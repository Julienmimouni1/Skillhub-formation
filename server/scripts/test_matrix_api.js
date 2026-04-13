const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'your_jwt_secret';

async function main() {
    console.log('🧪 Testing Skill Matrix API...');

    // 1. Login as Manager
    const email = 'manager.tech@skillhub.com';
    const password = 'password123';

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.error('❌ User not found');
        return;
    }

    // Verify password (bypass bcrypt check for speed if we know it works, but let's be thorough)
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        console.error('❌ Invalid password');
        // Generate a token anyway for testing if needed, assuming we trust the seed
    }

    // Manually generate token to simulate login
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '24h' }
    );

    console.log(`🔑 Token generated for ${user.first_name} ${user.last_name} (${user.id})`);

    // 2. Call Matrix Endpoint
    try {
        const response = await axios.get('http://localhost:3000/api/v1/skills/matrix', {
            headers: {
                'Cookie': `token=${token}` // Depending on how auth middleware reads it.
                // If it expects Bearer header: 'Authorization': `Bearer ${token}`
            },
            // Also try sending as cookie header if middleware uses req.cookies
             headers: {
                Cookie: `access_token=${token};`
            }
        });

        console.log('📡 API Response Status:', response.status);
        const data = response.data;
        
        console.log(`👥 Team Members Returned: ${data.team ? data.team.length : 0}`);
        if (data.team && data.team.length > 0) {
            console.log('   First member:', data.team[0].first_name);
            console.log('   Skills count:', data.team[0].skills.length);
        }
        
        console.log(`📚 Team Skills (Columns): ${data.teamSkills ? data.teamSkills.length : 0}`);
        console.log(`🌐 All System Skills: ${data.allSystemSkills ? data.allSystemSkills.length : 0}`);

    } catch (error) {
        console.error('❌ API Call Failed:', error.response ? error.response.data : error.message);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
