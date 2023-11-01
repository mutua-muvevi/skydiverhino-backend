/**
 * ## Login Controller
 *
 * ## Step by Step Procedure:
 * 1. Validate request data
 * 2. Fetch user by email
 * 3. Validate the password
 * 4. Issue JWT to the user
 * 5. Send the JWT to the user
 */

// Package and model imports
const ErrorResponse = require("../../../utils/errorResponse");
const User = require("../../../models/user/user");
const logger = require("../../../utils/logger"); // Assuming you have this logger setup

// Middleware imports
const { validatePassword } = require("../../../middlewares/password");
const { issueJWT } = require("../../../middlewares/token");

const invalidAuthMessage =
	"Invalid credentials, please double-check and try again.";

// Login
exports.loginJWT = async (req, res, next) => {
	const { email, password } = req.body;

	try {
		// Step 1: Validate request data
		const errors = [];
		if (!email) errors.push("Email is required");
		if (!password) errors.push("Password is required");

		// If any errors, send them in a single response
		if (errors.length > 0) {
			return next(new ErrorResponse(errors.join(", "), 400));
		}

		// Step 2: Fetch user by email, but only required fields for authentication
		const user = await User.findOne({ email }, "salt hash");
		if (!user) return next(new ErrorResponse(invalidAuthMessage, 400));

		// Step 3: Validate the password
		const isValid = validatePassword(password, user.salt, user.hash);
		if (!isValid) return next(new ErrorResponse(invalidAuthMessage, 400));

		// Step 4: Issue JWT to the user
		const tokenObject = issueJWT(user);

		// Step 5: Send the JWT to the user
		res.status(200).json({
			success: true,
			token: tokenObject.token,
			expires: tokenObject.expires,
		});
	} catch (error) {
		logger.error(`Error in login controller: ${error.message}`);
		next(error);
	}
};
