const db = require('../config/db');

class Reference {
    static async create(data) {
        const query = `
            WITH new_reference AS (
                INSERT INTO applic_ref (
                    applicant_id, full_name, ref_relationship, is_grantor,
                    city_id, mobile_number, national_id_number, passport_number,
                    ref_verified
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9
                )
                RETURNING *,
                (SELECT city_name FROM cities WHERE city_id = applic_ref.city_id) as city_name,
                (SELECT region_name FROM regions r JOIN cities c ON c.region_id = r.region_id WHERE c.city_id = applic_ref.city_id) as region_name,
                (SELECT state_name FROM states s JOIN regions r ON r.state_id = s.state_id JOIN cities c ON c.region_id = r.region_id WHERE c.city_id = applic_ref.city_id) as state_name
            )
            SELECT * FROM new_reference
        `;
        try {
            console.log('Creating reference with data:', JSON.stringify(data, null, 2));
            const values = [
                data.applicant_id,
                data.full_name,
                data.ref_relationship,
                data.is_grantor || '0',
                data.city_id,
                data.mobile_number || null,
                data.national_id_number || null,
                data.passport_number || null,
                data.ref_verified || '0'
            ];
            console.log('Query values:', values);
            const result = await db.query(query, values);
            console.log('Query result:', result.rows[0]);
            
            if (!result.rows[0]) {
                throw new Error('Failed to create reference');
            }
            return result.rows[0];
        } catch (err) {
            console.error('Detailed error creating reference:', {
                error: err,
                errorMessage: err.message,
                errorCode: err.code,
                errorDetail: err.detail,
                data: data
            });
            if (err.code === '23503') {
                if (err.detail?.includes('applicant_id')) {
                    throw new Error('Referenced applicant does not exist');
                } else if (err.detail?.includes('city_id')) {
                    throw new Error('Referenced city does not exist');
                }
            }
            throw err;
        }
    }

    static async getByApplicant(applicant_id) {
        const query = `
            SELECT 
                ar.*,
                c.city_name,
                r.region_name,
                s.state_name
            FROM applic_ref ar
            JOIN cities c ON ar.city_id = c.city_id
            JOIN regions r ON c.region_id = r.region_id
            JOIN states s ON r.state_id = s.state_id
            WHERE ar.applicant_id = $1
            ORDER BY ar.applic_ref_id
        `;
        try {
            const result = await db.query(query, [applicant_id]);
            return result.rows;
        } catch (err) {
            console.error('Error getting references:', err);
            throw err;
        }
    }

    static async getById(reference_id) {
        const query = `
            SELECT 
                ar.*,
                c.city_name,
                r.region_name,
                s.state_name
            FROM applic_ref ar
            JOIN cities c ON ar.city_id = c.city_id
            JOIN regions r ON c.region_id = r.region_id
            JOIN states s ON r.state_id = s.state_id
            WHERE ar.applic_ref_id = $1
        `;
        try {
            const result = await db.query(query, [reference_id]);
            return result.rows[0];
        } catch (err) {
            console.error('Error getting reference:', err);
            throw err;
        }
    }

    static async update(reference_id, data) {
        const validFields = [
            'full_name', 'ref_relationship', 'is_grantor',
            'city_id', 'mobile_number', 'national_id_number',
            'passport_number', 'ref_verified'
        ];
        
        const updates = [];
        const values = [reference_id];
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
            UPDATE applic_ref 
            SET ${updates.join(', ')}
            WHERE applic_ref_id = $1 
            RETURNING *
        `;

        try {
            const result = await db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Reference not found');
            }
            return result.rows[0];
        } catch (err) {
            console.error('Error updating reference:', err);
            throw err;
        }
    }

    static async delete(reference_id) {
        const query = 'DELETE FROM applic_ref WHERE applic_ref_id = $1';
        try {
            const result = await db.query(query, [reference_id]);
            if (result.rowCount === 0) {
                throw new Error('Reference not found');
            }
        } catch (err) {
            console.error('Error deleting reference:', err);
            throw err;
        }
    }
}

module.exports = Reference;