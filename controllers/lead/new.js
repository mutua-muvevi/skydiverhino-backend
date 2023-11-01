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
		details,
		email,
		telephone,
		city,
		country,
		leadSource,
		serviceID,
	} = req.body;
	const user = req.user;

	//Step: validate the request body
	let errors = [];

	if (!fullname) errors.push("Lead fullname is required");
	if (!email) errors.push("Lead email is required");
	if (!country) errors.push("Lead country is required");

	if (serviceID && !mongoose.Types.ObjectId.isValid(serviceID))
		errors.push("Service ID is invalid");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in CreateLead Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//check if there is a lead with similar fullname
		const leads = await Lead.find({ fullname });

		if (leads.length > 0) {
			logger.warn(
				`Lead with fullname: ${fullname} already exists in your account`
			);
			return next(
				new ErrorResponse(
					"Lead with this fullname already exists in your account",
					400
				)
			);
		}

		//check if there is a lead with this simmilar email
		const existingLead = await Lead.find({
			email,
		});

		if (existingLead.length > 0) {
			logger.warn(
				`Lead with email: ${email} already exists in your account`
			);
			return next(
				new ErrorResponse(
					"Lead with this email already exists in your account",
					400
				)
			);
		}

		//check if service exist if serviceID is provided
		let service = null;
		
		if (serviceID) {
			service = await Service.findOne({
				_id: serviceID,
			});

			if (!service) {
				logger.warn(`Service with ID: ${serviceID} does not exist`);
				return next(new ErrorResponse("Service does not exist", 404));
			}
		}


		//create the lead
		const lead = new Lead({
			fullname,
			details,
			email,
			telephone,
			city,
			country,
			leadSource,
			service: serviceID,
		});

		if (!lead) {
			logger.error(`Error in creating new lead for user: {${user._id}}`);
			return next(new ErrorResponse("Error in creating lead", 500));
		}

		//save the lead
		await lead.save();

		//save the lead to the service
		if (service) {
			service.leads.push(lead._id);
			await service.save();
		};

		//create notification
		const notification = {
			details: `A new lead ${fullname} has been created successfully`,
			type: "create",
			relatedModel: "Lead",
			relatedModelID: lead._id,
			createdBy: user._id,
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
			`Lead created successfully for user: {${user._id}} in ${
				end - start
			}ms`
		);
	} catch (error) {
		logger.error(`Error in CreateLead Controller: ${error.message}`);
		next(error);
	}
};
