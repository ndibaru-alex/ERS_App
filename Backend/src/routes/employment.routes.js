const express = require('express');
const router = express.Router();
const employmentController = require('../controllers/employment.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Routes for applicants
router.post('/applicant/:applicant_id', employmentController.createEmployment);
router.get('/applicant/:applicant_id', employmentController.getEmploymentsByApplicant);
router.delete('/:employment_id', employmentController.deleteEmployment);

// Admin-only routes
router.put('/:employment_id', [verifyToken, isAdmin], employmentController.updateEmployment);
router.put('/:employment_id/verify', [verifyToken, isAdmin], employmentController.verifyEmployment);

module.exports = router;