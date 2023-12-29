/**
 * Event Controller
 * ==============================
 * This controller is used to handle the Event data
 *
 * Steps:
 * - Validate the request body
 * - Create the Event
 * - Send a response to the client
 * - Create Notification
 */

//imports
const Event = require("../../models/event/event");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { uploadToGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//the controller
exports.createEvent = async (req, res, next) => {
	const user = req.user;
	let { name, description, date, venue } = req.body;
	let thumbnail = req.file.thumbnail;

	//Step: validate the request body
	let errors = [];

	if (!name) errors.push("Name is required");

	if (!description) errors.push("Description is required");

	if (!date) errors.push("Date is required");
	
	if (!thumbnail) errors.push("Thumbnail image is required");

	if (errors.length > 0) {
		logger.warn(`Validation Error in create event: ${errors}`);
		return next(new ErrorResponse(errors.join(", "), 400));
	}


	try {
		const start = performance.now();

		//check if event with the same name or description exists
		const eventExists = await Event.findOne({
			$or: [{ name }, { description }],
		});

		if (eventExists) {
			logger.warn(`Event with this name or description already exists`);
			return next(new ErrorResponse("Event already exists", 400));
		}

		//upload the thumbnail to GCS
		const startUpload = performance.now();

		thumbnail = await uploadToGCS(thumbnail);

		const endUpload = performance.now();


		//create the event
		const event = await Event.create({
			name,
			description,
			date,
			venue,
			thumbnail,
			createdBy: user._id,
		});

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
			message: "event created successfully",
		});

		logger.info(
			`createevent Controller Execution time: ${end - start} ms.`
		);
		logger.info(`Upload time is ${endUpload - startUpload}ms`);
	} catch (error) {
		logger.error(`Error in createEvent Controller: ${error}`);
		return next(new ErrorResponse(error.message, 500));
	}
};
