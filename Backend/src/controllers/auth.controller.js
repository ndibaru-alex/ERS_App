const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
    try {
        console.log('Registration attempt:', {
            username: req.body.username,
            email: req.body.email,
            role: req.body.role,
            full_name: req.body.full_name
        });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Registration validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, role, full_name } = req.body;

        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            console.log('Registration failed: Username already exists:', username);
            return res.status(400).json({ message: "Username already exists" });
        }

        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            console.log('Registration failed: Email already registered:', email);
            return res.status(400).json({ message: "Email already registered" });
        }

        const newUser = await User.create(username, email, password, role || 'user', full_name);
        console.log('User created successfully:', {
            id: newUser.id,
            username: newUser.username,
            role: newUser.role
        });
        
        const token = jwt.sign(
            { id: newUser.id, username, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                full_name: newUser.full_name
            }
        });
    } catch (err) {
        console.error('Registration error:', {
            error: err.message,
            stack: err.stack,
            body: req.body
        });
        res.status(500).json({ message: "Error creating user", error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('Login attempt:', { 
            username: req.body.username 
        });

        const { username, password } = req.body;

        const user = await User.findByUsername(username);
        console.log('Fetched user data:', user);
        if (!user) {
            console.log('Login failed: Invalid username:', username);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Map user_id to id if necessary
        if (!user.id && user.user_id) {
            user.id = user.user_id;
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            console.log('Login failed: Invalid password for user:', username);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.id || !user.username || !user.role) {
            console.error('Incomplete user data for token signing:', user);
            return res.status(500).json({ message: 'Internal server error: Incomplete user data' });
        }

        const token = jwt.sign(
            { id: user.id, username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        console.log('Login successful:', {
            id: user.id,
            username: user.username,
            role: user.role
        });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                full_name: user.full_name
            }
        });
    } catch (err) {
        console.error('Login error:', {
            error: err.message,
            stack: err.stack,
            body: req.body
        });
        res.status(500).json({ message: "Error during login", error: err.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Refresh token is required" });
        }

        jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired refresh token" });
            }

            const accessToken = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.json({ accessToken });
        });
    } catch (err) {
        console.error('Error refreshing token:', err);
        res.status(500).json({ message: "Error refreshing token", error: err.message });
    }
};

exports.logout = async (req, res) => {
    try {
        // Invalidate the refresh token (if stored in a database or cache)
        // For now, just send a success response
        res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        console.error('Error during logout:', err);
        res.status(500).json({ message: "Error during logout", error: err.message });
    }
};