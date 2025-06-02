const Applicant = require('../models/applicant.model');
const OTPService = require('../services/otp.service');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.createApplicant = async (req, res) => {
    try {
        const { mobile_number } = req.body;
        
        // Check if mobile number has been verified with OTP
        const isVerified = await OTPService.hasVerifiedOTP(mobile_number);
        if (!isVerified) {
            return res.status(403).json({ message: "Mobile number not verified. Please verify your mobile number first." });
        }

        const data = { ...req.body };
        
        // Parse height and weight as numeric if provided
        if (data.height) {
            data.height = parseFloat(data.height);
        }
        if (data.weight) {
            data.weight = parseFloat(data.weight);
        }

        const applicant = await Applicant.create(data);
        res.status(201).json(applicant);
    } catch (err) {
        console.error('Error creating applicant:', err);
        if (err.code === '23503') {
            res.status(400).json({ message: "Invalid reference provided (e.g. city_id)" });
            return;
        }
        res.status(500).json({ message: "Error creating applicant", error: err.message });
    }
};

exports.getAllApplicants = async (req, res) => {
    try {
        const applicants = await Applicant.getAll();
        res.json(applicants);
    } catch (err) {
        console.error('Error retrieving applicants:', err);
        res.status(500).json({ message: "Error retrieving applicants", error: err.message });
    }
};

exports.getApplicantById = async (req, res) => {
    try {
        const { id } = req.params;
        const applicant = await Applicant.getById(id);
        if (!applicant) {
            return res.status(404).json({ message: "Applicant not found" });
        }
        res.json(applicant);
    } catch (err) {
        console.error('Error retrieving applicant:', err);
        res.status(500).json({ message: "Error retrieving applicant", error: err.message });
    }
};

exports.updateApplicant = async (req, res) => {
    try {
        const { id } = req.params;
        const { mobile_number } = req.body;

        // For mobile updates, verify OTP first
        if (!req.user) { // If no user (admin), then it's a mobile update
            const isVerified = await OTPService.hasVerifiedOTP(mobile_number);
            if (!isVerified) {
                return res.status(403).json({ message: "Mobile number not verified. Please verify your mobile number first." });
            }
        }

        const updateData = { ...req.body };

        // Validate required fields for mobile update
        const requiredFields = ['first_name', 'last_name', 'mother_name', 'marital_status', 'highest_educ', 'school_name'];
        const missingFields = requiredFields.filter(field => !updateData[field]?.trim());
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: "Missing required fields",
                fields: missingFields
            });
        }

        // Parse height and weight as numeric if provided
        if (updateData.height) {
            updateData.height = parseFloat(updateData.height);
        }
        if (updateData.weight) {
            updateData.weight = parseFloat(updateData.weight);
        }

        const applicant = await Applicant.update(id, updateData);
        if (!applicant) {
            return res.status(404).json({ message: "Applicant not found" });
        }
        res.json(applicant);
    } catch (err) {
        console.error('Error updating applicant:', err);
        if (err.code === '23503') {
            res.status(400).json({ message: "Invalid reference provided (e.g. city_id)" });
            return;
        }
        res.status(500).json({ message: "Error updating applicant", error: err.message });
    }
};

exports.deleteApplicant = async (req, res) => {
    try {
        const { id } = req.params;
        const applicant = await Applicant.delete(id);
        if (!applicant) {
            return res.status(404).json({ message: "Applicant not found" });
        }
        res.json({ message: "Applicant deleted successfully" });
    } catch (err) {
        console.error('Error deleting applicant:', err);
        res.status(500).json({ message: "Error deleting applicant", error: err.message });
    }
};

exports.findByMobileNumber = async (req, res) => {
    try {
        const { mobile_number } = req.params;
        console.log('Received mobile_number:', mobile_number, typeof mobile_number); // Log the mobile_number value

        const applicant = await Applicant.findByMobileNumber(mobile_number);
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }
        res.json(applicant);
    } catch (err) {
        console.error('Error finding applicant by mobile number:', err);
        res.status(500).json({ message: 'Error finding applicant by mobile number', error: err.message });
    }
};

exports.findByMobile = async (req, res) => {
    try {
        const { mobile_number } = req.params;
        
        if (!mobile_number) {
            return res.status(400).json({ message: "Mobile number is required" });
        }
        
        // Query to find applicant with matching mobile number
        const query = `
            SELECT * FROM applicants 
            WHERE mobile_number = $1
        `;
        
        const result = await db.query(query, [mobile_number]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No applicant found with this mobile number" });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error finding applicant by mobile number:', err);
        res.status(500).json({ message: "Error finding applicant", error: err.message });
    }
};

exports.requestMobileSearch = async (req, res) => {
    try {
        const { mobile_number } = req.body;
        
        if (!mobile_number || !/^\d{10}$/.test(mobile_number)) {
            return res.status(400).json({ message: "Please provide a valid 10-digit mobile number" });
        }

        // Generate and send OTP
        const otp = await OTPService.generateOTP(mobile_number);
        
        // In production, send OTP via SMS
        // For development, return OTP in response
        res.json({ 
            message: "OTP sent successfully",
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (err) {
        console.error('Error requesting mobile search:', err);
        res.status(500).json({ message: "Error sending OTP", error: err.message });
    }
};

exports.verifyAndSearch = async (req, res) => {
    try {
        const { mobile_number, otp } = req.body;

        console.log('Received request for verifyAndSearch:', { mobile_number, otp });

        if (!mobile_number || !otp) {
            return res.status(400).json({ message: "Mobile number and OTP are required" });
        }

        // Validate mobile_number and otp formats
        if (!/^\d{10}$/.test(mobile_number)) {
            console.error('Invalid mobile number format:', mobile_number);
            return res.status(400).json({ message: "Invalid mobile number format" });
        }

        if (!/^\d{6}$/.test(otp)) {
            console.error('Invalid OTP format:', otp);
            return res.status(400).json({ message: "Invalid OTP format" });
        }

        const isValid = await OTPService.verifyOTP(mobile_number, otp);
        console.log('OTP verification result:', isValid);

        if (!isValid) {
            console.error('OTP verification failed for:', { mobile_number, otp });
            return res.status(401).json({ message: "Invalid OTP" });
        }

        console.log('OTP verified successfully for:', mobile_number);

        // Find applicant with this mobile number using the model method
        const applicant = await Applicant.findByMobileNumber(mobile_number);

        // Set default role to 'user' for OTP-generated tokens
        const role = 'user';

        // Generate JWT token with default role
        const token = jwt.sign(
            { applicant_id: applicant ? applicant.applicant_id : null, mobile_number, role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        if (applicant) {
            console.log('Existing application found for mobile number:', mobile_number);
            return res.json({ applicant_id: applicant.applicant_id, token });
        }

        console.warn('No application found for mobile number:', mobile_number);
        res.json({ applicant_id: null, token });
    } catch (err) {
        console.error('Error in verifyAndSearch:', {
            error: err.message,
            stack: err.stack,
            requestBody: req.body
        });
        res.status(500).json({ message: "Error verifying OTP", error: err.message });
    }
};