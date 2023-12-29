/**
 * Delete Controller
 * ==============================
 * This Controller is used to delete a event
 * 
 * Steps:
 * - Validate the request body
 * - Check if event exists
 * - Delete the event
 * - Send a response to the client
 * - Create notification
 * 
 */

//imports
const mongoose = require("mongoose");
const Event = require("../../models/event/event");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { deleteFromGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//helper function to get filename from url
function getFilenameFromUrl(url) {
	try {
		// The filename is typically the last part of the pathname
		const filename = url.split("/").pop();
		console.log("The filename", filename)

		return filename;
	} catch (error) {
		logger.error(`Error extracting filename from URL: ${error.message}`);
		return null;
	}
}

//controller
exports.deleteEvent = async (req, res, next) => {
	const { eventID } = req.params;
	const { user } = req;

	//Step: validate the request body
	if (!eventID || !mongoose.Types.ObjectId.isValid(eventID)) {
		return next(new ErrorResponse("Event ID is not valid"));
	}

	try {
		const start = performance.now();
		
		//find the event
		const event = await Event.findById(eventID);

		if(!event){
			logger.warn(`Event with ID: ${eventID} not found`);
			return next(
				new ErrorResponse(
					"Event not found or You are not authorized to delete",
					401
				)
			);
		}

		//delete the event
		const deletedEvent = await Event.findByIdAndDelete(eventID);

		//if thumbnail exists delete it from GCS
		if(event.thumbnail) {
			const thumbnail = getFilenameFromUrl(event.thumbnail);
			await deleteFromGCS(thumbnail);
		}

		//send a response to the client
		res.status(200).json({
			success: true,
			message: "Event deleted successfully",
			data: {},
		});

		//create notification
		const notification = {
			details: `Event ${event.name} has been deleted by ${user.fullname}`,
			type: "delete",
			relatedModel: "Event",
		};

		await createNotification(notification);

		const end = performance.now();
		logger.info(`Time taken to delete event: ${end - start}ms`);
	} catch (error) {
		logger.error(`Error deleting event: ${error.message}`);
		return next(new ErrorResponse("Error deleting event", 500));
	}
};