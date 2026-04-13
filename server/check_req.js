const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRequest() {
    try {
        const request = await prisma.trainingRequest.findUnique({
            where: { id: 6 },
            include: {
                evaluation: true
            }
        });
        console.log('EVALUATION:', request.evaluation);
        console.log('MANAGER EXPECTATIONS:', request.manager_expectations);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkRequest();
