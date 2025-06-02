const db = require('../config/db');

class Document {
    static async create(applicant_id, document_type, file_url, remarks = null) {
        const query = `
            INSERT INTO documents (
                applicant_id, document_type, file_url, remarks, status, doc_verified, updated_at
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
            RETURNING 
                document_id,
                applicant_id,
                document_type,
                file_url,
                uploaded_at,
                updated_at,
                status,
                doc_verified,
                remarks
        `;
        try {
            if (!file_url.startsWith('/uploads/')) {
                throw new Error('Invalid file URL format');
            }
            const values = [applicant_id, document_type, file_url, remarks, 'pending', '0'];
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (err) {
            if (err.code === '23505') { // Unique violation
                throw new Error('Document already exists');
            }
            if (err.code === '23503') { // Foreign key violation
                throw new Error('Referenced applicant does not exist');
            }
            throw err;
        }
    }

    static async getByApplicant(applicant_id) {
        const query = `
            SELECT 
                d.*,
                a.first_name,
                a.last_name
            FROM documents d
            JOIN applicants a ON d.applicant_id = a.applicant_id
            WHERE d.applicant_id = $1 
            ORDER BY d.uploaded_at DESC
        `;
        try {
            const result = await db.query(query, [applicant_id]);
            return result.rows;
        } catch (err) {
            console.error('Error getting documents:', err);
            throw err;
        }
    }

    static async updateStatus(document_id, status, remarks = null) {
        const query = `
            UPDATE documents 
            SET 
                status = $1,
                remarks = COALESCE($2, remarks),
                updated_at = NOW()
            WHERE document_id = $3
            RETURNING *
        `;
        try {
            const result = await db.query(query, [status, remarks, document_id]);
            if (result.rows.length === 0) {
                throw new Error('Document not found');
            }
            return result.rows[0];
        } catch (err) {
            console.error('Error updating document status:', err);
            throw err;
        }
    }

    static async verify(document_id, remarks = null) {
        const query = `
            UPDATE documents 
            SET 
                doc_verified = '1',
                remarks = COALESCE($1, remarks),
                updated_at = NOW()
            WHERE document_id = $2
            RETURNING *
        `;
        try {
            const result = await db.query(query, [remarks, document_id]);
            if (result.rows.length === 0) {
                throw new Error('Document not found');
            }
            return result.rows[0];
        } catch (err) {
            console.error('Error verifying document:', err);
            throw err;
        }
    }

    static async delete(document_id) {
        const query = 'DELETE FROM documents WHERE document_id = $1 RETURNING *';
        try {
            const result = await db.query(query, [document_id]);
            if (result.rows.length === 0) {
                throw new Error('Document not found');
            }
            return result.rows[0];
        } catch (err) {
            console.error('Error deleting document:', err);
            throw err;
        }
    }
}

module.exports = Document;