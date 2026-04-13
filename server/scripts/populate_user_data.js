const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting User Data Population...');

    try {
        // 1. Get all users
        const users = await prisma.user.findMany({
            include: { department: true }
        });

        console.log(`Found ${users.length} users.`);

        // 2. Identify Managers and RH
        const managers = users.filter(u => u.role === 'manager');
        const rhUsers = users.filter(u => u.role === 'rh');
        const admins = users.filter(u => u.role === 'admin');

        if (managers.length === 0) {
            console.warn('⚠️ No managers found! Creating a default manager...');
            // Create a default manager if none exists
            const defaultManager = await prisma.user.create({
                data: {
                    email: 'manager.default@skillhub.com',
                    password_hash: '$2a$10$X7.1.1.1.1.1.1.1.1.1.1', // dummy hash
                    first_name: 'Manager',
                    last_name: 'Default',
                    role: 'manager',
                    job_title: 'Manager d\'équipe',
                    employee_id: 'MGR001'
                }
            });
            managers.push(defaultManager);
        }

        if (rhUsers.length === 0) {
            console.warn('⚠️ No RH found! Creating a default RH...');
            const defaultRH = await prisma.user.create({
                data: {
                    email: 'rh.default@skillhub.com',
                    password_hash: '$2a$10$X7.1.1.1.1.1.1.1.1.1.1', // dummy hash
                    first_name: 'RH',
                    last_name: 'Default',
                    role: 'rh',
                    job_title: 'Responsable RH',
                    employee_id: 'RH001'
                }
            });
            rhUsers.push(defaultRH);
        }

        const mainManager = managers[0];
        const mainRH = rhUsers[0];

        console.log(`Using Manager: ${mainManager.email} (ID: ${mainManager.id})`);
        console.log(`Using RH: ${mainRH.email} (ID: ${mainRH.id})`);

        // 3. Update Users
        for (const [index, user] of users.entries()) {
            const updates = {};

            // Generate Employee ID if missing
            if (!user.employee_id) {
                updates.employee_id = `EMP${String(index + 1).padStart(3, '0')}`;
            }

            // Set Job Title based on role if missing
            if (!user.job_title) {
                switch (user.role) {
                    case 'admin': updates.job_title = 'Administrateur Système'; break;
                    case 'rh': updates.job_title = 'Chargé de Formation'; break;
                    case 'manager': updates.job_title = 'Manager Opérationnel'; break;
                    default: updates.job_title = 'Collaborateur'; break;
                }
            }

            // Set Legal Entity & Division if missing
            if (!user.legal_entity) updates.legal_entity = 'SkillHub France SAS';
            if (!user.division) updates.division = user.department ? user.department.name : 'Opérations';

            // Set Birth Date if missing (random date between 1980 and 2000)
            if (!user.birth_date) {
                const year = 1980 + Math.floor(Math.random() * 20);
                const month = Math.floor(Math.random() * 12);
                const day = 1 + Math.floor(Math.random() * 28);
                updates.birth_date = new Date(year, month, day);
            }

            // Link Manager (if user is collaborator and has no manager)
            if (user.role === 'collaborateur' && !user.manager_id) {
                updates.manager_id = mainManager.id;
            }

            // Link RH (if user has no RH)
            if (!user.assigned_rh_id) {
                updates.assigned_rh_id = mainRH.id;
            }

            // Apply Updates
            if (Object.keys(updates).length > 0) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: updates
                });
                console.log(`✅ Updated User: ${user.email} (${Object.keys(updates).join(', ')})`);
            } else {
                console.log(`ℹ️ User ${user.email} already up to date.`);
            }
        }

        console.log('🎉 Population Complete!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
