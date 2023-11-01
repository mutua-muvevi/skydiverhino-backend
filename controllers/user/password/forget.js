// ... Other imports ...

/**
 * ## Forgot Password Controller
 *
 * ## Step by Step Procedure:
 * 1. Validate email presence and format.
 * 2. Check if the user exists.
 * 3. Generate a reset token using middleware.
 * 4. Construct a password reset URL.
 * 5. Send reset link via email.
 * 6. Handle any errors gracefully.
 */

const { generateResetToken } = require("../../../middlewares/resetToken");
const User = require("../../../models/user/user");
const ErrorResponse = require("../../../utils/errorResponse");
const logger = require("../../../utils/logger");
const SendEmail = require("../../../utils/sendMail");

const validateEmailFormat = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

exports.forgotPassword = async (req, res, next) => {
	const { email } = req.body;

	try {
		// Step 1: Validate email presence and format
		if (!email || !validateEmailFormat(email)) {
			return next(
				new ErrorResponse("Please provide a valid email address.", 400)
			);
		}
		// Step 2: Check if the user exists
		const user = await User.findOne({ email });
		if (!user) {
			logger.warn(
				`Password reset attempt for non-existing email: ${email}`
			);
			return res.status(200).json({
				success: true,
				message:
					"If the email address exists in our system, we will send a reset link.",
			});
		}

		// Step 3: Generate reset token using middleware
		const resetToken = generateResetToken(user);
		await user.save();

		// Step 4: Construct password reset URL
		const resetUrl = `${process.env.CLIENT_URL}/auth/resetpassword/${resetToken}`;

		const emailHTML = `
			<h1>You have requested a password reset</h1>
			<p>Please click this link to reset your password. If you did not request a password reset, please ignore this email.</p>
			<a href=${resetUrl} clicktracking=off>${resetUrl}</a>
		`;

		const emailData = {
			to: email,
			from: process.env.SEND_EMAIL_FROM,
			subject: "Account Activation Link",
			html: emailHTML,
		};

		// Step 5: Send reset link via email
		try {
			const response = await SendEmail(emailData);

			if (!response)
				return next(new ErrorResponse("Error sending email", 500));

			res.status(200).json({
				success: true,
				message: "Reset link sent successfully. Check your email.",
			});
		} catch (error) {
			// Cleanup/reset the reset token in case of an email error
			user.resetPasswordToken = undefined;
			user.resetPasswordExpiry = undefined;
			await user.save();

			logger.error(`Error sending email: ${error.message}`);
			return next(
				new ErrorResponse(
					"Failed to send reset email. Please try again later.",
					500
				)
			);
		}

		logger.info(`Password reset link sent to ${user.email}`);
	} catch (error) {
		// Step 6: Handle any errors gracefully
		logger.error(`Error in ForgotPassword Controller: ${error.message}`);
		next(new ErrorResponse("An error occurred. Please try again.", 500));
	}
};
