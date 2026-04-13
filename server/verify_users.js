const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    const managers = await prisma.user.count({ where: { role: 'manager' } });
    const rh = await prisma.user.count({ where: { role: 'rh' } });
    const collabs = await prisma.user.count({ where: { role: 'collaborateur' } });

    console.log(`Total Users: ${userCount}`);
    console.log(`Managers: ${managers}`);
    console.log(`RH: ${rh}`);
    console.log(`Collaborators: ${collabs}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
