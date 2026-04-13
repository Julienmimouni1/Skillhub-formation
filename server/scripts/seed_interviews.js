const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users. Updating interviews...`);

    for (const user of users) {
        // Random date within last 3 years
        const monthsAgo = Math.floor(Math.random() * 36);
        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);

        await prisma.user.update({
            where: { id: user.id },
            data: { last_professional_interview: date },
        });
    }
    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
