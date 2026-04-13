const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ error: { status: 401, message: 'Accès non autorisé' } });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: { status: 403, message: 'Token invalide' } });
        }
        req.user = user;
        next();
    });
};



const checkRole = (roles) => {
    return (req, res, next) => {
        console.log('CheckRole:', roles, 'UserRole:', req.user?.role);
        if (!req.user) {
            return res.status(401).json({ error: { status: 401, message: 'Non authentifié' } });
        }
        const userRole = req.user.role ? req.user.role.toLowerCase() : '';
        const allowedRoles = roles.map(r => r.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            console.error('Role Mismatch:', userRole, 'Expected:', allowedRoles);
            return res.status(403).json({ error: { status: 403, message: 'Accès refusé' } });
        }
        next();
    };
};

module.exports = { authenticateToken, checkRole };
