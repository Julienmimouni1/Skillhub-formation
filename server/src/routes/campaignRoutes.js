const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken, checkRole } = require('../middleware/auth');

// GET /api/v1/campaigns - List all campaigns (RH only)
router.get('/', authenticateToken, checkRole(['rh', 'admin']), async (req, res) => {
    try {
        const campaigns = await prisma.campaign.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des campagnes' });
    }
});

// GET /api/v1/campaigns/active - Get current active campaign (Manager & RH)
router.get('/active', authenticateToken, async (req, res) => {
    try {
        const campaign = await prisma.campaign.findFirst({
            where: { status: 'OPEN' },
            orderBy: { end_date: 'asc' }
        });
        res.json(campaign);
    } catch (error) {
        console.error('Error fetching active campaign:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la campagne active' });
    }
});

// GET /api/v1/campaigns/:id - Get campaign details (All if OPEN, else RH/Admin)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await prisma.campaign.findUnique({ where: { id: parseInt(id) } });

        if (!campaign) {
            return res.status(404).json({ message: 'Campagne non trouvée' });
        }

        // Access control: RH/Admin can see all, others only OPEN
        if (req.user.role !== 'rh' && req.user.role !== 'admin' && campaign.status !== 'OPEN') {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        res.json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la campagne' });
    }
});

// POST /api/v1/campaigns - Create a new campaign (RH only)
router.post('/', authenticateToken, checkRole(['rh', 'admin']), async (req, res) => {
    try {
        const { title, description, start_date, end_date, budget_target } = req.body;

        // Validate dates
        const start = new Date(start_date);
        const end = new Date(end_date);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Dates invalides' });
        }

        const campaign = await prisma.campaign.create({
            data: {
                title,
                description,
                start_date: start,
                end_date: end,
                budget_target: budget_target ? parseFloat(budget_target) : null,
                status: 'DRAFT'
            }
        });
        res.status(201).json(campaign);
    } catch (error) {
        console.error('Error creating campaign:', error);
        require('fs').writeFileSync('C:/Users/julie/OneDrive/Desktop/Skillhub-Formation/server_error.log', JSON.stringify(error, null, 2) + '\n' + error.stack);
        res.status(500).json({ message: 'Erreur lors de la création de la campagne' });
    }
});

// PUT /api/v1/campaigns/:id - Update campaign (RH only)
router.put('/:id', authenticateToken, checkRole(['rh', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, start_date, end_date, budget_target, status } = req.body;

        // Check if exists
        const existing = await prisma.campaign.findUnique({ where: { id: parseInt(id) } });
        if (!existing) {
            return res.status(404).json({ message: 'Campagne non trouvée' });
        }

        const data = {};
        if (title) data.title = title;
        if (description !== undefined) data.description = description;
        if (start_date) data.start_date = new Date(start_date);
        if (end_date) data.end_date = new Date(end_date);
        if (budget_target !== undefined) data.budget_target = budget_target ? parseFloat(budget_target) : null;
        if (status) data.status = status;

        const campaign = await prisma.campaign.update({
            where: { id: parseInt(id) },
            data
        });

        res.json(campaign);
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
});


// PUT /api/v1/campaigns/:id/open - Open campaign
router.put('/:id/open', authenticateToken, checkRole(['rh', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await prisma.campaign.update({
            where: { id: parseInt(id) },
            data: { status: 'OPEN' }
        });
        res.json(campaign);
    } catch (error) {
        console.error('Error opening campaign:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ouverture de la campagne' });
    }
});

// PUT /api/v1/campaigns/:id/close - Close campaign
router.put('/:id/close', authenticateToken, checkRole(['rh', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await prisma.campaign.update({
            where: { id: parseInt(id) },
            data: { status: 'CLOSED' }
        });
        res.json(campaign);
    } catch (error) {
        console.error('Error closing campaign:', error);
        res.status(500).json({ message: 'Erreur lors de la clôture' });
    }
});

module.exports = router;
