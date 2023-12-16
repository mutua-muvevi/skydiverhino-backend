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

const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

// controller
exports.editService = async (req, res, next) => {
	const {
		name,
		shortDescription,
		details,
		prices,
		requirements,
		faq,
	} = req.body;
	const { serviceID } = req.params;
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

	let updatedService = {};

	if (name) updatedService.name = name;
	if (details) updatedService.details = details;
	if (prices) updatedService.prices = prices;
	if (requirements) updatedService.requirements = requirements;
	if (faq) updatedService.faq = faq;

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
			details: `Service ${name} has been updated successfully by user ${user.fullname}`,
			createdBy: user._id,
			type: "edit",
			relatedModel: "Service",
			relatedModelID: service._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		// Send the response
		res.status(200).json({
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
