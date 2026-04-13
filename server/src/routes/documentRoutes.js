const express = require('express');
const router = express.Router();
const { upload, uploadDocument, deleteDocument } = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Upload a document to a specific request
router.post('/requests/:id/documents', upload.single('file'), uploadDocument);

// Delete a document
router.delete('/documents/:id', deleteDocument);

module.exports = router;
