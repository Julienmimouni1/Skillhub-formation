const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: { status: 400, message: 'Email et mot de passe requis.' } });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                department: true,
                assigned_rh: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(401).json({ error: { status: 401, message: 'Email ou mot de passe incorrect.' } });
        }

        // Check password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: { status: 401, message: 'Email ou mot de passe incorrect.' } });
        }

        // Generate Token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send Cookie
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24h
        });

        // Return User info (without password)
        const { password_hash, ...userInfo } = user;
        res.json({ user: userInfo });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const logout = (req, res) => {
    res.clearCookie('access_token');
    res.status(204).send();
};

const me = async (req, res) => {
    try {
        // req.user is set by auth middleware (to be created)
        // For now, we'll just check if the cookie exists and decode it manually if middleware isn't there yet,
        // but ideally we use middleware. Let's assume middleware will be added.
        // Actually, let's implement the logic here for safety if middleware is missing or for the specific /me endpoint.

        const token = req.cookies.access_token;
        if (!token) {
            return res.status(401).json({ error: { status: 401, message: 'Non authentifié' } });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                department: true,
                assigned_rh: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(401).json({ error: { status: 401, message: 'Utilisateur introuvable' } });
        }

        const { password_hash, ...userInfo } = user;
        res.json({ user: userInfo });

    } catch (error) {
        return res.status(401).json({ error: { status: 401, message: 'Session invalide' } });
    }
};

// Directory list for RH/Managers
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true,
                department: { select: { id: true, name: true } },
                manager_id: true,
                last_professional_interview: true, // Needed for widget
                employee_id: true,
                job_title: true
            },
            orderBy: { last_name: 'asc' }
        });
        res.json({ users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

module.exports = { login, logout, me, getAllUsers };
