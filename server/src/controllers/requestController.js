const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to check if user can view a request
const canViewRequest = (user, request) => {
    if (user.role === 'admin' || user.role === 'rh') return true;
    if (user.role === 'manager' && request.manager_id === user.userId) return true;
    if (user.userId === request.user_id) return true;
    return false;
};

const createRequest = async (req, res) => {
    try {
        const {
            title, description, objectives, prerequisites, provider_id, cost, type, start_date, end_date, availability_period, duration_days, status, campaign_id,
            funding_type, co_funding_company_amount, co_funding_personal_amount, priority, personal_investment
        } = req.body;
        const userId = req.user.userId;

        // Validation for Co-funding
        if (funding_type === 'CO_FUNDED') {
            const total = parseFloat(co_funding_company_amount || 0) + parseFloat(co_funding_personal_amount || 0);
            if (cost && Math.abs(total - parseFloat(cost)) > 0.01) { // Tolerance for float math
                return res.status(400).json({ error: { status: 400, message: 'La somme des montants (Entreprise + Personnel) doit être égale au coût total.' } });
            }
        }

        // Get user to find manager and department
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { manager: true }
        });

        if (!user) return res.status(404).json({ error: { status: 404, message: 'Utilisateur non trouvé' } });

        // Validation: User MUST have a department because TrainingRequest requires it
        if (!user.department_id) {
            return res.status(400).json({ error: { status: 400, message: 'Votre profil n\'est associé à aucun département. Veuillez contacter les RH.' } });
        }

        // Safe Parsing
        const parsedCost = cost ? parseFloat(cost) : 0;
        const parsedproviderId = provider_id ? parseInt(provider_id) : undefined;
        const parsedCampaignId = campaign_id ? parseInt(campaign_id) : undefined;
        const parsedDuration = duration_days ? parseFloat(duration_days) : null;

        const newRequest = await prisma.trainingRequest.create({
            data: {
                title,
                description,
                objectives,
                prerequisites,
                cost: parsedCost,
                type,
                funding_type: funding_type || 'COMPANY',
                co_funding_company_amount: funding_type === 'CO_FUNDED' ? (co_funding_company_amount ? parseFloat(co_funding_company_amount) : 0) : null,
                co_funding_personal_amount: funding_type === 'CO_FUNDED' ? (co_funding_personal_amount ? parseFloat(co_funding_personal_amount) : 0) : null,
                start_date: start_date ? new Date(start_date) : null,
                end_date: end_date ? new Date(end_date) : null,
                availability_period: availability_period || null,
                duration_days: parsedDuration,
                priority: priority || null,
                personal_investment: personal_investment || null,
                status: status || 'DRAFT',
                campaign: parsedCampaignId && !isNaN(parsedCampaignId) ? { connect: { id: parsedCampaignId } } : undefined,
                user: { connect: { id: userId } },
                department: { connect: { id: user.department_id } },
                manager: user.manager_id ? { connect: { id: user.manager_id } } : undefined,
                provider: parsedproviderId && !isNaN(parsedproviderId) ? { connect: { id: parsedproviderId } } : undefined,
                history: {
                    create: {
                        actor_id: userId,
                        action: 'SUBMITTED',
                        new_status: status || 'DRAFT'
                    }
                }
            }
        });

        res.status(201).json({ request: newRequest });
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur lors de la création de la demande.', details: error.message } });
    }
};

