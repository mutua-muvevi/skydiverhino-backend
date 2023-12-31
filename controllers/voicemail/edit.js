/**
 * EDIT MANUAL CONTROLLER
 * ========================
 * Controls the edit voicemail data.
 * 
 * Steps
 * - Validate the request body
 * - Check if voicemail exists
 * - Update the voicemail
 * - Send a response to the client
 * - Create notification
 * 
 */

//imports
const mongoose = require("mongoose");
const Voicemail = require("../../models/voicemail/voicemail");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

//the controller
exports.editVoicemail = async (req, res, next) => {
	const { name, transcription, type } = req.body;
	const { voicemailID } = req.params;
	const { user } = req;

	//Step: validate the request body
	let errors = [];

	if (!name) {
		errors.push("Name is required");
	}

	if(!type){
		errors.push("Type is required");
	}

	if(!transcription){
		errors.push("Transcription is required");
	}

	if (!voicemailID || !mongoose.Types.ObjectId.isValid(voicemailID)) {
		errors.push("Voicemail ID is not valid");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in editVoicemail Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//find the voicemail
		const voicemail = await Voicemail.findOne({
			_id: voicemailID,
		});

		if(!voicemail){
			logger.warn(`Voicemail with ID: ${voicemailID} not found`);
			return next(
				new ErrorResponse(
					"You are not authorized to edit this voicemail",
					401
				)
			);
		}

		//update the voicemail
		voicemail.name = name;
		voicemail.transcription = transcription;
		voicemail.type = type;
		voicemail.updatedBy = user._id;

		//save the voicemail
		await voicemail.save();
		
		//create notification
		const notification = {
			details: `Edit voicemail ${name} has been created`,
			type: "edit",
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
			message: "Voicemail edited successfully",
		});

		logger.info(`editVoicemail Controller Execution time: ${end - start} ms.`);
	} catch (error) {
		logger.error(`Error in editVoicemail Controller: ${error}`);
		next(error);
	}
};
