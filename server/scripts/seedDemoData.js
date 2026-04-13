const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function seedDemoData() {
    console.log('🌱 Seeding Clean Demo Data with Strict Perimeters...');

    try {
        // CLEANUP FIRST to avoid Unique Constraint & FK errors
        console.log('   - 🧹 Clearing ALL existing data...');

        // 1. Level 4 dependencies (Deepest)
        await prisma.practiceLog.deleteMany({});
        await prisma.actionItem.deleteMany({});
        await prisma.trainingProposalVote.deleteMany({});

        // 2. Level 3 dependencies
        await prisma.applicationPlan.deleteMany({});
        await prisma.managerEvaluation.deleteMany({});
        await prisma.validationHistory.deleteMany({});
        await prisma.document.deleteMany({}); // References Request & User

        // 3. Level 2 dependencies
        await prisma.trainingRequest.deleteMany({});
        await prisma.wishlist.deleteMany({});
        await prisma.trainingProposal.deleteMany({});
        await prisma.userCertification.deleteMany({});

        // 4. Level 1 dependencies (Core)
        await prisma.budgetLine.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.department.deleteMany({});

        console.log('   - ✨ Data cleared.');

        const passwordHash = await bcrypt.hash('password123', 10);

        // 1. Create Departments
        const deptsPayload = [
            { name: 'Tech', budget: 75000 },
            { name: 'Marketing', budget: 45000 },
            { name: 'Sales', budget: 60000 }
        ];

        const deptMap = {}; // name -> id

        for (const d of deptsPayload) {
            const dept = await prisma.department.upsert({
                where: { name: d.name },
                update: { budget_allocated: d.budget },
                create: { name: d.name, budget_allocated: d.budget }
            });
            deptMap[d.name] = dept.id;
        }

        // 2. Define The Perimeter "Heads" (RHs) first to get their IDs
        const rhConfig = [
            {
                dept: 'Tech', email: 'rh.tech@skillhub.com',
                first: 'Sophie', last: 'Dubois', emp_id: 'EMP001',
                job: 'DRH Tech'
            },
            {
                dept: 'Marketing', email: 'rh.marketing@skillhub.com',
                first: 'Emma', last: 'Laurent', emp_id: 'EMP004',
                job: 'DRH Marketing'
            },
            {
                dept: 'Sales', email: 'rh.sales@skillhub.com',
                first: 'Alexandre', last: 'Richard', emp_id: 'EMP007',
                job: 'DRH Sales'
            }
        ];

        const rhMap = {}; // deptName -> rhUserId

        console.log('   - Creating RH Users (Perimeter Heads)...');
        for (const rh of rhConfig) {
            const user = await prisma.user.upsert({
                where: { email: rh.email },
                update: {
                    first_name: rh.first, last_name: rh.last,
                    role: 'rh',
                    department_id: deptMap[rh.dept],
                    employee_id: rh.emp_id,
                    job_title: rh.job,
                    assigned_rh_id: undefined,
                    is_active: true,
                    hired_at: new Date('2020-01-15'),
                    last_professional_interview: new Date('2024-01-15'),
                    last_annual_review: new Date('2024-11-15')
                },
                create: {
                    email: rh.email, password_hash: passwordHash,
                    first_name: rh.first, last_name: rh.last,
                    role: 'rh',
                    department_id: deptMap[rh.dept],
                    employee_id: rh.emp_id,
                    job_title: rh.job,
                    assigned_rh_id: undefined,
                    is_active: true,
                    hired_at: new Date('2020-01-15'),
                    last_professional_interview: new Date('2024-01-15'),
                    last_annual_review: new Date('2024-11-15')
                }
            });

            // Self-assign ID after creation to be safe
            await prisma.user.update({
                where: { id: user.id },
                data: { assigned_rh_id: user.id }
            });

            rhMap[rh.dept] = user.id;
            console.log(`     > ${rh.dept}: ${rh.first} (ID: ${user.id})`);
        }

        // 3. Define the rest of the team (Managers & Collabs)
        const teamConfig = [
            // TECH
            {
                role: 'manager', dept: 'Tech', email: 'manager.tech@skillhub.com',
                first: 'Thomas', last: 'Bernard', emp_id: 'EMP002', job: 'CTO'
            },
            {
                role: 'collaborateur', dept: 'Tech', manager_email: 'manager.tech@skillhub.com',
                email: 'collab.tech@skillhub.com', first: 'Lucas', last: 'Petit', emp_id: 'EMP003', job: 'Dev Senior'
            },
            // MARKETING
            {
                role: 'manager', dept: 'Marketing', email: 'manager.marketing@skillhub.com',
                first: 'Julie', last: 'Moreau', emp_id: 'EMP005', job: 'CMO'
            },
            {
                role: 'collaborateur', dept: 'Marketing', manager_email: 'manager.marketing@skillhub.com',
                email: 'collab.marketing@skillhub.com', first: 'Antoine', last: 'Roux', emp_id: 'EMP006', job: 'Growth Lead'
            },
            // SALES
            {
                role: 'manager', dept: 'Sales', email: 'manager.sales@skillhub.com',
                first: 'Sarah', last: 'Girard', emp_id: 'EMP008', job: 'Head of Sales'
            },
            {
                role: 'collaborateur', dept: 'Sales', manager_email: 'manager.sales@skillhub.com',
                email: 'collab.sales@skillhub.com', first: 'Maxime', last: 'Simon', emp_id: 'EMP009', job: 'Account Exec'
            }
        ];

        console.log('   - Creating Team Members linked to RH...');

        const managers = teamConfig.filter(u => u.role === 'manager');
        const collabs = teamConfig.filter(u => u.role === 'collaborateur');

        const managerMap = {}; // email -> id

        for (const m of managers) {
            const rhId = rhMap[m.dept]; // STRICT LINKAGE
            const user = await prisma.user.upsert({
                where: { email: m.email },
                update: {
                    first_name: m.first, last_name: m.last,
                    role: m.role,
                    department_id: deptMap[m.dept],
                    assigned_rh_id: rhId,
                    employee_id: m.emp_id,
                    job_title: m.job,
                    is_active: true,
                    hired_at: new Date('2021-03-20'),
                    last_professional_interview: new Date('2022-05-20'),
                    last_annual_review: new Date('2024-02-20')
                },
                create: {
                    email: m.email, password_hash: passwordHash,
                    first_name: m.first, last_name: m.last,
                    role: m.role,
                    department_id: deptMap[m.dept],
                    assigned_rh_id: rhId,
                    employee_id: m.emp_id,
                    job_title: m.job,
                    is_active: true,
                    hired_at: new Date('2021-03-20'),
                    last_professional_interview: new Date('2022-05-20'),
                    last_annual_review: new Date('2024-02-20')
                }
            });
            managerMap[m.email] = user.id;
        }

        for (const c of collabs) {
            const rhId = rhMap[c.dept]; // STRICT LINKAGE
            const mgrId = managerMap[c.manager_email];

            await prisma.user.upsert({
                where: { email: c.email },
                update: {
                    first_name: c.first, last_name: c.last,
                    role: c.role,
                    department_id: deptMap[c.dept],
                    assigned_rh_id: rhId,
                    manager_id: mgrId,
                    employee_id: c.emp_id,
                    job_title: c.job,
                    is_active: true,
                    hired_at: new Date('2022-06-10'),
                    last_professional_interview: c.first === 'Lucas' ? null : new Date('2023-11-10'),
                    last_annual_review: new Date('2024-12-05')
                },
                create: {
                    email: c.email, password_hash: passwordHash,
                    first_name: c.first, last_name: c.last,
                    role: c.role,
                    department_id: deptMap[c.dept],
                    assigned_rh_id: rhId,
                    manager_id: mgrId,
                    employee_id: c.emp_id,
                    job_title: c.job,
                    is_active: true,
                    hired_at: new Date('2022-06-10'),
                    last_professional_interview: c.first === 'Lucas' ? null : new Date('2023-11-10'),
                    last_annual_review: new Date('2024-12-05')
                }
            });
        }

        // Admin
        await prisma.user.upsert({
            where: { email: 'admin@skillhub.com' },
            update: { role: 'admin', employee_id: 'ADMIN01' },
            create: {
                email: 'admin@skillhub.com', password_hash: passwordHash,
                first_name: 'Admin', last_name: 'System', role: 'admin',
                employee_id: 'ADMIN01', is_active: true
            }
        });

        console.log('✅ Database Standardized: EMP IDs applied, RH Perimeters enforced.');

    } catch (e) {
        console.error('❌ Error seeding:', e);
    } finally {
        await prisma.$disconnect();
    }
}

seedDemoData();
