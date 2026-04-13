const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { syncCatalog: runSync } = require('../services/catalogSyncService');

const searchCatalog = async (req, res) => {
    try {
        const { q, type } = req.query; // type: 'internal' or 'external' (default: all or external?)

        if (!q || q.length < 2) {
            return res.json({ results: [] });
        }

        const whereClause = {
            OR: [
                { title: { contains: q } },
                { description: { contains: q } },
                { provider: { name: { contains: q } } }
            ]
        };

        if (type === 'internal') {
            whereClause.is_internal = true;
        } else if (type === 'external') {
            whereClause.is_internal = false;
        }

        const results = await prisma.trainingCourse.findMany({
            where: whereClause,
            include: {
                provider: true,
                documents: true
            },
            take: 20
        });

        // Map to frontend expected format
        const formattedResults = results.map(course => ({
            id: course.id,
            title: course.title,
            provider: course.provider.name,
            description: course.description,
            cost: Number(course.cost),
            duration_days: Number(course.duration_days),
            type: course.is_cpf_eligible ? 'CPF' : 'PLAN_DEV',
            url: course.url,
            is_internal: course.is_internal,
            objective: course.objective,
            prerequisites: course.prerequisites,
            documents: course.documents
        }));

        res.json({ results: formattedResults });
    } catch (error) {
        console.error('Catalog search error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur lors de la recherche catalogue.' } });
    }
};

const getCatalog = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const type = req.query.type; // 'internal' or 'external'
        const skip = (page - 1) * limit;

        const whereClause = {};
        if (type === 'internal') {
            whereClause.is_internal = true;
        } else if (type === 'external') {
            whereClause.is_internal = false;
        }

        const [total, courses] = await prisma.$transaction([
            prisma.trainingCourse.count({ where: whereClause }),
            prisma.trainingCourse.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    provider: true,
                    documents: true
                },
                orderBy: {
                    title: 'asc'
                }
            })
        ]);

        const formattedCourses = courses.map(course => ({
            id: course.id,
            title: course.title,
            provider: course.provider.name,
            description: course.description,
            cost: Number(course.cost),
            duration_days: Number(course.duration_days),
            type: course.is_cpf_eligible ? 'CPF' : 'PLAN_DEV',
            url: course.url,
            is_internal: course.is_internal,
            objective: course.objective,
            prerequisites: course.prerequisites,
            documents: course.documents
        }));

        res.json({
            data: formattedCourses,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get catalog error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur lors de la récupération du catalogue.' } });
    }
};

// CRUD for Internal Catalog
const createInternalCourse = async (req, res) => {
    try {
        const { title, description, provider_id, cost, duration_days, url } = req.body;

        // Basic validation
        if (!title || !provider_id) {
            return res.status(400).json({ message: 'Titre et Organisme requis' });
        }

        const course = await prisma.trainingCourse.create({
            data: {
                title,
                description,
                objective: req.body.objective,
                prerequisites: req.body.prerequisites,
                provider_id: parseInt(provider_id),
                cost: cost ? parseFloat(cost) : 0,
                duration_days: duration_days ? parseFloat(duration_days) : 0,
                url,
                is_internal: true,
                external_id: `INT-${Date.now()}` // Generate a fake external ID
            }
        });

        res.status(201).json({ message: 'Formation créée', course });
    } catch (error) {
        console.error('Create internal course error:', error);
        res.status(500).json({ message: 'Erreur lors de la création' });
    }
};

const updateInternalCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, provider_id, cost, duration_days, url } = req.body;

        const course = await prisma.trainingCourse.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                objective: req.body.objective,
                prerequisites: req.body.prerequisites,
                provider_id: parseInt(provider_id),
                cost: cost ? parseFloat(cost) : 0,
                duration_days: duration_days ? parseFloat(duration_days) : 0,
                url
            }
        });

        res.json({ message: 'Formation mise à jour', course });
    } catch (error) {
        console.error('Update internal course error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
};

const deleteInternalCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.trainingCourse.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Formation supprimée' });
    } catch (error) {
        console.error('Delete internal course error:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
};

const triggerSync = async (req, res) => {
    try {
        // Check if user is admin or RH (optional, but good practice)
        if (req.user.role !== 'admin' && req.user.role !== 'rh') {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const result = await runSync();
        res.json({ message: 'Synchronisation terminée', ...result });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ message: 'Erreur lors de la synchronisation' });
    }
};

module.exports = {
    searchCatalog,
    triggerSync,
    getCatalog,
    createInternalCourse,
    updateInternalCourse,
    deleteInternalCourse
};
