const express = require('express');
const router = express.Router();
const {
    getTeamSkillMatrix,
    updateSkillLevel,
    createSkill,
    updateSkill
} = require('../controllers/skillController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/matrix', getTeamSkillMatrix);
router.post('/update', updateSkillLevel);
router.post('/create', createSkill);
router.put('/:id', updateSkill);

module.exports = router;
