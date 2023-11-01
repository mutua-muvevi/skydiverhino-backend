/**
 * NEW SERVICE CONTROLLER
 * ========================
 * This controller is responsible for creating a new service.
 *
 * Steps:
 * - Validate the request body
 * - Create a new service
 * - Save the service
 * - Push the service to the user's services array
 * - Create notification
 * - Log the success
 *
 */

// the imports
const Service = require("../../models/service/service");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

// the controller
exports.createService = async (req, res, next) => {
	const {
		name,
		details,
	} = req.body;
	const user = req.user;

	// Step: Validate the request body
	const errors = [];
	if (!name) errors.push("Service name is required");
	if (!details) errors.push("Service details are required");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in CreateService Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		// Check if there is a service with a similar name
		const existingService = await Service.findOne({
			name,
		});
		if (existingService) {
			logger.warn(`Service with name: ${name} already exists`);
			return next(
				new ErrorResponse("Service with this name already exists", 400)
			);
		}

		// Create the service
		const service = new Service({
			name,
			details,
		});

		if (!service) {
			logger.error(
				`Something went wrong while creating the service in the createService controller`
			);
			return next(
				new ErrorResponse(
					"Something went wrong while creating the service",
					500
				)
			);
		}

		// Save the service
		await service.save();

		// Push the service to the user's services array
		user.services.push(service._id);
		await user.save();

		// Create a notification
		const notification = {
			details: `A new service ${name} has been created successfully`,
			type: "create",
			relatedModel: "Service",
			relatedModelID: service._id,
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		// Send response to the client
		res.status(201).json({
			success: true,
			message: "Service created successfully",
			data: service,
		});

		const end = performance.now();

		// Logging success
		logger.info(
			`Service created successfully for user: {${user._id}} in ${
				end - start
			}ms`
		);
	} catch (error) {
		logger.error(`Error in CreateService Controller: ${error.message}`);
		next(error);
	}
};
