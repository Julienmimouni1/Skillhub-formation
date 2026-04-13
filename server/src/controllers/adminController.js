const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Users Management
const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                is_active: true,
                department: { select: { id: true, name: true } },
                manager: { select: { id: true, first_name: true, last_name: true, email: true } },
                employee_id: true,
                legal_entity: true,
                division: true,
                birth_date: true,
                job_title: true,
                assigned_rh: { select: { id: true, email: true, first_name: true, last_name: true } }
            },
            orderBy: { last_name: 'asc' }
        });
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const createUser = async (req, res) => {
    try {
        const {
            email, password, first_name, last_name, role, department_id, manager_id,
            employee_id, legal_entity, division, birth_date, job_title, manager_email, rh_email,
            contract_type, job_category, hired_at, gender
        } = req.body;

        // Check if email exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: { status: 400, message: 'Cet email est déjà utilisé.' } });
        }

        // Resolve Manager ID
        let resolvedManagerId = manager_id ? parseInt(manager_id) : null;
        if (manager_email) {
            const manager = await prisma.user.findUnique({ where: { email: manager_email } });
            if (manager) resolvedManagerId = manager.id;
        }

        // Resolve RH ID
        let resolvedRhId = null;
        if (rh_email) {
            const rh = await prisma.user.findUnique({ where: { email: rh_email } });
            if (rh) resolvedRhId = rh.id;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                password_hash: passwordHash,
                first_name,
                last_name,
                role: role || 'collaborateur',
                department_id: department_id ? parseInt(department_id) : null,
                manager_id: resolvedManagerId,
                employee_id,
                legal_entity,
                division,
                birth_date: birth_date ? new Date(birth_date) : null,
                job_title,
                assigned_rh_id: resolvedRhId,
                contract_type,
                job_category,
                hired_at: hired_at ? new Date(hired_at) : null,
                gender
            }
        });

        const { password_hash: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ user: userWithoutPassword });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            email, first_name, last_name, role, department_id, manager_id, is_active, password,
            employee_id, legal_entity, division, birth_date, job_title, rh_email,
            contract_type, job_category, hired_at, gender
        } = req.body;

        // Validation
        let deptId = null;
        if (department_id) {
            deptId = parseInt(department_id);
            if (isNaN(deptId)) return res.status(400).json({ error: { status: 400, message: 'ID Département invalide' } });
        }

        let mgrId = null;
        if (manager_id) {
            mgrId = parseInt(manager_id);
            if (isNaN(mgrId)) return res.status(400).json({ error: { status: 400, message: 'ID Manager invalide' } });
        }

        // Find RH if email provided
        let rhId = undefined;
        if (rh_email) {
            const rh = await prisma.user.findUnique({ where: { email: rh_email } });
            if (!rh) {
                return res.status(400).json({ error: { status: 400, message: `RH avec l'email ${rh_email} non trouvé` } });
            }
            rhId = rh.id;
        } else if (rh_email === '') {
            rhId = null; // Clear if empty string sent
        }

        // Find Manager if email provided
        if (req.body.manager_email) {
            const manager = await prisma.user.findUnique({ where: { email: req.body.manager_email } });
            if (manager) {
                mgrId = manager.id;
            } else {
                return res.status(400).json({ error: { status: 400, message: `Manager avec l'email ${req.body.manager_email} non trouvé` } });
            }
        } else if (req.body.manager_email === '') {
            mgrId = null;
        }

        const dataToUpdate = {
            email,
            first_name,
            last_name,
            role,
            department_id: deptId,
            manager_id: mgrId,
            is_active: is_active === 'true' || is_active === true,
            employee_id,
            legal_entity,
            division,
            birth_date: birth_date ? new Date(birth_date) : null,
            job_title,
            assigned_rh_id: rhId,
            contract_type,
            job_category,
            hired_at: hired_at ? new Date(hired_at) : null,
            gender
        };

        if (password) {
            dataToUpdate.password_hash = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: dataToUpdate
        });

        const { password_hash: _, ...userWithoutPassword } = updatedUser;
        res.json({ user: userWithoutPassword });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

// Departments Management
const getDepartments = async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ departments });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { budget_allocated, name } = req.body;

        const updatedDepartment = await prisma.department.update({
            where: { id: parseInt(id) },
            data: {
                name,
                budget_allocated: parseFloat(budget_allocated)
            }
        });

        res.json({ department: updatedDepartment });

    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const fs = require('fs');
