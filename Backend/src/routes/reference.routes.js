const express = require('express');
const router = express.Router();
const referenceController = require('../controllers/reference.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes
router.post('/', referenceController.createReference);
router.get('/applicant/:applicant_id', referenceController.getReferencesByApplicant);

// Protected routes
router.put('/:reference_id', [verifyToken], referenceController.updateReference);
router.delete('/:reference_id', [verifyToken], referenceController.deleteReference);

// Admin-only routes
router.put('/:reference_id/verify', [verifyToken, isAdmin], referenceController.verifyReference);

module.exports = router;