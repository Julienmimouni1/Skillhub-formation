const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, getDepartments, updateDepartment, importUsers, downloadUserImportTemplate, getDepartmentBudgetLines, addBudgetLine, removeBudgetLine, getOrganizationStructure, getDocuments } = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'rh') {
        return res.status(403).json({ error: { status: 403, message: 'Accès réservé aux administrateurs et RH.' } });
    }
    next();
};

router.use(authenticateToken);
router.use(requireAdmin);

// Users
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
router.post('/users/import', upload.single('file'), importUsers);
router.get('/users/import/template', downloadUserImportTemplate);

// Departments
router.get('/departments', getDepartments);
router.put('/departments/:id', updateDepartment);
router.get('/departments/:id/budget-lines', getDepartmentBudgetLines);
router.post('/departments/:id/budget-lines', addBudgetLine);
router.delete('/departments/:id/budget-lines/:lineId', removeBudgetLine);
router.get('/organization/structure', getOrganizationStructure);
router.get('/documents', getDocuments);

module.exports = router;
