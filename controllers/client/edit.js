/**
 * EDIT CLIENT CONTROLLER
 * ==========================
 * This controller is responsible for editing a client.
 *
 * Steps:
 * - Validate the request body
 * - Find and edit the client
 * - Save the client
 * - Create notification
 * - Log the success
 *
 */

//the imports
const mongoose = require("mongoose");
const Client = require("../../models/client/client");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

//controller
exports.editClient = async (req, res, next) => {
	const { fullname, email, telephone, city, country, leadSource } = req.body;
	const { clientID } = req.params;
	const user = req.user;

	//Step: validate the request params
	let errors = [];

	if (!clientID || !mongoose.Types.ObjectId.isValid(clientID))
		errors.push("Client ID is required");

	if (!user.clients.includes(clientID)) {
		errors.push("Not authorized to edit this client");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in EditClient Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	//updating the fields
	const updatedClient = {};

	if (fullname) updatedClient.fullname = fullname;
	if (email) updatedClient.email = email;
	if (telephone) updatedClient.telephone = telephone;
	if (city) updatedClient.city = city;
	if (country) updatedClient.country = country;
	if (leadSource) updatedClient.leadSource = leadSource;

	try {
		const start = performance.now();

		//if email is present, check if there is a client with this simmilar name
		const clients = await Client.find({ email }).lean();

		if (!clients.length > 0) {
			logger.warn(`Client with email: ${email} does not exists`);
			return next(
				new ErrorResponse(
					"This client does not exist, perhaps you should create a new one",
					400
				)
			);
		}

		//find and update the client
		const client = await Client.findOneAndUpdate(
			{
				_id: clientID,
			},
			updatedClient,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!client) {
			logger.error(
				`Something went wrong while editing client in editClient controller`
			);
			return next(
				new ErrorResponse(
					"Something went wrong while editing client, pleae try again",
					500
				)
			);
		}

		//create notification
		const notification = {
			details: `Client ${fullname} has been edited successfully`,
			type: "edit",
			relatedModel: "Client",
			relatedModelID: client._id,
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		// send response to client
		res.status(200).json({
			success: true,
			message: "Client edited successfully",
			data: client,
		});

		const end = performance.now();

		//logging success
		logger.info(
			`Client edited successfully for user: {${user._id}} in ${
				end - start
			}ms`
		);
	} catch (error) {
		logger.error(`Error in EditClient Controller: ${error.message}`);
		next(error);
	}
};
