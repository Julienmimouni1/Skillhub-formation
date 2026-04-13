const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTeamSkillMatrix = async (req, res) => {
    try {
        const userId = parseInt(req.user.id); // Ensure Int
        const role = req.user.role.toLowerCase(); // Ensure lowercase
        const { departmentId } = req.query;

        console.log(`🔍 getTeamSkillMatrix called by User ID: ${userId}, Role: ${role}`);

        let whereUser = {};

        // Role-based filtering
        if (role === 'manager') {
            whereUser = { manager_id: userId };
        } else if (role === 'rh' || role === 'admin') {
            if (departmentId) {
                whereUser = { department_id: parseInt(departmentId) };
            }
        } else {
            console.log('⛔ Access denied: Invalid role');
            return res.status(403).json({ error: { status: 403, message: 'Accès non autorisé.' } });
        }

        console.log('Querying team with filter:', whereUser);

        const team = await prisma.user.findMany({
            where: {
                ...whereUser,
                is_active: true
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                department: { select: { name: true } },
                skills: {
                    include: {
                        skill: true
                    }
                }
            }
        });

        console.log(`✅ Found ${team.length} team members.`);

        // Calculate Freshness
        const now = new Date();
        const teamWithFreshness = team.map(user => ({
            ...user,
            skills: user.skills.map(us => {
                const lastUpdate = new Date(us.updated_at);
                const diffTime = Math.abs(now - lastUpdate);
                const floatMonths = diffTime / (1000 * 60 * 60 * 24 * 30);
                
                let freshness = 100 - (floatMonths * 10); // 10% decay per month
                if (freshness < 0) freshness = 0;
                if (freshness > 100) freshness = 100;

                return { ...us, freshness: Math.round(freshness) };
            })
        }));

        // Get unique skill IDs from the team's skills
        const teamSkillIds = new Set();
        team.forEach(user => {
            user.skills.forEach(us => teamSkillIds.add(us.skill_id));
        });

        let teamSkills = [];
        if (teamSkillIds.size > 0) {
            teamSkills = await prisma.skill.findMany({
                where: {
                    id: { in: Array.from(teamSkillIds) }
                },
                orderBy: { name: 'asc' }
            });
        }

        // Get ALL system skills (for the "Add Column" feature)
        const allSystemSkills = await prisma.skill.findMany({
            orderBy: { name: 'asc' }
        });

        // If teamSkills is empty but we have team members, it implies they have no skills assessed.
        // We still return teamWithFreshness (rows) and empty teamSkills (columns).
        // The frontend handles this by showing an empty table, which is correct.
        // The user can then use "Add Column".

        res.json({ team: teamWithFreshness, teamSkills, allSystemSkills });
    } catch (error) {
        console.error('Get team skill matrix error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const updateSkillLevel = async (req, res) => {
    const { userId, skillId, level, notes } = req.body;

    try {
        const userSkill = await prisma.userSkill.upsert({
            where: {
                user_id_skill_id: {
                    user_id: parseInt(userId),
                    skill_id: parseInt(skillId)
                }
            },
            update: {
                level: parseInt(level),
                notes,
                updated_at: new Date()
            },
            create: {
                user_id: parseInt(userId),
                skill_id: parseInt(skillId),
                level: parseInt(level),
                notes
            }
        });

        res.json(userSkill);
    } catch (error) {
        console.error('Update skill level error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const createSkill = async (req, res) => {
    const { name, category, description } = req.body;
    try {
        const newSkill = await prisma.skill.create({
            data: {
                name,
                category: category || 'General',
                description
            }
        });
        res.json(newSkill);
    } catch (error) {
        console.error('Create skill error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur création compétence.' } });
    }
};

const updateSkill = async (req, res) => {
    const { id } = req.params;
    const { name, category } = req.body;
    try {
        const updated = await prisma.skill.update({
            where: { id: parseInt(id) },
            data: { name, category }
        });
        res.json(updated);
    } catch (error) {
        console.error('Update skill error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur modification compétence.' } });
    }
};

module.exports = {
    getTeamSkillMatrix,
    updateSkillLevel,
    createSkill,
    updateSkill
};
