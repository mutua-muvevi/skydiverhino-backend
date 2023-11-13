/**
 * Delete Controller
 * ==============================
 * This Controller is used to delete a manual
 * 
 * Steps:
 * - Validate the request body
 * - Check if manual exists
 * - Delete the manual
 * - Send a response to the client
 * - Create notification
 * 
 */

//imports
const mongoose = require("mongoose");
const Manual = require("../../models/manual/manual");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { deleteFromGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//controller
exports.deleteManual = async (req, res, next) => {
	const { manualID } = req.params;
	const { user } = req;

	//Step: validate the request body
	let errors = [];

	if (!manualID || !mongoose.Types.ObjectId.isValid(manualID)) {
		errors.push("Manual ID is not valid");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in deleteManual Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();
		
		//find the manual
		const manual = await Manual.findById(manualID);

		if(!manual){
			logger.warn(`Manual with ID: ${manualID} not found`);
			return next(
				new ErrorResponse(
					"Manual not found or You are not authorized to delete",
					401
				)
			);
		}

		//delete file in gcs
		if(manual.file){
			const startDelete = performance.now();

			const extractFileName = manual.file.split("/").pop();

			await deleteFromGCS(extractFileName);

			const endDelete = performance.now();
			logger.info(`Delete time is ${endDelete - startDelete}ms`);
		}

		//delete the manual
		await Manual.findByIdAndDelete(manualID);

		//create notification
		const notification = {
			details: `Manual deleted successfully`,
			type: "delete",
			relatedModel: "Manual",
			relatedModelID: manual._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		const end = performance.now();

		//send a response to the client
		res.status(200).json({
			success: true,
			message: "Manual deleted successfully",
		});

		logger.info(`deleteManual Controller Execution time: ${end - start} ms.`);
	} catch (error) {
		logger.error(`Error in deleteManual Controller: ${error}`);
		next(error);
	}
};