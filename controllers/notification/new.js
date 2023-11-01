// ============================
// TOP COMMENT
//
//Create Notification:
//Step 1: Validate incoming request payload.
//Step 2: Create and save a new notification.


//module imports
const Notification = require("../../models/notification/notification");
const logger = require("../../utils/logger");
const ErrorResponse = require("../../utils/errorResponse");

//the controller
exports.createNotification = async (req, res, next) => {
	const { details, type, relatedModel, relatedModelID, createdBy } = req.body;
	const user = req.user;
	
	//Step 1: Validate the request body
	const errors = [];

	if (!details) errors.push("Notification details is required");
	if (!type) errors.push("Notification type is required");
	if (!relatedModel) errors.push("Notification related model is required");

	if(errors.length > 0) {
		logger.warn(`Validation error in CreateNotification Controller: ${errors.join(", ")}`);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {

		const start = performance.now();

		//Step 2: Create and save a new notification
		const notification = await Notification.create({
			details,
			type,
			relatedModel,
			relatedModelID,
			createdBy: user._id,
		});

		// Step 3: Pushing the notification to the user
		user.notifications.push(notification._id);
		await user.save();

		const end = performance.now();

		//log the success and the time taken
		logger.info(`CreateNotification Controller Success: ${end - start}ms`);
		next();

	} catch (error) {
		logger.error(`CreateNotification Controller: ${error}`);
		next(error)
	}
}