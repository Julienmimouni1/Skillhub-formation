const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { extractText, extractActionsFromText } = require('../utils/documentParser');
const path = require('path');
const fs = require('fs');

const getPlanByRequestId = async (req, res) => {
    try {
        const { requestId } = req.params;
        const plan = await prisma.applicationPlan.findUnique({
            where: { request_id: parseInt(requestId) },
            include: {
                actions: true,
                practice_logs: {
                    orderBy: { date: 'desc' }
                }
            }
        });
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper to calculate Impact Score server-side
const calculateImpactScore = (behaviorChangesStr, roiQualitativeStr) => {
    let score = 0;

    // Parse JSONs
    let beforeAfter = { before: '', after: '', magnitude: 'moderate', trigger: '' };
    let roiCalc = { amount: '' };
    let starStory = { situation: '', task: '', action: '', result: '' };

    try {
        if (behaviorChangesStr) {
            const behav = typeof behaviorChangesStr === 'string' ? JSON.parse(behaviorChangesStr) : behaviorChangesStr;
            if (behav.beforeAfter) beforeAfter = { ...beforeAfter, ...behav.beforeAfter };
        }
        if (roiQualitativeStr) {
            const roi = typeof roiQualitativeStr === 'string' ? JSON.parse(roiQualitativeStr) : roiQualitativeStr;
            if (roi.roiCalc) roiCalc = { ...roiCalc, ...roi.roiCalc };
            if (roi.starStory) starStory = { ...starStory, ...roi.starStory };
        }
    } catch (e) {
        console.error("Error calculating score:", e);
    }

    // L3: Transformation
    if (beforeAfter.before && beforeAfter.after) score += 15;
    // Relaxed check: just check if trigger is present and has content
    if (beforeAfter.trigger && beforeAfter.trigger.trim().length > 0) score += 10;

    // Magnitude
    if (beforeAfter.magnitude === 'marginal') score += 5;
    else if (beforeAfter.magnitude === 'moderate') score += 10;
    else if (beforeAfter.magnitude === 'radical') score += 15;

    // Habit
    let habitFrequency = 0;
    try {
        if (behaviorChangesStr) {
            const behav = typeof behaviorChangesStr === 'string' ? JSON.parse(behaviorChangesStr) : behaviorChangesStr;
            if (behav.habitFrequency) habitFrequency = behav.habitFrequency;
        }
    } catch (e) { }

    if (habitFrequency > 0) score += (habitFrequency * 5);

    // L4: Results
    if (roiCalc.amount) score += 20;

    // STAR Story
    // Relaxed check: > 2 chars
    const starFilled = Object.values(starStory).filter(v => v && v.length > 2).length;
    if (starFilled === 4) score += 20;

    return Math.min(100, score);
};

const createOrUpdatePlan = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { feedback, progress, key_takeaways, confidence_level, impact_rating, scheduled_review_date, blockers, application_rate, behavior_changes, kpis, roi_qualitative, manager_review_comment, manager_reviewed_at } = req.body;

        // Calculate Score Server-Side
        const calculatedScore = calculateImpactScore(behavior_changes, roi_qualitative);

        const plan = await prisma.applicationPlan.upsert({
            where: { request_id: parseInt(requestId) },
            update: {
                feedback,
                progress,
                key_takeaways,
                confidence_level,
                impact_rating,
                impact_score: calculatedScore,
                scheduled_review_date: scheduled_review_date ? new Date(scheduled_review_date) : undefined,
                blockers,
                application_rate,
                behavior_changes,
                kpis,
                roi_qualitative,
                manager_review_comment,
                manager_reviewed_at: manager_reviewed_at ? new Date(manager_reviewed_at) : undefined
            },
            create: {
                request_id: parseInt(requestId),
                feedback,
                progress: progress || 0,
                key_takeaways,
                confidence_level,
                impact_rating,
                impact_score: calculatedScore,
                scheduled_review_date: scheduled_review_date ? new Date(scheduled_review_date) : null,
                blockers,
                application_rate,
                behavior_changes,
                kpis,
                roi_qualitative,
                manager_review_comment,
                manager_reviewed_at: manager_reviewed_at ? new Date(manager_reviewed_at) : undefined
            },
            include: {
                actions: true,
                practice_logs: {
                    orderBy: { date: 'desc' }
                }
            }
        });
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addActionItem = async (req, res) => {
    try {
        const { planId } = req.params;
        const { title, deadline, priority, resources_needed, outcome } = req.body;

        const action = await prisma.actionItem.create({
            data: {
                plan_id: parseInt(planId),
                title,
                deadline: deadline ? new Date(deadline) : null,
                status: 'TODO',
                priority: priority || 'MEDIUM',
                resources_needed,
                outcome
            }
        });
        res.json(action);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateActionItem = async (req, res) => {
    try {
        const { actionId } = req.params;
        const { status, title, deadline, priority, resources_needed, outcome, is_completed } = req.body;

        const action = await prisma.actionItem.update({
            where: { id: parseInt(actionId) },
            data: {
                status,
                title,
                deadline: deadline ? new Date(deadline) : undefined,
                priority,
                resources_needed,
                outcome,
                is_completed
            }
        });

        // Recalculate plan progress
        const planId = action.plan_id;
        const allActions = await prisma.actionItem.findMany({ where: { plan_id: planId } });
        const completed = allActions.filter(a => a.status === 'DONE' || a.is_completed).length;
        const progress = Math.round((completed / allActions.length) * 100);

        await prisma.applicationPlan.update({
            where: { id: planId },
            data: { progress }
        });

        res.json(action);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteActionItem = async (req, res) => {
    try {
        const { actionId } = req.params;
        await prisma.actionItem.delete({
            where: { id: parseInt(actionId) }
        });
        res.json({ message: 'Action deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const generateDefaultActions = async (req, res) => {
    try {
        const { requestId } = req.params;

        // 1. Get Plan and Check Limit
        let plan = await prisma.applicationPlan.findUnique({ where: { request_id: parseInt(requestId) } });

        if (!plan) {
            plan = await prisma.applicationPlan.create({
                data: { request_id: parseInt(requestId) }
            });
        }

        if (plan.ai_generation_count >= 3) {
            return res.status(403).json({
                error: {
                    status: 403,
                    message: 'Limite de génération atteinte (3/3).',
                    code: 'LIMIT_REACHED'
                }
            });
        }

        // 2. Get Request Context (Title, Description, Documents)
        const request = await prisma.trainingRequest.findUnique({
            where: { id: parseInt(requestId) },
            include: { documents: true }
        });

        if (!request) return res.status(404).json({ error: 'Demande non trouvée' });

        let suggestedActions = [];

        // 3. Extract Actions from Documents
        if (request.documents && request.documents.length > 0) {
            for (const doc of request.documents) {
                const filePath = path.resolve(__dirname, '../../uploads', doc.file_path || doc.file_name);
                if (fs.existsSync(filePath)) {
                    const text = await extractText(filePath);
                    const docActions = extractActionsFromText(text);
                    suggestedActions.push(...docActions.map(a => `[Doc] ${a}`));
                }
            }
        }

        // 4. Fallback / Complementary Heuristic Logic
        const keywords = {
            'management': ['Organiser une réunion de délégation', 'Définir des KPI d\'équipe', 'Mener un entretien de feedback structuré'],
            'technique': ['Créer un POC (Proof of Concept)', 'Documenter la nouvelle stack', 'Former un pair sur la techno'],
            'communication': ['Présenter les acquis en réunion d\'équipe', 'Rédiger une note de synthèse', 'Appliquer l\'écoute active lors du prochain point'],
            'anglais': ['Tenir une réunion complète en anglais', 'Rédiger tous les emails de la semaine en anglais', 'Lire un article technique par jour'],
            'projet': ['Mettre à jour le diagramme de Gantt', 'Organiser un post-mortem', 'Revoir la gestion des risques']
        };

        const lowerTitle = request.title.toLowerCase();
        const lowerDesc = request.description ? request.description.toLowerCase() : '';

        for (const [key, actions] of Object.entries(keywords)) {
            if (lowerTitle.includes(key) || lowerDesc.includes(key)) {
                suggestedActions.push(...actions);
            }
        }

        // Fallback if absolutely nothing found
        if (suggestedActions.length === 0) {
            suggestedActions = [
                `Appliquer les concepts de "${request.title}" sur un cas réel`,
                "Identifier 3 situations pour utiliser les nouveaux acquis",
                "Planifier une session de partage avec l'équipe"
            ];
        }

        // Select 3 random unique actions from the pool
        const selectedActions = [...new Set(suggestedActions)]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(title => ({
                title: title.length > 100 ? title.substring(0, 97) + '...' : title,
                status: 'TODO',
                priority: 'HIGH',
                resources_needed: 'Temps dédié, Support de cours',
                outcome: 'Mise en pratique immédiate'
            }));

        // 5. Save Actions and Increment Counter
        for (const action of selectedActions) {
            await prisma.actionItem.create({
                data: {
                    plan_id: plan.id,
                    title: action.title,
                    status: action.status,
                    priority: action.priority,
                    resources_needed: action.resources_needed,
                    outcome: action.outcome
                }
            });
        }

        const updatedPlan = await prisma.applicationPlan.update({
            where: { id: plan.id },
            data: {
                ai_generation_count: { increment: 1 }
            },
            include: { actions: true }
        });

        res.json(updatedPlan);

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const sharePlanWithManager = async (req, res) => {
    try {
        const { requestId } = req.params;

        // 1. Fetch Request with User and Manager details
        const request = await prisma.trainingRequest.findUnique({
            where: { id: parseInt(requestId) },
            include: {
                user: true,
                manager: true,
                application_plan: true
            }
        });

        if (!request) return res.status(404).json({ error: 'Demande non trouvée' });
        if (!request.manager) return res.status(400).json({ error: 'Aucun manager assigné à cette demande.' });

        const plan = request.application_plan;
        if (!plan) return res.status(400).json({ error: 'Aucun plan de mise en pratique trouvé.' });

        // 2. Construct Email Content (Simulation)
        const skills = plan.key_takeaways ? JSON.parse(plan.key_takeaways) : [];

        console.log("---------------------------------------------------");
        console.log(`📧 SIMULATION EMAIL TO: ${request.manager.email}`);
        console.log(`SUBJECT: Bilan de formation - ${request.user.first_name} ${request.user.last_name}`);
        console.log("---------------------------------------------------");
        console.log(`Bonjour ${request.manager.first_name},`);
        console.log("");
        console.log(`${request.user.first_name} vient de compléter son bilan à chaud pour la formation "${request.title}".`);
        console.log("");
        console.log("TOP 3 COMPÉTENCES ACQUISES :");
        skills.forEach((skill, idx) => {
            console.log(`${idx + 1}. ${skill.name || 'Non défini'} (Confiance: ${skill.confidence}/10)`);
            if (skill.needsHelp) console.log(`   ⚠️ A BESOIN D'AIDE SUR CE POINT`);
            if (skill.playground) console.log(`   📍 Contexte: ${skill.playground}`);
        });
        console.log("");
        console.log("Merci de prendre un moment pour échanger avec lui/elle.");
        console.log("---------------------------------------------------");

        res.json({ message: 'Récapitulatif envoyé au manager avec succès !' });

    } catch (error) {
        console.error("Share Plan Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const createPracticeLog = async (req, res) => {
    try {
        const { planId } = req.params;
        const { date, content, skill_index, mood } = req.body;

        const log = await prisma.practiceLog.create({
            data: {
                plan_id: parseInt(planId),
                date: date ? new Date(date) : new Date(),
                content,
                skill_index,
                mood
            }
        });
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deletePracticeLog = async (req, res) => {
    try {
        const { logId } = req.params;
        await prisma.practiceLog.delete({
            where: { id: parseInt(logId) }
        });
        res.json({ message: 'Log deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPlanByRequestId,
    createOrUpdatePlan,
    addActionItem,
    updateActionItem,
    deleteActionItem,
    generateDefaultActions,
    sharePlanWithManager,
    createPracticeLog,
    deletePracticeLog
};
