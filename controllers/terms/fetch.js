/**
 * FETCH CLIENT CONTROLLER
 * ==========================
 *
 * Fetch All Terms:
 *
 * Fetch Single Term:
 *
 */

//package import
const mongoose = require("mongoose");
const Term = require("../../models/term/term");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//fetch all terms in the database
exports.fetchAllTerms = async (req, res, next) => {
	try {
		const start = performance.now();

		//find all terms
		const terms = await Term.find().sort({ createdAt: -1 }).lean();

		if (!terms) {
			return next(new ErrorResponse("No terms found", 404));
		}

		//send a success response back to the term with the list of terms
		res.status(200).json({
			success: true,
			count: terms.length,
			data: terms,
		});

		const end = performance.now();

		logger.info(`Fetched all terms in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAll Terms: ${error.message}`);
		next(error);
	}
};


//fetch a single term by id
exports.fetchTermByID = async (req, res, next) => {
	const { termID } = req.params;

	if (!mongoose.Types.ObjectId.isValid(termID)) {
		return next(new ErrorResponse("Invalid term id", 400));
	}

	try {
		const start = performance.now();

		//find the term
		const term = await Term.findOne({
			_id: termID,
		}).lean();

		if (!term) {
			return next(new ErrorResponse("Term not found", 404));
		}

		//send a success response back to the term with the term
		res.status(200).json({
			success: true,
			data: term,
		});

		const end = performance.now();

		logger.info(`Fetched term by id in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchTermByID: ${error.message}`);
		next(error);
	}
};
