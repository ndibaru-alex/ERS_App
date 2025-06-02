const Reference = require('../models/reference.model');

exports.createReference = async (req, res) => {
    try {
        if (!req.body.applicant_id) {
            return res.status(400).json({ message: "applicant_id is required" });
        }
        if (!req.body.full_name || !req.body.ref_relationship || !req.body.city_id) {
            return res.status(400).json({ message: "full_name, ref_relationship, and city_id are required" });
        }

        const referenceData = {
            ...req.body,
            ref_verified: '0'  // Default to unverified
        };

        const reference = await Reference.create(referenceData);
        res.status(201).json(reference);
    } catch (err) {
        console.error('Error creating reference:', err);
        if (err.message === 'Referenced applicant does not exist') {
            return res.status(400).json({ message: err.message });
        }
        if (err.message === 'Referenced city does not exist') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ 
            message: "Error creating reference", 
            error: err.message 
        });
    }
};

exports.getReferencesByApplicant = async (req, res) => {
    try {
        const { applicant_id } = req.params;
        const references = await Reference.getByApplicant(applicant_id);
        res.json(references);
    } catch (err) {
        console.error('Error retrieving references:', err);
        res.status(500).json({ 
            message: "Error retrieving references", 
            error: err.message 
        });
    }
};

exports.updateReference = async (req, res) => {
    try {
        const { reference_id } = req.params;
        const reference = await Reference.update(reference_id, req.body);
        res.json(reference);
    } catch (err) {
        console.error('Error updating reference:', err);
        if (err.message === 'Reference not found') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ 
            message: "Error updating reference", 
            error: err.message 
        });
    }
};

exports.verifyReference = async (req, res) => {
    try {
        const { reference_id } = req.params;
        // Update the verification status and get the updated reference with location info
        const updatedReference = await Reference.update(reference_id, { ref_verified: '1' });
        if (!updatedReference) {
            return res.status(404).json({ message: "Reference not found" });
        }
        
        // Get the full reference data with location info
        const reference = await Reference.getById(reference_id);
        res.json(reference);
    } catch (err) {
        console.error('Error verifying reference:', err);
        if (err.message === 'Reference not found') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: "Error verifying reference", error: err.message });
    }
};

exports.deleteReference = async (req, res) => {
    try {
        const { reference_id } = req.params;
        await Reference.delete(reference_id);
        res.json({ message: 'Reference deleted successfully' });
    } catch (err) {
        console.error('Error deleting reference:', err);
        if (err.message === 'Reference not found') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ 
            message: "Error deleting reference", 
            error: err.message 
        });
    }
};