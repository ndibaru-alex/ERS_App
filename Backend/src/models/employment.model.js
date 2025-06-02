const db = require('../config/db');

class Employment {
    static async create(data) {
        const query = `
            INSERT INTO employment_history (
                applicant_id,
                employer_name,
                city_id,
                job_title,
                start_date,
                end_date,
                contact_name,
                emp_verified
            ) VALUES ($1, $2, $3, $4, $5::date, $6::date, $7, $8)
            RETURNING *,
                (SELECT city_name FROM cities WHERE city_id = $3) as city_name
        `;
        try {
            const values = [
                data.applicant_id,
                data.employer_name,
                data.city_id,
                data.job_title,
                data.start_date,
                data.end_date,
                data.contact_name,
                data.emp_verified
            ];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (err) {
            if (err.code === '23503') { // Foreign key violation
                throw new Error('Referenced applicant or city does not exist');
            }
            throw err;
        }
    }

    static async getByApplicant(applicant_id) {
        const query = `
            SELECT 
                eh.*,
                c.city_name as city_name,
                r.region_name,
                s.state_name
            FROM employment_history eh
            JOIN cities c ON eh.city_id = c.city_id
            JOIN regions r ON c.region_id = r.region_id
            JOIN states s ON r.state_id = s.state_id
            WHERE eh.applicant_id = $1 
            ORDER BY eh.start_date DESC
        `;
        try {
            const result = await db.query(query, [applicant_id]);
            return result.rows;
        } catch (err) {
            console.error('Error getting employment history:', err);
            throw err;
        }
    }

    static async update(employment_id, data) {
        const validFields = [
            'employer_name', 'city_id', 'job_title',
            'start_date', 'end_date', 'contact_name', 'emp_verified'
        ];
        
        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [employment_id];
        let paramCount = 2; // Start from 2 as $1 is used for employment_id

        Object.keys(data).forEach(key => {
            if (validFields.includes(key)) {
                if (key === 'start_date' || key === 'end_date') {
                    updates.push(`${key} = $${paramCount}::date`);
                } else {
                    updates.push(`${key} = $${paramCount}`);
                }
                values.push(data[key]);
                paramCount++;
            }
        });

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        const query = `
            UPDATE employment_history 
            SET ${updates.join(', ')}
            WHERE employment_id = $1 
            RETURNING *
        `;

        try {
            const result = await db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Employment record not found');
            }
            return result.rows[0];
        } catch (err) {
            if (err.code === '23503') { // Foreign key violation
                throw new Error('Referenced city does not exist');
            }
            throw err;
        }
    }

    static async delete(employment_id) {
        const query = 'DELETE FROM employment_history WHERE employment_id = $1 RETURNING *';
        try {
            const result = await db.query(query, [employment_id]);
            if (result.rows.length === 0) {
                throw new Error('Employment record not found');
            }
            return result.rows[0];
        } catch (err) {
            console.error('Error deleting employment record:', err);
            throw err;
        }
    }
}

module.exports = Employment;