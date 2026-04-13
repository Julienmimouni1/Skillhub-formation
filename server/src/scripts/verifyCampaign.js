const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:3000/api/v1';

async function verifyCampaignFlow() {
    console.log('--- Starting Campaign Feature Verification ---');

    // 0. Cleanup: Close all existing OPEN campaigns to ensure deterministic test
    try {
        console.log('0. Cleaning up old campaigns...');
        await prisma.campaign.updateMany({
            where: { status: 'OPEN' },
            data: { status: 'CLOSED' }
        });
        console.log('   Old campaigns closed.');
    } catch (e) {
        console.error('   Cleanup Failed:', e.message);
    }

    let rhToken, managerToken;
    let campaignId;
    let requestId;

    // 1. Login as RH
    try {
        console.log('1. Logging in as RH...');
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'rh@skillhub.com',
            password: 'password123'
        });

        const cookies = res.headers['set-cookie'];
        rhToken = cookies[0].split(';')[0]; // access_token=...
        console.log('   RH Login Successful.');
    } catch (e) {
        console.error('   RH Login Failed:', e.message);
        if (e.response) {
            console.error('   Status:', e.response.status);
            console.error('   Data:', e.response.data);
        } else if (e.request) {
            console.error('   No response received. Server might be down.');
        }
        return;
    }

    const rhConfig = { headers: { Cookie: rhToken } };

    // 2. Create Campaign
    try {
        console.log('2. Creating Campaign...');
        const res = await axios.post(`${API_URL}/campaigns`, {
            title: 'Campagne Test Verification ' + Date.now(),
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 86400000 * 30).toISOString(), // +30 days
            budget_target: 50000
        }, rhConfig);
        campaignId = res.data.id;
        console.log(`   Campaign Created. ID: ${campaignId}`);
    } catch (e) {
        console.error('   Create Campaign Failed:', e.response?.data || e.message);
        return;
    }

    // 3. Open Campaign
    try {
        console.log('3. Opening Campaign...');
        await axios.put(`${API_URL}/campaigns/${campaignId}`, { status: 'OPEN' }, rhConfig);
        console.log('   Campaign Opened.');
    } catch (e) {
        console.error('   Open Campaign Failed:', e.response?.data || e.message);
    }

    // 4. Login as Manager
    try {
        console.log('4. Logging in as Manager...');
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'manager.tech@skillhub.com',
            password: 'password123'
        });
        const cookies = res.headers['set-cookie'];
        managerToken = cookies[0].split(';')[0];
        console.log('   Manager Login Successful.');
    } catch (e) {
        console.error('   Manager Login Failed:', e.message);
        return;
    }

    const managerConfig = { headers: { Cookie: managerToken } };

    // 5. Get Active Campaign
    try {
        console.log('5. Fetching Active Campaign...');
        const res = await axios.get(`${API_URL}/campaigns/active`, managerConfig);
        if (res.data && res.data.id === campaignId) {
            console.log('   Active Campaign Verified.');
        } else {
            console.error('   Active Campaign Mismatch or None.');
            console.log('   Expected ID:', campaignId);
            console.log('   Got:', res.data);
        }
    } catch (e) {
        console.error('   Fetch Active Campaign Failed:', e.message);
    }

    // 6. Submit Request
    try {
        console.log('6. Submitting Request...');
        const res = await axios.post(`${API_URL}/requests`, {
            title: 'Formation React Avancé',
            description: 'Besoin pour le projet X',
            cost: 2000,
            type: 'PLAN_DEV',
            campaign_id: campaignId,
            status: 'PENDING_RH'
        }, managerConfig);
        requestId = res.data.request.id;
        console.log(`   Request Submitted. ID: ${requestId}`);
        console.log('   Request Data:', res.data.request);
    } catch (e) {
        console.error('   Submit Request Failed:', e.response?.data || e.message);
        return;
    }

    // 7. RH Verification
    try {
        console.log('7. RH Verifying Request...');
        const res = await axios.get(`${API_URL}/requests?campaign_id=${campaignId}`, rhConfig);
        const found = res.data.requests.find(r => r.id === requestId);
        if (found) {
            console.log('   Request found in campaign list.');
        } else {
            console.error('   Request NOT found in campaign list.');
            console.log('   Requests found:', res.data.requests.map(r => r.id));
        }
    } catch (e) {
        console.error('   RH Verify Failed:', e.message);
    }

    // 8. Close Campaign
    try {
        console.log('8. Closing Campaign...');
        await axios.put(`${API_URL}/campaigns/${campaignId}/close`, {}, rhConfig);
        console.log('   Campaign Closed.');
    } catch (e) {
        console.error('   Close Campaign Failed:', e.message);
    }

    console.log('--- Verification Complete ---');
    await prisma.$disconnect();
}

verifyCampaignFlow();
