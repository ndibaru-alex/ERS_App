const db = require('../config/db');

class Applicant {
    static async create(data) {
        const validFields = [
            'first_name', 'midle_name', 'last_name', 'mother_name',
            'date_of_birth', 'place_of_birth', 'gender', 'email',
            'mobile_number', 'national_id_number', 'passport_number',
            'photo_url', 'marital_status', 'highest_educ', 'school_name',
            'height', 'weight', 'nbr_of_chil', 'live_with', 'emp_status',
            'app_status', 'city_id', 'being_qatar', 'arrest_qatar' // Added new fields
        ];

        // Validate gender
        if (data.gender && !['male', 'female'].includes(data.gender.toLowerCase())) {
            throw new Error('Gender must be either male or female');
        }

        const fields = [];
        const values = [];
        let paramCounter = 1;

        validFields.forEach(field => {
            if (data[field] !== undefined) {
                if (field === 'height' || field === 'weight') {
                    if (isNaN(Number(data[field]))) {
                        throw new Error(`${field} must be a numeric value`);
                    }
                }
                if (field === 'gender') {
                    data[field] = data[field].toLowerCase();
                }
                fields.push(field);
                values.push(data[field]);
                paramCounter++;
            }
        });

        const query = `
            INSERT INTO applicants (${fields.join(', ')})
            VALUES (${fields.map((_, index) => `$${index + 1}`).join(', ')})
            RETURNING *
        `;

        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (err) {
            console.error('Error creating applicant:', err);
            throw err;
        }
    }

    static async getAll() {
        const query = `
            SELECT 
                a.applicant_id,
                a.first_name,
                a.midle_name,
                a.last_name,
                a.mother_name,
                a.date_of_birth,
                a.place_of_birth,
                a.gender,
                a.email,
                a.mobile_number,
                a.national_id_number,
                a.passport_number,
                a.photo_url,
                a.marital_status,
                a.highest_educ,
                a.school_name,
                a.height || ' meter' AS height,
                a.weight || ' kg' AS weight,
                a.nbr_of_chil,
                a.live_with,
                a.emp_status,
                a.app_status,
                a.city_id,
                c.city_name,
                r.region_name,
                s.state_name,
                a.created_at
            FROM applicants a
            LEFT JOIN cities c ON a.city_id = c.city_id
            LEFT JOIN regions r ON c.region_id = r.region_id
            LEFT JOIN states s ON r.state_id = s.state_id
            ORDER BY a.created_at DESC
        `;
        try {
            console.log('Executing getAll query:', query);
            const result = await db.query(query);
            return result.rows;
        } catch (err) {
            console.error('Error executing getAll query:', err.message);
            throw err;
        }
    }

    static async getById(id) {
        const query = `
            SELECT 
                a.applicant_id,
                a.first_name,
                a.midle_name,
                a.last_name,
                a.mother_name,
                a.date_of_birth,
                a.place_of_birth,
                a.gender,
                a.email,
                a.mobile_number,
                a.national_id_number,
                a.passport_number,
                a.photo_url,
                a.marital_status,
                a.highest_educ,
                a.school_name,
                a.height || ' meter' AS height,
                a.weight || ' kg' AS weight,
                a.nbr_of_chil,
                a.live_with,
                a.emp_status,
                a.app_status,
                a.city_id,
                c.city_name,
                r.region_name,
                s.state_name
            FROM applicants a
            LEFT JOIN cities c ON a.city_id = c.city_id
            LEFT JOIN regions r ON c.region_id = r.region_id
            LEFT JOIN states s ON r.state_id = s.state_id
            WHERE a.applicant_id = $1
        `;
        try {
            console.log('Executing getById query:', query, 'with id:', id);
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (err) {
            console.error('Error executing getById query:', err.message);
            throw err;
        }
    }

    static async update(id, data) {
        const validFields = [
            'first_name', 'midle_name', 'last_name', 'mother_name',
            'date_of_birth', 'place_of_birth', 'gender', 'email',
            'mobile_number', 'national_id_number', 'passport_number',
            'photo_url', 'marital_status', 'highest_educ', 'school_name',
            'height', 'weight', 'nbr_of_chil', 'live_with', 'emp_status',
            'app_status', 'city_id', 'being_qatar', 'arrest_qatar' // Added new fields
        ];

        // Validate gender if it's being updated
        if (data.gender && !['male', 'female'].includes(data.gender.toLowerCase())) {
            throw new Error('Gender must be either male or female');
        }

        const updates = [];
        const values = [id];
        let paramCounter = 2;

        Object.keys(data).forEach(key => {
            if (validFields.includes(key) && data[key] !== undefined) {
                if (key === 'height' || key === 'weight') {
                    if (isNaN(Number(data[key]))) {
                        throw new Error(`${key} must be a numeric value`);
                    }
                }
                if (key === 'gender') {
                    data[key] = data[key].toLowerCase();
                }
                updates.push(`${key} = $${paramCounter}`);
                values.push(data[key]);
                paramCounter++;
            }
        });

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        const query = `
            UPDATE applicants 
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE applicant_id = $1 
            RETURNING *
        `;

        try {
            const result = await db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Applicant not found');
            }
            return result.rows[0];
        } catch (err) {
            console.error('Error updating applicant:', err);
            throw err;
        }
    }

