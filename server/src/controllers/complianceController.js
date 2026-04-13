const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Professional Interviews (Every 2 years)
const getProfessionalInterviews = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { is_active: true },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                last_professional_interview: true,
                hired_at: true,
                department: { select: { name: true } }
            },
            orderBy: { last_name: 'asc' }
        });

        const today = new Date();
        const data = users.map(user => {
            let status = 'UP_TO_DATE';
            let next_date = null;

            const referenceDate = user.last_professional_interview ? new Date(user.last_professional_interview) : user.hired_at ? new Date(user.hired_at) : null;

            if (referenceDate) {
                next_date = new Date(referenceDate);
                next_date.setFullYear(next_date.getFullYear() + 2);

                if (next_date < today) {
                    status = 'LATE';
                } else if (next_date < new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)) {
                    status = 'UPCOMING';
                }
            } else {
                status = 'REQUIRED';
            }

            return { ...user, status, next_date };
        });

        res.json({ users: data });
    } catch (error) {
        console.error('Get professional interviews error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

// 2. Annual Reviews (Every year)
const getAnnualReviews = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { is_active: true },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                last_annual_review: true,
                hired_at: true,
                department: { select: { name: true } }
            }
        });

        const today = new Date();
        const data = users.map(user => {
            let status = 'UP_TO_DATE';
            let next_date = null;

            const referenceDate = user.last_annual_review ? new Date(user.last_annual_review) : user.hired_at ? new Date(user.hired_at) : null;

            if (referenceDate) {
                next_date = new Date(referenceDate);
                next_date.setFullYear(next_date.getFullYear() + 1);

                if (next_date < today) {
                    status = 'LATE';
                } else if (next_date < new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)) {
                    status = 'UPCOMING';
                }
            } else {
                status = 'REQUIRED';
            }

            return { ...user, status, next_date };
        });

        res.json({ users: data });
    } catch (error) {
        console.error('Get annual reviews error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

// 3. 6-Year Review (Bilan 6 ans)
// Logic: Within 6 years, employee must have had:
// - 3 professional interviews (every 2 years)
// - AT LEAST one non-obligatory training
const getSixYearBilan = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { is_active: true },
            include: {
                requests: {
                    where: {
                        status: 'COMPLETED',
                        type: { not: 'OBLIGATOIRE' }
                    }
                },
                department: true
            }
        });

        const today = new Date();
        const data = users.map(user => {
            const hiredDate = user.hired_at ? new Date(user.hired_at) : null;
            if (!hiredDate) return { ...user, compliance_6y: 'UNKNOWN', message: 'Date embauche manquante' };

            const years = (today - hiredDate) / (365.25 * 24 * 60 * 60 * 1000);
            if (years < 6) return { ...user, compliance_6y: 'NOT_APPLICABLE', progress: Math.min(100, (years / 6) * 100).toFixed(0) };

            const hasNonObligatoryTraining = user.requests.length > 0;
            // Simplified: Just check training for now, as interview history might not be perfectly tracked in DB yet
            const isCompliant = hasNonObligatoryTraining;

            return {
                ...user,
                compliance_6y: isCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
                has_training: hasNonObligatoryTraining,
                trainings_count: user.requests.length
            };
        });

        res.json({ users: data });
    } catch (error) {
        console.error('Get 6y bilan error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

// 4. Authorizations (Habilitations)
const getAuthorizations = async (req, res) => {
    try {
        const certifications = await prisma.userCertification.findMany({
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        department: { select: { name: true } }
                    }
                }
            }
        });
        res.json({ certifications });
    } catch (error) {
        console.error('Get certifications error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

// 5. Training History
const getTrainingHistory = async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        let where = { status: 'COMPLETED' };

        // If manager, only show their team's history
        if (role === 'manager') {
            where.user = {
                manager_id: userId
            };
        }

        const history = await prisma.trainingRequest.findMany({
            where,
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        department: { select: { name: true } }
                    }
                },
                provider: { select: { name: true } },
                application_plan: {
                    select: {
                        impact_score: true,
                        progress: true
                    }
                }
            },
            orderBy: { actual_end_date: 'desc' }
        });

        res.json({ history });
    } catch (error) {
        console.error('Get training history error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const exportProfessionalInterviews = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { is_active: true },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                last_professional_interview: true,
                hired_at: true,
                department: { select: { name: true } }
            },
            orderBy: { last_name: 'asc' }
        });

        const today = new Date();
        let csv = '\uFEFFCollaborateur;Email;Département;Date Embauche;Dernier Entretien;Prochaine Échéance;Statut\n';

        users.forEach(user => {
            let status = 'À JOUR';
            let next_date_str = '-';
            const referenceDate = user.last_professional_interview ? new Date(user.last_professional_interview) : user.hired_at ? new Date(user.hired_at) : null;

            if (referenceDate) {
                const next_date = new Date(referenceDate);
                next_date.setFullYear(next_date.getFullYear() + 2);
                next_date_str = next_date.toLocaleDateString();

                if (next_date < today) status = 'EN RETARD';
                else if (next_date < new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)) status = 'À PLANIFIER';
            } else {
                status = 'OBLIGATOIRE';
            }

            const hiredAt = user.hired_at ? new Date(user.hired_at).toLocaleDateString() : 'N/A';
            const lastInt = user.last_professional_interview ? new Date(user.last_professional_interview).toLocaleDateString() : 'Jamais';

            csv += `${user.first_name} ${user.last_name};${user.email};${user.department?.name || 'N/A'};${hiredAt};${lastInt};${next_date_str};${status}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`Export_Entretiens_Pro_${new Date().getFullYear()}.csv`);
        return res.send(csv);

    } catch (error) {
        console.error('Export interviews error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'export.' });
    }
};

module.exports = {
    getProfessionalInterviews,
    getAnnualReviews,
    getSixYearBilan,
    getAuthorizations,
    getTrainingHistory,
    exportProfessionalInterviews
};
