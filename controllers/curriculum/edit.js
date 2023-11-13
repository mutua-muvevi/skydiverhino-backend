/**
 * EDIT MANUAL CONTROLLER
 * ========================
 * Controls the edit curriculum data.
 * 
 * Steps
 * - Validate the request body
 * - Check if curriculum exists
 * - Update the curriculum
 * - Send a response to the client
 * - Create notification
 * 
 */

//imports
const mongoose = require("mongoose");
const Curriculum = require("../../models/curriculum/curriculum");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { updateInGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//the controller
exports.editCurriculum = async (req, res, next) => {
	const { name, description } = req.body;
	const { curriculumID } = req.params;
	const { user, file } = req;

	//Step: validate the request body
	let errors = [];

	if (!name) {
		errors.push("Name is required");
	}

	if (!curriculumID || !mongoose.Types.ObjectId.isValid(curriculumID)) {
		errors.push("Curriculum ID is not valid");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in editCurriculum Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//find the curriculum
		const curriculum = await Curriculum.findOne({
			_id: curriculumID,
		});

		if(!curriculum){
			logger.warn(`Curriculum with ID: ${curriculumID} not found`);
			return next(
				new ErrorResponse(
					"You are not authorized to edit this curriculum",
					401
				)
			);
		}

		//update the file if file exists
		let fileUrl

		if(file && file !== ""){
			const startUpload = performance.now();

			const filename = curriculum.file.split("/").pop();

			fileUrl = await updateInGCS(filename, file);

			const endUpload = performance.now();
			logger.info(`Upload time is ${endUpload - startUpload}ms`);
		}

		//update the curriculum
		curriculum.name = name;
		curriculum.description = description;
		curriculum.file = file && fileUrl ? fileUrl : curriculum.file;
		curriculum.updatedBy = user._id;

		//save the curriculum
		await curriculum.save();
		
		//create notification
		const notification = {
			details: `Edit curriculum ${name} has been created`,
			type: "edit",
			relatedModel: "Curriculum",
			relatedModelID: curriculum._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		const end = performance.now();

		//send a response to the client
		res.status(200).json({
			success: true,
			data: curriculum,
			message: "Curriculum edited successfully",
		});

		logger.info(`editCurriculum Controller Execution time: ${end - start} ms.`);
	} catch (error) {
		logger.error(`Error in editCurriculum Controller: ${error}`);
		next(error);
	}
};