const getRequests = async (req, res) => {
    try {
        const { role, userId } = req.user;
        let where = {};

        if (role === 'collaborateur') {
            where = { user_id: userId };
        } else if (role === 'manager') {
            // Manager sees their own requests AND requests assigned to them
            where = {
                OR: [
                    { user_id: userId },
                    { manager_id: userId, status: { not: 'DRAFT' } } // Don't see drafts of subordinates
                ]
            };
        } else if (role === 'rh' || role === 'admin') {
            // RH/Admin sees everything except drafts of others (usually)
            // Spec says: "ne pas voir les brouillons des collaborateurs"
            where = {
                OR: [
                    { user_id: userId }, // See own drafts
                    { status: { not: 'DRAFT' } }
                ]
            };

            // Filter by RH Scope if requested
            if (req.query.scope === 'my_scope' && role === 'rh') {
                where.AND = {
                    user: {
                        assigned_rh_id: userId
                    }
                };
            }
        }

        // Filter by Campaign
        if (req.query.campaign_id) {
            where.campaign_id = parseInt(req.query.campaign_id);
        }

        const requests = await prisma.trainingRequest.findMany({
            where,
            include: {
                user: { select: { first_name: true, last_name: true } },
                department: { select: { name: true } },
                application_plan: true
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({ requests });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur lors de la récupération des demandes.' } });
    }
};

const getRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await prisma.trainingRequest.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: { select: { first_name: true, last_name: true, email: true } },
                department: true,
                documents: true,
                evaluation: true,
                application_plan: {
                    select: {
                        manager_review_comment: true,
                        manager_reviewed_at: true,
                        application_rate: true,
                        behavior_changes: true,
                        kpis: true,
                        roi_qualitative: true
                    }
                },
                history: {
                    include: { actor: { select: { first_name: true, last_name: true, role: true } } },
                    orderBy: { created_at: 'desc' }
                }
            }
        });

        if (!request) return res.status(404).json({ error: { status: 404, message: 'Demande non trouvée' } });

        // Check permissions
        if (!canViewRequest(req.user, request)) {
            return res.status(403).json({ error: { status: 403, message: 'Accès refusé' } });
        }

        res.json({ request });
    } catch (error) {
        console.error('Get request details error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const validateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, comment } = req.body;
        const { role, userId } = req.user;

        const request = await prisma.trainingRequest.findUnique({ where: { id: parseInt(id) } });
        if (!request) return res.status(404).json({ error: { status: 404, message: 'Demande non trouvée' } });

        let newStatus = request.status;

        // Workflow Logic
        if (action === 'PRIORITY_2') {
            if (role === 'manager' && request.status === 'PENDING_MANAGER') {
                newStatus = 'PRIORITY_2';
            } else {
                return res.status(403).json({ error: { status: 403, message: 'Action non autorisée' } });
            }
        } else if (action === 'APPROVED') {
            if (role === 'manager' && (request.status === 'PENDING_MANAGER' || request.status === 'PRIORITY_2')) {
                // MANDATORY: Manager must define expectations
                const { manager_expectations } = req.body;
                if (!manager_expectations || manager_expectations.trim() === '') {
                    return res.status(400).json({
                        error: {
                            status: 400,
                            message: 'Les attentes et objectifs sont obligatoires pour valider la demande.',
                            field: 'manager_expectations'
                        }
                    });
                }

                newStatus = 'PENDING_RH';

                // Handle Manager Evaluation
                const { evaluation } = req.body;
                if (!evaluation) {
                    return res.status(400).json({
                        error: {
                            status: 400,
                            message: 'L\'évaluation est obligatoire pour valider la demande.',
                            field: 'evaluation'
                        }
                    });
                }

                if (evaluation) {
                    // Calculate score server-side to ensure integrity
                    const score =
                        (parseInt(evaluation.alignment_strategy) * 3) +
                        (parseInt(evaluation.competence_gap) * 3) +
                        (parseInt(evaluation.operational_impact) * 2) +
                        (parseInt(evaluation.roe_expectation) * 2) +
                        (parseInt(evaluation.content_relevance) * 1);

                    await prisma.managerEvaluation.create({
                        data: {
                            request_id: request.id,
                            alignment_strategy: parseInt(evaluation.alignment_strategy),
                            competence_gap: parseInt(evaluation.competence_gap),
                            operational_impact: parseInt(evaluation.operational_impact),
                            roe_expectation: parseInt(evaluation.roe_expectation),
                            content_relevance: parseInt(evaluation.content_relevance),
                            score: score,
                            comment: evaluation.comment
                        }
                    });
                }
            } else if ((role === 'rh' || role === 'admin') && request.status === 'PENDING_RH') {
                newStatus = 'APPROVED';
                // Update budget engaged
                await prisma.department.update({
                    where: { id: request.department_id },
                    data: { budget_engaged: { increment: request.cost } }
                });
            } else {
                return res.status(403).json({ error: { status: 403, message: 'Action non autorisée pour ce statut/rôle' } });
            }
        } else if (action === 'PLANNED') {
            if ((role === 'rh' || role === 'admin') && (request.status === 'APPROVED' || request.status === 'PLANNED')) {
                newStatus = 'PLANNED';
            } else {
                return res.status(403).json({ error: { status: 403, message: 'Action non autorisée' } });
            }
        } else if (action === 'COMPLETED') {
            if ((role === 'rh' || role === 'admin') && request.status === 'PLANNED') {
                const { actual_start_date, actual_end_date } = req.body;
                if (!actual_start_date || !actual_end_date) {
                    return res.status(400).json({ error: { status: 400, message: 'Les dates réelles sont obligatoires' } });
                }
                newStatus = 'COMPLETED';

                // Update budget: remove from engaged, add to consumed
                await prisma.department.update({
                    where: { id: request.department_id },
                    data: {
                        budget_engaged: { decrement: request.cost },
                        budget_consumed: { increment: request.cost }
                    }
                });

                // Auto-update skills if linked to a course
                if (request.course_id) {
                    const course = await prisma.trainingCourse.findUnique({
                        where: { id: request.course_id },
                        include: { skills: true }
                    });

                    if (course && course.skills && course.skills.length > 0) {
                        for (const skill of course.skills) {
                            const currentSkill = await prisma.userSkill.findUnique({
                                where: { user_id_skill_id: { user_id: request.user_id, skill_id: skill.id } }
                            });

                            const newLevel = Math.min((currentSkill?.level || 0) + 1, 5);

                            await prisma.userSkill.upsert({
                                where: { user_id_skill_id: { user_id: request.user_id, skill_id: skill.id } },
                                update: { level: newLevel, updated_at: new Date() },
                                create: { user_id: request.user_id, skill_id: skill.id, level: 1 }
                            });
                        }
                    }
                }
            } else {
                return res.status(403).json({ error: { status: 403, message: 'Action non autorisée' } });
            }
        } else if (action === 'REJECTED') {
            if (!comment) return res.status(400).json({ error: { status: 400, message: 'Motif de refus obligatoire' } });
            newStatus = 'REJECTED';
        } else if (action === 'COMMENTED') {
            // Just adding a comment, status doesn't change or maybe goes back to draft?
            // Spec says: "Demander un complément" -> Statut repasse à DRAFT
            newStatus = 'DRAFT';
        } else if (action === 'UPDATE_COST') {
            if (role === 'rh' || role === 'admin') {
                const { newCost } = req.body;
                if (newCost === undefined || isNaN(newCost)) {
                    return res.status(400).json({ error: { status: 400, message: 'Le nouveau coût est obligatoire et doit être un nombre.' } });
                }

                const diff = parseFloat(newCost) - parseFloat(request.cost);

                if (request.status === 'APPROVED' || request.status === 'PLANNED') {
                    await prisma.department.update({
                        where: { id: request.department_id },
                        data: { budget_engaged: { increment: diff } }
                    });
                } else if (request.status === 'COMPLETED') {
                    await prisma.department.update({
                        where: { id: request.department_id },
                        data: { budget_consumed: { increment: diff } }
                    });
                }
                // Final update will handle the cost field
                req.body.cost = parseFloat(newCost);
            } else {
                return res.status(403).json({ error: { status: 403, message: 'Action non autorisée' } });
            }
        }

        const updatedRequest = await prisma.trainingRequest.update({
            where: { id: parseInt(id) },
            data: {
                status: newStatus,
                manager_expectations: req.body.manager_expectations || undefined,
                start_date: req.body.start_date ? new Date(req.body.start_date) : undefined,
                end_date: req.body.end_date ? new Date(req.body.end_date) : undefined,
                cost: req.body.cost || undefined,
                actual_start_date: req.body.actual_start_date ? new Date(req.body.actual_start_date) : undefined,
                actual_end_date: req.body.actual_end_date ? new Date(req.body.actual_end_date) : undefined,
                history: {
                    create: {
                        actor_id: userId,
                        action,
                        comment,
                        previous_status: request.status,
                        new_status: newStatus
                    }
                }
            }
        });

        res.json({ request: updatedRequest });

    } catch (error) {
        console.error('Validate request error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const exportRequests = async (req, res) => {
    try {
        const { role, userId } = req.user;

        if (role !== 'rh' && role !== 'admin' && role !== 'manager') {
            return res.status(403).json({ error: { status: 403, message: 'Accès refusé' } });
        }

        let where = {};
        if (role === 'manager') {
            where = { manager_id: userId, status: { not: 'DRAFT' } };
        } else if (req.query.scope === 'my_scope') {
            where = { user: { assigned_rh_id: userId } };
        }

        // Apply filters from query
        if (req.query.status) where.status = req.query.status;
        if (req.query.campaign_id) where.campaign_id = parseInt(req.query.campaign_id);
        if (req.query.department_id) where.department_id = parseInt(req.query.department_id);

        const requests = await prisma.trainingRequest.findMany({
            where,
            include: {
                user: { select: { first_name: true, last_name: true, email: true } },
                department: { select: { name: true } },
                provider: { select: { name: true } },
                application_plan: { select: { impact_score: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        // CSV Header - Add BOM for Excel UTF-8 compatibility
        let csv = '\uFEFFID;Titre;Utilisateur;Email;Département;Statut;Coût;Type;Durée (Jours);Durée (Heures);Début;Fin;Fournisseur;Score Impact\n';

        // CSV Rows
        requests.forEach(req => {
            const startDate = req.start_date ? new Date(req.start_date).toLocaleDateString() : '';
            const endDate = req.end_date ? new Date(req.end_date).toLocaleDateString() : '';
            const providerName = req.provider ? req.provider.name : '';
            const durationHours = (Number(req.duration_days) || 0) * 7;
            const impactScore = req.application_plan?.impact_score || 0;

            // Escape fields that might contain semicolons or newlines
            const title = `"${(req.title || '').replace(/"/g, '""')}"`;
            const userName = `"${req.user.first_name} ${req.user.last_name}"`;

            csv += `${req.id};${title};${userName};${req.user.email};${req.department.name};${req.status};${req.cost};${req.type};${req.duration_days};${durationHours};${startDate};${endDate};${providerName};${impactScore}%\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`export_formations_${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csv);

    } catch (error) {
        console.error('Export requests error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur lors de l\'export.' } });
    }
};

const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, description, objectives, prerequisites, provider_id, cost, type, start_date, end_date, availability_period, duration_days,
            funding_type, co_funding_company_amount, co_funding_personal_amount, priority, personal_investment
        } = req.body;
        const userId = req.user.userId;

        const request = await prisma.trainingRequest.findUnique({ where: { id: parseInt(id) } });

        if (!request) return res.status(404).json({ error: { status: 404, message: 'Demande non trouvée' } });

        // Check permissions: Owner only for this specific feature request
        if (request.user_id !== userId) {
            return res.status(403).json({ error: { status: 403, message: 'Vous ne pouvez modifier que vos propres demandes' } });
        }

        // Check status: Allow DRAFT, PENDING_MANAGER, PENDING_RH
        const allowedStatuses = ['DRAFT', 'PENDING_MANAGER', 'PENDING_RH'];
        if (!allowedStatuses.includes(request.status)) {
            return res.status(403).json({ error: { status: 403, message: 'Modification impossible à ce stade (déjà validée ou refusée)' } });
        }

        // Validation for Co-funding
        if (funding_type === 'CO_FUNDED') {
            const total = parseFloat(co_funding_company_amount || 0) + parseFloat(co_funding_personal_amount || 0);
            if (Math.abs(total - parseFloat(cost)) > 0.01) {
                return res.status(400).json({ error: { status: 400, message: 'La somme des montants (Entreprise + Personnel) doit être égale au coût total.' } });
            }
        }

        const updatedRequest = await prisma.trainingRequest.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                objectives,
                prerequisites,
                cost: cost,
                type,
                funding_type: funding_type || 'COMPANY',
                co_funding_company_amount: funding_type === 'CO_FUNDED' ? co_funding_company_amount : null,
                co_funding_personal_amount: funding_type === 'CO_FUNDED' ? co_funding_personal_amount : null,
                start_date: start_date ? new Date(start_date) : null,
                end_date: end_date ? new Date(end_date) : null,
                availability_period: availability_period || null,
                duration_days: duration_days,
                priority: priority || undefined,
                personal_investment: personal_investment || undefined,
                provider: provider_id ? { connect: { id: parseInt(provider_id) } } : { disconnect: true },
                // Log history? Maybe not for simple edits to avoid clutter, or yes for audit. 
                // Let's add a simple log.
                history: {
                    create: {
                        actor_id: userId,
                        action: 'UPDATED',
                        previous_status: request.status,
                        new_status: request.status // Status doesn't change on edit usually, or maybe resets? 
                        // Requirement doesn't say reset. Usually if you edit while pending, it stays pending but might need re-validation.
                        // For now, keep status same.
                    }
                }
            }
        });

        res.json({ request: updatedRequest });

    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur lors de la modification.' } });
    }
};

module.exports = { createRequest, getRequests, getRequestById, validateRequest, exportRequests, updateRequest };
