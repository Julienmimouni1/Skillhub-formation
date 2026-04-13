const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../utils/prisma');

// Configure Multer Storage for Memory (Vercel compatible)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Format de fichier non supporté (PDF, DOCX, JPG, PNG uniquement).'));
        }
    }
});

const uploadDocument = async (req, res) => {
    try {
        const { id } = req.params; // request_id
        const { document_type } = req.body;
        const userId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({ error: { status: 400, message: 'Aucun fichier fourni.' } });
        }

        // Check if request exists
        const request = await prisma.trainingRequest.findUnique({ where: { id: parseInt(id) } });
        if (!request) {
            return res.status(404).json({ error: { status: 404, message: 'Demande non trouvée.' } });
        }

        // Vercel simulation: We don't save the actual file to disk, we just save the metadata to DB
        // In a real production app, we would upload to S3 or Cloudinary here.
        const document = await prisma.document.create({
            data: {
                request_id: parseInt(id),
                file_name: req.file.originalname,
                file_path: 'memory://' + req.file.originalname, // Placeholder for Vercel
                mimetype: req.file.mimetype,
                file_size_kb: Math.round(req.file.size / 1024),
                document_type: document_type || 'AUTRE',
                uploaded_by_user_id: userId
            }
        });

        res.status(201).json({ document });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur lors de l\'upload.' } });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params; // document_id
        const userId = req.user.userId;
        const userRole = req.user.role;

        const document = await prisma.document.findUnique({
            where: { id: parseInt(id) },
            include: { request: true }
        });

        if (!document) return res.status(404).json({ error: { status: 404, message: 'Document non trouvé.' } });

        // Permission check
        const isOwner = document.uploaded_by_user_id === userId;
        const isDraft = document.request?.status === 'DRAFT';

        if (!((isOwner && isDraft) || userRole === 'admin' || userRole === 'rh')) {
            return res.status(403).json({ error: { status: 403, message: 'Suppression non autorisée.' } });
        }

        // Delete from DB (File deletion skipped on Vercel as it's in memory)
        await prisma.document.delete({ where: { id: parseInt(id) } });

        res.status(204).send();

    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur serveur.' } });
    }
};

const uploadCourseDocument = async (req, res) => {
    try {
        const { id } = req.params; // course_id
        const { document_type } = req.body;
        const userId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({ error: { status: 400, message: 'Aucun fichier fourni.' } });
        }

        // Check if course exists
        const course = await prisma.trainingCourse.findUnique({ where: { id: parseInt(id) } });
        if (!course) {
            return res.status(404).json({ error: { status: 404, message: 'Formation non trouvée.' } });
        }

        // Save to DB
        const document = await prisma.document.create({
            data: {
                course_id: parseInt(id),
                file_name: req.file.originalname,
                file_path: 'memory://' + req.file.originalname,
                mimetype: req.file.mimetype,
                file_size_kb: Math.round(req.file.size / 1024),
                document_type: document_type || 'PROGRAMME',
                uploaded_by_user_id: userId
            }
        });

        res.status(201).json({ document });

    } catch (error) {
        console.error('Upload course document error:', error);
        res.status(500).json({ error: { status: 500, message: 'Erreur lors de l\'upload.' } });
    }
};

module.exports = { upload, uploadDocument, deleteDocument, uploadCourseDocument };
