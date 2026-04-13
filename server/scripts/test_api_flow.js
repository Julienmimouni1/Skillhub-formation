const axios = require('axios');

async function testFlow() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
            email: 'collab.tech@skillhub.com',
            password: 'password123'
        });
        
        const token = loginRes.data.token;
        console.log('Login successful. Token obtained.');

        // 2. Get Requests
        console.log('Fetching requests...');
        const requestsRes = await axios.get('http://localhost:3000/api/v1/requests', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const requests = requestsRes.data.requests;
        console.log(`API returned ${requests.length} requests.`);
        
        const validStatuses = ['APPROVED', 'PLANNED', 'COMPLETED'];
        const filtered = requests.filter(r => validStatuses.includes(r.status));
        
        console.log(`Filtered (Client-side logic) count: ${filtered.length}`);
        filtered.forEach(r => console.log(` - [${r.status}] ${r.title}`));

    } catch (error) {
        console.error('Error Details:', error.code || error.message);
        if (error.response) console.error('Response:', error.response.status, error.response.data);
    }
}

testFlow();
