const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicant.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { mobileSearchLimiter } = require('../middleware/rateLimiter');

// Public mobile search and update endpoints without rate limiting for testing
router.post('/mobile/request', applicantController.requestMobileSearch);
router.post('/mobile/verify', applicantController.verifyAndSearch);
router.put('/mobile/update/:id', applicantController.updateApplicant);

// Public application submission
router.post('/', applicantController.createApplicant);

// Public route to get applicant by ID
router.get('/:id', applicantController.getApplicantById);
router.get('/', applicantController.getAllApplicants);
// Protected admin routes
// router.get('/', [verifyToken, isAdmin], applicantController.getAllApplicants);
router.put('/:id', [verifyToken, isAdmin], applicantController.updateApplicant);
router.delete('/:id', [verifyToken, isAdmin], applicantController.deleteApplicant);

module.exports = router;