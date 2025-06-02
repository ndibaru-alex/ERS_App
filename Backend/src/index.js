const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { verifyConnection } = require('./config/db');
const { initDatabase } = require('./db-init');
const OTPService = require('./services/otp.service'); // Added OTPService import

const authRoutes = require('./routes/auth.routes');
const stateRoutes = require('./routes/state.routes');
const regionRoutes = require('./routes/region.routes');
const cityRoutes = require('./routes/city.routes');
const mpRoutes = require('./routes/mp.routes');
const applicantRoutes = require('./routes/applicant.routes');
const documentRoutes = require('./routes/document.routes');
const employmentRoutes = require('./routes/employment.routes');
const referenceRoutes = require('./routes/reference.routes');
const languageRoutes = require('./routes/language.routes'); // Added language routes

const app = express();

// More permissive CORS configuration for testing
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Body parsers - place these before the logging middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Enhanced request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    console.log('\n=== New Request ===');
    console.log(`Request ID: ${requestId}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Query:', JSON.stringify(req.query, null, 2));
    console.log('Params:', JSON.stringify(req.params, null, 2));

    // Enhance response logging
    const oldSend = res.send;
    res.send = function(data) {
        const responseTime = Date.now() - start;
        console.log('\n=== Response ===');
        console.log(`Request ID: ${requestId}`);
        console.log(`Status: ${res.statusCode}`);
        console.log('Body:', typeof data === 'string' ? data : JSON.stringify(data, null, 2));
        console.log(`Response Time: ${responseTime}ms`);
        console.log('=== End ===\n');
        oldSend.apply(res, arguments);
    };

    next();
});

// Health check endpoint with DB status
app.get('/api/health', async (req, res) => {
    try {
        await verifyConnection();
        res.json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            database: 'connected',
            server: process.env.NODE_ENV || 'development'
        });
    } catch (err) {
        res.status(500).json({ 
            status: 'error', 
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: err.message
        });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/mps', mpRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/employments', employmentRoutes);  // Fixed path
app.use('/api/references', referenceRoutes);
app.use('/api/languages', languageRoutes); // Added language routes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('\n=== Error ===');
    console.error('Time:', new Date().toISOString());
    console.error('Path:', req.path);
    console.error('Method:', req.method);
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('Body:', JSON.stringify(req.body, null, 2));
    console.error('Query:', JSON.stringify(req.query, null, 2));
    console.error('Params:', JSON.stringify(req.params, null, 2));
    console.error('=== End Error ===\n');

    // Check if error is a database connection error
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        return res.status(503).json({ 
            message: 'Database connection error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3005;

// Verify database connection and initialize required tables before starting the server
const startServer = async () => {
    try {
        await verifyConnection();
        console.log('Database connection verified successfully');
        
        // Initialize database and check/create required tables
        await initDatabase();
        console.log('Database tables checked and initialized');
        
        // Set up periodic OTP cleanup
        setInterval(() => {
            OTPService.cleanupExpiredOTPs()
                .catch(err => console.error('Error in OTP cleanup job:', err));
        }, 5 * 60 * 1000); // Run every 5 minutes
        
        app.listen(PORT, () => {
            console.log(`\n=== Server Started ===`);
            console.log(`Time: ${new Date().toISOString()}`);
            console.log(`Server is running on port ${PORT}`);
            console.log(`Database connection: OK`);
            console.log(`Base URL: http://localhost:${PORT}/api`);

            console.log('\nTest URLs for Postman:');
            console.log(`Health Check: GET http://localhost:${PORT}/api/health`);
            
            console.log('\nMP Endpoints:');
            console.log(`1. Create MP: POST http://localhost:${PORT}/api/mps`);
            console.log('Request Body Example:');
            console.log(JSON.stringify({
                mp_name: "John Smith",
                mobile: "+1234567890",
                mp_type: "federal",  // or "state"
                state_id: 1,
                applicant_id: 1
            }, null, 2));

            console.log(`\n2. Get MPs by Applicant: GET http://localhost:${PORT}/api/mps/applicant/1`);
            console.log('Response Example:');
            console.log(JSON.stringify([{
                mp_id: 1,
                mp_name: "John Smith",
                mobile: "+1234567890",
                mp_type: "federal",
                state_id: 1,
                applicant_id: 1,
                state_name: "State Name"
            }], null, 2));

            console.log('\n=== Ready for Testing ===\n');
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();