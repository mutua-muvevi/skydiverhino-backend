/**
 * ## GetMe Middleware
 *
 * This middleware retrieves the authenticated user's information.
 *
 * ### Step-by-step procedure:
 * 1. Extract JWT from the request.
 * 2. Validate the JWT and extract user ID.
 * 3. Fetch the user data from the database.
 * 4. Measure the performance of the fetch operation.
 * 5. Attach the user data to the request object.
 *
 * ### Detailed Explanation:
 * - **User**: User model to fetch user details.
 * - **jwt**: Extracted JWT from request headers.
 * - **invalidJWT**: A constant string for an invalid JWT error.
 */

const { performance } = require("perf_hooks");
const User = require("../models/user/user");
const ErrorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");
const { populateUser } = require("../config/populateUser");

const invalidJWT = "Invalid User";

exports.getMe = async (req, res, next) => {
	try {
		// Step 1: Extract JWT from the request
		const { jwt } = req;

		// Step 2: Validate the JWT and extract user ID
		if (!jwt) {
			logger.error("JWT not provided");
			return next(new ErrorResponse(invalidJWT, 401));
		}

		const userID = jwt.userId;

		// Step 3: Fetch the user data from the database
		const start = performance.now();

		const user = await User.findById(userID)
			.select("-salt -hash -imageID")
			.populate(populateUser);

		const end = performance.now();

		// Step 4: Measure the performance of the fetch operation
		const timeTaken = end - start;

		if (!user) {
			logger.error("User not found with given ID");
			return next(new ErrorResponse("Can't get the user", 404));
		}

		// Step 5: Attach the user data to the request object
		req.user = user;
		req.user.timeTaken = timeTaken;

		next();
	} catch (error) {
		logger.error(`Error in GetMe Middleware: ${JSON.stringify(error)}`);
		next(error);
	}
};
