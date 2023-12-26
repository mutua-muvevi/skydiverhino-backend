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

//helper function to get filename from url
function getFilenameFromUrl(url) {
	try {
		// The filename is typically the last part of the pathname
		const filename = url.split("/").pop();
		console.log("The filename", filename)

		return filename;
	} catch (error) {
		logger.error(`Error extracting filename from URL: ${error.message}`);
		return null;
	}
}

//controller
exports.deleteCurriculum = async (req, res, next) => {
	const { curriculumID } = req.params;
	const { user } = req;

	//Step: validate the request body
	if (!curriculumID || !mongoose.Types.ObjectId.isValid(curriculumID)) {
		return next(new ErrorResponse("Curriculum ID is not valid"));
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
		
		//check if the user is authorized to delete the curriculum
		if (curriculum.author.toString() !== user._id.toString()) {
			return next(
				new ErrorResponse("Unauthorized to delete this curriculum", 403)
			);
		}

		//delete associated images from GCS
		const startDelete = performance.now();

		if (curriculum.thumbnail) {
			await deleteFromGCS(getFilenameFromUrl(curriculum.thumbnail));
		}

		for (const block of curriculum.contentBlocks) {
			if (block.image) {
				await deleteFromGCS(getFilenameFromUrl(block.image));
			}
		}

		const endDelete = performance.now();

		//delete the curriculum
		await Curriculum.deleteOne({ _id: curriculumID });

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
		logger.info(`File deletion time: ${endDelete - startDelete}ms`);
	} catch (error) {
		logger.error(`Error in deleteCurriculum Controller: ${error}`);
		next(error);
	}
};