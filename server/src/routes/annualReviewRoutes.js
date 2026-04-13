const express = require('express');
const router = express.Router();
const {
    getAnnualReviewDossier,
    saveAnnualReview
} = require('../controllers/annualReviewController');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is RH, Admin or Manager
const requireReviewAccess = (req, res, next) => {
    const { role } = req.user;
    if (role !== 'rh' && role !== 'admin' && role !== 'manager' && role !== 'collaborateur') {
        return res.status(403).json({ error: { status: 403, message: 'Accès non autorisé.' } });
    }
    next();
};

router.use(authenticateToken);
router.use(requireReviewAccess);

router.get('/dossier/:userId', getAnnualReviewDossier);
router.post('/', saveAnnualReview);

module.exports = router;
