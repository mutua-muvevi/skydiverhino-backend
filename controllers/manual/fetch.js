/**
 * FETCH CLIENT CONTROLLER
 * ==========================
 *
 * Fetch All Manuals:
 *
 * Fetch All Manuals for User:
 *
 * Fetch Single Manual:
 *
 */

//package import
const mongoose = require("mongoose");
const Manual = require("../../models/manual/manual");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//fetch all manuals in the database
exports.fetchAllManuals = async (req, res, next) => {
	try {
		const start = performance.now();

		//find all manuals
		const manuals = await Manual.find().sort({ createdAt: -1 }).lean();

		if (!manuals) {
			return next(new ErrorResponse("No manuals found", 404));
		}

		//send a success response back to the manual with the list of manuals
		res.status(200).json({
			success: true,
			count: manuals.length,
			data: manuals,
		});

		const end = performance.now();

		logger.info(`Fetched all manuals in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAll Manuals: ${error.message}`);
		next(error);
	}
};


//fetch a single manual by id
exports.fetchManualByID = async (req, res, next) => {
	const { manualID } = req.params;

	if (!mongoose.Types.ObjectId.isValid(manualID)) {
		return next(new ErrorResponse("Invalid manual id", 400));
	}

	try {
		const start = performance.now();

		//find the manual
		const manual = await Manual.findOne({
			_id: manualID,
		}).lean();

		if (!manual) {
			return next(new ErrorResponse("Manual not found", 404));
		}

		//send a success response back to the manual with the manual
		res.status(200).json({
			success: true,
			data: manual,
		});

		const end = performance.now();

		logger.info(`Fetched manual by id in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchManualByID: ${error.message}`);
		next(error);
	}
};
