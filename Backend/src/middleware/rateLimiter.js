const rateLimit = require('express-rate-limit');

// Create a limiter for mobile number searches
const mobileSearchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 0, // Disable rate limiting for testing
    message: 'Too many search attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    mobileSearchLimiter
};