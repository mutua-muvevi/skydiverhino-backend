/**
 * Edit Controller
 * ==============================
 * This controller is used to handle the Event data
 *
 * Steps:
 * - Validate the request body
 * - Check if the event exists
 * - Check if there is a change in the thumbnail if so update the thumbnail
 * - If there is no thumbnail in the event.thumbnail field, upload the thumbnail to GCS
 * - Update the event
 * - Send a response to the client
 * - Create Notification
 */

//imports
const { default: mongoose } = require("mongoose");
const Event = require("../../models/event/event");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { uploadToGCS, updateInGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//the controller
exports.editEvent = async (req, res, next) => {
	const user = req.user;
	let { name, description, date, venue } = req.body;
	let thumbnail = req.file;
	const { eventID } = req.params;

	//Step: validate the request body
	let errors = [];

	if (!name) errors.push("Name is required");

	if (!description) errors.push("Description is required");

	if (!date) errors.push("Date is required");

	if(!eventID || !mongoose.isValidObjectId(eventID)) errors.push("Event ID is required");

	if (errors.length > 0) {
		logger.warn(`Validation Error in edit event: ${errors}`);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//check if event with the same name or description exists
		const eventExists = await Event.findById(eventID);

		if (!eventExists) {
			logger.warn(`Event with this ID does not exist`);
			return next(new ErrorResponse("Event does not exist", 400));
		}

		//check if there is a change in the thumbnail
		const startUpload = performance.now();

		//if thumbnail is proviced update the thumbnail
		let thumbnailUrl = eventExists.thumbnail;

		if (thumbnail) {
			if(eventExists.thumbnail) {
				const oldThumbnail = eventExists.thumbnail.split("/").pop();
				thumbnail = await updateInGCS(oldThumbnail, thumbnail);
			} else {
				thumbnailUrl = await uploadToGCS(thumbnail);
			}
		}

		const endUpload = performance.now();

		// the update Object
		const update = {
			name,
			description,
			date,
			venue,
			thumbnail: thumbnailUrl,
			createdBy: user._id,
		};

		//update the event
		const event = await Event.findByIdAndUpdate(eventID, update, {
			new: true, runValidators: true, context: "query"
		});

		if(!event) {
			logger.warn(`Event with this ID does not exist`);
			return next(new ErrorResponse("Event does not exist", 400));
		}
		
		//create notification
		const notification = {
			details: `New event ${name} has been created`,
			type: "create",
			relatedModel: "Event",
			relatedModelID: event._id,
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		const end = performance.now();

		//send a response to the client
		res.status(200).json({
			success: true,
			data: event,
			message: "event editd successfully",
		});

		logger.info(
			`editevent Controller Execution time: ${end - start} ms.`
		);
		logger.info(`Upload / Update time is ${endUpload - startUpload}ms`);
	} catch (error) {
		logger.error(`Error in editEvent Controller: ${error}`);
		return next(new ErrorResponse(error.message, 500));
	}
};