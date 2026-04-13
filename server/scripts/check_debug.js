const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const email = 'collab.tech@skillhub.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: { requests: true }
    });

    if (!user) {
        console.log(`User ${email} not found.`);
        return;
    }

    console.log(`User ${email} (ID: ${user.id}) has ${user.requests.length} requests.`);
    user.requests.forEach(r => {
        console.log(` - ID: ${r.id}, Status: ${r.status}, Title: ${r.title}`);
    });
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
