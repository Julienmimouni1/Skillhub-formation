const express = require('express');
const router = express.Router();
const { searchCatalog, triggerSync, getCatalog, createInternalCourse, updateInternalCourse, deleteInternalCourse } = require('../controllers/catalogController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getCatalog);
router.get('/search', searchCatalog);
router.post('/sync', triggerSync);

// Internal Catalog CRUD
router.post('/internal', createInternalCourse);
router.put('/internal/:id', updateInternalCourse);
router.delete('/internal/:id', deleteInternalCourse);
router.post('/internal/:id/documents', require('../controllers/documentController').upload.single('file'), require('../controllers/documentController').uploadCourseDocument);

module.exports = router;
