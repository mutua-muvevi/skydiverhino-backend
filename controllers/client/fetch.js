/**
 * FETCH CLIENT CONTROLLER
 * ==========================
 *
 * Fetch All Clients:
 *
 * Fetch All Clients for User:
 *
 * Fetch Single Client:
 *
 */

//package import
const mongoose = require("mongoose");
const Client = require("../../models/client/client");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//fetch all clients in the database
exports.fetchAllClients = async (req, res, next) => {
	try {
		const start = performance.now();

		//find all clients
		const clients = await Client.find().sort({ createdAt: -1 }).lean();

		if (!clients) {
			return next(new ErrorResponse("No clients found", 404));
		}

		//send a success response back to the client with the list of clients
		res.status(200).json({
			success: true,
			count: clients.length,
			data: clients,
		});

		const end = performance.now();

		logger.info(`Fetched all clients in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAll Clients: ${error.message}`);
		next(error);
	}
};


//fetch a single client by id
exports.fetchClientByID = async (req, res, next) => {
	const { clientID } = req.params;
	const user = req.user;

	if (!mongoose.Types.ObjectId.isValid(clientID)) {
		return next(new ErrorResponse("Invalid client id", 400));
	}

	try {
		const start = performance.now();

		//find the client
		const client = await Client.findOne({
			_id: clientID,
		}).lean();

		if (!client) {
			return next(new ErrorResponse("Client not found", 404));
		}

		//send a success response back to the client with the client
		res.status(200).json({
			success: true,
			data: client,
		});

		const end = performance.now();

		logger.info(`Fetched client by id in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchClientByID: ${error.message}`);
		next(error);
	}
};
