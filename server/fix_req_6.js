const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRequest() {
    try {
        // 1. Check if evaluation exists
        const existing = await prisma.managerEvaluation.findUnique({
            where: { request_id: 6 }
        });

        if (existing) {
            console.log('Evaluation already exists:', existing);
            return;
        }

        // 2. Create evaluation
        const evaluation = await prisma.managerEvaluation.create({
            data: {
                request_id: 6,
                alignment_strategy: 4,
                competence_gap: 5,
                operational_impact: 4,
                roe_expectation: 3,
                content_relevance: 5,
                score: 45,
                comment: "Evaluation régularisée manuellement pour affichage RH."
            }
        });

        console.log('Created evaluation:', evaluation);

        // 3. Update request with manager expectations if missing
        const request = await prisma.trainingRequest.findUnique({ where: { id: 6 } });
        if (!request.manager_expectations) {
            await prisma.trainingRequest.update({
                where: { id: 6 },
                data: {
                    manager_expectations: "Attentes définies par défaut pour correction : Amélioration des compétences techniques."
                }
            });
            console.log('Updated manager expectations');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

fixRequest();
