const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function recalculateScores() {
    console.log('🔄 Starting Impact Score Recalculation...');

    try {
        const plans = await prisma.applicationPlan.findMany();
        console.log(`Found ${plans.length} plans to process.`);

        let updatedCount = 0;

        for (const plan of plans) {
            let score = 0;

            // 1. Parsing Data
            let beforeAfter = { before: '', after: '', magnitude: 'moderate', trigger: '' };
            let habitFrequency = 0;
            let roiCalc = { amount: '' };
            let starStory = { situation: '', task: '', action: '', result: '' };

            try {
                if (plan.behavior_changes) {
                    const behav = JSON.parse(plan.behavior_changes);
                    if (behav.beforeAfter) beforeAfter = { ...beforeAfter, ...behav.beforeAfter };
                    if (behav.habitFrequency) habitFrequency = behav.habitFrequency;
                }
                if (plan.roi_qualitative) {
                    const roi = JSON.parse(plan.roi_qualitative);
                    if (roi.roiCalc) roiCalc = { ...roiCalc, ...roi.roiCalc };
                    if (roi.starStory) starStory = { ...starStory, ...roi.starStory };
                }
            } catch (e) {
                console.warn(`Error parsing JSON for plan ${plan.id}:`, e.message);
                continue;
            }

            // 2. Calculation Logic (Mirrors Frontend)

            // L3: Transformation
            if (beforeAfter.before && beforeAfter.after) score += 15;
            // Relaxed check: just check if trigger is present
            if (beforeAfter.trigger && beforeAfter.trigger.trim().length > 0) score += 10;

            // Magnitude
            if (beforeAfter.magnitude === 'marginal') score += 5;
            else if (beforeAfter.magnitude === 'moderate') score += 10;
            else if (beforeAfter.magnitude === 'radical') score += 15;

            // Habit
            if (habitFrequency > 0) {
                score += (habitFrequency * 5);
            }

            // L4: Results
            if (roiCalc.amount) score += 20;

            // STAR Story
            // Relaxed check: > 2 chars
            const starFilled = Object.values(starStory).filter(v => v && v.length > 2).length;
            if (starFilled === 4) score += 20;

            // Cap at 100
            score = Math.min(100, score);

            // 3. Update
            if (plan.impact_score !== score) {
                await prisma.applicationPlan.update({
                    where: { id: plan.id },
                    data: { impact_score: score }
                });
                console.log(`✅ Plan ${plan.id}: Updated score ${plan.impact_score} -> ${score}`);
                updatedCount++;
            }
        }

        console.log(`\n🎉 Sync Complete. Updated ${updatedCount} plans.`);

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

recalculateScores();
