const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Debugging Manager Data...');

    const email = 'manager.tech@skillhub.com';
    const manager = await prisma.user.findUnique({
        where: { email },
        include: { department: true }
    });

    if (!manager) {
        console.error(`❌ Manager ${email} NOT FOUND.`);
        return;
    }

    console.log(`✅ Manager Found: ID=${manager.id}, Name=${manager.first_name} ${manager.last_name}, Role=${manager.role}`);

    // Check Subordinates
    const subordinates = await prisma.user.findMany({
        where: { manager_id: manager.id }
    });

    console.log(`👥 Subordinates Count: ${subordinates.length}`);
    subordinates.forEach(s => {
        console.log(`   - [${s.id}] ${s.first_name} ${s.last_name} (Active: ${s.is_active})`);
    });

    if (subordinates.length > 0) {
        // Check Skills for first subordinate
        const firstSub = subordinates[0];
        const skills = await prisma.userSkill.findMany({
            where: { user_id: firstSub.id },
            include: { skill: true }
        });
        console.log(`🧠 Skills for ${firstSub.first_name} (${firstSub.id}): ${skills.length}`);
        skills.forEach(sk => {
            console.log(`   - ${sk.skill.name}: Level ${sk.level}`);
        });
    } else {
        console.log('⚠️ No subordinates found. This is why the matrix is empty.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
