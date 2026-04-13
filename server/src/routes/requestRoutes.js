const express = require('express');
const router = express.Router();
const { createRequest, getRequests, getRequestById, validateRequest } = require('../controllers/requestController');
const { upload, uploadDocument } = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken); // Protect all routes

router.post('/', createRequest);
router.get('/', getRequests);
router.get('/actions/export', require('../controllers/requestController').exportRequests);
router.get('/:id', getRequestById);
router.put('/:id', require('../controllers/requestController').updateRequest);
router.post('/:id/validate', validateRequest);
router.post('/:id/documents', upload.single('file'), uploadDocument);

module.exports = router;
