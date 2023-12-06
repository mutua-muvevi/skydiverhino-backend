/**
 * 
 * @api {post} /api/storage/new Add a new file
 * @apiName AddNewFile
 * @apiGroup Storage
 * @apiPermission user
 * @apiParam {String} file The file to be uploaded
 * 
 * ADDING A NEW FILE
 * ===========================================
 * This controller is responsible for adding a new file to the database.
 *
 * Steps:
 * - Validate the request body
 * - Upload the file to GCS
 * - Create a new file
 * - Send a response to the client
 *
 */

//imports
const mongoose = require("mongoose");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const {
	uploadToGCS,
	calculateStorageUsage,
	getStorageDetails,
} = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//the controller
exports.addNewFile = async (req, res, next) => {
	const { user, file } = req;

	//Step: validate the request body
	let errors = [];

	if (!file) {
		errors.push("No file provided");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in addFile Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	if (!user || !mongoose.Types.ObjectId.isValid(user._id)) {
		return next(new ErrorResponse("Not Authorized", 401));
	}

	try {
		const start = performance.now();

		//Step: upload file to GCS
		const startUpload = performance.now();

		const uploadedFile = await uploadToGCS(file, user);

		if (!uploadedFile) {
			logger.error(`Error uploading file in Add new File`);
			return next(new ErrorResponse("Error uploading file", 500));
		}

		const endUpload = performance.now();

		//update the storage data in the user
		const files = await getStorageDetails(user.fullname);

		const storage = calculateStorageUsage(files);

		user.storage = storage;
		await user.save();

		//create notification
		const notification = {
			details: `File was added to user sucessfully`,
			createdBy: user._id,
			type: "add",
			relatedModel: "User",
			relatedModelID: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		//send the response
		res.status(201).json({
			success: true,
			message: "File added successfully",
		});

		const end = performance.now();
		logger.info(`Upload time is ${endUpload - startUpload}ms`);
		logger.info(`File added successfully in ${end - start}ms`);
	} catch (error) {
		logger.error(`Error in addFile Controller: ${error.message}`);
		next(error);
	}
};
