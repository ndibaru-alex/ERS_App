const express = require('express');
const router = express.Router();
const cityController = require('../controllers/city.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes for viewing cities
router.get('/', cityController.getAllCities);
router.get('/:id', cityController.getCityById);
router.get('/region/:regionId', cityController.getCitiesByRegion);

// Protected routes for managing cities
router.post('/', [verifyToken, isAdmin], cityController.createCity);
router.put('/:id', [verifyToken, isAdmin], cityController.updateCity);
router.delete('/:id', [verifyToken, isAdmin], cityController.deleteCity);

module.exports = router;