const logger = require("../../../utils/logger");

/**
 * ## FetchMe Controller
 *
 * This controller fetches and responds with the authenticated user's information.
 *
 * ### Step-by-step procedure:
 * 1. Extract the user data from the request object.
 * 2. Check if the user data is present.
 * 3. Remove any unnecessary attributes to prevent potential information leaks.
 * 4. Respond with the user data.
 * 
 * ### Detailed Explanation:
 * - **user**: The user data retrieved by the `getMe` middleware.
 * - **cleanedUser**: The user data after removing unnecessary attributes.
 */

exports.fetchMe = async (req, res, next) => {
    try {
        // Step 1: Extract the user data from the request object
        const { user } = req;

        // Step 2: Check if the user data is present
        if (!user) {
            logger.error("User data not present in request");
            return next(new ErrorResponse("User data missing", 500));
        }

        // Step 3: Remove any unnecessary attributes to prevent potential information leaks
        const cleanedUser = {
            ...user._doc,
            salt: undefined,
            hash: undefined,
            imageID: undefined,
            timeTaken: undefined
        };

        // Step 4: Respond with the user data
        res.status(200).json({
            success: true,
            data: cleanedUser
        });
    } catch (error) {
        logger.error(`Error in fetchMe Controller: ${error.message}`);
        next(error);
    }
};
