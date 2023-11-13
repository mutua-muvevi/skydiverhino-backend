/**
 * FETCH CLIENT CONTROLLER
 * ==========================
 *
 * Fetch All Voicemails:
 *
 * Fetch Single Voicemail:
 *
 */

//package import
const mongoose = require("mongoose");
const Voicemail = require("../../models/voicemail/voicemail");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//fetch all voicemails in the database
exports.fetchAllVoicemails = async (req, res, next) => {
	try {
		const start = performance.now();

		//find all voicemails
		const voicemails = await Voicemail.find().sort({ createdAt: -1 }).lean();

		if (!voicemails) {
			return next(new ErrorResponse("No voicemails found", 404));
		}

		//send a success response back to the voicemail with the list of voicemails
		res.status(200).json({
			success: true,
			count: voicemails.length,
			data: voicemails,
		});

		const end = performance.now();

		logger.info(`Fetched all voicemails in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAll Voicemails: ${error.message}`);
		next(error);
	}
};


//fetch a single voicemail by id
exports.fetchVoicemailByID = async (req, res, next) => {
	const { voicemailID } = req.params;

	if (!mongoose.Types.ObjectId.isValid(voicemailID)) {
		return next(new ErrorResponse("Invalid voicemail id", 400));
	}

	try {
		const start = performance.now();

		//find the voicemail
		const voicemail = await Voicemail.findOne({
			_id: voicemailID,
		}).lean();

		if (!voicemail) {
			return next(new ErrorResponse("Voicemail not found", 404));
		}

		//send a success response back to the voicemail with the voicemail
		res.status(200).json({
			success: true,
			data: voicemail,
		});

		const end = performance.now();

		logger.info(`Fetched voicemail by id in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchVoicemailByID: ${error.message}`);
		next(error);
	}
};
