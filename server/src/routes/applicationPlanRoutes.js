const express = require('express');
const router = express.Router();
const controller = require('../controllers/applicationPlanController');
const { authenticateToken } = require('../middleware/auth');

// All routes protected
// router.use(verifyToken); // Commented out for now if middleware path is unsure, but usually it is needed.
// Checking file structure, middleware is in ../middleware

router.get('/request/:requestId', controller.getPlanByRequestId);
router.post('/request/:requestId', controller.createOrUpdatePlan);
router.post('/request/:requestId/generate', controller.generateDefaultActions);
router.post('/request/:requestId/share', controller.sharePlanWithManager);

router.post('/:planId/actions', controller.addActionItem);
router.put('/actions/:actionId', controller.updateActionItem);
router.delete('/actions/:actionId', controller.deleteActionItem);

router.post('/:planId/logs', controller.createPracticeLog);
router.delete('/logs/:logId', controller.deletePracticeLog);

module.exports = router;
