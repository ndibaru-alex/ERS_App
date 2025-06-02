const crypto = require('crypto');
const db = require('../config/db');

class OTPService {
    static async generateOTP(mobile) {
        try {
            if (!mobile || typeof mobile !== 'string' || !/^\d{10}$/.test(mobile)) {
                throw new Error('Invalid mobile number format');
            }

            // First, invalidate any existing OTPs for this mobile number
            await db.query(
                'UPDATE otps SET is_used = true WHERE mobile_number = $1 AND is_used = false',
                [mobile]
            );

            // Generate 6-digit OTP
            const otp = crypto.randomInt(100000, 999999).toString();
            
            // Store OTP in database with 5-minute expiration
            const query = `
                INSERT INTO otps (mobile_number, otp_code, expires_at)
                VALUES ($1, $2, NOW() + INTERVAL '5 minutes')
                RETURNING otp_id
            `;
            
            await db.query(query, [mobile, otp]);
            return otp;
        } catch (err) {
            console.error('Error generating OTP:', err);
            throw err;
        }
    }

    static async verifyOTP(mobile, otpToVerify) {
        try {
            // Validate input
            if (!mobile || typeof mobile !== 'string' || !/^\d{10}$/.test(mobile)) {
                throw new Error('Invalid mobile number format');
            }

            if (!otpToVerify || typeof otpToVerify !== 'string' || !/^\d{6}$/.test(otpToVerify)) {
                throw new Error('Invalid OTP format');
            }

            // Ensure otpToVerify is treated as a string
            const otpString = otpToVerify.toString();

            // Get the latest unused OTP for this mobile number
            const query = `
                SELECT * FROM otps
                WHERE mobile_number = $1
                AND otp_code = $2
                AND is_used = false
                AND expires_at > NOW()
                AND attempts < 3
                ORDER BY created_at DESC
                LIMIT 1
            `;

            const result = await db.query(query, [mobile, otpString]);
            
            if (result.rows.length === 0) {
                // Increment attempts for this OTP if it exists
                await db.query(`
                    UPDATE otps 
                    SET attempts = attempts + 1
                    WHERE mobile_number = $1
                    AND otp_code = $2
                    AND is_used = false
                `, [mobile, otpString]);
                return false;
            }

            // Mark OTP as used and record verification time
            await db.query(
                'UPDATE otps SET is_used = true, verified_at = NOW() WHERE otp_id = $1',
                [result.rows[0].otp_id]
            );

            return true;
        } catch (err) {
            console.error('Error verifying OTP:', err);
            throw err;
        }
    }

    static async hasVerifiedOTP(mobile_number) {
        try {
            // Check if there's a recently verified OTP for this mobile number
            const query = `
                SELECT * FROM otps
                WHERE mobile_number = $1
                AND is_used = true
                AND verified_at > NOW() - INTERVAL '15 minutes'
                ORDER BY verified_at DESC
                LIMIT 1
            `;

            const result = await db.query(query, [mobile_number]);
            return result.rows.length > 0;
        } catch (err) {
            console.error('Error checking OTP verification:', err);
            throw err;
        }
    }

    static async cleanupExpiredOTPs() {
        try {
            // Delete OTPs that are expired or have too many attempts
            await db.query(`
                DELETE FROM otps
                WHERE expires_at < NOW()
                OR attempts >= 3
                OR is_used = true
            `);
        } catch (err) {
            console.error('Error cleaning up OTPs:', err);
        }
    }
}

module.exports = OTPService;