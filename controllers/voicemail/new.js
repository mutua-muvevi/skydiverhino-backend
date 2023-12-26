/**
 * Voicemail Controller
 * ==============================
 * This controller is used to handle the voicemail data
 *
 * Steps:
 * - Validate the request body
 * - Create the voicemail
 * - Send a response to the client
 * - Create Notification
 */

//imports
const Voicemail = require("../../models/voicemail/voicemail");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

//the controller
exports.createVoicemail = async (req, res, next) => {
	const { name, transcription, type } = req.body;
	const { user } = req;

	//Step: validate the request body
	let errors = [];

	if (!name) {
		errors.push("Name is required");
	}

	if(!transcription){
		errors.push("Transcription is required");
	}

	if(!type){
		errors.push("Type is required");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in createVoicemail Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();
		//create the voicemail
		const voicemail = await Voicemail.create({
			name,
			transcription,
			type,
			uploadedBy: user._id,
		});


		//create notification
		const notification = {
			details: `New voicemail ${name} has been created`,
			type: "create",
			relatedModel: "Voicemail",
			relatedModelID: voicemail._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		const end = performance.now();

		//send a response to the client
		res.status(200).json({
			success: true,
			data: voicemail,
			message: "Voicemail created successfully",
		});

		logger.info(`createVoicemail Controller Execution time: ${end - start} ms.`);

	} catch (error) {
		logger.error(`Error in createVoicemail Controller: ${error}`);
		next(error);
	}
};