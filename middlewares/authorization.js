/**
 * ## Authorization Middleware
 *
 * This middleware ensures the user has the appropriate user type and role to access certain endpoints.
 *
 * ### Step-by-step procedure:
 * 1. Check if the user's JWT has been attached to the request (by the authentication middleware).
 * 2. Extract the user's type and roles from the JWT.
 * 3. Check if the user has the appropriate type and roles to access the endpoint.
 * 4. If authorized, proceed to the next middleware or route handler. Otherwise, return a 403 Forbidden error.
 *
 * ### Detailed Explanation:
 * - **req.jwt**: Contains the verified JWT which should have the user's type and roles.
 * - **next()**: Proceeds to the next middleware or route handler.
 */

const logger = require("../utils/logger");
const ErrorResponse = require("../utils/errorResponse");

const authorizationMiddleware = (req, res, next) => {
	try {
		// 1. Checking JWT existence
		if (!req.jwt || !req.jwt.userType || !req.jwt.roles) {
			logger.error("Invalid JWT data");
			return next(new ErrorResponse("Invalid token data", 400));
		}

		// 2. Extracting user type and roles
		const { userType, roles } = req.jwt;

		// 3. Checking user type
		if (userType !== "freelancer" && userType !== "client") {
			return res.status(403).json({
				success: false,
				message: "User type unauthorized",
			});
		}

		// Checking for IT team roles
		// if (roles.includes("IT team")) {
		// 	return res.status(403).json({
		// 		success: false,
		// 		message: "IT team unauthorized",
		// 	});
		// }

		// 4. If checks pass, proceed
		next();
	} catch (error) {
		logger.error(error);
		next(error);
	}
};

module.exports = authorizationMiddleware;
