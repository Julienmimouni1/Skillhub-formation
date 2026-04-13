const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FRANCE_TRAVAIL_AUTH_URL = 'https://entreprise.pole-emploi.fr/connexion/oauth2/access_token';
const FRANCE_TRAVAIL_API_URL = 'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search'; // Using Offres d'emploi as proxy or actual Formation API if available. 
// Note: The actual Formation API might be different, but for this exercise we will simulate the structure or use a mock if credentials are not provided.
// Since we don't have real credentials, we will mock the external call but keep the logic structure.

// Real API endpoint for formations is likely: https://api.francetravail.io/partenaire/formations/v1/... (hypothetical)
// For this implementation, we will simulate the fetch with realistic data structure.

async function getFranceTravailToken() {
    // In a real scenario:
    // const params = new URLSearchParams();
    // params.append('grant_type', 'client_credentials');
    // params.append('client_id', process.env.FT_CLIENT_ID);
    // params.append('client_secret', process.env.FT_CLIENT_SECRET);
    // params.append('scope', 'api_offresdemploiv2 o2dsoffre');
    // const response = await axios.post(FRANCE_TRAVAIL_AUTH_URL, params);
    // return response.data.access_token;

    return "mock_token_" + Date.now();
}

async function fetchFranceTravailCourses(token, keyword) {
    // Simulate API call
    console.log(`Fetching courses for keyword: ${keyword}`);

    // Mock data generation
    const mockCourses = [
        {
            id: `FT-${keyword}-001`,
            title: `Formation ${keyword} Avancé`,
            companyName: 'Cegos',
            description: `Maîtrisez ${keyword} avec cette formation complète de 3 jours.`,
            durationHours: 21,
            price: 1500.00,
            isCpf: true,
            url: 'https://www.cegos.fr/formation-exemple'
        },
        {
            id: `FT-${keyword}-002`,
            title: `Introduction à ${keyword}`,
            companyName: 'Orsys',
            description: `Les bases de ${keyword} pour débutants.`,
            durationHours: 14,
            price: 990.00,
            isCpf: true,
            url: 'https://www.orsys.fr/formation-exemple'
        },
        {
            id: `FT-${keyword}-003`,
            title: `Expert ${keyword}`,
            companyName: 'Learning Tree',
            description: `Devenez un expert sur ${keyword}. Certification incluse.`,
            durationHours: 35,
            price: 2500.00,
            isCpf: false,
            url: 'https://www.learningtree.fr/formation-exemple'
        }
    ];

    return new Promise(resolve => setTimeout(() => resolve(mockCourses), 500));
}

async function syncCatalog() {
    console.log('Starting Catalog Sync Job...');

    try {
        const token = await getFranceTravailToken();
        const keywords = ['React', 'Management', 'Anglais', 'Sécurité', 'Marketing', 'Excel'];

        let totalSynced = 0;

        for (const keyword of keywords) {
            const externalCourses = await fetchFranceTravailCourses(token, keyword);

            for (const course of externalCourses) {
                // 1. Find or Create Provider
                let provider = await prisma.provider.findFirst({
                    where: { name: course.companyName }
                });

                if (!provider) {
                    provider = await prisma.provider.create({
                        data: {
                            name: course.companyName,
                            url: `https://www.google.com/search?q=${encodeURIComponent(course.companyName)}`
                        }
                    });
                }

                // 2. Upsert Training Course
                await prisma.trainingCourse.upsert({
                    where: { external_id: course.id },
                    update: {
                        title: course.title,
                        description: course.description,
                        cost: course.price,
                        duration_hours: course.durationHours,
                        duration_days: course.durationHours / 7, // Assuming 7h/day
                        is_cpf_eligible: course.isCpf,
                        url: course.url,
                        last_synced_at: new Date(),
                        updated_at: new Date()
                    },
                    create: {
                        external_id: course.id,
                        provider_id: provider.id,
                        title: course.title,
                        description: course.description,
                        cost: course.price,
                        duration_hours: course.durationHours,
                        duration_days: course.durationHours / 7,
                        is_cpf_eligible: course.isCpf,
                        url: course.url
                    }
                });
                totalSynced++;
            }
        }

        console.log(`Sync Job Completed. ${totalSynced} courses synced.`);
        return { success: true, count: totalSynced };
    } catch (error) {
        console.error('Error during catalog sync:', error);
        throw error;
    }
}

module.exports = { syncCatalog };