const csv = require('csv-parser');

const importUsers = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: { status: 400, message: 'Aucun fichier fourni.' } });
    }

    const filePath = req.file.path;
    const results = [];
    const errors = [];

    try {
        // Detect separator (simple check of first line)
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const firstLine = fileContent.split('\n')[0];
        const separator = firstLine.includes(';') ? ';' : ',';
        console.log(`[Import] Detected separator: '${separator}' for file: ${req.file.originalname}`);

        fs.createReadStream(filePath)
            .pipe(csv({ separator: separator, mapHeaders: ({ header }) => header.trim() }))
            .on('data', (data) => results.push(data))
            .on('error', (error) => {
                console.error('[Import] CSV Parse Error:', error);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                res.status(500).json({ error: { status: 500, message: 'Erreur lors de la lecture du fichier CSV.' } });
            })
            .on('end', async () => {
                console.log(`[Import] Parsed ${results.length} rows. Processing...`);
                let successCount = 0;
                let failureCount = 0;

                try {
                    for (const [index, row] of results.entries()) {
                        try {
                            // Basic Validation
                            if (!row.email || !row.last_name) {
                                // Skip empty rows
                                continue;
                            }

                            // Find/Create Department
                            let departmentId = null;
                            if (row.department) {
                                const dept = await prisma.department.upsert({
                                    where: { name: row.department.trim() },
                                    update: {},
                                    create: { name: row.department.trim(), budget_allocated: 0, budget_engaged: 0, budget_consumed: 0 }
                                });
                                departmentId = dept.id;
                            }

                            // Find Manager
                            let managerId = null;
                            if (row.manager_email) {
                                const manager = await prisma.user.findUnique({ where: { email: row.manager_email.trim() } });
                                if (manager) managerId = manager.id;
                            }

                            // Find RH
                            let rhId = null;
                            if (row.rh_email) {
                                const rh = await prisma.user.findUnique({ where: { email: row.rh_email.trim() } });
                                if (rh) rhId = rh.id;
                            }

                            // Upsert User
                            await prisma.user.upsert({
                                where: { email: row.email.trim() },
                                update: {
                                    first_name: row.first_name?.trim(),
                                    last_name: row.last_name?.trim(),
                                    role: row.role?.trim().toLowerCase() || 'collaborateur',
                                    department_id: departmentId,
                                    manager_id: managerId,
                                    employee_id: row.employee_id?.trim(),
                                    legal_entity: row.legal_entity?.trim(),
                                    division: row.division?.trim(),
                                    birth_date: row.birth_date ? new Date(row.birth_date) : null,
                                    job_title: row.job_title?.trim(),
                                    assigned_rh_id: rhId,
                                    contract_type: row.contract_type?.trim(),
                                    job_category: row.job_category?.trim(),
                                    contract_type: row.contract_type?.trim(),
                                    job_category: row.job_category?.trim(),
                                    hired_at: row.hired_at ? new Date(row.hired_at) : null,
                                    gender: row.gender?.trim()
                                },
                                create: {
                                    email: row.email.trim(),
                                    password_hash: await bcrypt.hash('password123', 10), // Default password
                                    first_name: row.first_name?.trim(),
                                    last_name: row.last_name?.trim(),
                                    role: row.role?.trim().toLowerCase() || 'collaborateur',
                                    department_id: departmentId,
                                    manager_id: managerId,
                                    employee_id: row.employee_id?.trim(),
                                    legal_entity: row.legal_entity?.trim(),
                                    division: row.division?.trim(),
                                    birth_date: row.birth_date ? new Date(row.birth_date) : null,
                                    job_title: row.job_title?.trim(),
                                    assigned_rh_id: rhId,
                                    contract_type: row.contract_type?.trim(),
                                    job_category: row.job_category?.trim(),
                                    contract_type: row.contract_type?.trim(),
                                    job_category: row.job_category?.trim(),
                                    hired_at: row.hired_at ? new Date(row.hired_at) : null,
                                    gender: row.gender?.trim()
                                }
                            });
                            successCount++;
                        } catch (err) {
                            console.error(`[Import] Error row ${index + 1}:`, err.message);
                            errors.push(`Ligne ${index + 1} (${row.email || 'Inconnu'}): ${err.message}`);
                            failureCount++;
                        }
                    }

                    console.log(`[Import] Completed. Success: ${successCount}, Failures: ${failureCount}`);
                    res.json({
                        message: `Import terminé. ${successCount} succès, ${failureCount} échecs.`,
                        errors: errors.length > 0 ? errors : undefined
                    });

                } catch (processError) {
                    console.error('[Import] Processing Error:', processError);
                    res.status(500).json({ error: { status: 500, message: 'Erreur lors du traitement des données.' } });
                } finally {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
            });
    } catch (err) {
        console.error('[Import] Setup Error:', err);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const downloadUserImportTemplate = (req, res) => {
    console.log('[Template] Downloading CSV template...');
    const csvContent = 'email;first_name;last_name;role;department;manager_email;employee_id;legal_entity;division;birth_date;job_title;rh_email;contract_type;job_category;hired_at;gender\n' +
        'jean.dupont@email.com;Jean;Dupont;collaborateur;Tech;manager@email.com;EMP001;SkillHub France;Engineering;1990-01-01;Développeur;rh@email.com;CDI;CADRE;2020-01-01;M';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=modele_import_utilisateurs.csv');
    res.status(200).send(csvContent);
};

const getDepartmentBudgetLines = async (req, res) => {
    try {
        const { id } = req.params;
        const lines = await prisma.budgetLine.findMany({
            where: { department_id: parseInt(id) },
            orderBy: { created_at: 'desc' }
        });
        res.json({ lines });
    } catch (error) {
        console.error('Get budget lines error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const addBudgetLine = async (req, res) => {
    try {
        const { id } = req.params;
        const { legal_entity, division, amount, year } = req.body;

        const newLine = await prisma.budgetLine.create({
            data: {
                department_id: parseInt(id),
                legal_entity,
                division,
                amount: parseFloat(amount),
                year: parseInt(year) || 2025
            }
        });

        // Update Department Total
        const aggregate = await prisma.budgetLine.aggregate({
            where: { department_id: parseInt(id), year: parseInt(year) || 2025 },
            _sum: { amount: true }
        });

        await prisma.department.update({
            where: { id: parseInt(id) },
            data: { budget_allocated: aggregate._sum.amount || 0 }
        });

        res.json({ line: newLine });
    } catch (error) {
        console.error('Add budget line error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const removeBudgetLine = async (req, res) => {
    try {
        const { id, lineId } = req.params;

        // Get line to know year/dept before deleting
        const line = await prisma.budgetLine.findUnique({ where: { id: parseInt(lineId) } });
        if (!line) return res.status(404).json({ error: 'Ligne non trouvée' });

        await prisma.budgetLine.delete({ where: { id: parseInt(lineId) } });

        // Update Department Total
        const aggregate = await prisma.budgetLine.aggregate({
            where: { department_id: line.department_id, year: line.year },
            _sum: { amount: true }
        });

        await prisma.department.update({
            where: { id: line.department_id },
            data: { budget_allocated: aggregate._sum.amount || 0 }
        });

        res.json({ message: 'Ligne supprimée' });
    } catch (error) {
        console.error('Remove budget line error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};
const getOrganizationStructure = async (req, res) => {
    try {
        const entities = await prisma.user.findMany({
            select: { legal_entity: true },
            distinct: ['legal_entity'],
            where: { legal_entity: { not: null } }
        });

        const divisions = await prisma.user.findMany({
            select: { division: true },
            distinct: ['division'],
            where: { division: { not: null } }
        });

        res.json({
            legal_entities: entities.map(e => e.legal_entity).filter(Boolean),
            divisions: divisions.map(d => d.division).filter(Boolean)
        });
    } catch (error) {
        console.error('Get org structure error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};
const getDocuments = async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            include: {
                request: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        user: {
                            select: {
                                first_name: true,
                                last_name: true,
                                department: { select: { name: true } }
                            }
                        }
                    }
                },
                uploaded_by: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                }
            },
            orderBy: { uploaded_at: 'desc' }
        });

        res.json({ documents });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

module.exports = {
    getUsers, createUser, updateUser,
    getDepartments, updateDepartment,
    importUsers, downloadUserImportTemplate,
    getDepartmentBudgetLines, addBudgetLine, removeBudgetLine,
    getOrganizationStructure,
    getDocuments
};
