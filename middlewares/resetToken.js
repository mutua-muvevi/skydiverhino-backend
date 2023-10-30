/**
 * ## Reset Token Middleware
 *
 * ## Step by Step Procedure:
 * 1. Generate a cryptographically secure reset token.
 * 2. Hash the token for secure storage.
 * 3. Set the hashed token and its expiry on the user object.
 * 4. Return the plain token for use in the email.
 */

const crypto = require("crypto");

const TOKEN_LENGTH = 20; // This gives a 40-character long hex string.
const TOKEN_EXPIRY_HOURS = 4;

exports.generateResetToken = (user) => {
	try {
		// Step 1: Generate reset token
		const resetToken = crypto.randomBytes(TOKEN_LENGTH).toString("hex");

		// Step 2: Hash the token for secure storage
		user.resetPasswordToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		// Step 3: Set token expiry
		user.resetPasswordExpiry =
			Date.now() + TOKEN_EXPIRY_HOURS * (60 * 60 * 1000);

		// Step 4: Return plain token
		return resetToken;
	} catch (error) {
		throw new Error("Error generating reset token.");
	}
};
