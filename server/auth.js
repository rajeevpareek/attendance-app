import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your-super-secret-key-that-should-be-in-an-env-file';

/**
 * Compares a plain text pin with a hash.
 * @param {string} pin - The plain text pin from user input.
 * @param {string} hash - The stored hash from the database.
 * @returns {Promise<boolean>}
 */
export const comparePin = async (pin, hash) => {
    return bcrypt.compare(pin, hash);
};

/**
 * Generates a JSON Web Token (JWT).
 * @param {object} user - The user object (without the pin hash).
 * @returns {Promise<string>}
 */
export const generateToken = async (user) => {
    // The payload should not contain sensitive data that doesn't need to be exposed client-side.
    // The user object passed in should already be "safe".
    return jwt.sign(user, SECRET_KEY, { expiresIn: '8h' });
};

/**
 * Verifies a JWT.
 * @param {string} token - The JWT from the client.
 * @returns {Promise<object>} - The decoded payload if valid.
 */
export const verifyToken = async (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return reject(err);
            }
            resolve(decoded);
        });
    });
};