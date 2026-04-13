const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTeamBudgetStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { departmentId: queryDeptId } = req.query;

        let departmentId;
        let department;

        if (queryDeptId && ['rh', 'admin'].includes(req.user.role)) {
            departmentId = parseInt(queryDeptId);
            department = await prisma.department.findUnique({
                where: { id: departmentId }
            });
        } else {
            // 1. Get the manager's department
            const manager = await prisma.user.findUnique({
                where: { id: userId },
                include: { department: true },
            });

            if (!manager || !manager.department_id) {
                return res.status(400).json({ error: 'User has no assigned department' });
            }
            departmentId = manager.department_id;
            department = manager.department;
        }

        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }

        // 2. Calculate "Engaged" Budget (APPROVED or PLANNED)
        const calculateAmount = async (statusList) => {
            // 1. Standard Requests (Company pays full cost)
            const standard = await prisma.trainingRequest.aggregate({
                where: {
                    department_id: departmentId,
                    status: { in: statusList },
                    funding_type: { not: 'CO_FUNDED' }
                },
                _sum: { cost: true }
            });

            // 2. Co-funded Requests (Company pays partial amount)
            const coFunded = await prisma.trainingRequest.aggregate({
                where: {
                    department_id: departmentId,
                    status: { in: statusList },
                    funding_type: 'CO_FUNDED'
                },
                _sum: { co_funding_company_amount: true }
            });

            return (Number(standard._sum.cost) || 0) + (Number(coFunded._sum.co_funding_company_amount) || 0);
        };

        const engagedAmount = await calculateAmount(['APPROVED', 'PLANNED']);
        const consumedAmount = await calculateAmount(['COMPLETED']);
        const initialBudget = department.budget_allocated || 0;
        const remainingBudget = Number(initialBudget) - (Number(engagedAmount) + Number(consumedAmount));

        // --- NEW: Regulatory & Performance Stats ---
        const totalDaysAgg = await prisma.trainingRequest.aggregate({
            where: {
                department_id: departmentId,
                status: { in: ['APPROVED', 'PLANNED', 'COMPLETED'] }
            },
            _sum: { duration_days: true }
        });
        const totalTrainingDays = Number(totalDaysAgg._sum.duration_days) || 0;
        const totalTrainingHours = totalTrainingDays * 7;

        const teamMembersCount = await prisma.user.count({
            where: {
                department_id: departmentId,
                is_active: true,
                role: 'collaborateur'
            }
        });

        const trainedUsersCount = await prisma.trainingRequest.groupBy({
            by: ['user_id'],
            where: {
                department_id: departmentId,
                status: { in: ['APPROVED', 'PLANNED', 'COMPLETED'] }
            }
        });

        const participationRate = teamMembersCount > 0
            ? Math.round((trainedUsersCount.length / teamMembersCount) * 100)
            : 0;

        const budgetByTypeAgg = await prisma.trainingRequest.groupBy({
            by: ['type'],
            where: {
                department_id: departmentId,
                status: { in: ['APPROVED', 'PLANNED', 'COMPLETED'] }
            },
            _sum: { cost: true }
        });

        const budgetByType = budgetByTypeAgg.map(item => ({
            type: item.type,
            amount: Number(item._sum.cost) || 0
        }));

        res.json({
            initial: Number(initialBudget),
            engaged: Number(engagedAmount),
            consumed: Number(consumedAmount),
            remaining: remainingBudget,
            currency: 'EUR',
            kpis: {
                totalTrainingDays,
                totalTrainingHours,
                participationRate,
                teamSize: teamMembersCount,
                trainedCount: trainedUsersCount.length,
                budgetByType
            }
        });

    } catch (error) {
        console.error('Error fetching team budget stats:', error);
        res.status(500).json({ error: 'Failed to fetch budget statistics' });
    }
};

const getTeamEquityStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const teamMembers = await prisma.user.findMany({
            where: { manager_id: userId },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                job_title: true,
                requests: {
                    where: { status: { not: 'REJECTED' } },
                    select: {
                        id: true,
                        cost: true,
                        funding_type: true,
                        co_funding_company_amount: true
                    }
                }
            }
        });

        const stats = teamMembers.map(member => {
            const requestCount = member.requests.length;
            const totalCost = member.requests.reduce((acc, req) => {
                const amount = req.funding_type === 'CO_FUNDED'
                    ? (parseFloat(req.co_funding_company_amount) || 0)
                    : (parseFloat(req.cost) || 0);
                return acc + amount;
            }, 0);

            return {
                id: member.id,
                name: `${member.first_name} ${member.last_name}`,
                job_title: member.job_title,
                request_count: requestCount,
                total_cost: totalCost
            };
        });

        stats.sort((a, b) => a.request_count - b.request_count);
        res.json({ members: stats });
    } catch (error) {
        console.error('Error fetching team equity stats:', error);
        res.status(500).json({ error: 'Failed to fetch equity stats' });
    }
};

// NEW: RH - Company Wide Stats & Pilotage Indicators
const getCompanyStats = async (req, res) => {
    try {
        const { scope } = req.query; // 'GLOBAL' or 'MY_SCOPE'
        const userId = req.user.userId;

        // 1. Global/Scope Budget
        // If MY_SCOPE, only count budget of the RH's assigned department
        let departmentWhere = {};
        let scopeName = "Global";

        if (scope === 'MY_SCOPE') {
            const rhUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { department_id: true, department: { select: { name: true } } }
            });

            if (rhUser && rhUser.department) {
                // Future-proof: if assigned_rh relation had multiple depts, we'd join names here.
                // For now, it is 1 dept.
                departmentWhere = { id: rhUser.department_id };
                scopeName = `Périmètre ${rhUser.department.name}`;
            } else {
                scopeName = "Mon périmètre (Non défini)";
            }
        }

        const allDepartments = await prisma.department.findMany({
            where: departmentWhere,
            select: { id: true, name: true, budget_allocated: true }
        });

        const initialBudget = allDepartments.reduce((acc, dept) => acc + (Number(dept.budget_allocated) || 0), 0);

        // 2. Training Requests filtering
        const requestWhere = {
            status: { in: ['APPROVED', 'PLANNED', 'COMPLETED'] }
        };

        if (scope === 'MY_SCOPE') {
            requestWhere.user = { assigned_rh_id: userId };
        }

        const requests = await prisma.trainingRequest.findMany({
            where: requestWhere,
            select: {
                status: true,
                cost: true,
                funding_type: true,
                co_funding_company_amount: true,
                duration_days: true,
                type: true,
                department_id: true,
                user: {
                    select: {
                        id: true,
                        gender: true,
                        contract_type: true,
                        job_category: true,
                        birth_date: true,
                        hired_at: true
                    }
                }
            }
        });

        // Initialize Aggregators
        let engaged = 0;
        let consumed = 0;
        let totalTrainingDays = 0;
        let mandatoryCount = 0;
        let maleHours = 0;
        let femaleHours = 0;
        let maleCost = 0;
        let femaleCost = 0;

        const uniqueUserIds = new Set();
        const typeDistribution = {}; // { type: count }
        const departmentUsage = {}; // { deptId: amount }
        const cspAccess = {}; // { csp: { trained: Set<id>, total: 0 } }
        const contractAccess = {}; // { contract: { trained: Set<id>, total: 0 } }

        for (const req of requests) {
            const amount = req.funding_type === 'CO_FUNDED'
                ? (Number(req.co_funding_company_amount) || 0)
                : (Number(req.cost) || 0);

            if (req.status === 'COMPLETED') {
                consumed += amount;
            } else {
                engaged += amount;
            }

            const days = Number(req.duration_days) || 0;
            totalTrainingDays += days;
            const hours = days * 7;

            // Regulatory
            if (req.type === 'OBLIGATOIRE' && req.status === 'COMPLETED') {
                mandatoryCount++;
            }

            // Parity
            if (req.user?.gender === 'M') {
                maleHours += hours;
                maleCost += amount;
            } else if (req.user?.gender === 'F') {
                femaleHours += hours;
                femaleCost += amount;
            }

            // Type Distribution
            typeDistribution[req.type] = (typeDistribution[req.type] || 0) + 1;

            // Dept Usage
            departmentUsage[req.department_id] = (departmentUsage[req.department_id] || 0) + amount;

            // Demographics Tracking
            if (req.user?.job_category) {
                if (!cspAccess[req.user.job_category]) cspAccess[req.user.job_category] = { trained: new Set(), total: 0 };
                cspAccess[req.user.job_category].trained.add(req.user.id);
            }
            if (req.user?.contract_type) {
                if (!contractAccess[req.user.contract_type]) contractAccess[req.user.contract_type] = { trained: new Set(), total: 0 };
                contractAccess[req.user.contract_type].trained.add(req.user.id);
            }

            uniqueUserIds.add(req.user.id);
        }

        const remaining = initialBudget - (engaged + consumed);

        // --- DEMOGRAPHICS & POPULATION ANALYSIS ---
        const totalEmployeesWhere = { is_active: true };
        if (scope === 'MY_SCOPE') {
            totalEmployeesWhere.assigned_rh_id = userId;
        }

        const allEmployees = await prisma.user.findMany({
            where: totalEmployeesWhere,
            select: {
                id: true,
                birth_date: true,
                hired_at: true,
                job_category: true,
                contract_type: true
            }
        });

        const totalEmployees = allEmployees.length;
        let totalTenureMonths = 0;
        let tenureCount = 0;
        const agePyramid = { '20-30': 0, '30-40': 0, '40-50': 0, '50+': 0 };
        const cspDist = {};
        const contractDist = {};

        const now = new Date();

        allEmployees.forEach(u => {
            // Seniority
            if (u.hired_at) {
                const tenure = (now - new Date(u.hired_at)) / (1000 * 60 * 60 * 24 * 30.44); // Months
                totalTenureMonths += tenure;
                tenureCount++;
            }

            // Age
            if (u.birth_date) {
                const age = (now - new Date(u.birth_date)) / (1000 * 60 * 60 * 24 * 365.25);
                if (age < 30) agePyramid['20-30']++;
                else if (age < 40) agePyramid['30-40']++;
                else if (age < 50) agePyramid['40-50']++;
                else agePyramid['50+']++;
            }

            // Distributions
            if (u.job_category) {
                cspDist[u.job_category] = (cspDist[u.job_category] || 0) + 1;
                if (!cspAccess[u.job_category]) cspAccess[u.job_category] = { trained: new Set(), total: 0 };
                cspAccess[u.job_category].total++;
            }
            if (u.contract_type) {
                contractDist[u.contract_type] = (contractDist[u.contract_type] || 0) + 1;
                if (!contractAccess[u.contract_type]) contractAccess[u.contract_type] = { trained: new Set(), total: 0 };
                contractAccess[u.contract_type].total++;
            }
        });

        const avgSeniorityYears = tenureCount > 0 ? (totalTenureMonths / tenureCount / 12).toFixed(1) : 0;
        const accessRate = totalEmployees > 0 ? Math.round((uniqueUserIds.size / totalEmployees) * 100) : 0;

        // Formating Chart Data
        const departmentAnalysis = allDepartments.map(dept => {
            const used = departmentUsage[dept.id] || 0;
            const allocated = Number(dept.budget_allocated) || 0;
            return {
                name: dept.name,
                budget: allocated,
                used: used,
                remaining: allocated - used,
                usagePct: allocated > 0 ? Math.round((used / allocated) * 100) : 0
            };
        }).sort((a, b) => b.usagePct - a.usagePct);

        const typeData = Object.entries(typeDistribution).map(([name, value]) => ({ name, value }));

        // CSP Access Rate
        const cspAnalysis = Object.entries(cspAccess).map(([key, data]) => ({
            name: key,
            accessRate: data.total > 0 ? Math.round((data.trained.size / data.total) * 100) : 0,
            count: data.total
        }));

        res.json({
            initial: initialBudget,
            engaged,
            consumed,
            remaining,
            currency: 'EUR',
            kpis: {
                totalTrainingHours: totalTrainingDays * 7,
                accessRate,
                totalEmployees,
                trainedCount: uniqueUserIds.size,
                averageCostPerEmployee: uniqueUserIds.size > 0 ? Math.round((engaged + consumed) / uniqueUserIds.size) : 0,
                avgSeniorityYears: Number(avgSeniorityYears),
                parity: {
                    maleHours,
                    femaleHours,
                    maleCost,
                    femaleCost
                },
                regulatory: {
                    mandatoryCompleted: mandatoryCount
                }
            },
            charts: {
                departmentAnalysis,
                typeDistribution: typeData,
                agePyramid: Object.entries(agePyramid).map(([name, value]) => ({ name, value })),
                cspDistribution: Object.entries(cspDist).map(([name, value]) => ({ name, value })),
                contractDistribution: Object.entries(contractDist).map(([name, value]) => ({ name, value })),
                cspAnalysis
            }
        });

    } catch (error) {
        console.error('Error fetching company stats:', error);
        res.status(500).json({ error: 'Failed to fetch company statistics' });
    }
};

