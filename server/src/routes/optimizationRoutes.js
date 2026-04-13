const express = require('express');
const router = express.Router();
const optimizationController = require('../controllers/optimizationController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/roleMiddleware');

router.get('/opportunities', authenticateToken, authorizeRole(['rh', 'admin']), optimizationController.getOptimizationOpportunities);
router.post('/create-session', authenticateToken, authorizeRole(['rh', 'admin']), optimizationController.createIntraSession);

module.exports = router;
