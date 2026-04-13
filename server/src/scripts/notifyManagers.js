const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sendReminderEmails = async () => {
    console.log('--- Starting Notification Job ---');

    // 1. Find active campaigns ending soon (e.g., in 3 days)
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    const campaignsEndingSoon = await prisma.campaign.findMany({
        where: {
            status: 'OPEN',
            end_date: {
                lte: threeDaysLater,
                gte: today
            }
        }
    });

    console.log(`Found ${campaignsEndingSoon.length} campaigns ending soon.`);

    for (const campaign of campaignsEndingSoon) {
        // 2. Find managers who haven't submitted anything yet (simplified logic)
        // Or just blast everyone for now as a reminder.
        // Let's just log the email sending.

        console.log(`[EMAIL] Sending reminder for campaign "${campaign.title}" to all managers.`);
        console.log(`Subject: Rappel - La campagne "${campaign.title}" se termine bientôt !`);
        console.log(`Body: Bonjour, n'oubliez pas de soumettre vos besoins avant le ${campaign.end_date.toLocaleDateString()}.`);
    }

    console.log('--- Notification Job Completed ---');
};

// If run directly
if (require.main === module) {
    sendReminderEmails()
        .then(() => process.exit(0))
        .catch(e => {
            console.error(e);
            process.exit(1);
        });
}

module.exports = { sendReminderEmails };
