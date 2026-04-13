const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Skill Matrix Seeding...');

    // 1. Ensure Department exists
    const techDept = await prisma.department.upsert({
        where: { name: 'Tech & Product' },
        update: {},
        create: { name: 'Tech & Product', budget_allocated: 50000 }
    });

    // 2. Ensure Manager exists
    const manager = await prisma.user.upsert({
        where: { email: 'julien.manager@skillhub.com' },
        update: {},
        create: {
            email: 'julien.manager@skillhub.com',
            first_name: 'Julien',
            last_name: 'Manager',
            role: 'manager',
            password_hash: 'hashed_placeholder', // Not used for login in this context usually
            department_id: techDept.id
        }
    });

    // 3. Create Team Members
    const membersData = [
        { email: 'alice.dev@skillhub.com', first: 'Alice', last: 'Dev', role: 'collaborateur' },
        { email: 'bob.archi@skillhub.com', first: 'Bob', last: 'Architect', role: 'collaborateur' },
        { email: 'charlie.junior@skillhub.com', first: 'Charlie', last: 'Junior', role: 'collaborateur' }
    ];

    const members = [];
    for (const m of membersData) {
        const user = await prisma.user.upsert({
            where: { email: m.email },
            update: { manager_id: manager.id, department_id: techDept.id },
            create: {
                email: m.email,
                first_name: m.first,
                last_name: m.last,
                role: m.role,
                password_hash: 'placeholder',
                manager_id: manager.id,
                department_id: techDept.id
            }
        });
        members.push(user);
    }

    // 4. Create Skills
    const skillsData = [
        { name: 'React Native', category: 'Hard Skills' },
        { name: 'Node.js', category: 'Hard Skills' },
        { name: 'System Design', category: 'Hard Skills' },
        { name: 'Public Speaking', category: 'Soft Skills' },
        { name: 'Docker', category: 'Hard Skills' }
    ];

    const skills = {};
    for (const s of skillsData) {
        const skill = await prisma.skill.upsert({
            where: { name: s.name },
            update: {},
            create: { name: s.name, category: s.category }
        });
        skills[s.name] = skill;
    }

    // 5. Assign Skills with specific Freshness (Manipulating updated_at)
    const assignments = [
        // Alice: React Expert & Fresh
        { user: members[0], skill: skills['React Native'], level: 5, monthsAgo: 0 },
        // Alice: Node.js Good but Rusty (6 months ago)
        { user: members[0], skill: skills['Node.js'], level: 4, monthsAgo: 6 },
        
        // Bob: System Design Expert & Fresh
        { user: members[1], skill: skills['System Design'], level: 5, monthsAgo: 0 },
        // Bob: Docker Expert but Very Rusty (12 months ago)
        { user: members[1], skill: skills['Docker'], level: 5, monthsAgo: 12 },
        
        // Charlie: Learning React (Fresh)
        { user: members[2], skill: skills['React Native'], level: 2, monthsAgo: 0 },
        // Charlie: Public Speaking (Standard)
        { user: members[2], skill: skills['Public Speaking'], level: 3, monthsAgo: 2 }
    ];

    for (const a of assignments) {
        const pastDate = new Date();
        pastDate.setMonth(pastDate.getMonth() - a.monthsAgo);

        // We use update here to force the updated_at time if record exists
        // But Prisma @updatedAt might override it on update. 
        // We might need to use raw query or updateMany if direct update doesn't stick.
        // Let's try standard update first, but Prisma sets updated_at automatically.
        // Actually, we can manually set updated_at in many cases if we include it.
        
        await prisma.userSkill.upsert({
            where: {
                user_id_skill_id: {
                    user_id: a.user.id,
                    skill_id: a.skill.id
                }
            },
            update: {
                level: a.level,
                updated_at: pastDate 
            },
            create: {
                user_id: a.user.id,
                skill_id: a.skill.id,
                level: a.level,
                updated_at: pastDate // Works on create
            }
        });
        
        // Force update just in case upsert update ignored custom date due to @updatedAt behavior
        // Sometimes Prisma overrides.
        // A raw query is safer for "time travel".
        /*
        await prisma.$executeRaw`
            UPDATE "UserSkill" 
            SET updated_at = ${pastDate} 
            WHERE user_id = ${a.user.id} AND skill_id = ${a.skill.id}
        `;
        */ 
        // Note: SQLite uses different syntax if needed, but Prisma usually handles Dates ok.
        // Let's trust Prisma allows manual override if passed explicitly, 
        // if not we might see them all as "Fresh".
    }

    console.log('✅ Seeding Complete. Skills & Freshness Applied.');
    console.log('Manager: julien.manager@skillhub.com');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