    static async delete(id) {
        const query = 'DELETE FROM applicants WHERE applicant_id = $1 RETURNING *';
        try {
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (err) {
            console.error('Error deleting applicant:', err);
            throw err;
        }
    }

    static async findByMobileNumber(mobile_number) {
        try {
            // Validate input
            if (!mobile_number || typeof mobile_number !== 'string' || !/^\d{10}$/.test(mobile_number)) {
                throw new Error('Invalid mobile number format');
            }

            const query = `
                SELECT 
                    a.applicant_id,
                    a.first_name,
                    a.midle_name,
                    a.last_name,
                    a.mother_name,
                    a.date_of_birth,
                    a.place_of_birth,
                    a.gender,
                    a.email,
                    a.mobile_number,
                    a.national_id_number,
                    a.passport_number,
                    a.photo_url,
                    a.marital_status,
                    a.highest_educ,
                    a.school_name,
                    a.height,
                    a.weight,
                    a.nbr_of_chil,
                    a.live_with,
                    a.emp_status,
                    a.app_status,
                    a.city_id,
                    c.city_name,
                    r.region_name,
                    s.state_name
                FROM applicants a
                LEFT JOIN cities c ON a.city_id = c.city_id
                LEFT JOIN regions r ON c.region_id = r.region_id
                LEFT JOIN states s ON r.state_id = s.state_id
                WHERE a.mobile_number = $1
            `;

            console.log('Executing query for mobile number:', mobile_number);
            const result = await db.query(query, [mobile_number]);
            console.log('Query result:', result.rows[0]);
            return result.rows[0];
        } catch (err) {
            console.error('Error in findByMobileNumber:', {
                error: err.message,
                stack: err.stack,
                mobile_number
            });
            throw err;
        }
    }

    static async findByMobile(mobile_number) {
        const query = `
            SELECT 
                a.applicant_id,
                a.first_name,
                a.midle_name,
                a.last_name,
                a.mother_name,
                a.date_of_birth,
                a.place_of_birth,
                a.gender,
                a.email,
                a.mobile_number,
                a.national_id_number,
                a.passport_number,
                a.photo_url,
                a.marital_status,
                a.highest_educ,
                a.school_name,
                CASE 
                    WHEN a.height = '' OR a.height IS NULL OR a.height = 'null' THEN NULL 
                    ELSE NULLIF(a.height, '')::numeric || ' meter'
                END as height,
                CASE 
                    WHEN a.weight = '' OR a.weight IS NULL OR a.weight = 'null' THEN NULL 
                    ELSE NULLIF(a.weight, '')::numeric || ' kg'
                END as weight,
                a.nbr_of_chil,
                a.live_with,
                a.emp_status,
                a.app_status,
                a.city_id,
                c.city_name,
                r.region_name,
                s.state_name
            FROM applicants a
            LEFT JOIN cities c ON a.city_id = c.city_id
            LEFT JOIN regions r ON c.region_id = r.region_id
            LEFT JOIN states s ON r.state_id = s.state_id
            WHERE a.mobile_number = $1
        `;
        try {
            const result = await db.query(query, [mobile_number]);
            return result.rows[0];
        } catch (err) {
            console.error('Error finding applicant by mobile:', err);
            throw err;
        }
    }
}

module.exports = Applicant;