/**
 * Delete Controller
 * ==============================
 * This Controller is used to delete a term
 * 
 * Steps:
 * - Validate the request body
 * - Check if term exists
 * - Delete the term
 * - Send a response to the client
 * - Create notification
 * 
 */

//imports
const mongoose = require("mongoose");
const Term = require("../../models/term/term");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { deleteFromGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//controller
exports.deleteTerm = async (req, res, next) => {
	const { termID } = req.params;
	const { user } = req;

	//Step: validate the request body
	let errors = [];

	if (!termID || !mongoose.Types.ObjectId.isValid(termID)) {
		errors.push("Term ID is not valid");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in deleteTerm Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();
		
		//find the term
		const term = await Term.findById(termID);

		if(!term){
			logger.warn(`Term with ID: ${termID} not found`);
			return next(
				new ErrorResponse(
					"Term not found or You are not authorized to delete",
					401
				)
			);
		}

		//delete file in gcs
		if(term.file){
			const startDelete = performance.now();

			const extractFileName = term.file.split("/").pop();

			await deleteFromGCS(extractFileName);

			const endDelete = performance.now();
			logger.info(`Delete time is ${endDelete - startDelete}ms`);
		}

		//delete the term
		await Term.findByIdAndDelete(termID);

		//create notification
		const notification = {
			details: `Term deleted successfully`,
			type: "delete",
			relatedModel: "Term",
			relatedModelID: term._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		const end = performance.now();

		//send a response to the client
		res.status(200).json({
			success: true,
			message: "Term deleted successfully",
		});

		logger.info(`deleteTerm Controller Execution time: ${end - start} ms.`);
	} catch (error) {
		logger.error(`Error in deleteTerm Controller: ${error}`);
		next(error);
	}
};