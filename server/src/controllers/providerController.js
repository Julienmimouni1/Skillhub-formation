const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProviders = async (req, res) => {
    try {
        const providers = await prisma.provider.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ providers });
    } catch (error) {
        console.error('Get providers error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur lors de la récupération des organismes.' } });
    }
};

const createProvider = async (req, res) => {
    try {
        const { name, contact_email, phone, url } = req.body;

        if (!name) {
            return res.status(400).json({ error: { status: 400, message: 'Le nom de l\'organisme est requis.' } });
        }

        const existing = await prisma.provider.findUnique({ where: { name } });
        if (existing) {
            return res.status(400).json({ error: { status: 400, message: 'Cet organisme existe déjà.' } });
        }

        const provider = await prisma.provider.create({
            data: { name, contact_email, phone, url }
        });

        res.status(201).json({ provider });
    } catch (error) {
        console.error('Create provider error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur lors de la création de l\'organisme.' } });
    }
};

const updateProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact_email, phone, url } = req.body;

        const provider = await prisma.provider.update({
            where: { id: parseInt(id) },
            data: { name, contact_email, phone, url }
        });

        res.json({ provider });
    } catch (error) {
        console.error('Update provider error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur lors de la mise à jour.' } });
    }
};

const deleteProvider = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if used in requests
        const used = await prisma.trainingRequest.findFirst({ where: { provider_id: parseInt(id) } });
        if (used) {
            return res.status(400).json({ error: { status: 400, message: 'Impossible de supprimer cet organisme car il est lié à des demandes.' } });
        }

        await prisma.provider.delete({ where: { id: parseInt(id) } });
        res.status(204).send();
    } catch (error) {
        console.error('Delete provider error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur lors de la suppression.' } });
    }
};

module.exports = { getProviders, createProvider, updateProvider, deleteProvider };
