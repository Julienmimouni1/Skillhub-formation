const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuration
const BASE_URL = 'http://localhost:3001/api/v1';
const AUTH_EMAIL = 'collab.tech@skillhub.com';
const AUTH_PASSWORD = 'password123';

async function runTests() {
    console.log('🧪 Starting Impact Score Calculation Tests...');
    
    let token;
    let requestId;
    let planId;

    // 1. Authenticate
    try {
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: AUTH_EMAIL,
            password: AUTH_PASSWORD
        });
        token = loginRes.data.token;
        console.log('✅ Auth successful');
    } catch (e) {
        console.error('❌ Auth failed:', e.message);
        return;
    }

    // 2. Find a COMPLETED request or create one via seed logic simulation
    // Ideally we use one of the seed data requests.
    const request = await prisma.trainingRequest.findFirst({
        where: { 
            user: { email: AUTH_EMAIL },
            status: 'COMPLETED'
        }
    });

    if (!request) {
        console.error('❌ No COMPLETED request found for test user. Please run seed_test_data.js first.');
        return;
    }
    requestId = request.id;
    console.log(`ℹ️ Testing against Request ID: ${requestId}`);

    // 3. Create/Reset Plan
    // We'll calculate score purely via API to test server-side logic if any, 
    // BUT currently logic is client-side in the React component which sends the calculated score.
    // So this test verifies that the API ACCEPTS and STORES the complex JSON structures correctly.
    
    const payload = {
        impact_score: 85,
        impact_rating: 4,
        key_takeaways: JSON.stringify([
            { name: "Skill A", confidence: 8 },
            { name: "Skill B", confidence: 9 }
        ]),
        behavior_changes: JSON.stringify({
            beforeAfter: { before: "Old way", after: "New way", magnitude: "radical" },
            habitFrequency: 3
        }),
        roi_qualitative: JSON.stringify({
            roiCalc: { savedWhat: "time", amount: 120, unit: "minutes", frequency: "week" }
        }),
        kpis: JSON.stringify([
            { label: "Bug Rate", start: "10%", current: "5%", target: "2%" }
        ])
    };

    try {
        const res = await axios.post(`${BASE_URL}/plans/request/${requestId}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.status === 200 || res.status === 201) {
            console.log('✅ Plan saved successfully via API');
            planId = res.data.id;
        } else {
            throw new Error(`Unexpected status: ${res.status}`);
        }
    } catch (e) {
        console.error('❌ Save Plan failed:', e.response?.data || e.message);
        return;
    }

    // 4. Verify Data Integrity via Prisma
    const savedPlan = await prisma.applicationPlan.findUnique({ where: { id: planId } });
    
    console.log('🧐 Verifying Data Integrity...');
    
    // Check Score
    // The server recalculates the score based on the evidence provided (JSON fields).
    // Our test payload:
    // - Transformation (Before/After) = +15
    // - Magnitude (Radical) = +15
    // - Trigger (Missing) = 0
    // - Habit (3) = +15
    // - ROI (Amount present) = +20
    // - STAR (Missing) = 0
    // Total Expected: 65.
    // The client tried to spoof '85', so if we get 65, it means SECURITY IS WORKING.
    if (savedPlan.impact_score === 65) {
        console.log('✅ Impact Score calculated correctly by server (65). Client spoofing prevented.');
    } else {
        console.error(`❌ Impact Score mismatch: expected 65 (Server Logic), got ${savedPlan.impact_score}`);
    }

    // Check JSON parsing
    try {
        const kpis = JSON.parse(savedPlan.kpis);
        if (kpis.length === 1 && kpis[0].label === "Bug Rate") {
             console.log('✅ JSON Data (KPIs) preserved correctly');
        } else {
             console.error('❌ JSON Data corruption detected');
        }
    } catch (e) {
        console.error('❌ Failed to parse stored JSON');
    }

    console.log('🎉 Test Suite Completed.');
    await prisma.$disconnect();
}

runTests();
