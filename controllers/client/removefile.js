/**
 * REMOVE FILE FROM CLIENT ARRAY
 * ============================
 * This controller is responsible for removing a file from a client's files array.
 *
 * Steps:
 * - Validate the request body
 * - Check if client with the clientID exists
 * - Get the filename from client.files if it exists
 * - delete the file in GCS
 * - Update the client
 * - Send a response to the client
 * - Log the success
 *
 */

//imports
const mongoose = require("mongoose");
const Client = require("../../models/client/client");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { deleteFromGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//the controller
exports.removeFileFromClient = async (req, res, next) => {
	const { clientID } = req.params;
	const { fileUrl } = req.body; //the fileUrl is the last part of the file url
	const user = req.user;

	//Step: validate the request body
	let errors = [];

	if (!clientID || !mongoose.Types.ObjectId.isValid(clientID)) {
		errors.push("Client ID is not valid");
	}

	if(!fileUrl || fileUrl.length === 0){
		errors.push("No fileUrl provided");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in removeFile Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//Step: find the client
		const client = await Client.findOne({
			_id: clientID,
		});

		if (!client) {
			return next(
				new ErrorResponse(
					"You are not authorized to remove file from this client",
					401
				)
			);
		}

		// Check if fileUrl exists in client's files array
		if (!client.files.includes(fileUrl)) {
			return next(new ErrorResponse("File not found in client", 404));
		}

		//extract the filename from the file url
		const filename = fileUrl.split("/").pop();

		//Step: delete the file in GCS
		const startDelete = performance.now();

		await deleteFromGCS(user, filename);

		const endDelete = performance.now();

		// Remove the file reference from the client.files array
		client.files = client.files.filter((file) => file !== fileUrl);

		await client.save();

		//create notification
		const notification = {
			details: `File in client was removed sucessfully`,
			createdBy: user._id,
			type: "edit",
			relatedModel: "Client",
			relatedModelID: client._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		//send the response
		res.status(201).json({
			success: true,
			message: "Client edited successfully",
			data: client,
		});

		const end = performance.now();
		logger.info(
			`File deleted successfully in ${endDelete - startDelete}ms`
		);
		logger.info(
			`Client ${client._id} removed file successfully in ${end - start}ms`
		);
	} catch (error) {
		logger.error(
			`Error in removeFileFromClient Controller: ${error.message}`
		);
		next(error);
	}
};
