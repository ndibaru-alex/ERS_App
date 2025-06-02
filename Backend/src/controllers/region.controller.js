const Region = require('../models/region.model');

exports.createRegion = async (req, res) => {
    try {
        console.log('Create region request:', req.body);
        const { region_name, state_id } = req.body;
        const region = await Region.create(region_name, state_id);
        console.log('Region created:', region);
        res.status(201).json(region);
    } catch (err) {
        console.error('Error creating region:', err);
        res.status(500).json({ message: "Error creating region", error: err.message });
    }
};

exports.getAllRegions = async (req, res) => {
    try {
        console.log('Fetching all regions');
        const regions = await Region.getAll();
        console.log(`Retrieved ${regions.length} regions`);
        res.json(regions);
    } catch (err) {
        console.error('Error retrieving regions:', err);
        res.status(500).json({ message: "Error retrieving regions", error: err.message });
    }
};

exports.getRegionById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching region by ID:', id);
        const region = await Region.getById(id);
        if (!region) {
            return res.status(404).json({ message: "Region not found" });
        }
        res.json(region);
    } catch (err) {
        console.error('Error retrieving region:', err);
        res.status(500).json({ message: "Error retrieving region", error: err.message });
    }
};

exports.getRegionsByState = async (req, res) => {
    try {
        const { stateId } = req.params;
        console.log('Fetching regions by state:', stateId);
        const regions = await Region.getByState(stateId);
        res.json(regions);
    } catch (err) {
        console.error('Error retrieving regions by state:', err);
        res.status(500).json({ message: "Error retrieving regions", error: err.message });
    }
};

exports.updateRegion = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Update region request:', { id, body: req.body });
        const region = await Region.update(id, req.body);
        if (!region) {
            return res.status(404).json({ message: "Region not found" });
        }
        res.json(region);
    } catch (err) {
        console.error('Error updating region:', err);
        res.status(500).json({ message: "Error updating region", error: err.message });
    }
};

exports.deleteRegion = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Delete region request:', id);
        const region = await Region.delete(id);
        if (!region) {
            return res.status(404).json({ message: "Region not found" });
        }
        res.json({ message: "Region deleted successfully" });
    } catch (err) {
        console.error('Error deleting region:', err);
        res.status(500).json({ message: "Error deleting region", error: err.message });
    }
};