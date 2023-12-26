/**
 * Manual Controller
 * ==============================
 * This controller is used to handle the manual data
 *
 * Steps:
 * - Validate the request body
 * - Create the manual
 * - Send a response to the client
 * - Create Notification
 */

//imports
const Manual = require("../../models/manual/manual");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { uploadToGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//the controller
exports.createManual = async (req, res, next) => {
	const { name, description, type } = req.body;
	const { file, user } = req;

	//Step: validate the request body
	let errors = [];

	if (!name) {
		errors.push("Name is required");
	}

	if (!type) {
		errors.push("Manual type is required");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in createManual Controller: ${errors.join(", ")}`
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

		//create the manual
		const manual = await Manual.create({
			name,
			type,
			description,
			file: fileUrl,
			uploadedBy: user._id,
		});


		//create notification
		const notification = {
			details: `New manual ${name} has been created`,
			type: "create",
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
			message: "Manual created successfully",
		});

		logger.info(`createManual Controller Execution time: ${end - start} ms.`);

	} catch (error) {
		logger.error(`Error in createManual Controller: ${error}`);
		next(error);
	}
};