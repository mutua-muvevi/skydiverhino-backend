/**
 * Create a new term
 * ==================================
 * This controller is responsible for creating a new term
 * 
 * Steps:
 * - Validate the request body
 * - Create the term
 * - Send a response to the client
 * - Create Notification
 */

//imports
const Term = require("../../models/term/term");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { uploadToGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//the controller
exports.createTerm = async (req, res, next) => {
	const { name, description, type } = req.body;
	const { file, user } = req;

	//Step: validate the request body
	let errors = [];

	if (!name) {
		errors.push("Name is required");
	}

	if (!type) {
		errors.push("Type is required");
	}
	
	if (errors.length > 0) {
		logger.warn(
			`Validation error in createTerm Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();
		console.log("BODY", req.body)
		console.log("file", req.file)

		//upload the file to GCS if file exists
		let fileUrl = null

		if(file && file !== ""){
			const startUpload = performance.now();

			fileUrl = await uploadToGCS(file);

			const endUpload = performance.now();
			logger.info(`Upload time is ${endUpload - startUpload}ms`);
		}

		//create the term
		const term = await Term.create({
			name,
			description,
			type,
			file: fileUrl,
			uploadedBy: user._id,
		});
		
		//create notification
		const notification = {
			details: `New term ${name} has been created`,
			type: "create",
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
			message: "Term created successfully",
		});

		logger.info(`createTerm Controller Execution time: ${end - start} ms.`);

	} catch (error) {
		logger.error(`Error in createTerm Controller: ${error}`);
		next(error);
	}
};