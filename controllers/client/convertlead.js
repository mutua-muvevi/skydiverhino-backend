/**
 * CONVERT TO CLIENT CONTROLLER
 * ========================
 * This controller is responsible for converting a lead to a client.
 *
 * Steps:
 * - Validate the request parameters and body
 * - Retrieve the lead
 * - Create a new client from the lead's data
 * - Save the client
 * - Push the client to the user's clients array
 * - Remove the lead from the user's leads array
 * - Delete the lead from the database
 * - Create notification
 * - Log the success
 *
 */

//the imports
const Lead = require("../../models/lead/lead");
const Client = require("../../models/client/client");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");
const Service = require("../../models/service/service");

// controller
exports.convertToClient = async (req, res, next) => {
	const { leadID } = req.params;
	const user = req.user;

	//Step: validate the request parameters and body
	if (!leadID) {
		logger.warn(
			`Validation error in ConvertToClient Controller: Lead ID is required`
		);
		return next(new ErrorResponse("Lead ID is required", 400));
	}

	try {
		const start = performance.now();

		// retrieve the lead
		const lead = await Lead.findById(leadID);

		if (!lead) {
			logger.warn(`Lead not found with ID: ${leadID}`);
			return next(new ErrorResponse("Lead not found", 404));
		}

		// create a new client from the lead's data
		const clientData = {
			fullname: lead.fullname,
			message: lead.message,
			email: lead.email,
			telephone: lead.telephone,
			city: lead.city,
			country: lead.country,
			leadSource: lead.leadSource,
			service: lead.service,
		};

		const client = new Client(clientData);

		// save the client
		await client.save();

		// delete the lead from the database
		await Lead.findByIdAndDelete(leadID);

		//remove the lead from the service's leads array and push the client to the service's clients array
		const service = await Service.findById(lead.service);

		service.leads = service.leads.filter((lead) => lead != leadID);

		service.clients.push(client._id);

		await service.save();

		// create notification
		const notification = {
			details: `Lead ${lead.fullname} has been successfully converted to client ${client.fullname}`,
			type: "convert",
			relatedModel: "Client",
			relatedModelID: client._id,
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		// send response to client
		res.status(201).json({
			success: true,
			message: "Lead converted to client successfully",
			data: client,
		});

		const end = performance.now();

		//logging success
		logger.info(
			`Lead ${lead._id} converted to client ${
				client._id
			} successfully for user ${user._id} in ${end - start}ms`
		);
	} catch (error) {
		console.log("Error", error)
		logger.error(`Error in ConvertToClient Controller: ${error.message}`);
		next(error);
	}
};
