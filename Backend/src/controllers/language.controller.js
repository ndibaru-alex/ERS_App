const Language = require('../models/language.model');

exports.createLanguage = async (req, res) => {
    try {
        if (!req.body.applicant_id || !req.body.language || !req.body.level) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const language = await Language.create(req.body);
        res.status(201).json(language);
    } catch (err) {
        console.error('Error creating language:', err);
        if (err.message === 'Referenced applicant does not exist') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ 
            message: "Error creating language", 
            error: err.message 
        });
    }
};

exports.getByApplicant = async (req, res) => {
    try {
        const { applicant_id } = req.params;
        const languages = await Language.getByApplicant(applicant_id);
        res.json(languages);
    } catch (err) {
        console.error('Error retrieving languages:', err);
        res.status(500).json({ 
            message: "Error retrieving languages", 
            error: err.message 
        });
    }
};

exports.updateLanguage = async (req, res) => {
    try {
        const { id } = req.params;
        const language = await Language.update(id, req.body);
        res.json(language);
    } catch (err) {
        console.error('Error updating language:', err);
        if (err.message === 'Language not found') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ 
            message: "Error updating language", 
            error: err.message 
        });
    }
};

exports.deleteLanguage = async (req, res) => {
    try {
        const { id } = req.params;
        await Language.delete(id);
        res.json({ message: 'Language deleted successfully' });
    } catch (err) {
        console.error('Error deleting language:', err);
        if (err.message === 'Language not found') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ 
            message: "Error deleting language", 
            error: err.message 
        });
    }
};