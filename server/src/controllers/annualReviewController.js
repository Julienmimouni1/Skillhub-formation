const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAnnualReviewDossier = async (req, res) => {
    const { userId } = req.params;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: {
                department: true,
                manager: {
                    select: { id: true, first_name: true, last_name: true }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: { status: 404, message: 'Utilisateur non trouvé.' } });
        }

        const review = await prisma.annualReview.findUnique({
            where: {
                user_id_year: {
                    user_id: parseInt(userId),
                    year: year
                }
            }
        });

        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        const trainingRequests = await prisma.trainingRequest.findMany({
            where: {
                user_id: parseInt(userId),
                created_at: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                application_plan: true
            }
        });

        const starStories = trainingRequests
            .filter(req => req.application_plan && req.application_plan.roi_qualitative)
            .map(req => {
                try {
                    const roi = JSON.parse(req.application_plan.roi_qualitative);
                    return {
                        training_title: req.title,
                        star: roi.starStory || null
                    };
                } catch (e) {
                    return null;
                }
            })
            .filter(s => s && s.star && (s.star.situation || s.star.task || s.star.action || s.star.result));

        res.json({
            user,
            review: review || { user_id: parseInt(userId), year, status: 'DRAFT' },
            trainingRequests,
            starStories
        });

    } catch (error) {
        console.error('Get annual review dossier error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const saveAnnualReview = async (req, res) => {
    const { userId, year, status, previous_goals_summary, new_goals, competencies_review, collaborator_comment, manager_comment, rh_comment } = req.body;

    try {
        const review = await prisma.annualReview.upsert({
            where: {
                user_id_year: {
                    user_id: parseInt(userId),
                    year: parseInt(year)
                }
            },
            update: {
                status,
                previous_goals_summary,
                new_goals,
                competencies_review,
                collaborator_comment,
                manager_comment,
                rh_comment
            },
            create: {
                user_id: parseInt(userId),
                manager_id: req.user.id,
                year: parseInt(year),
                status,
                previous_goals_summary,
                new_goals,
                competencies_review,
                collaborator_comment,
                manager_comment,
                rh_comment
            }
        });

        if (status === 'VALIDATED') {
            await prisma.user.update({
                where: { id: parseInt(userId) },
                data: { last_annual_review: new Date() }
            });
        }

        res.json(review);
    } catch (error) {
        console.error('Save annual review error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

module.exports = {
    getAnnualReviewDossier,
    saveAnnualReview
};
