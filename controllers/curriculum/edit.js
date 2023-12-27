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

// Helper function to update images and return their URLs
async function updateImages(newFiles, existingUrls) {
	try {
		let updatedUrls = [];

		for (let i = 0; i < existingUrls.length; i++) {
			let oldUrl = existingUrls[i];
			let newFile = newFiles[i];

			// If a new file is provided, update it in GCS and get the new URL
			if (newFile) {
				try {
					let updatedUrl = await updateInGCS(
						oldUrl.split("/").pop(),
						newFile
					);
					updatedUrls.push(updatedUrl);
				} catch (error) {
					throw new Error(`Error updating file: ${error.message}`);
				}
			} else {
				// If no new file, keep the existing URL
				updatedUrls.push(oldUrl.split("/").pop());
			}
		}

		return updatedUrls;
	} catch (error) {
		logger.error(`Error updating images: ${error.message}`);
		return error;
	}
}

//the controller
exports.editCurriculum = async (req, res, next) => {
	const user = req.user;
	const { curriculumID } = req.params;
	let { title, introDescription, contentBlocks } = req.body;
	
	// Extracting thumbnail and content images from the request
	const thumbnail = req.files.thumbnail;
	const contentFiles = req.files.file;

	//Step: validate the request body
	let errors = [];

	if (!title) {
		errors.push("Title is required");
	}

	if (!introDescription) {
		errors.push("Intro description is required");
	}

	if (!contentBlocks || contentBlocks.length < 1) {
		errors.push("Content blocks is required");
	}

	if(!curriculumID || !mongoose.Types.ObjectId.isValid(curriculumID)) {
		errors.push("Curriculum ID is required");
	}

	//though this is done in the middleware, we still need to check
	if (!user) {
		errors.push("User is required");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in editBlog controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//check if curriculum exists
		const curriculum = await Curriculum.findById(curriculumID);

		if (!curriculum) {
			logger.warn(
				`Curriculum with ID ${curriculumID} does not exist`
			);
			return next(
				new ErrorResponse(
					`Curriculum with ID ${curriculumID} does not exist`,
					400
				)
			);
		}

		//updating the files in GCS
		const startUpload = performance.now();

		// Updating the thumbnail if provided
		let thumbnailUrl = curriculum.thumbnail;
		
		if (thumbnail) {
			thumbnailUrl = await updateInGCS(
				curriculum.thumbnail.split("/").pop(),
				thumbnail[0]
			);
		}
		
		// Updating content block images
		const existingFileUrls = curriculum.contentBlocks.map(
			(block) => block.file
		);
		const contentFileUrls = await updateImages(
			contentFiles,
			existingFileUrls
		);

		// Assign each updated file URL to the corresponding content block
		const updatedContentBlocks = contentBlocks.map((block, index) => ({
			...block,
			file: contentFileUrls[index] || existingFileUrls[index],
		}));

		const endUpload = performance.now();

		// Update the curriculum
		curriculum.title = title || curriculum.title;
		curriculum.introDescription = introDescription || curriculum.introDescription;
		curriculum.contentBlocks = updatedContentBlocks;
		curriculum.thumbnail = thumbnailUrl;
		curriculum.updatedBy = user._id;

		await curriculum.save();

		//create notification
		const notification = {
			details: `Edit curriculum ${title} has been created`,
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

		logger.info(
			`editCurriculum Controller Execution time: ${end - start} ms.`
		);
		logger.info(`Upload time is ${endUpload - startUpload}ms`);
	} catch (error) {
		logger.error(`Error in editCurriculum Controller: ${error}`);
		return next(new ErrorResponse(error.message, 500));
	}
};
