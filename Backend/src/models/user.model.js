const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    static async create(username, email, password, role, full_name) {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const query = `
            INSERT INTO users (username, email, password_hash, role, full_name)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [username, email, password_hash, role, full_name];
        
        try {
            console.log('Creating user with values:', {
                username,
                email,
                role,
                full_name
            });
            const result = await db.query(query, values);
            console.log('User created successfully:', result.rows[0]);
            return result.rows[0];
        } catch (err) {
            console.error('Error creating user:', {
                error: err.message,
                code: err.code,
                detail: err.detail
            });
            throw err;
        }
    }

    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        try {
            const result = await db.query(query, [username]);
            console.log('findByUsername result:', result.rows[0]);
            return result.rows[0];
        } catch (err) {
            console.error('Error finding user by username:', {
                username,
                error: err.message
            });
            throw err;
        }
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        try {
            const result = await db.query(query, [email]);
            return result.rows[0];
        } catch (err) {
            console.error('Error finding user by email:', {
                email,
                error: err.message
            });
            throw err;
        }
    }

    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        try {
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (err) {
            console.error('Error finding user by id:', {
                id,
                error: err.message
            });
            throw err;
        }
    }

    static async getAll() {
        const query = 'SELECT id, username, email, role, full_name, created_at FROM users';
        try {
            const result = await db.query(query);
            return result.rows;
        } catch (err) {
            console.error('Error getting all users:', err.message);
            throw err;
        }
    }
}

module.exports = User;