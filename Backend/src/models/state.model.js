const db = require('../config/db');

class State {
    static async getAll() {
        const query = `
            SELECT 
                state_id::text as id, 
                state_name 
            FROM states 
            ORDER BY state_name
        `;
        try {
            const result = await db.query(query);
            console.log('Retrieved states:', result.rows);
            return result.rows;
        } catch (err) {
            console.error('Error getting all states:', err.message);
            throw err;
        }
    }

    static async getById(id) {
        const query = 'SELECT state_id::text as id, state_name FROM states WHERE state_id = $1';
        try {
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (err) {
            console.error('Error getting state by id:', {
                id,
                error: err.message
            });
            throw err;
        }
    }

    static async create(state_name) {
        const query = 'INSERT INTO states (state_name) VALUES ($1) RETURNING state_id::text as id, state_name';
        try {
            const result = await db.query(query, [state_name]);
            return result.rows[0];
        } catch (err) {
            console.error('Error creating state:', {
                state_name,
                error: err.message
            });
            throw err;
        }
    }

    static async update(id, state_name) {
        const query = 'UPDATE states SET state_name = $1 WHERE state_id = $2 RETURNING state_id::text as id, state_name';
        try {
            const result = await db.query(query, [state_name, id]);
            return result.rows[0];
        } catch (err) {
            console.error('Error updating state:', {
                id,
                state_name,
                error: err.message
            });
            throw err;
        }
    }

    static async delete(id) {
        const query = 'DELETE FROM states WHERE state_id = $1 RETURNING state_id::text as id, state_name';
        try {
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (err) {
            console.error('Error deleting state:', {
                id,
                error: err.message
            });
            throw err;
        }
    }
}

module.exports = State;