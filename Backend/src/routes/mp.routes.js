const express = require('express');
const router = express.Router();
const mpController = require('../controllers/mp.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', mpController.getAllMPs);  // Made public
router.get('/applicant/:applicant_id', mpController.getByApplicant);
router.post('/', mpController.createMP);

// Protected admin routes
router.get('/:id', [verifyToken, isAdmin], mpController.getMPById);
router.put('/:id', [verifyToken, isAdmin], mpController.updateMP);
router.delete('/:id', [verifyToken, isAdmin], mpController.deleteMP);

module.exports = router;