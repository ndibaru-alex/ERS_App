const db = require('../config/db');

class City {
    static async create(city_name, region_id) {
        const query = `
            WITH new_city AS (
                INSERT INTO cities (city_name, region_id) 
                VALUES ($1, $2) 
                RETURNING 
                    city_id,
                    city_name,
                    region_id
            )
            SELECT 
                nc.city_id::text as id,
                nc.city_name as name,
                nc.region_id as "regionId",
                r.region_name,
                s.state_name,
                s.state_id::text as state_id
            FROM new_city nc
            LEFT JOIN regions r ON nc.region_id = r.region_id
            LEFT JOIN states s ON r.state_id = s.state_id
        `;
        try {
            console.log('Creating city:', { city_name, region_id });
            const result = await db.query(query, [city_name, region_id]);
            console.log('City created:', result.rows[0]);
            return result.rows[0];
        } catch (err) {
            console.error('Error creating city:', {
                city_name,
                region_id,
                error: err.message
            });
            throw err;
        }
    }

    static async getAll() {
        const query = `
            SELECT 
                c.city_id::text as id,
                c.city_name as name,
                c.region_id as "regionId",
                r.region_name,
                s.state_name,
                s.state_id::text as state_id
            FROM cities c
            LEFT JOIN regions r ON c.region_id = r.region_id
            LEFT JOIN states s ON r.state_id = s.state_id
            ORDER BY s.state_name, r.region_name, c.city_name
        `;
        try {
            const result = await db.query(query);
            return result.rows;
        } catch (err) {
            console.error('Error getting cities:', err.message);
            throw err;
        }
    }

    static async getById(id) {
        const query = `
            SELECT 
                c.city_id::text as id,
                c.city_name as name,
                c.region_id as "regionId",
                r.region_name,
                s.state_name,
                s.state_id::text as state_id
            FROM cities c
            LEFT JOIN regions r ON c.region_id = r.region_id
            LEFT JOIN states s ON r.state_id = s.state_id
            WHERE c.city_id = $1
        `;
        try {
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (err) {
            console.error('Error getting city:', {
                id,
                error: err.message
            });
            throw err;
        }
    }

    static async getByRegion(regionId) {
        const query = `
            SELECT 
                c.city_id::text as id,
                c.city_name as name,
                c.region_id as "regionId",
                r.region_name,
                s.state_name,
                s.state_id::text as state_id
            FROM cities c
            LEFT JOIN regions r ON c.region_id = r.region_id
            LEFT JOIN states s ON r.state_id = s.state_id
            WHERE c.region_id = $1 
            ORDER BY c.city_name
        `;
        try {
            const result = await db.query(query, [regionId]);
            return result.rows;
        } catch (err) {
            console.error('Error getting cities by region:', {
                regionId,
                error: err.message
            });
            throw err;
        }
    }

    static async update(cityId, cityName, regionId) {
        const query = `
            UPDATE cities 
            SET city_name = $1, region_id = $2 
            WHERE city_id = $3 
            RETURNING 
                city_id::text as id, 
                city_name as name, 
                region_id as "regionId"
        `;
        try {
            const result = await db.query(query, [cityName, regionId, cityId]);
            return result.rows[0];
        } catch (err) {
            console.error('Error updating city:', {
                cityId,
                cityName,
                regionId,
                error: err.message
            });
            throw err;
        }
    }

    static async delete(cityId) {
        const query = `
            DELETE FROM cities 
            WHERE city_id = $1 
            RETURNING 
                city_id::text as id, 
                city_name as name, 
                region_id as "regionId"
        `;
        try {
            const result = await db.query(query, [cityId]);
            return result.rows[0];
        } catch (err) {
            console.error('Error deleting city:', {
                cityId,
                error: err.message
            });
            throw err;
        }
    }
}

module.exports = City;