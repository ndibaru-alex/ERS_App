const Employment = require('../models/employment.model');

exports.createEmployment = async (req, res) => {
    try {
        const { applicant_id } = req.params;
        const employmentData = {
            ...req.body,
            applicant_id,
            emp_verified: '0'  // Default to unverified
        };

        const employment = await Employment.create(employmentData);
        res.status(201).json(employment);
    } catch (err) {
        console.error('Error creating employment record:', err);
        res.status(500).json({ 
            message: "Error creating employment record", 
            error: err.message 
        });
    }
};

exports.getEmploymentsByApplicant = async (req, res) => {
    try {
        const { applicant_id } = req.params;
        const employments = await Employment.getByApplicant(applicant_id);
        res.json(employments);
    } catch (err) {
        console.error('Error retrieving employment records:', err);
        res.status(500).json({ 
            message: "Error retrieving employment records", 
            error: err.message 
        });
    }
};

exports.updateEmployment = async (req, res) => {
    try {
        const { employment_id } = req.params;
        const employment = await Employment.update(employment_id, req.body);
        res.json(employment);
    } catch (err) {
        console.error('Error updating employment record:', err);
        if (err.message === 'Employment record not found') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ 
            message: "Error updating employment record", 
            error: err.message 
        });
    }
};

exports.verifyEmployment = async (req, res) => {
    try {
        const { employment_id } = req.params;
        const employment = await Employment.update(employment_id, { emp_verified: '1' });
        res.json(employment);
    } catch (err) {
        console.error('Error verifying employment:', err);
        if (err.message === 'Employment record not found') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ 
            message: "Error verifying employment", 
            error: err.message 
        });
    }
};

exports.deleteEmployment = async (req, res) => {
    try {
        const { employment_id } = req.params;
        await Employment.delete(employment_id);
        res.json({ message: 'Employment record deleted successfully' });
    } catch (err) {
        console.error('Error deleting employment record:', err);
        if (err.message === 'Employment record not found') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ 
            message: "Error deleting employment record", 
            error: err.message 
        });
    }
};