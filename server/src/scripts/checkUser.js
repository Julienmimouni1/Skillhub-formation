const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const user = await prisma.user.findUnique({
        where: { email: 'rh@skillhub.com' }
    });
    console.log('User:', user);
}

check()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
