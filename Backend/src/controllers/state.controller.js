const State = require('../models/state.model');

exports.createState = async (req, res) => {
    try {
        console.log('Create state request:', {
            body: req.body,
            user: req.user
        });

        const { state_name } = req.body;
        const state = await State.create(state_name);
        
        console.log('State created successfully:', state);
        res.status(201).json(state);
    } catch (err) {
        console.error('Error creating state:', {
            error: err.message,
            code: err.code,
            body: req.body
        });

        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ message: "State name already exists" });
        }
        res.status(500).json({ message: "Error creating state", error: err.message });
    }
};

exports.getAllStates = async (req, res) => {
    try {
        console.log('Fetching all states');
        const states = await State.getAll();
        console.log(`Retrieved ${states.length} states`);
        res.json(states);
    } catch (err) {
        console.error('Error retrieving states:', {
            error: err.message,
            stack: err.stack
        });
        res.status(500).json({ message: "Error retrieving states", error: err.message });
    }
};

exports.getStateById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching state by ID:', id);

        const state = await State.getById(id);
        if (!state) {
            console.log('State not found:', id);
            return res.status(404).json({ message: "State not found" });
        }

        console.log('Retrieved state:', state);
        res.json(state);
    } catch (err) {
        console.error('Error retrieving state:', {
            error: err.message,
            params: req.params
        });
        res.status(500).json({ message: "Error retrieving state", error: err.message });
    }
};

exports.updateState = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Update state request:', {
            id,
            body: req.body,
            user: req.user
        });

        const { state_name } = req.body;
        const state = await State.update(id, state_name);
        if (!state) {
            console.log('State not found for update:', id);
            return res.status(404).json({ message: "State not found" });
        }

        console.log('State updated successfully:', state);
        res.json(state);
    } catch (err) {
        console.error('Error updating state:', {
            error: err.message,
            code: err.code,
            params: req.params,
            body: req.body
        });

        if (err.code === '23505') {
            return res.status(400).json({ message: "State name already exists" });
        }
        res.status(500).json({ message: "Error updating state", error: err.message });
    }
};

exports.deleteState = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Delete state request:', {
            id,
            user: req.user
        });

        const state = await State.delete(id);
        if (!state) {
            console.log('State not found for deletion:', id);
            return res.status(404).json({ message: "State not found" });
        }

        console.log('State deleted successfully:', id);
        res.json({ message: "State deleted successfully" });
    } catch (err) {
        console.error('Error deleting state:', {
            error: err.message,
            params: req.params
        });
        res.status(500).json({ message: "Error deleting state", error: err.message });
    }
};