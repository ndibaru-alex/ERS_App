const { Pool } = require('pg');
require('dotenv').config();

// Construct the connection config object instead of using connection string
const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: false,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 10
};

console.log('Attempting database connection with config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user
});

const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err, client) => {
    console.error('Database pool error:', {
        error: err.message,
        code: err.code,
        detail: err.detail
    });
});

pool.on('connect', (client) => {
    console.log('New database connection established');
});

// Test query function with better error handling
const testConnection = async () => {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('Database test query successful:', {
            timestamp: result.rows[0].now,
            database: process.env.DB_NAME,
            host: process.env.DB_HOST
        });
        return true;
    } catch (err) {
        console.error('Database test query failed:', {
            error: err.message,
            code: err.code,
            detail: err.detail
        });
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
};

// Verify connection function with retries and detailed logging
const verifyConnection = async (retries = 3) => {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Connection attempt ${i + 1} of ${retries}`);
            await testConnection();
            return true;
        } catch (err) {
            lastError = err;
            console.error(`Connection attempt ${i + 1} failed:`, {
                error: err.message,
                code: err.code,
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                database: process.env.DB_NAME
            });
            
            if (i < retries - 1) {
                const delay = 1000 * (i + 1);
                console.log(`Waiting ${delay}ms before next attempt...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
};

// Enhanced query function with better error handling
const query = async (text, params) => {
    const start = Date.now();
    let client;

    try {
        client = await pool.connect();
        console.log('Executing query:', {
            text: text.replace(/\s+/g, ' ').trim(),
            params: params
        });

        const res = await client.query(text, params);
        const duration = Date.now() - start;

        console.log('Query completed:', {
            command: res.command,
            rowCount: res.rowCount,
            duration: duration + 'ms'
        });

        return res;
    } catch (err) {
        console.error('Query error:', {
            error: err.message,
            code: err.code,
            detail: err.detail,
            query: text.replace(/\s+/g, ' ').trim(),
            params: params,
            duration: Date.now() - start + 'ms'
        });
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
};

// Test the connection immediately
testConnection().catch(err => {
    console.error('Initial connection test failed:', err.message);
});

module.exports = {
    query,
    pool,
    verifyConnection,
    testConnection
};