const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Skill Matrix Seeding for DEMO Accounts...');

    // We target the Tech team from the original seed:
    // Manager: manager.tech@skillhub.com (Thomas Manager)
    // Collab: collab.tech@skillhub.com (Lucas Collab)
    // HR: rh.tech@skillhub.com (Sophie RH)

    const managerEmail = 'manager.tech@skillhub.com';
    
    // 1. Get Manager
    const manager = await prisma.user.findUnique({ where: { email: managerEmail } });
    if (!manager) {
        console.error('Manager not found. Run "npx prisma db seed" first.');
        return;
    }

    // 2. Get Lucas (Collab)
    const lucas = await prisma.user.findUnique({ where: { email: 'collab.tech@skillhub.com' } });
    
    // 3. Create extra team members for Thomas if they don't exist
    // To make the matrix interesting, we need more than 1 person.
    const newMembersData = [
        { email: 'chloe.tech@skillhub.com', first: 'Chloe', last: 'Front', role: 'collaborateur' },
        { email: 'david.tech@skillhub.com', first: 'David', last: 'Back', role: 'collaborateur' }
    ];

    const extraMembers = [];
    for (const m of newMembersData) {
        const user = await prisma.user.upsert({
            where: { email: m.email },
            update: { manager_id: manager.id, department_id: manager.department_id },
            create: {
                email: m.email,
                first_name: m.first,
                last_name: m.last,
                role: m.role,
                password_hash: '$2a$10$X7...', // dummy hash
                manager_id: manager.id,
                department_id: manager.department_id,
                job_title: 'Developer'
            }
        });
        extraMembers.push(user);
    }

    const team = [lucas, ...extraMembers].filter(u => u !== null);

    // 4. Upsert Skills
    const skillsList = [
        { name: 'React', category: 'Hard Skills' },
        { name: 'Node.js', category: 'Hard Skills' },
        { name: 'TypeScript', category: 'Hard Skills' },
        { name: 'SQL', category: 'Hard Skills' },
        { name: 'Communication', category: 'Soft Skills' },
        { name: 'Leadership', category: 'Soft Skills' },
        { name: 'Kubernetes', category: 'Hard Skills' }
    ];

    const skillsMap = {};
    for (const s of skillsList) {
        const skill = await prisma.skill.upsert({
            where: { name: s.name },
            update: {},
            create: { name: s.name, category: s.category }
        });
        skillsMap[s.name] = skill;
    }

    // 5. Assign Skills & Freshness
    // Lucas: Full stack, slightly rusty on Front
    await assignSkill(lucas, skillsMap['React'], 4, 6); // Rusty (6 months)
    await assignSkill(lucas, skillsMap['Node.js'], 5, 0); // Fresh
    await assignSkill(lucas, skillsMap['SQL'], 3, 2); // OK

    // Chloe: Front Expert, Fresh
    await assignSkill(extraMembers[0], skillsMap['React'], 5, 0);
    await assignSkill(extraMembers[0], skillsMap['TypeScript'], 4, 1);
    await assignSkill(extraMembers[0], skillsMap['Communication'], 4, 3);

    // David: Back Expert, Rusty on K8s
    await assignSkill(extraMembers[1], skillsMap['Node.js'], 4, 1);
    await assignSkill(extraMembers[1], skillsMap['SQL'], 5, 0);
    await assignSkill(extraMembers[1], skillsMap['Kubernetes'], 3, 12); // Very Rusty (1 year)

    console.log('✅ Demo Matrix Updated for Thomas Manager (manager.tech@skillhub.com)');
}

async function assignSkill(user, skill, level, monthsAgo) {
    if (!user || !skill) return;

    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);

    await prisma.userSkill.upsert({
        where: {
            user_id_skill_id: {
                user_id: user.id,
                skill_id: skill.id
            }
        },
        update: {
            level: level,
            updated_at: date
        },
        create: {
            user_id: user.id,
            skill_id: skill.id,
            level: level,
            updated_at: date
        }
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
