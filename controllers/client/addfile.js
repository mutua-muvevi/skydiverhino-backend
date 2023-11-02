/**
 * ADD FILES TO CLIENT
 * ========================
 * This controller is responsible for adding files to a client.
 * 
 * Steps:
 * - Validate the request body
 * - Check if client with the clientID exists
 * - upload the file to GCS
 * - Update the client
 * - Send a response to the client
 * 
 */

//imports
const mongoose = require("mongoose");
const Client = require("../../models/client/client");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { uploadToGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//the controller
exports.addFileToClient = async (req, res, next) => {
	const { clientID } = req.params;
	const user = req.user;
	const file = req.file;

	//Step: validate the request body
	let errors = [];

	if (!clientID || !mongoose.Types.ObjectId.isValid(clientID)) {
		errors.push("Client ID is not valid");
	}

	if (!file) {
		errors.push("No file provided");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in addFile Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//find the client
		const client = await Client.findOne({
			_id: clientID,
		});

		if(!client){
			logger.warn(`Client with ID: ${clientID} not found`);
			return next(
				new ErrorResponse(
					"You are not authorized to add file to this client",
					401
				)
			);
		}

		//upload the file to GCS`
		const startUpload = performance.now();

		const uploadedFile = await uploadToGCS(file, user);

		const endUpload = performance.now();

		//update the client
		client.files.push(uploadedFile);
		const updatedClient = await client.save();

		if(!updatedClient){
			logger.warn(`Something went wrong adding file to this client ${clientID}}`);
			return next(
				new ErrorResponse(
					"Something went wrong adding file to this client",
					401
				)
			);
		}

		//create notification
		const notification = {
			details: `File was added to client sucessfully`,
			createdBy: user._id,
			type: "add",
			relatedModel: "Client",
			relatedModelID: client._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		//send the response
		res.status(201).json({
			success: true,
			message: "Client added successfully",
			data: client,
		});

		const end = performance.now();
		logger.info(`Upload time is ${endUpload - startUpload}ms`);
		logger.info(`Client added successfully in ${end - start}ms`);
	} catch (error) {
		logger.error(
			`Error in AddFileToClient Controller: ${error.message}`
		);
		next(error);
	}
}