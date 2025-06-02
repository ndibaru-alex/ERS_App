const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    console.log('Verifying token for request:', {
        method: req.method,
        path: req.path,
        headers: {
            authorization: req.header('Authorization')?.substring(0, 20) + '...'
        }
    });

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        console.log('No token provided for path:', req.path);
        return res.status(401).json({ message: "Authentication token is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('verifyToken decoded user:', decoded);
        console.log('Token verified successfully:', {
            userId: decoded.id,
            username: decoded.username,
            role: decoded.role
        });
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification failed:', {
            error: err.message,
            token: token.substring(0, 20) + '...'
        });
        
        // Provide specific error message for token expiration
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Your session has expired. Please login again.",
                error: "token_expired"
            });
        }
        
        return res.status(401).json({ message: "Invalid token" });
    }
};

const isAdmin = (req, res, next) => {
    console.log('Checking admin rights for user:', {
        userId: req.user?.id,
        role: req.user?.role,
        path: req.path
    });

    console.log('isAdmin check:', req.user);

    if (req.user && req.user.role === 'admin') {
        console.log('Admin access granted for:', req.user.username);
        next();
    } else {
        console.log('Admin access denied for:', req.user?.username);
        res.status(403).json({ message: "Access denied. Admin rights required." });
    }
};

module.exports = { verifyToken, isAdmin };