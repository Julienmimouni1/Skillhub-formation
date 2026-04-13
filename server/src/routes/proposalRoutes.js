const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

// Use a separate prisma instance or import from utils if available, 
// but for now creating a new one or assuming global if standard.
// Checking previous patterns: usually checks imports.
// I'll stick to local instance if not sure, or better:
const prisma = new PrismaClient();

// GET /api/proposals - List all proposals
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware

        const proposals = await prisma.trainingProposal.findMany({
            include: {
                _count: {
                    select: { votes: true }
                },
                votes: {
                    where: { user_id: userId },
                    select: { id: true } // Only need to know if it exists
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Transform data for frontend
        const formattedProposals = proposals.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            voteCount: p._count.votes,
            hasVoted: p.votes.length > 0,
            createdAt: p.created_at
        }));

        res.json(formattedProposals);
    } catch (error) {
        console.error('Error fetching proposals:', error);
        res.status(500).json({ error: 'Failed to fetch proposals' });
    }
});

// POST /api/proposals - Create a new proposal
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.userId;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const newProposal = await prisma.trainingProposal.create({
            data: {
                title,
                description,
                user_id: userId
            }
        });

        res.status(201).json(newProposal);
    } catch (error) {
        console.error('Error creating proposal:', error);
        res.status(500).json({ error: 'Failed to create proposal' });
    }
});

// POST /api/proposals/:id/vote - Toggle vote
router.post('/:id/vote', authenticateToken, async (req, res) => {
    try {
        const proposalId = parseInt(req.params.id);
        const userId = req.user.id;

        // Check if vote exists
        const existingVote = await prisma.trainingProposalVote.findUnique({
            where: {
                proposal_id_user_id: {
                    proposal_id: proposalId,
                    user_id: userId
                }
            }
        });

        if (existingVote) {
            // Remove vote
            await prisma.trainingProposalVote.delete({
                where: { id: existingVote.id }
            });
            res.json({ voted: false });
        } else {
            // Add vote
            await prisma.trainingProposalVote.create({
                data: {
                    proposal_id: proposalId,
                    user_id: userId
                }
            });
            res.json({ voted: true });
        }
    } catch (error) {
        console.error('Error toggling vote:', error);
        res.status(500).json({ error: 'Failed to toggle vote' });
    }
});

module.exports = router;
