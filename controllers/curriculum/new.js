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

//the controller
exports.createCurriculum = async (req, res, next) => {
	const { name, description } = req.body;
	const { file, user } = req;

	//Step: validate the request body
	let errors = [];

	if (!name) {
		errors.push("Name is required");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in createCurriculum Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//upload the file to GCS if file exists
		let fileUrl

		if(file && file !== ""){
			const startUpload = performance.now();

			fileUrl = await uploadToGCS(file);

			const endUpload = performance.now();
			logger.info(`Upload time is ${endUpload - startUpload}ms`);
		}

		//create the curriculum
		const curriculum = await Curriculum.create({
			name,
			description,
			file: fileUrl,
			uploadedBy: user._id,
		});


		//create notification
		const notification = {
			details: `New curriculum ${name} has been created`,
			type: "create",
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
			message: "Curriculum created successfully",
		});

		logger.info(`createCurriculum Controller Execution time: ${end - start} ms.`);

	} catch (error) {
		logger.error(`Error in createCurriculum Controller: ${error}`);
		next(error);
	}
};