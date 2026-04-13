const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

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
            // Clean up uploaded file if request doesn't exist
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: { status: 404, message: 'Demande non trouvée.' } });
        }

        // Save to DB
        const document = await prisma.document.create({
            data: {
                request_id: parseInt(id),
                file_name: req.file.originalname,
                file_path: req.file.path,
                mimetype: req.file.mimetype,
                file_size_kb: Math.round(req.file.size / 1024),
                document_type: document_type || 'AUTRE',
                uploaded_by_user_id: userId
            }
        });

        res.status(201).json({ document });

    } catch (error) {
        console.error('Upload error:', error);
        // Try to clean up file if DB insert fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
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
        // Owner can delete if DRAFT, Admin/RH can always delete
        const isOwner = document.uploaded_by_user_id === userId;
        const isDraft = document.request.status === 'DRAFT';

        if (!((isOwner && isDraft) || userRole === 'admin' || userRole === 'rh')) {
            return res.status(403).json({ error: { status: 403, message: 'Suppression non autorisée.' } });
        }

        // Delete file from FS
        if (fs.existsSync(document.file_path)) {
            fs.unlinkSync(document.file_path);
        }

        // Delete from DB
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
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: { status: 404, message: 'Formation non trouvée.' } });
        }

        // Save to DB
        const document = await prisma.document.create({
            data: {
                course_id: parseInt(id),
                file_name: req.file.originalname,
                file_path: req.file.path,
                mimetype: req.file.mimetype,
                file_size_kb: Math.round(req.file.size / 1024),
                document_type: document_type || 'PROGRAMME',
                uploaded_by_user_id: userId
            }
        });

        res.status(201).json({ document });

    } catch (error) {
        console.error('Upload course document error:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: { status: 500, message: 'Erreur lors de l\'upload.' } });
    }
};

module.exports = { upload, uploadDocument, deleteDocument, uploadCourseDocument };
