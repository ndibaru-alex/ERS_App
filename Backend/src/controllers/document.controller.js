const Document = require('../models/document.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 
            'image/png', 
            'image/gif', 
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            const error = new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, DOC and DOCX are allowed.');
            error.code = 'INVALID_FILE_TYPE';
            return cb(error, false);
        }
        cb(null, true);
    }
}).single('file');

// Handle simple file upload without document creation
exports.uploadFile = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error('File upload error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File size cannot exceed 5MB' });
            }
            if (err.code === 'INVALID_FILE_TYPE') {
                return res.status(400).json({ message: err.message });
            }
            return res.status(500).json({ message: 'Error uploading file', error: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file provided" });
            }

            // Construct the URL for the uploaded file
            const file_url = `/uploads/${req.file.filename}`;
            res.status(201).json({ file_url });
        } catch (err) {
            console.error('Error handling file upload:', err);
            res.status(500).json({ message: "Error handling file upload", error: err.message });
        }
    });
};

// Handle document upload with metadata
exports.uploadDocument = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Document upload error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File size cannot exceed 5MB' });
            }
            if (err.code === 'INVALID_FILE_TYPE') {
                return res.status(400).json({ message: err.message });
            }
            return res.status(500).json({ message: 'Error uploading document', error: err.message });
        }

        try {
            const { applicant_id, document_type, remarks } = req.body;
            
            if (!applicant_id || !document_type || !req.file) {
                return res.status(400).json({ 
                    message: "Applicant ID, document type, and file are required" 
                });
            }

            const file_url = `/uploads/${req.file.filename}`;
            const document = await Document.create(applicant_id, document_type, file_url, remarks);
            
            res.status(201).json(document);
        } catch (err) {
            console.error('Error saving document:', err);
            if (err.code === '23503') { // Foreign key violation
                return res.status(400).json({ message: "Referenced applicant does not exist" });
            }
            res.status(500).json({ message: "Error saving document", error: err.message });
        }
    });
};

exports.getApplicantDocuments = async (req, res) => {
    try {
        const { applicant_id } = req.params;
        const documents = await Document.getByApplicant(applicant_id);
        res.json(documents);
    } catch (err) {
        console.error('Error retrieving documents:', err);
        res.status(500).json({ message: "Error retrieving documents", error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { document_id } = req.params;
        const { status, remarks } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const document = await Document.updateStatus(document_id, status, remarks);
        res.json(document);
    } catch (err) {
        console.error('Error updating document status:', err);
        if (err.message === 'Document not found') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ 
            message: "Error updating document status", 
            error: err.message 
        });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const { document_id } = req.params;
        const document = await Document.delete(document_id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json({ message: "Document deleted successfully" });
    } catch (err) {
        console.error('Error deleting document:', err);
        res.status(500).json({ message: "Error deleting document", error: err.message });
    }
};

exports.verifyDocument = async (req, res) => {
    try {
        const { document_id } = req.params;
        const { remarks } = req.body;

        const document = await Document.verify(document_id, remarks);
        res.json(document);
    } catch (err) {
        console.error('Error verifying document:', err);
        if (err.message === 'Document not found') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ 
            message: "Error verifying document", 
            error: err.message 
        });
    }
};