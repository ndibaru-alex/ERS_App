const City = require('../models/city.model');

exports.createCity = async (req, res) => {
    try {
        const { name, regionId } = req.body;
        console.log('Create city request:', { name, regionId });

        if (!name || !regionId) {
            return res.status(400).json({ message: "City name and region ID are required" });
        }

        const city = await City.create(name, regionId);
        console.log('City created:', city);
        res.status(201).json(city);
    } catch (err) {
        console.error('Error creating city:', err);
        if (err.code === '23505') {
            return res.status(400).json({ message: "City name already exists in this region" });
        }
        if (err.code === '23503') {
            return res.status(400).json({ message: "Referenced region does not exist" });
        }
        res.status(500).json({ message: "Error creating city", error: err.message });
    }
};

exports.getAllCities = async (req, res) => {
    try {
        console.log('Fetching all cities');
        const cities = await City.getAll();
        console.log(`Retrieved ${cities.length} cities`);
        res.json(cities);
    } catch (err) {
        console.error('Error retrieving cities:', err);
        res.status(500).json({ message: "Error retrieving cities", error: err.message });
    }
};

exports.getCityById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching city by ID:', id);
        const city = await City.getById(id);
        if (!city) {
            return res.status(404).json({ message: "City not found" });
        }
        res.json(city);
    } catch (err) {
        console.error('Error retrieving city:', err);
        res.status(500).json({ message: "Error retrieving city", error: err.message });
    }
};

exports.getCitiesByRegion = async (req, res) => {
    try {
        const { regionId } = req.params;
        console.log('Fetching cities by region:', regionId);
        const cities = await City.getByRegion(regionId);
        res.json(cities);
    } catch (err) {
        console.error('Error retrieving cities by region:', err);
        res.status(500).json({ message: "Error retrieving cities", error: err.message });
    }
};

exports.updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, regionId } = req.body;
        console.log('Update city request:', { id, name, regionId });

        if (!name || !regionId) {
            return res.status(400).json({ message: "City name and region ID are required" });
        }

        const city = await City.update(id, name, regionId);
        if (!city) {
            return res.status(404).json({ message: "City not found" });
        }
        res.json(city);
    } catch (err) {
        console.error('Error updating city:', err);
        if (err.code === '23505') {
            return res.status(400).json({ message: "City name already exists in this region" });
        }
        if (err.code === '23503') {
            return res.status(400).json({ message: "Referenced region does not exist" });
        }
        res.status(500).json({ message: "Error updating city", error: err.message });
    }
};

exports.deleteCity = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Delete city request:', id);
        const city = await City.delete(id);
        if (!city) {
            return res.status(404).json({ message: "City not found" });
        }
        res.json({ message: "City deleted successfully" });
    } catch (err) {
        console.error('Error deleting city:', err);
        res.status(500).json({ message: "Error deleting city", error: err.message });
    }
};