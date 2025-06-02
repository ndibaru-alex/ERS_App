const express = require('express');
const router = express.Router();
const languageController = require('../controllers/language.controller');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/', languageController.createLanguage);
router.get('/applicant/:applicant_id', languageController.getByApplicant);

// Protected routes
router.put('/:id', verifyToken, languageController.updateLanguage);
router.delete('/:id', verifyToken, languageController.deleteLanguage);

module.exports = router;