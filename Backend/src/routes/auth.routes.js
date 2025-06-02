const express = require('express');
const { check, body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', [
    check('username')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'),
    check('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    check('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    check('full_name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2 })
        .withMessage('Full name must be at least 2 characters long'),
    check('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Role must be either user or admin')
], authController.register);

router.post('/login', [
    check('username')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Username is required'),
    check('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password is required')
], authController.login);

router.post('/refreshToken', authController.refreshToken);

router.post('/logout', authController.logout);

module.exports = router;