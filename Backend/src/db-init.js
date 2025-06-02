// Database initialization and table creation script
const db = require('./config/db');

const initDatabase = async () => {
  console.log('Starting database initialization...');
  
  try {
    // Add gender check constraint
    const addGenderConstraint = `
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.constraint_column_usage 
          WHERE table_name = 'applicants' AND column_name = 'gender' AND constraint_name = 'check_valid_gender'
        ) THEN
          ALTER TABLE applicants
          ADD CONSTRAINT check_valid_gender
          CHECK (gender IN ('male', 'female'));
        END IF;
      END $$;
    `;
    
    await db.query(addGenderConstraint);
    console.log('Gender constraint checked/added');

    // Check if applicant_languages table exists
    const checkLanguagesTable = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'applicant_languages'
      );
    `;
    
    const tableExists = await db.query(checkLanguagesTable);
    
    if (!tableExists.rows[0].exists) {
      console.log('applicant_languages table does not exist. Creating...');
      
      const createLanguagesTable = `
        CREATE TABLE applicant_languages (
          app_lan_id SERIAL PRIMARY KEY,
          applicant_id INTEGER NOT NULL,
          language VARCHAR(50) NOT NULL,
          level VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (applicant_id) REFERENCES applicants(applicant_id) ON DELETE CASCADE,
          UNIQUE(applicant_id, language)
        );
      `;
      
      await db.query(createLanguagesTable);
      console.log('applicant_languages table created successfully');
    } else {
      console.log('applicant_languages table already exists');
    }

    // Check if mps table exists
    const checkMPsTable = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'mps'
      );
    `;
    
    const mpsTableExists = await db.query(checkMPsTable);
    
    if (!mpsTableExists.rows[0].exists) {
      console.log('mps table does not exist. Creating...');
      
      const createMPsTable = `
        CREATE TABLE mps (
          mp_id SERIAL PRIMARY KEY,
          mp_name VARCHAR(255) NOT NULL,
          mobile VARCHAR(50),
          mp_type VARCHAR(20) NOT NULL CHECK (mp_type IN ('federal', 'state')),
          state_id INTEGER NOT NULL,
          applicant_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (state_id) REFERENCES states(state_id) ON DELETE CASCADE,
          FOREIGN KEY (applicant_id) REFERENCES applicants(applicant_id) ON DELETE CASCADE
        );
      `;
      
      await db.query(createMPsTable);
      console.log('mps table created successfully');
    } else {
      console.log('mps table already exists');
    }

    // Add OTP table if it doesn't exist
    const createOtpTable = `
      CREATE TABLE IF NOT EXISTS otps (
        otp_id SERIAL PRIMARY KEY,
        mobile_number VARCHAR(15) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        verified_at TIMESTAMP,
        is_used BOOLEAN DEFAULT FALSE,
        attempts INT DEFAULT 0
      );
    `;
    
    await db.query(createOtpTable);
    console.log('OTP table checked/created');

    // Add verified_at column if it doesn't exist
    const addVerifiedAtColumn = `
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='otps' AND column_name='verified_at'
        ) THEN
          ALTER TABLE otps ADD COLUMN verified_at TIMESTAMP;
        END IF;
      END $$;
    `;

    await db.query(addVerifiedAtColumn);
    console.log('verified_at column checked/added');

    // Update existing verified OTPs
    const updateExistingOTPs = `
      UPDATE otps 
      SET verified_at = created_at 
      WHERE is_used = true 
      AND verified_at IS NULL;
    `;

    await db.query(updateExistingOTPs);
    console.log('Existing OTP records updated');
    
    console.log('Database initialization completed successfully');
    return true;
  } catch (err) {
    console.error('Error during database initialization:', err);
    return false;
  }
};

module.exports = { initDatabase };