/**
 * SERVICE EDIT CONTROLLER
 * ========================
 *
 * Steps:
 * - Validate the request body and params
 * - Find the service and Update the service
 * - Save the service
 * - Push the updated service to the user's services array (if not already there)
 * - Create a notification
 * - Log the success
 */

//the imports
const mongoose = require("mongoose");
const Service = require("../../models/service/service");
const User = require("../../models/user/user");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

// controller
exports.editService = async (req, res, next) => {
	const {
		name,
		details,
	} = req.body;
	const { serviceID } = req.params;
	const user = req.user;

	// Step: Validate the request body and params
	let errors = [];

	if (!serviceID || !mongoose.Types.ObjectId.isValid(serviceID))
		errors.push("Invalid service ID");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in EditService Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	let updatedService = {};

	if (name) updatedService.name = name;
	if (details) updatedService.details = details;

	try {
		const start = performance.now();

		// Find the service and update
		const service = await Service.findOneAndUpdate(
			{ _id: serviceID },
			updatedService,
			{ new: true, runValidators: true, context: "query" }
		);

		if (!service) {
			return next(
				new ErrorResponse("Not authorized to edit this service", 401)
			);
		}

		// Create a notification
		const notification = {
			details: `Service ${name} has been updated successfully`,
			createdBy: user._id,
			type: "edit",
			relatedModel: "Service",
			relatedModelID: service._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		// Send the response
		res.status(201).json({
			success: true,
			message: "Service updated successfully",
			data: service,
		});

		const end = performance.now();
		logger.info(
			`Service : ${serviceID} updated successfully for user: {${
				user._id
			}} in ${end - start}ms`
		);
	} catch (error) {
		logger.error(`Error in EditService Controller: ${error.message}`);
		next(error);
	}
};
