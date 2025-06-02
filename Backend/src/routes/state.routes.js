const express = require('express');
const router = express.Router();
const stateController = require('../controllers/state.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes for viewing states
router.get('/', stateController.getAllStates);
router.get('/:id', stateController.getStateById);

// Protected routes for managing states
router.post('/', [verifyToken, isAdmin], stateController.createState);
router.put('/:id', [verifyToken, isAdmin], stateController.updateState);
router.delete('/:id', [verifyToken, isAdmin], stateController.deleteState);

module.exports = router;