/**
 * NEW LEAD CONTROLLER
 * ========================
 * This controller is responsible for creating a new lead.
 *
 * Steps:
 * - Validate the request body
 * - Create a new lead
 * - Save the lead
 * - Push the lead to the user's leads array
 * - Create notification
 * - Log the success
 *
 */

//the imports
const mongoose = require("mongoose");
const Lead = require("../../models/lead/lead");
const Service = require("../../models/service/service");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

// controller
exports.createLead = async (req, res, next) => {
	const {
		fullname,
		message,
		email,
		telephone,
		city,
		country,
		leadSource,
		service,
	} = req.body;
	const user = req.user;

	//Step: validate the request body
	let errors = [];

	if (!fullname) errors.push("Lead fullname is required");
	if (!email) errors.push("Lead email is required");
	if (!country) errors.push("Lead country is required");
	if(!service) errors.push("Service ID is required");

	if (service && !mongoose.Types.ObjectId.isValid(service))
		errors.push("Service ID is invalid");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in CreateLead Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//create the lead
		const lead = new Lead({
			fullname,
			message,
			email,
			telephone,
			city,
			country,
			leadSource,
			service: service,
		});
		
		if (!lead) {
			logger.error(`Error in creating new lead `);
			return next(new ErrorResponse("Error in creating lead", 500));
		}

		//save the lead
		await lead.save();

		//find the service

		const foundService = await Service.findByIdAndUpdate(service, {
			$push: { leads: lead._id }
		});

		if(!foundService) {
			logger.error(`Error in pushing lead to service`);
			return next(new ErrorResponse("Error in pushing lead to service", 500));
		}

		//create notification
		const notification = {
			details: `A new lead ${fullname} has been created successfully`,
			type: "create",
			relatedModel: "Lead",
			relatedModelID: lead._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		// send response to lead
		res.status(201).json({
			success: true,
			message: "Lead created successfully",
			data: lead,
		});

		const end = performance.now();

		//logging success
		logger.info(
			`Lead created successfully for user: in ${
				end - start
			}ms`
		);
	} catch (error) {
		logger.error(`Error in CreateLead Controller: ${error.message}`);
		console.error("Error details:", error);
		next(error);
	}
};
