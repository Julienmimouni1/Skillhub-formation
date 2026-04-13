const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:3000/api/v1';

async function testWishlist() {
    try {
        // 1. Login to get cookie
        console.log('Attempting login...');
        // We need a valid user. I'll check the DB for a user first or create one.
        // Actually, I'll just try to find the first user in DB.
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error('No user found in DB to test with.');
            return;
        }
        console.log(`Found user: ${user.email}`);

        // We can't easily login without knowing the password (it's hashed).
        // BUT, since I have DB access, I can generate a JWT token directly!
        const jwt = require('jsonwebtoken');
        const dotenv = require('dotenv');
        dotenv.config();

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Generated test token.');

        // 2. Try to add item to wishlist using the token
        const cookie = `access_token=${token}`;

        console.log('Sending POST request to /wishlist...');
        const response = await axios.post(
            `${BASE_URL}/wishlist`,
            {
                title: 'Test Formation via Script',
                url: 'http://test.com',
                notes: 'Created by debug script'
            },
            {
                headers: {
                    Cookie: cookie,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        console.log('✅ Backend API is working correctly!');

    } catch (error) {
        console.error('❌ Error testing API:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

testWishlist();
