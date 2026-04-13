require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Departments
    const departments = [
        { name: 'Tech', budget_allocated: 50000.00 },
        { name: 'Sales', budget_allocated: 30000.00 },
        { name: 'Marketing', budget_allocated: 25000.00 },
        { name: 'RH', budget_allocated: 10000.00 },
    ];

    for (const dept of departments) {
        await prisma.department.upsert({
            where: { name: dept.name },
            update: {},
            create: dept,
        });
    }

    const techDept = await prisma.department.findUnique({ where: { name: 'Tech' } });
    const rhDept = await prisma.department.findUnique({ where: { name: 'RH' } });
    const salesDept = await prisma.department.findUnique({ where: { name: 'Sales' } });
    const marketingDept = await prisma.department.findUnique({ where: { name: 'Marketing' } });

    const allDepts = [techDept, salesDept, marketingDept, rhDept];
    const operationalDepts = [techDept, salesDept, marketingDept];

    // Users
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@skillhub.com' },
        update: {},
        create: {
            email: 'admin@skillhub.com',
            password_hash: passwordHash,
            first_name: 'Admin',
            last_name: 'System',
            role: 'admin',
            department_id: rhDept.id,
            employee_id: 'ADM001',
            legal_entity: 'SkillHub France',
            division: 'Direction',
            job_title: 'System Administrator',
            birth_date: new Date('1980-01-01'),
        },
    });

    // 2. RH Users
    const rhTech = await prisma.user.upsert({
        where: { email: 'rh.tech@skillhub.com' },
        update: {},
        create: {
            email: 'rh.tech@skillhub.com',
            password_hash: passwordHash,
            first_name: 'Sophie',
            last_name: 'RH',
            role: 'rh',
            department_id: techDept.id,
            employee_id: 'RHT001',
            legal_entity: 'SkillHub France',
            job_title: 'Responsable RH Tech',
        },
    });

    const rhMarketing = await prisma.user.upsert({
        where: { email: 'rh.marketing@skillhub.com' },
        update: {},
        create: {
            email: 'rh.marketing@skillhub.com',
            password_hash: passwordHash,
            first_name: 'Emma',
            last_name: 'RH',
            role: 'rh',
            department_id: marketingDept.id,
            employee_id: 'RHM001',
            legal_entity: 'SkillHub France',
            job_title: 'Responsable RH Marketing',
        },
    });

    const rhSales = await prisma.user.upsert({
        where: { email: 'rh.sales@skillhub.com' },
        update: {},
        create: {
            email: 'rh.sales@skillhub.com',
            password_hash: passwordHash,
            first_name: 'Alexandre',
            last_name: 'RH',
            role: 'rh',
            department_id: salesDept.id,
            employee_id: 'RHS001',
            legal_entity: 'SkillHub France',
            job_title: 'Responsable RH Sales',
        },
    });

    // 3. Managers
    const managerTech = await prisma.user.upsert({
        where: { email: 'manager.tech@skillhub.com' },
        update: {},
        create: {
            email: 'manager.tech@skillhub.com',
            password_hash: passwordHash,
            first_name: 'Thomas',
            last_name: 'Manager',
            role: 'manager',
            department_id: techDept.id,
            manager_id: admin.id,
            assigned_rh_id: rhTech.id,
            employee_id: 'MGRT01',
            legal_entity: 'SkillHub France',
            job_title: 'Engineering Manager',
        },
    });

    const managerMarketing = await prisma.user.upsert({
        where: { email: 'manager.marketing@skillhub.com' },
        update: {},
        create: {
            email: 'manager.marketing@skillhub.com',
            password_hash: passwordHash,
            first_name: 'Julie',
            last_name: 'Manager',
            role: 'manager',
            department_id: marketingDept.id,
            manager_id: admin.id,
            assigned_rh_id: rhMarketing.id,
            employee_id: 'MGRM01',
            legal_entity: 'SkillHub France',
            job_title: 'Marketing Manager',
        },
    });

    const managerSales = await prisma.user.upsert({
        where: { email: 'manager.sales@skillhub.com' },
        update: {},
        create: {
            email: 'manager.sales@skillhub.com',
            password_hash: passwordHash,
            first_name: 'Sarah',
            last_name: 'Manager',
            role: 'manager',
            department_id: salesDept.id,
            manager_id: admin.id,
            assigned_rh_id: rhSales.id,
            employee_id: 'MGRS01',
            legal_entity: 'SkillHub France',
            job_title: 'Sales Manager',
        },
    });

    // 4. Collaborators
    await prisma.user.upsert({
        where: { email: 'collab.tech@skillhub.com' },
        update: {},
        create: {
            email: 'collab.tech@skillhub.com',
            password_hash: passwordHash,
            first_name: 'Lucas',
            last_name: 'Collab',
            role: 'collaborateur',
            department_id: techDept.id,
            manager_id: managerTech.id,
            assigned_rh_id: rhTech.id,
            employee_id: 'COLT01',
            legal_entity: 'SkillHub France',
            job_title: 'Developer',
        },
    });

    await prisma.user.upsert({
        where: { email: 'collab.marketing@skillhub.com' },
        update: {},
        create: {
            email: 'collab.marketing@skillhub.com',
            password_hash: passwordHash,
            first_name: 'Antoine',
            last_name: 'Collab',
            role: 'collaborateur',
            department_id: marketingDept.id,
            manager_id: managerMarketing.id,
            assigned_rh_id: rhMarketing.id,
            employee_id: 'COLM01',
            legal_entity: 'SkillHub France',
            job_title: 'Marketing Specialist',
        },
    });

    await prisma.user.upsert({
        where: { email: 'collab.sales@skillhub.com' },
        update: {},
        create: {
            email: 'collab.sales@skillhub.com',
            password_hash: passwordHash,
            first_name: 'Maxime',
            last_name: 'Collab',
            role: 'collaborateur',
            department_id: salesDept.id,
            manager_id: managerSales.id,
            assigned_rh_id: rhSales.id,
            employee_id: 'COLS01',
            legal_entity: 'SkillHub France',
            job_title: 'Account Executive',
        },
    });

    console.log('Seed data inserted');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
