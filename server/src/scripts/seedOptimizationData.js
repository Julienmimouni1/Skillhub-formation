const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Optimization Data...');

    // 1. Get or create a manager
    const manager = await prisma.user.findFirst({
        where: { role: 'manager' }
    });

    if (!manager) {
        console.error('❌ No manager found. Please seed users first.');
        return;
    }

    // 2. Get some collaborators (or create dummy ones if needed)
    // We'll just pick the first 5 users who are not the manager
    const users = await prisma.user.findMany({
        take: 6,
        where: { id: { not: manager.id } }
    });

    if (users.length < 5) {
        console.warn('⚠️ Not enough users found. Creating requests for available users multiple times.');
    }

    const trainingTitle = "Formation Excel Avancé - Expert";
    const cost = 1200;

    // 2.5 Get or Create Provider
    let provider = await prisma.provider.findUnique({ where: { name: "ExcelPro Formation" } });
    if (!provider) {
        provider = await prisma.provider.create({
            data: { name: "ExcelPro Formation" }
        });
    }

    // 3. Create requests
    const requestsToCreate = [];

    // Ensure we have at least 6 requests
    for (let i = 0; i < 6; i++) {
        const user = users[i % users.length]; // Cycle through users

        requestsToCreate.push({
            user_id: user.id,
            manager_id: manager.id,
            department_id: user.department_id || manager.department_id, // Fallback
            title: trainingTitle,
            description: "Perfectionnement sur les TCD et Macros",
            status: 'PENDING_RH', // Ready for optimization
            cost: cost,
            duration_days: 2,
            type: 'PLAN_DEV',
            start_date: new Date('2025-06-01'),
            end_date: new Date('2025-06-02'),
            provider_id: provider.id,
            created_at: new Date(),
            updated_at: new Date()
        });
    }

    // Insert
    for (const req of requestsToCreate) {
        // Check if department_id is null, if so, skip or fix
        if (!req.department_id) {
            // Fetch a department
            const dept = await prisma.department.findFirst();
            if (dept) req.department_id = dept.id;
            else continue;
        }

        await prisma.trainingRequest.create({
            data: req
        });
    }

    console.log(`✅ Created ${requestsToCreate.length} requests for "${trainingTitle}".`);
    console.log('👉 Go to RH Dashboard > Optimisation to see the result.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
