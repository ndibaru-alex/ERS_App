const db = require('../config/db');

class Language {
    static async create(data) {
        const query = `
            INSERT INTO applicant_languages (
                applicant_id, language, level
            ) VALUES ($1, $2, $3)
            RETURNING *
        `;
        
        try {
            const values = [data.applicant_id, data.language, data.level];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (err) {
            console.error('Error creating language:', err);
            if (err.code === '23503') {
                throw new Error('Referenced applicant does not exist');
            }
            throw err;
        }
    }

    static async getByApplicant(applicant_id) {
        const query = `
            SELECT * FROM applicant_languages 
            WHERE applicant_id = $1
            ORDER BY app_lan_id
        `;
        try {
            const result = await db.query(query, [applicant_id]);
            return result.rows;
        } catch (err) {
            console.error('Error getting languages:', err);
            throw err;
        }
    }

    static async update(id, data) {
        const validFields = ['language', 'level'];
        const updates = [];
        const values = [id];
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
            UPDATE applicant_languages 
            SET ${updates.join(', ')}
            WHERE app_lan_id = $1 
            RETURNING *
        `;

        try {
            const result = await db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Language not found');
            }
            return result.rows[0];
        } catch (err) {
            console.error('Error updating language:', err);
            throw err;
        }
    }

    static async delete(id) {
        const query = 'DELETE FROM applicant_languages WHERE app_lan_id = $1 RETURNING *';
        try {
            const result = await db.query(query, [id]);
            if (result.rows.length === 0) {
                throw new Error('Language not found');
            }
            return result.rows[0];
        } catch (err) {
            console.error('Error deleting language:', err);
            throw err;
        }
    }
}

module.exports = Language;