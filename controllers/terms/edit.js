/**
 * EDIT MANUAL CONTROLLER
 * ========================
 * Controls the edit term data.
 * 
 * Steps
 * - Validate the request body
 * - Check if term exists
 * - Update the term
 * - Send a response to the client
 * - Create notification
 * 
 */

//imports
const mongoose = require("mongoose");
const Term = require("../../models/term/term");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { updateInGCS, uploadToGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//the controller
exports.editTerm = async (req, res, next) => {
	const { name, description, type } = req.body;
	const { termID } = req.params;
	const { user, file } = req;

	//Step: validate the request body
	let errors = [];

	if (!name) {
		errors.push("Name is required");
	}

	if (!type) {
		errors.push("Type is required");
	}

	if (!termID || !mongoose.Types.ObjectId.isValid(termID)) {
		errors.push("Term ID is not valid");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in editTerm Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//find the term
		const term = await Term.findOne({
			_id: termID,
		});

		if(!term){
			logger.warn(`Term with ID: ${termID} not found`);
			return next(
				new ErrorResponse(
					"You are not authorized to edit this term",
					401
				)
			);
		}

		//update the file if file exists
		let fileUrl

		if(file && file !== ""){
			const startUpload = performance.now();

			//if the term.file doesnt exist, then use uploadToGCS
			if(!term.file){
				fileUrl = await uploadToGCS(file);
			} else {
				//else use updateInGCS
				const filename = term.file.split("/").pop();

				fileUrl = await updateInGCS(filename, file);
			}

			const endUpload = performance.now();
			logger.info(`Upload time is ${endUpload - startUpload}ms`);
		}

		//update the term
		term.name = name;
		term.description = description;
		term.type = type;
		term.file = file && fileUrl ? fileUrl : term.file;
		term.updatedBy = user._id;

		//save the term
		await term.save();
		
		//create notification
		const notification = {
			details: `Term ${name} has been edited successfully`,
			type: "edit",
			relatedModel: "Term",
			relatedModelID: term._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		const end = performance.now();

		//send a response to the client
		res.status(200).json({
			success: true,
			data: term,
			message: "Term edited successfully",
		});

		logger.info(`editTerm Controller Execution time: ${end - start} ms.`);
	} catch (error) {
		logger.error(`Error in editTerm Controller: ${error}`);
		next(error);
	}
};
