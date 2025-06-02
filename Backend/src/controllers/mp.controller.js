const MP = require('../models/mp.model');

const VALID_MP_TYPES = ['federal', 'state'];

exports.createMP = async (req, res) => {
    try {
        const { mp_name, mobile, mp_type, state_id, applicant_id } = req.body;
        
        if (!mp_name || !state_id || !applicant_id) {
            return res.status(400).json({ message: "MP name, state ID, and applicant ID are required" });
        }

        if (mp_type && !VALID_MP_TYPES.includes(mp_type)) {
            return res.status(400).json({ 
                message: "MP type must be either 'federal' or 'state'"
            });
        }

        const mpData = {
            mp_name,
            mobile,
            mp_type,
            state_id,
            applicant_id
        };

        const mp = await MP.create(mpData);
        res.status(201).json(mp);
    } catch (err) {
        console.error('Error creating MP:', err);
        if (err.code === '23503') {
            return res.status(400).json({ message: "Referenced state or applicant does not exist" });
        }
        res.status(500).json({ message: "Error creating MP", error: err.message });
    }
};

exports.getAllMPs = async (req, res) => {
    try {
        const mps = await MP.getAll();
        res.json(mps);
    } catch (err) {
        console.error('Error retrieving MPs:', err);
        res.status(500).json({ message: "Error retrieving MPs", error: err.message });
    }
};

exports.getMPById = async (req, res) => {
    try {
        const { id } = req.params;
        const mp = await MP.getById(id);
        if (!mp) {
            return res.status(404).json({ message: "MP not found" });
        }
        res.json(mp);
    } catch (err) {
        console.error('Error retrieving MP:', err);
        res.status(500).json({ message: "Error retrieving MP", error: err.message });
    }
};

exports.updateMP = async (req, res) => {
    try {
        const { id } = req.params;
        const { mp_name, mobile, mp_type, state_id, applicant_id } = req.body;

        if (!mp_name || !state_id || !applicant_id) {
            return res.status(400).json({ message: "MP name, state ID, and applicant ID are required" });
        }

        if (mp_type && !VALID_MP_TYPES.includes(mp_type)) {
            return res.status(400).json({ 
                message: "MP type must be either 'federal' or 'state'"
            });
        }

        const mpData = {
            mp_name,
            mobile,
            mp_type,
            state_id,
            applicant_id
        };

        const mp = await MP.update(id, mpData);
        if (!mp) {
            return res.status(404).json({ message: "MP not found" });
        }
        res.json(mp);
    } catch (err) {
        console.error('Error updating MP:', err);
        if (err.code === '23503') {
            return res.status(400).json({ message: "Referenced state or applicant does not exist" });
        }
        res.status(500).json({ message: "Error updating MP", error: err.message });
    }
};

exports.deleteMP = async (req, res) => {
    try {
        const { id } = req.params;
        const mp = await MP.delete(id);
        if (!mp) {
            return res.status(404).json({ message: "MP not found" });
        }
        res.json({ message: "MP deleted successfully" });
    } catch (err) {
        console.error('Error deleting MP:', err);
        res.status(500).json({ message: "Error deleting MP", error: err.message });
    }
};

exports.getByApplicant = async (req, res) => {
    try {
        const { applicant_id } = req.params;
        const mps = await MP.getByApplicant(applicant_id);
        res.json(mps);
    } catch (err) {
        console.error('Error fetching MPs by applicant ID:', err);
        res.status(500).json({ message: 'Error fetching MPs', error: err.message });
    }
};