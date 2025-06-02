const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public upload routes
router.post('/upload/file', documentController.uploadFile);
router.post('/upload', documentController.uploadDocument);

// Public fetch route
router.get('/applicant/:applicant_id', documentController.getApplicantDocuments);

// Protected routes
router.put('/:document_id/verify', [verifyToken, isAdmin], documentController.verifyDocument);
router.put('/:document_id/status', [verifyToken, isAdmin], documentController.updateStatus);
router.delete('/:document_id', [verifyToken], documentController.deleteDocument);

module.exports = router;