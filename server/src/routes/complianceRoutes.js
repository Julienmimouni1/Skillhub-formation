const express = require('express');
const router = express.Router();
const {
    getProfessionalInterviews,
    getAnnualReviews,
    getSixYearBilan,
    getAuthorizations,
    getTrainingHistory,
    exportProfessionalInterviews
} = require('../controllers/complianceController');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is RH or Admin
const requireRHOrAdminOrManager = (req, res, next) => {
    if (req.user.role !== 'rh' && req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ error: { status: 403, message: 'Accès réservé aux RH, Administrateurs et Managers.' } });
    }
    next();
};

router.use(authenticateToken);
router.use(requireRHOrAdminOrManager);

router.get('/professional-interviews', getProfessionalInterviews);
router.get('/professional-interviews/export', exportProfessionalInterviews);
router.get('/annual-reviews', getAnnualReviews);
router.get('/bilan-6-years', getSixYearBilan);
router.get('/authorizations', getAuthorizations);
router.get('/training-history', getTrainingHistory);


module.exports = router;
