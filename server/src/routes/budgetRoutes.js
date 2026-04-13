const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/roleMiddleware');

// Get team budget stats (Manager only)
router.get('/team-stats', authenticateToken, authorizeRole(['manager', 'rh', 'admin']), budgetController.getTeamBudgetStats);
router.get('/team-equity', authenticateToken, authorizeRole(['manager', 'admin']), budgetController.getTeamEquityStats);





// Get company stats (RH/Admin only)
router.get('/company-stats', authenticateToken, authorizeRole(['rh', 'admin']), budgetController.getCompanyStats);
router.get('/export-kpis', authenticateToken, authorizeRole(['rh', 'admin']), budgetController.exportCompanyKpis);

module.exports = router;
