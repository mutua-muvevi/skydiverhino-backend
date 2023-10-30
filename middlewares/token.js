/**
 * ## Token Issuance Middleware
 *
 * This middleware is designed to issue JSON Web Tokens (JWT) for authenticated users.
 *
 * ### Step-by-step procedure:
 * 1. Extract the user's unique identifier.
 * 2. Define the JWT payload.
 * 3. Sign the token with a secret key.
 * 4. Return the signed token and its expiration details.
 *
 * ### Detailed Explanation:
 * - **jsonwebtoken**: Library to work with JSON Web Tokens.
 * - **JWT_SECRET**: A secret string to sign the JWT.
 * - **USER_TOKEN_EXPIRY**: Token expiration duration.
 */

const jsonwebtoken = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse"); // Assuming this path is accurate
const logger = require("../utils/logger");

module.exports.issueJWT = (user) => {
	try {
		// Step 1: Extract the user's unique identifier
		const _id = user._id;

		// Step 2: Define the JWT payload
		const payload = {
			sub: _id,
			iat: Date.now(),
		};

		// Extract token expiration duration from environment or default to '1d'
		const expiresIn = process.env.USER_TOKEN_EXPIRY || "1d";

		// Step 3: Sign the token
		if (!process.env.JWT_SECRET) {
			logger.error("JWT_SECRET is missing in environment");
			throw new ErrorResponse(
				"JWT_SECRET is missing in environment",
				500
			);
		}
		const signedToken = jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
			expiresIn: expiresIn,
		});

		// Step 4: Return the token and its expiration details
		return {
			token: "Bearer " + signedToken,
			expires: expiresIn,
		};
	} catch (error) {
		logger.error(`Error issuing JWT: ${error.message}`);
		throw new ErrorResponse("Failed to issue JWT", 500);
	}
};
