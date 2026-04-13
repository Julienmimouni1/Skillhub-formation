const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuration
const REQUESTS_PER_USER = 5;

// Data Helpers
const titles = [
    "Advanced React Patterns",
    "Node.js Microservices",
    "Effective Communication",
    "Sales Negotiation Masterclass",
    "Digital Marketing Trends 2026",
    "AWS Certified Solutions Architect",
    "Cybersecurity for Developers",
    "Project Management Professional (PMP)",
    "UX/UI Design Fundamentals",
    "Data Science with Python"
];

const providers = [
    { name: "Udemy", contact_email: "support@udemy.com" },
    { name: "Coursera", contact_email: "enterprise@coursera.org" },
    { name: "Pluralsight", contact_email: "sales@pluralsight.com" },
    { name: "Internal", contact_email: "training@skillhub.com" },
    { name: "Cegos", contact_email: "info@cegos.fr" }
];

const statuses = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "COMPLETED"];
const priorities = ["LOW", "MEDIUM", "HIGH"];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
    console.log('🚀 Starting Test Data Generation...');

    // 1. Ensure Providers Exist
    console.log('📦 Upserting Providers...');
    const dbProviders = [];
    for (const p of providers) {
        const provider = await prisma.provider.upsert({
            where: { name: p.name },
            update: {},
            create: p,
        });
        dbProviders.push(provider);
    }

    // 2. Get Collaborators
    const collaborators = await prisma.user.findMany({
        where: { role: 'collaborateur' },
        include: { department: true } // Need dept for request
    });

    if (collaborators.length === 0) {
        console.error('❌ No collaborators found. Please run seedDemoData.js first or ensure users exist.');
        return;
    }

    console.log(`👥 Found ${collaborators.length} collaborators. Generating requests...`);

    for (const user of collaborators) {
        console.log(`   - Processing user: ${user.email}`);
        
        for (let i = 0; i < REQUESTS_PER_USER; i++) {
            const title = getRandomElement(titles);
            const provider = getRandomElement(dbProviders);
            const status = getRandomElement(statuses);
            const priority = getRandomElement(priorities);
            const cost = getRandomInt(500, 5000);
            
            // Generate distinct dates based on status
            const now = new Date();
            let startDate, endDate;
            
            if (status === 'COMPLETED') {
                startDate = getRandomDate(new Date(2025, 0, 1), new Date(2025, 6, 1));
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + getRandomInt(1, 5));
            } else {
                startDate = getRandomDate(new Date(2026, 1, 1), new Date(2026, 12, 1));
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + getRandomInt(1, 5));
            }

            // Create Request
            const request = await prisma.trainingRequest.create({
                data: {
                    title: `${title} - ${getRandomInt(100, 999)}`, // Unique-ish title
                    description: `Training for ${title} to improve skills.`,
                    objectives: "Master the subject matter and apply it to daily tasks.",
                    user_id: user.id,
                    department_id: user.department_id,
                    manager_id: user.manager_id, // Assuming manager exists if linked
                    provider_id: provider.id,
                    cost: cost,
                    status: status,
                    priority: priority,
                    start_date: startDate,
                    end_date: endDate,
                    duration_days: getRandomInt(1, 5),
                    funding_type: "COMPANY",
                    type: "PLAN_DEV"
                }
            });

            // If COMPLETED, create Application Plan
            if (status === 'COMPLETED') {
                await createApplicationPlan(request.id, user.id);
            }
        }
    }

    console.log('✅ Test Data Generation Complete!');
}

async function createApplicationPlan(requestId, userId) {
    const plan = await prisma.applicationPlan.create({
        data: {
            request_id: requestId,
            progress: getRandomInt(20, 100),
            feedback: "Excellent training, very relevant.",
            key_takeaways: "Learned X, Y, Z.",
            confidence_level: getRandomInt(7, 10),
            impact_rating: getRandomInt(3, 5),
            impact_score: getRandomInt(50, 100),
            application_rate: getRandomInt(40, 90),
            behavior_changes: "Using new patterns in daily coding.",
            scheduled_review_date: new Date(new Date().setDate(new Date().getDate() + 30))
        }
    });

    // Add Action Items
    const actions = ["Share knowledge with team", "Implement new feature using skill", "Update documentation"];
    for (const actionTitle of actions) {
        await prisma.actionItem.create({
            data: {
                plan_id: plan.id,
                title: actionTitle,
                status: getRandomElement(["TODO", "IN_PROGRESS", "DONE"]),
                priority: getRandomElement(["HIGH", "MEDIUM"]),
                is_completed: Math.random() > 0.5
            }
        });
    }

    // Add Practice Logs
    const logCount = getRandomInt(1, 3);
    for (let j = 0; j < logCount; j++) {
        await prisma.practiceLog.create({
            data: {
                plan_id: plan.id,
                content: `Practiced ${j + 1} times. It's getting easier.`,
                mood: getRandomElement(['success', 'neutral', 'struggle']),
                date: new Date()
            }
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
