/**
 * NEW CLIENT CONTROLLER
 * ========================
 * This controller is responsible for creating a new client.
 *
 * Steps:
 * - Validate the request body
 * - Create a new client
 * - Save the client
 * - Push the client to the user's clients array
 * - Create notification
 * - Log the success
 *
 */

//the imports
const mongoose = require("mongoose");
const Client = require("../../models/client/client");
const Service = require("../../models/service/service");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

// controller
exports.createClient = async (req, res, next) => {
	const { fullname, email, details, telephone, city, country, leadSource, service } = req.body;
	const user = req.user;

	//Step: validate the request body
	let errors = [];

	if (!fullname) errors.push("Lead fullname is required");
	if (!email) errors.push("Lead email is required");
	if (!country) errors.push("Lead country is required");
	if (!service) errors.push("Service ID is required");

	if (service && !mongoose.Types.ObjectId.isValid(service))
	errors.push("Service ID is invalid");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in CreateClient Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//check if there is a client with similar fullname
		const clients = await Client.find({ fullname });

		if (clients.length > 0) {
			logger.warn(`Client with fullname: ${fullname} already exists`);
			return next(
				new ErrorResponse(
					"Client with this fullname already exists",
					400
				)
			);
		}

		//check if there is a client with this simmilar email
		const existingClient = await Client.find({
			email
		});

		if (existingClient.length > 0) {
			logger.warn(`Client with email: ${email} already exists`);
			return next(
				new ErrorResponse("Client with this email already exists", 400)
			);
		}

		//create the client
		const client = new Client({
			fullname,
			details,
			email,
			telephone,
			city,
			country,
			leadSource,
			service
		});

		if (!client) {
			logger.error(
				`Something went wrong while creating client ij createClient controller`
			);
			return next(
				new ErrorResponse(
					"Something went wrong while creating client",
					500
				)
			);
		}

		//save the client
		await client.save();

		//find the service and push the client to the service clients array
		const foundService = await Service.findByIdAndUpdate(service, {
			$push: { clients: client._id }
		});

		if(!foundService) {
			logger.error(`Error in pushing lead to service`);
			return next(new ErrorResponse("Error in pushing lead to service", 500));
		}

		//create notification
		const notification = {
			details: `A new client ${fullname} has been created successfully`,
			type: "create",
			relatedModel: "Client",
			relatedModelID: client._id,
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		// send response to client
		res.status(201).json({
			success: true,
			message: "Client created successfully",
			data: client,
		});

		const end = performance.now();

		//logging success
		logger.info(
			`Client created successfully for user: {${user._id}} in ${
				end - start
			}ms`
		);
	} catch (error) {
		logger.error(`Error in CreateClient Controller: ${error.message}`);
		next(error);
	}
};
