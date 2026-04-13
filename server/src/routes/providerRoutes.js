const express = require('express');
const router = express.Router();
const { getProviders, createProvider, updateProvider, deleteProvider } = require('../controllers/providerController');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is Admin or RH
const requireAdminOrRH = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'rh') {
        next();
    } else {
        res.status(403).json({ error: { status: 403, message: 'Accès refusé. Rôle Admin ou RH requis.' } });
    }
};

router.use(authenticateToken);

router.get('/', getProviders); // Accessible to all authenticated users (for dropdowns)
router.post('/', requireAdminOrRH, createProvider);
router.put('/:id', requireAdminOrRH, updateProvider);
router.delete('/:id', requireAdminOrRH, deleteProvider);

module.exports = router;
