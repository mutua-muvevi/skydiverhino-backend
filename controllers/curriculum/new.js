/**
 * Curriculum Controller
 * ==============================
 * This controller is used to handle the curriculum data
 *
 * Steps:
 * - Validate the request body
 * - Create the curriculum
 * - Send a response to the client
 * - Create Notification
 */

//imports
const Curriculum = require("../../models/curriculum/curriculum");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { uploadToGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

// Helper function to upload file and return their URLs
async function uploadContentFiles(file) {
	if (!file || !Array.isArray(file) || file.length < 1) {
		return [];
	}

	return Promise.all(
		file.map((file, index) => {
			console.log(`Processing file ${index}: `, file);
			return uploadToGCS(file);
		})
	);
}

//the controller
exports.createCurriculum = async (req, res, next) => {
	const user = req.user;
	let { title, introDescription, contentBlocks, tags } = req.body;

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

	if (!thumbnail) {
		errors.push("Thumbnail image is required");
	}

	//though this is done in the middleware, we still need to check
	if (!user) {
		errors.push("User is required");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in createBlog Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//check if curriculum with existing title exists
		const curriculumExists = await Curriculum.findOne({ title });

		if (curriculumExists) {
			logger.warn(
				`Validation error in createCurriculum Controller: Curriculum with title ${title} already exists`
			);
			return next(
				new ErrorResponse(
					`Curriculum with title ${title} already exists`,
					400
				)
			);
		}

		//upload the thumbnail and content images
		const startUpload = performance.now();

		const [thumbnailUrl, contentImageUrls] = await Promise.all([
			uploadToGCS(thumbnail[0]),
			uploadContentFiles(contentFiles),
		])

		// Assign each file URL to the corresponding content block
		const updatedContentBlock = contentBlocks.map((block, index) => {
			return {
				...block,
				file: contentImageUrls[index],
			};
		});

		const endUpload = performance.now();

		//creating the curriculum
		const curriculum = await Curriculum.create({
			title,
			introDescription,
			contentBlocks: updatedContentBlock,
			thumbnail: thumbnailUrl,
			author: user._id,
		});

		if(!curriculum){
			logger.error(`Error in createCurriculum Controller: Unable to create curriculum`);
			return next(new ErrorResponse(`Unable to create curriculum`, 400));
		}


		//create notification
		const notification = {
			details: `New curriculum ${name} has been created`,
			type: "create",
			relatedModel: "Curriculum",
			relatedModelID: curriculum._id,
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		const end = performance.now();

		//send a response to the client
		res.status(200).json({
			success: true,
			data: curriculum,
			message: "Curriculum created successfully",
		});

		logger.info(
			`createCurriculum Controller Execution time: ${end - start} ms.`
		);
		logger.info(`Upload time is ${endUpload - startUpload}ms`);
	} catch (error) {
		logger.error(`Error in createCurriculum Controller: ${error}`);
		return next(new ErrorResponse(error.message, 500));
	}
};
