const db = require('../config/db');

class Region {
    static async getAll() {
        const query = `
            SELECT 
                r.region_id::text as id,
                r.region_name,
                r.state_id::text as state_id,
                s.state_name
            FROM regions r 
            LEFT JOIN states s ON r.state_id = s.state_id 
            ORDER BY r.region_name
        `;
        try {
            const result = await db.query(query);
            console.log('Retrieved regions with states:', result.rows);
            return result.rows;
        } catch (err) {
            console.error('Error getting all regions:', err.message);
            throw err;
        }
    }

    static async getById(id) {
        const query = `
            SELECT 
                r.region_id::text as id,
                r.region_name,
                r.state_id::text as state_id,
                s.state_name
            FROM regions r 
            LEFT JOIN states s ON r.state_id = s.state_id 
            WHERE r.region_id = $1
        `;
        try {
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (err) {
            console.error('Error getting region by id:', {
                id,
                error: err.message
            });
            throw err;
        }
    }

    static async getByState(stateId) {
        const query = `
            SELECT 
                r.region_id::text as id,
                r.region_name,
                r.state_id::text as state_id,
                s.state_name
            FROM regions r 
            LEFT JOIN states s ON r.state_id = s.state_id 
            WHERE r.state_id = $1
            ORDER BY r.region_name
        `;
        try {
            const result = await db.query(query, [stateId]);
            return result.rows;
        } catch (err) {
            console.error('Error getting regions by state:', {
                stateId,
                error: err.message
            });
            throw err;
        }
    }

    static async create(region_name, state_id) {
        const query = `
            INSERT INTO regions (region_name, state_id) 
            VALUES ($1, $2) 
            RETURNING 
                region_id::text as id,
                region_name,
                state_id::text as state_id,
                (SELECT state_name FROM states WHERE state_id = $2) as state_name
        `;
        try {
            console.log('Creating region:', { region_name, state_id });
            const result = await db.query(query, [region_name, state_id]);
            console.log('Region created:', result.rows[0]);
            return result.rows[0];
        } catch (err) {
            console.error('Error creating region:', {
                region_name,
                state_id,
                error: err.message
            });
            throw err;
        }
    }

    static async update(id, data) {
        const { region_name, state_id } = data;
        const query = `
            UPDATE regions 
            SET region_name = COALESCE($1, region_name),
                state_id = COALESCE($2, state_id)
            WHERE region_id = $3 
            RETURNING 
                region_id::text as id,
                region_name,
                state_id::text as state_id
        `;
        try {
            const result = await db.query(query, [region_name, state_id, id]);
            return result.rows[0];
        } catch (err) {
            console.error('Error updating region:', {
                id,
                data,
                error: err.message
            });
            throw err;
        }
    }

    static async delete(id) {
        const query = `
            DELETE FROM regions 
            WHERE region_id = $1 
            RETURNING region_id::text as id, region_name, state_id::text as state_id
        `;
        try {
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (err) {
            console.error('Error deleting region:', {
                id,
                error: err.message
            });
            throw err;
        }
    }
}

module.exports = Region;