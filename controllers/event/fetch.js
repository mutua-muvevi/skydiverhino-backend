/**
 * FETCH CLIENT CONTROLLER
 * ==========================
 *
 * Fetch All Events:
 *
 * Fetch Single Event:
 *
 */

//package import
const mongoose = require("mongoose");
const Event = require("../../models/event/event");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//fetch all events in the database
exports.fetchAllEvents = async (req, res, next) => {
	try {
		const start = performance.now();

		//find all events
		const events = await Event.find()
			.sort({ createdAt: -1 })
			.lean()
			.populate([
				{
					path: "createdBy",
					select: "fullname email",
				},
			]);

		if (!events) {
			return next(new ErrorResponse("No events found", 404));
		}

		//send a success response back to the event with the list of events
		res.status(200).json({
			success: true,
			count: events.length,
			data: events,
		});

		const end = performance.now();

		logger.info(`Fetched all events in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAll Events: ${error.message}`);
		next(error);
	}
};

//fetch a single event by id
exports.fetchEventByID = async (req, res, next) => {
	const { eventID } = req.params;

	try {
		const start = performance.now();

		//check if the event id is valid
		if (!mongoose.Types.ObjectId.isValid(eventID)) {
			return next(new ErrorResponse("Invalid event ID", 400));
		}

		//find the event
		const event = await Event.findById(eventID)
			.lean()
			.populate([
				{
					path: "createdBy",
					select: "fullname email",
				},
			]);

		if (!event) {
			return next(new ErrorResponse("Event not found", 404));
		}

		//send a success response back to the event with the event
		res.status(200).json({
			success: true,
			data: event,
		});

		const end = performance.now();

		logger.info(`Fetched event in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchEventByID: ${error.message}`);
		next(error);
	}
};