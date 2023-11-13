/**
 * EDIT MANUAL CONTROLLER
 * ========================
 * Controls the edit manual data.
 * 
 * Steps
 * - Validate the request body
 * - Check if manual exists
 * - Update the manual
 * - Send a response to the client
 * - Create notification
 * 
 */

//imports
const mongoose = require("mongoose");
const Manual = require("../../models/manual/manual");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { updateInGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//the controller
exports.editManual = async (req, res, next) => {
	const { name, description } = req.body;
	const { manualID } = req.params;
	const { user, file } = req;

	//Step: validate the request body
	let errors = [];

	if (!name) {
		errors.push("Name is required");
	}

	if (!manualID || !mongoose.Types.ObjectId.isValid(manualID)) {
		errors.push("Manual ID is not valid");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in editManual Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//find the manual
		const manual = await Manual.findOne({
			_id: manualID,
		});

		if(!manual){
			logger.warn(`Manual with ID: ${manualID} not found`);
			return next(
				new ErrorResponse(
					"You are not authorized to edit this manual",
					401
				)
			);
		}

		//update the file if file exists
		let fileUrl

		if(file && file !== ""){
			const startUpload = performance.now();

			const filename = manual.file.split("/").pop();

			fileUrl = await updateInGCS(filename, file);

			const endUpload = performance.now();
			logger.info(`Upload time is ${endUpload - startUpload}ms`);
		}

		//update the manual
		manual.name = name;
		manual.description = description;
		manual.file = file && fileUrl ? fileUrl : manual.file;
		manual.updatedBy = user._id;

		//save the manual
		await manual.save();
		
		//create notification
		const notification = {
			details: `Edit manual ${name} has been created`,
			type: "edit",
			relatedModel: "Manual",
			relatedModelID: manual._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		const end = performance.now();

		//send a response to the client
		res.status(200).json({
			success: true,
			data: manual,
			message: "Manual edited successfully",
		});

		logger.info(`editManual Controller Execution time: ${end - start} ms.`);
	} catch (error) {
		logger.error(`Error in editManual Controller: ${error}`);
		next(error);
	}
};
