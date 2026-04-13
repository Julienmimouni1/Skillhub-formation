const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verify() {
    const demoEmails = [
        'rh.tech@skillhub.com',
        'manager.tech@skillhub.com',
        'collab.tech@skillhub.com',
        'admin@skillhub.com'
    ];

    console.log('--- Verification des comptes de Demo ---');
    for (const email of demoEmails) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            const isValid = await bcrypt.compare('password123', user.password_hash);
            console.log(`[OK] ${email} found. Password valid: ${isValid}`);
        } else {
            console.log(`[FAIL] ${email} NOT found.`);
        }
    }

    // Check if new tables exist
    try {
        const skillsCount = await prisma.skill.count();
        console.log(`[INFO] Skills count: ${skillsCount}`);
        const reviewsCount = await prisma.annualReview.count();
        console.log(`[INFO] AnnualReviews count: ${reviewsCount}`);
    } catch (e) {
        console.log(`[ERROR] New tables check failed: ${e.message}`);
    }

    await prisma.$disconnect();
}

verify();
