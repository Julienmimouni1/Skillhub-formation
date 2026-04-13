const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');

// GET /api/certifications/expiring
// Returns all certifications expiring within 30 days (for HR Dashboard)
router.get('/expiring', authenticateToken, async (req, res) => {
    try {
        // Only HR or Admin
        if (req.user.role !== 'rh' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const expiringCerts = await prisma.userCertification.findMany({
            where: {
                expires_at: {
                    gte: today,
                    lte: thirtyDaysFromNow
                }
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        department: { select: { name: true } }
                    }
                }
            },
            orderBy: {
                expires_at: 'asc'
            }
        });

        res.json(expiringCerts);
    } catch (error) {
        console.error('Error fetching expiring certifications:', error);
        res.status(500).json({ error: 'Failed to fetch certifications' });
    }
});

// GET /api/certifications/user/:userId
// Returns certifications for a specific user
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.userId);

        // Security check: only own profile or Manager/HR/Admin
        if (req.user.userId !== targetUserId &&
            req.user.role === 'collaborateur') {
            // For simplicity, strict check. Ideally check if manager of user.
            // But for now, collaborators can only see their own.
            return res.status(403).json({ error: 'Access denied' });
        }

        const certs = await prisma.userCertification.findMany({
            where: { user_id: targetUserId },
            orderBy: { expires_at: 'asc' }
        });

        res.json(certs);
    } catch (error) {
        console.error('Error fetching user certifications:', error);
        res.status(500).json({ error: 'Failed to fetch certifications' });
    }
});

// POST /api/certifications
// Create a new certification (HR/Admin usually, but open for demo)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { user_id, name, issuing_org, obtained_at, expires_at } = req.body;

        const newCert = await prisma.userCertification.create({
            data: {
                user_id: parseInt(user_id),
                name,
                issuing_org,
                obtained_at: new Date(obtained_at),
                expires_at: expires_at ? new Date(expires_at) : null
            }
        });

        res.status(201).json(newCert);
    } catch (error) {
        console.error('Error creating certification:', error);
        res.status(500).json({ error: 'Failed to create certification' });
    }
});

module.exports = router;
