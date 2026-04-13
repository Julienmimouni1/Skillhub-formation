const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function wipeRequests() {
    console.log('🗑️ Starting cleanup of Training Requests...');

    try {
        // 1. Delete deeply nested relations not covered by Cascade (or just to be safe)
        console.log('   - Deleting Practice Logs...');
        await prisma.practiceLog.deleteMany({});

        console.log('   - Deleting Action Items...');
        await prisma.actionItem.deleteMany({});

        // 2. Delete One-to-One relations dependent on Request
        console.log('   - Deleting Application Plans...');
        await prisma.applicationPlan.deleteMany({});

        console.log('   - Deleting Manager Evaluations...');
        await prisma.managerEvaluation.deleteMany({});

        // 3. Delete One-to-Many relations
        console.log('   - Deleting Validation History...');
        await prisma.validationHistory.deleteMany({});

        console.log('   - Deleting Documents attached to Requests...');
        // Only delete documents linked to a request (preserve Course documents)
        await prisma.document.deleteMany({
            where: {
                request_id: { not: null }
            }
        });

        // 4. Finally, delete the Requests
        console.log('   - Deleting Training Requests...');
        const { count } = await prisma.trainingRequest.deleteMany({});

        console.log(`✅ Cleanup complete! ${count} requests deleted.`);
    } catch (error) {
        console.error('❌ Error cleaning up:', error);
    } finally {
        await prisma.$disconnect();
    }
}

wipeRequests();
