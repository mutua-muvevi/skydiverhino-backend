/**
 * EDIT LEAD CONTROLLER
 * ===========================
 * This controller is responsible for editing a lead.
 *
 * Steps:
 * - Validate the request body
 * - Find and edit the lead
 * - Save the lead
 * - Create notification
 * - Log the success
 *
 */

//the imports
const mongoose = require("mongoose");
const Lead = require("../../models/lead/lead");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

//controller
exports.editLead = async (req, res, next) => {
	const { fullname, email, telephone, city, country, leadSource } = req.body;
	const { leadID } = req.params;
	const user = req.user;

	//Step: validate the request params
	let errors = [];

	if (!leadID || !mongoose.Types.ObjectId.isValid(leadID))
		errors.push("Lead ID is required");


	if (errors.length > 0) {
		logger.warn(
			`Validation error in EditLead Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	if (!user.leads.includes(leadID)) {
		return next(new ErrorResponse("Not authorized to edit this lead", 403));
	}

	//updating the fields
	const updatedLead = {};

	if (fullname) updatedLead.fullname = fullname;
	if (email) updatedLead.email = email;
	if (telephone) updatedLead.telephone = telephone;
	if (city) updatedLead.city = city;
	if (country) updatedLead.country = country;
	if (leadSource) updatedLead.leadSource = leadSource;

	try {
		const start = performance.now();

		//if email is present, check if there is a lead with this simmilar name
		const leads = await Lead.find({ email }).lean();

		if (!leads.length > 0) {
			logger.warn(`Lead with email: ${email} does not exists`);
			return next(
				new ErrorResponse(
					"This lead does not exist, perhaps you should create a new one",
					400
				)
			);
		}

		//find and update the lead
		const lead = await Lead.findOneAndUpdate(
			{
				_id: leadID,
			},
			updatedLead,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!lead) {
			logger.warn(`Something went wrong while editing lead ${leadID}`);
			return next(
				new ErrorResponse(
					"Something went wrong while creating lead, please try again",
					400
				)
			);
		};

		//create notification
		const notification = {
			details: `Lead ${fullname} has been edited successfully`,
			type: "edit",
			relatedModel: "Lead",
			relatedModelID: lead._id,
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		// send response
		res.status(200).json({
			success: true,
			message: "Lead edited successfully",
			data: lead,
		});

		const end = performance.now();

		//logging success
		logger.info(
			`Lead edited successfully for user: {${user._id}} in ${
				end - start
			}ms`
		);
	} catch (error) {
		logger.error(`Error in EditClient Controller: ${error.message}`);
		next(error);
	}
};
