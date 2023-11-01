// Package Imports
const User = require("../../../models/user/user");
const { issueJWT } = require("../../../middlewares/token");
const ErrorResponse = require("../../../utils/errorResponse");
const logger = require("../../../utils/logger");

/**
 * ## Verify OTP for User Account Activation
 *
 * ## Step by Step Procedure
 * 1. Extract email and OTP from the request body and validate the request body
 * 2. Retrieve the user with the given email from the database
 * 3. Check if the user exists
 * 4. Verify if the provided OTP has not expired
 * 5. Validate the OTP against the stored OTP for the user
 * 6. If the OTP is valid, issue JWT for user authentication
 * 7. Clear the stored OTP from the user's record
 * 8. Send a response to the user with the JWT
 */

exports.verifyOTP = async (req, res, next) => {
    // Step 1: Extract email and OTP from the request body
	const { email, otp } = req.body;

	try {

		// Step 2: Validate the request body
		let errors = [];
		if (!email) errors.push("Email is required");
		if (!otp) errors.push("OTP is required");

		// If any errors, send them in a single response
		if (errors.length > 0) {
			return next(new ErrorResponse(errors.join(", "), 400));
		}

        // Step 3: Retrieve the user with the given email from the database
		const user = await User.findOne({ email });

        // Step 4: Check if the user exists
		if (!user) {
			return next(new ErrorResponse("User not found.", 404));
		}

        // Step 5: Verify if the provided OTP has not expired
		if (Date.now() > user.otp.expiry) {
			return next(new ErrorResponse("OTP has expired.", 400));
		}

        // Step 6: Validate the OTP against the stored OTP for the user
		if (otp !== user.otp.code) {
			return next(new ErrorResponse("Invalid OTP.", 400));
		}

        // Step 7: If the OTP is valid, issue JWT for user authentication
		const jwt = issueJWT(user);

        // Step 8: Clear the stored OTP from the user's record
		user.otp = undefined;
		await user.save();

        // Step 9: Send a response to the user with the JWT
		res.status(200).json({
			success: true,
			message: "Email verified successfully.",
			token: jwt.token,
			expires: jwt.expires,
		});

	} catch (error) {
		logger.error(`Error in verifyOTP Controller: ${error.message}`);
		next(error);
	}
};
