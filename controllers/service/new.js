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
		shortDescription,
		details,
		prices,
		requirements,
		faq,
	} = req.body;
	const user = req.user;

	// Step: Validate the request body
	const errors = [];
	
	if (!name) errors.push("Service name is required");

	if (!shortDescription)
		errors.push("Service short description is required");

	//valitate to ensure that details, prices and requirements are arrays that contains atleast one object
	if (!Array.isArray(details) || details.length < 1)
		errors.push("Service details is required");

	if (!Array.isArray(prices) || prices.length < 1)
		errors.push("Service prices is required");

	if (!Array.isArray(requirements) || requirements.length < 1)
		errors.push("Service requirements is required");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in CreateService Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		// Check if there is a service with a similar name
		const existingService = await Service.findOne({ name });

		if (existingService) {
			logger.warn(`Service with name: ${name} already exists`);
			return next(
				new ErrorResponse("Service with this name already exists", 400)
			);
		}

		// Create the service
		const service = new Service({
			name,
			shortDescription,
			details,
			requirements,
			prices,
			faq
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

		// Create a notification
		const notification = {
			details: `A new service ${name} has been created successfully by user ${user._id}`,
			type: "create",
			relatedModel: "Service",
			relatedModelID: service._id,
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
