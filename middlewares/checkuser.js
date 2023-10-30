// ============================
// TOP COMMENT
//
// Middleware: checkUserExistence
// Step 1: Check for user ID in the request.
// Step 2: Validate if the provided ID is a valid Mongoose ObjectId.
// Step 3: Check if a user exists with the provided ID.
// Step 4: If all checks pass, forward the request to the next middleware or route.
//
// ============================

// Package imports
const mongoose = require("mongoose");
const User = require("../models/user/user");
const ErrorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");

const checkUserExistence = async (req, res, next) => {
	const { userID } = req.params; // Assuming the ID is passed in the request params

	// Step 1: Check for user ID in the request.
	if (!userID) {
		logger.warn("User ID not provided in the request");
		return next(new ErrorResponse("User ID is required", 400));
	}

	// Step 2: Validate if the provided ID is a valid Mongoose ObjectId.
	if (!mongoose.Types.ObjectId.isValid(userID)) {
		logger.warn(`Invalid user ID format: ${userID}`);
		return next(new ErrorResponse("Invalid user ID", 400));
	}

	try {
		// Step 3: Check if a user exists with the provided ID.
		const existingUser = await User.findById(userID).select(
			"-salt -hash -resetPasswordExpiry -resetPasswordToken"
		);

		if (!existingUser) {
			logger.warn(`No user found with the provided ID: ${userID}`);
			return next(new ErrorResponse("User not found", 404));
		}

		// Attach the user to the request object for potential use in subsequent middlewares or controllers
		req.user = existingUser;

		// Step 4: If all checks pass, forward the request to the next middleware or route.
		next();
	} catch (error) {
		logger.error(
			`Error in checkUserExistence middleware: ${error.message}`
		);
		next(error);
	}
};

module.exports = checkUserExistence;
