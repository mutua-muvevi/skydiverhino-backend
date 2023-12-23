/**
 * DELETE CLIENT CONTROLLER
 *
 * Delete Single Client
 * Steps:
 * - Validate the client id
 * - Find the client
 * - Delete the client
 * - Remove the client from the user's clients array
 *
 * Delete Multiple Clients
 * Steps:
 * - Validate the client ids
 * - Find the clients
 * - Delete the clients
 * - Remove the clients from the user's clients array
 *
 */

//imports
const mongoose = require("mongoose");
const Client = require("../../models/client/client");
const Service = require("../../models/service/service");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

//delete single client controller
exports.deleteClient = async (req, res, next) => {
	const { clientID } = req.params;
	const user = req.user;

	//Step: validate the client id
	if (!clientID || !mongoose.Types.ObjectId.isValid(clientID)) {
		logger.warn(
			`Invalid client ID provided in DeleteClient Controller: ${clientID}`
		);
		return next(new ErrorResponse("Invalid client ID", 400));
	}

	try {
		const start = performance.now();

		//find the client that belongs to this user
		const client = await Client.findOne({
			_id: clientID,
		});

		if (!client) {
			return next(
				new ErrorResponse("You are not authorized to delete", 401)
			);
		}

		//remove the client from service's clients array
		const service = await Service.findByIdAndUpdate(client.service, {
			$pull: { clients: clientID },
		});

		if (!service) {
			logger.warn(
				`Something went wrong while removing service from client`
			);
			return next(
				new ErrorResponse(
					"Something went wrong while removing service from client",
					404
				)
			);
		}

		//delete the client
		await Client.findByIdAndDelete(clientID);

		//create notification
		const notification = {
			details: `The client has been deleted successfully`,
			type: "delete",
			relatedModel: "Client",
			relatedModelID: client._id,
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		//send data to user
		res.status(200).json({
			success: true,
			data: {},
			message: "Client has deleted successfully",
		});

		const end = performance.now();

		//logging the success
		logger.info(
			`Client: ${clientID} deleted successfully by user : ${
				user._id
			} in ${end - start}ms`
		);
	} catch (error) {
		logger.error(`Error in DeleteClient Controller: ${error.message}`);
		next(error);
	}
};

//delete multiple clients controller
exports.deleteClients = async (req, res, next) => {
	const { clientIDs } = req.body;
	const user = req.user;

	//Step: validate the client ids
	if (
		!clientIDs ||
		!Array.isArray(clientIDs) ||
		clientIDs.length === 0 ||
		!clientIDs.every((id) => mongoose.Types.ObjectId.isValid(id))
	) {
		logger.warn(
			`Invalid client IDs provided in DeleteClients Controller: ${clientIDs}`
		);
		return next(new ErrorResponse("Invalid client IDs", 400));
	}

	try {
		const start = performance.now();

		//find the clients that belong to this user
		const clients = await Client.find({
			_id: { $in: clientIDs },
		});

		if (clients.length === 0) {
			return next(
				new ErrorResponse("You are not authorized to delete", 401)
			);
		}

		//ensuring that all clients belong to this user
		if (clients.length !== clientIDs.length) {
			logger.warn(
				`Some clients not found or not authorized in DeleteClients Controller: ${clientIDs}`
			);
			return next(
				new ErrorResponse(
					"You do not have permission to delete some or all of the selected clients",
					403
				)
			);
		}

		//delete the clients
		await Client.deleteMany({ _id: { $in: clientIDs } });

		//create notification
		const notification = {
			details: `${clientIDs.length} clients have been deleted successfully`,
			type: "delete",
			relatedModel: "Client",
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		//send data to user
		res.status(200).json({
			success: true,
			data: {},
			message: "Clients have deleted successfully",
		});

		const end = performance.now();

		//logging the success
		logger.info(
			`${clientIDs.length} Clients deleted successfully by user : ${
				user._id
			} in ${end - start}ms`
		);
	} catch (error) {
		logger.error(`Error in deleteManyClients Controller: ${error.message}`);
		next(error);
	}
};
