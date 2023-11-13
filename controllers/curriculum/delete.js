/**
 * Delete Controller
 * ==============================
 * This Controller is used to delete a curriculum
 * 
 * Steps:
 * - Validate the request body
 * - Check if curriculum exists
 * - Delete the curriculum
 * - Send a response to the client
 * - Create notification
 * 
 */

//imports
const mongoose = require("mongoose");
const Curriculum = require("../../models/curriculum/curriculum");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { deleteFromGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//controller
exports.deleteCurriculum = async (req, res, next) => {
	const { curriculumID } = req.params;
	const { user } = req;

	//Step: validate the request body
	let errors = [];

	if (!curriculumID || !mongoose.Types.ObjectId.isValid(curriculumID)) {
		errors.push("Curriculum ID is not valid");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in deleteCurriculum Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();
		
		//find the curriculum
		const curriculum = await Curriculum.findById(curriculumID);

		if(!curriculum){
			logger.warn(`Curriculum with ID: ${curriculumID} not found`);
			return next(
				new ErrorResponse(
					"Curriculum not found or You are not authorized to delete",
					401
				)
			);
		}

		//delete file in gcs
		if(curriculum.file){
			const startDelete = performance.now();

			const extractFileName = curriculum.file.split("/").pop();

			await deleteFromGCS(extractFileName);

			const endDelete = performance.now();
			logger.info(`Delete time is ${endDelete - startDelete}ms`);
		}

		//delete the curriculum
		await Curriculum.findByIdAndDelete(curriculumID);

		//create notification
		const notification = {
			details: `Curriculum deleted successfully`,
			type: "delete",
			relatedModel: "Curriculum",
			relatedModelID: curriculum._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		const end = performance.now();

		//send a response to the client
		res.status(200).json({
			success: true,
			message: "Curriculum deleted successfully",
		});

		logger.info(`deleteCurriculum Controller Execution time: ${end - start} ms.`);
	} catch (error) {
		logger.error(`Error in deleteCurriculum Controller: ${error}`);
		next(error);
	}
};