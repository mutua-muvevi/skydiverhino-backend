/**
 * Delete Controller
 * ==============================
 * This Controller is used to delete a voicemail
 * 
 * Steps:
 * - Validate the request body
 * - Check if voicemail exists
 * - Delete the voicemail
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

//controller
exports.deleteVoicemail = async (req, res, next) => {
	const { voicemailID } = req.params;
	const { user } = req;

	//Step: validate the request body
	let errors = [];

	if (!voicemailID || !mongoose.Types.ObjectId.isValid(voicemailID)) {
		errors.push("Voicemail ID is not valid");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in deleteVoicemail Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();
		
		//find the voicemail
		const voicemail = await Voicemail.findById(voicemailID);

		if(!voicemail){
			logger.warn(`Voicemail with ID: ${voicemailID} not found`);
			return next(
				new ErrorResponse(
					"Voicemail not found or You are not authorized to delete",
					401
				)
			);
		}

		//delete the voicemail
		await Voicemail.findByIdAndDelete(voicemailID);

		//create notification
		const notification = {
			details: `Voicemail deleted successfully`,
			type: "delete",
			relatedModel: "Voicemail",
			relatedModelID: voicemail._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		const end = performance.now();

		//send a response to the client
		res.status(200).json({
			success: true,
			message: "Voicemail deleted successfully",
		});

		logger.info(`deleteVoicemail Controller Execution time: ${end - start} ms.`);
	} catch (error) {
		logger.error(`Error in deleteVoicemail Controller: ${error}`);
		next(error);
	}
};