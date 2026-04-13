const express = require('express');
const router = express.Router();
const { login, logout, me, getAllUsers } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);
router.get('/users', authenticateToken, getAllUsers);

module.exports = router;
