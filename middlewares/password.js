/**
 * ## Password Handling Middleware
 *
 * This middleware is designed to generate and validate hashed passwords.
 *
 * ### Step-by-step procedure:
 * 1. Generate a cryptographically secure salt.
 * 2. Hash the password using PBKDF2 and the generated salt.
 * 3. Validate passwords by hashing input and comparing with stored hash.
 *
 * ### Detailed Explanation:
 * - **crypto**: Node's native crypto module.
 * - **SALT_LENGTH**: Length of the salt (should match hash length).
 * - **ITERATIONS**: Number of iterations for PBKDF2.
 * - **KEY_LENGTH**: Length of the generated cryptographic key.
 * - **DIGEST**: The hash function used.
 */

const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");

const SALT_LENGTH = 64; // Bytes
const ITERATIONS = 10000;
const KEY_LENGTH = 64; // Bytes
const DIGEST = "sha512";

// Generate password hash and salt
module.exports.generatePassword = async (password) => {
	try {
		// Step 1: Generate a cryptographically secure salt
		const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");

		// Step 2: Hash the password using PBKDF2 and the generated salt
		const genHash = crypto
			.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
			.toString("hex");

		return {
			salt: salt,
			hash: genHash,
		};
	} catch (error) {
		logger.error(`Error generating password hash: ${error.message}`);
		throw new ErrorResponse("Failed to generate password hash", 500);
	}
};

// Validate password against a given hash and salt
module.exports.validatePassword = (password, salt, hash) => {
	try {
		// Step 1: Validate passwords by hashing input and comparing with stored hash
		const hashVerify = crypto
			.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
			.toString("hex");

		return hash === hashVerify;
	} catch (error) {
		logger.error(`Error validating password: ${error.message}`);
		throw new ErrorResponse("Failed to validate password", 500);
	}
};
