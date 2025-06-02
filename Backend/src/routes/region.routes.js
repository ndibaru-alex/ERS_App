const express = require('express');
const router = express.Router();
const regionController = require('../controllers/region.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes for viewing regions
router.get('/', regionController.getAllRegions);
router.get('/:id', regionController.getRegionById);
router.get('/state/:stateId', regionController.getRegionsByState);

// Protected routes for managing regions
router.post('/', [verifyToken, isAdmin], regionController.createRegion);
router.put('/:id', [verifyToken, isAdmin], regionController.updateRegion);
router.delete('/:id', [verifyToken, isAdmin], regionController.deleteRegion);

module.exports = router;