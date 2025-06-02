const db = require('../config/db');

class MP {
    static async create(data) {
        const query = `
            INSERT INTO mps (
                mp_name, mobile, mp_type, state_id, applicant_id
            ) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        try {
            const values = [
                data.mp_name,
                data.mobile,
                data.mp_type,
                data.state_id,
                data.applicant_id
            ];
            console.log('Creating MP with data:', data);
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (err) {
            console.error('Error creating MP:', err, data);
            if (err.code === '23503') { // Foreign key violation
                throw new Error('Referenced state or applicant does not exist');
            }
            throw err;
        }
    }

    static async getAll() {
        const query = `
            SELECT 
                m.mp_id,
                m.mp_name,
                m.mobile,
                m.mp_type,
                m.state_id,
                m.applicant_id,
                s.state_name
            FROM mps m
            JOIN states s ON m.state_id = s.state_id
            ORDER BY m.mp_name
        `;
        try {
            const result = await db.query(query);
            return result.rows;
        } catch (err) {
            console.error('Error getting MPs:', err);
            throw err;
        }
    }

    static async getById(mp_id) {
        const query = `
            SELECT 
                m.mp_id,
                m.mp_name,
                m.mobile,
                m.mp_type,
                m.state_id,
                m.applicant_id,
                s.state_name
            FROM mps m
            JOIN states s ON m.state_id = s.state_id
            WHERE m.mp_id = $1
        `;
        try {
            const result = await db.query(query, [mp_id]);
            if (result.rows.length === 0) {
                throw new Error('MP not found');
            }
            return result.rows[0];
        } catch (err) {
            console.error('Error getting MP:', err);
            throw err;
        }
    }

    static async update(mp_id, data) {
        const validFields = [
            'mp_name', 'mobile', 'mp_type',
            'state_id', 'applicant_id'
        ];
        
        const updates = [];
        const values = [mp_id];
        let paramCount = 2;

        Object.keys(data).forEach(key => {
            if (validFields.includes(key)) {
                updates.push(`${key} = $${paramCount}`);
                values.push(data[key]);
                paramCount++;
            }
        });

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        const query = `
            UPDATE mps 
            SET ${updates.join(', ')}
            WHERE mp_id = $1 
            RETURNING *
        `;

        try {
            const result = await db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('MP not found');
            }
            return result.rows[0];
        } catch (err) {
            if (err.code === '23503') {
                throw new Error('Referenced state or applicant does not exist');
            }
            throw err;
        }
    }

    static async delete(mp_id) {
        const query = 'DELETE FROM mps WHERE mp_id = $1 RETURNING *';
        try {
            const result = await db.query(query, [mp_id]);
            if (result.rows.length === 0) {
                throw new Error('MP not found');
            }
            return result.rows[0];
        } catch (err) {
            console.error('Error deleting MP:', err);
            throw err;
        }
    }

    static async getByApplicant(applicant_id) {
        const query = `
            SELECT 
                mp.mp_id,
                mp.mp_name,
                mp.mobile,
                mp.mp_type,
                mp.state_id,
                mp.applicant_id,
                s.state_name
            FROM mps mp
            JOIN states s ON mp.state_id = s.state_id
            WHERE mp.applicant_id = $1
            ORDER BY mp.mp_id
        `;
        try {
            const result = await db.query(query, [applicant_id]);
            return result.rows;
        } catch (err) {
            console.error('Error fetching MPs by applicant ID:', err);
            throw err;
        }
    }
}

module.exports = MP;