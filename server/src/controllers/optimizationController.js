const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getOptimizationOpportunities = async (req, res) => {
    try {
        // Find groups of requests with same title and status PENDING_RH or APPROVED
        const groupedRequests = await prisma.trainingRequest.groupBy({
            by: ['title'],
            where: {
                status: { in: ['PENDING_RH', 'APPROVED'] }
            },
            _count: {
                id: true
            },
            _sum: {
                cost: true
            },
            having: {
                id: {
                    _count: {
                        gte: 5
                    }
                }
            }
        });

        const opportunities = groupedRequests.map(group => {
            const count = group._count.id;
            const totalCost = Number(group._sum.cost) || 0;
            // Assumption: Intra session is ~65% of total individual costs (35% saving)
            const estimatedSessionCost = totalCost * 0.65;
            const potentialSavings = totalCost - estimatedSessionCost;

            return {
                title: group.title,
                count,
                totalCost,
                estimatedSessionCost,
                potentialSavings
            };
        });

        // Sort by potential savings desc
        opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);

        res.json(opportunities);

    } catch (error) {
        console.error('Error fetching optimization opportunities:', error);
        res.status(500).json({ error: 'Failed to fetch optimization opportunities' });
    }
};

const createIntraSession = async (req, res) => {
    // Placeholder for US-417: Convert to session
    // For now, just return success
    res.json({ message: 'Feature coming soon: Convert to Intra Session' });
};

module.exports = {
    getOptimizationOpportunities,
    createIntraSession
};
