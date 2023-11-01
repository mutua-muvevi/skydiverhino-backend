/**
 * ## Reset Password Controller
 *
 * ## Step by Step Procedure:
 * 1. Extract password and reset token from request.
 * 2. Hash reset token for lookup.
 * 3. Validate the new password's presence.
 * 4. Find user with the hashed token and check token's validity.
 * 5. If user found, generate new salt and hash for password.
 * 6. Save the updated user data.
 * 7. Respond to the client with success.
 * 8. Gracefully handle errors.
 */

const { generatePassword } = require("../../../middlewares/password");
const User = require("../../../models/user/user");
const ErrorResponse = require("../../../utils/errorResponse");
const logger = require("../../../utils/logger");
const crypto = require("crypto");

exports.resetpassword = async (req, res, next) => {
	// Step 1: Extract password and reset token from request
	const { password } = req.body;
	const { resetToken } = req.params;


	try {
		// Step 2: Validate the new password's presence
		if (!password) {
			return next(
				new ErrorResponse("Your new password is required", 400)
			);
		}

		// Step 3: Hash reset token for lookup
		const hashedResetToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		// Step 4: Find user with the hashed token and check token's validity
		const user = await User.findOne({
			resetPasswordToken: hashedResetToken,
			resetPasswordExpiry: { $gt: Date.now() },
		});

		if (!user) {
			return next(
				new ErrorResponse("Invalid token or token expired.", 400)
			);
		}

		// Step 5: Generate new salt and hash for password
		const saltAndHash = await generatePassword(password);
		console.log("Hash from here", saltAndHash.hash, "Salt from here", saltAndHash.salt)
		console.log("Hash from the user", user.hash, "Salt from the user", user.salt)

		// Step 6: Save the updated user data
		user.salt = saltAndHash.salt;
		user.hash = saltAndHash.hash;
		user.resetPasswordToken = null;
		user.resetPasswordExpiry = null;

		await user.save();

		// Step 7: Respond to the client with success
		res.status(200).json({
			success: true,
			message: "Your password was updated successfully",
		});
		logger.info(`Reset Password for ${user.email} done successfully`);

	} catch (error) {
		// Step 8: Gracefully handle errors
		logger.error(`Error in ForgotPassword Controller: ${error.message}`);
		next(new ErrorResponse("An error occurred. Please try again.", 500));
	}
};
