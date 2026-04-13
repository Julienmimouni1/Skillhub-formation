const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding skills...');

    const skillData = [
        { name: 'Négociation Commerciale', category: 'Soft Skills' },
        { name: 'Leadership & Management', category: 'Soft Skills' },
        { name: 'Gestion de Projet (Agile)', category: 'Hard Skills' },
        { name: 'SQL & Bases de données', category: 'Hard Skills' },
        { name: 'React & Frontend', category: 'Hard Skills' },
        { name: 'Anglais (Business)', category: 'Langues' },
        { name: 'Excel Avancé', category: 'Hard Skills' },
        { name: 'Pr prise de parole en public', category: 'Soft Skills' }
    ];

    for (const skill of skillData) {
        await prisma.skill.upsert({
            where: { name: skill.name },
            update: {},
            create: skill
        });
    }

    const users = await prisma.user.findMany({ take: 10 });
    const skills = await prisma.skill.findMany();

    console.log('Linking skills to users...');

    for (const user of users) {
        // Randomly assign 3-5 skills to each user with random levels
        const shuffled = skills.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 3);

        for (const s of selected) {
            await prisma.userSkill.upsert({
                where: {
                    user_id_skill_id: {
                        user_id: user.id,
                        skill_id: s.id
                    }
                },
                update: {},
                create: {
                    user_id: user.id,
                    skill_id: s.id,
                    level: Math.floor(Math.random() * 5) + 1
                }
            });
        }
    }

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