const exportCompanyKpis = async (req, res) => {
    try {
        const { scope } = req.query;
        const userId = req.user.userId;

        // Re-use logic to get the same data as getCompanyStats
        // (In a real app, we might refactor this into a service, but for now we follow the existing pattern)
        
        let departmentWhere = {};
        if (scope === 'MY_SCOPE') {
            const rhUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { department_id: true }
            });
            if (rhUser) departmentWhere = { id: rhUser.department_id };
        }

        const allDepartments = await prisma.department.findMany({
            where: departmentWhere,
            select: { id: true, name: true, budget_allocated: true }
        });

        const requestWhere = { status: { in: ['APPROVED', 'PLANNED', 'COMPLETED'] } };
        if (scope === 'MY_SCOPE') requestWhere.user = { assigned_rh_id: userId };

        const requests = await prisma.trainingRequest.findMany({
            where: requestWhere,
            include: { user: true, department: true }
        });

        const initialBudget = allDepartments.reduce((acc, dept) => acc + (Number(dept.budget_allocated) || 0), 0);
        let engaged = 0;
        let consumed = 0;
        const deptUsage = {};

        requests.forEach(req => {
            const amount = req.funding_type === 'CO_FUNDED' ? (Number(req.co_funding_company_amount) || 0) : (Number(req.cost) || 0);
            if (req.status === 'COMPLETED') consumed += amount;
            else engaged += amount;
            deptUsage[req.department_id] = (deptUsage[req.department_id] || 0) + amount;
        });

        // CSV Generation
        let csv = '\uFEFF'; // BOM for Excel
        
        // Section 1: Global Summary
        csv += 'RAPPORT DE PILOTAGE RH;;\n';
        csv += `Périmètre;${scope === 'MY_SCOPE' ? 'Mon Périmètre' : 'Global'};\n`;
        csv += `Date d\'export;${new Date().toLocaleDateString()};\n\n`;

        csv += 'RESUME FINANCIER;;\n';
        csv += `Budget Total;${initialBudget};€\n`;
        csv += `Budget Engagé;${engaged};€\n`;
        csv += `Budget Consommé;${consumed};€\n`;
        csv += `Budget Restant;${initialBudget - (engaged + consumed)};€\n\n`;

        // Section 2: Department Detail
        csv += 'DETAIL PAR DEPARTEMENT;Budget Alloué;Budget Utilisé;Reste;Usage (%)\n';
        allDepartments.forEach(dept => {
            const used = deptUsage[dept.id] || 0;
            const allocated = Number(dept.budget_allocated) || 0;
            const pct = allocated > 0 ? Math.round((used / allocated) * 100) : 0;
            csv += `${dept.name};${allocated};${used};${allocated - used};${pct}%\n`;
        });
        
        csv += '\nDETAIL DES DEMANDES;Collaborateur;Titre;Type;Statut;Coût;Date\n';
        requests.forEach(req => {
            const date = req.start_date ? new Date(req.start_date).toLocaleDateString() : 'N/A';
            csv += `${req.user.first_name} ${req.user.last_name};${req.title};${req.type};${req.status};${req.cost};${date}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`Export_KPI_Skillhub_${scope}_${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csv);

    } catch (error) {
        console.error('Export KPI error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'export des KPIs' });
    }
};

module.exports = {
    getTeamBudgetStats,
    getTeamEquityStats,
    getCompanyStats,
    exportCompanyKpis
};
