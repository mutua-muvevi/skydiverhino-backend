/**
 * @api {delete} /storage/:id Delete storage
 * @apiName deleteFile
 * @apiGroup Storage
 * @apiPermission user
 * @apiParam {String} id Storage id
 * @apiSuccess (Success 200) {Boolean} success true
 *
 * DELETING A STORAGE
 * ===========================================
 * This controller is responsible for deleting a storage from the database.
 *
 * Steps:
 * - Validate the request body
 * - Delete the storage
 * - Send a response to the client
 *
 */

//imports
const mongoose = require("mongoose");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const {
	deleteFromGCS,
	calculateStorageUsage,
	getStorageDetails,
} = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//the controller
exports.deleteFile = async (req, res, next) => {
	const { user } = req;
	const { filename } = req.params;

	//Step: validate the request body
	let errors = [];

	if (!filename) {
		errors.push("Storage ID is not valid");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in deleteFile Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	if (!user || !mongoose.Types.ObjectId.isValid(user._id)) {
		return next(new ErrorResponse("Not Authorized", 401));
	}

	try {
		const start = performance.now();

		// Step: Find the file in user's storage
		let fileFound = false;
		for (const folder in user.storage) {
			if (
				user.storage[folder].files.some((file) =>
					file.file.endsWith(filename)
				)
			) {
				fileFound = true;
				break;
			}
		}

		if (!fileFound) {
			return next(
				new ErrorResponse("File not found in user's storage", 404)
			);
		}

		//Step: delete the storage
		const startDelete = performance.now();

		const deletedFile = await deleteFromGCS(user, filename);

		if (!deletedFile) {
			return next(new ErrorResponse("File not found", 404));
		}

		const endDelete = performance.now();

		const files = await getStorageDetails(user.fullname);

		const storage = calculateStorageUsage(files);

		user.storage = storage;

		//create notification
		const notification = {
			details: `File was removed sucessfully`,
			createdBy: user._id,
			type: "delete",
			relatedModel: "User",
			relatedModelID: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		//send the response
		res.status(200).json({
			success: true,
			message: "File deleted successfully",
			data: user,
		});

		const end = performance.now();
		logger.info(
			`File deleted successfully in ${endDelete - startDelete}ms`
		);
		logger.info(`File deleted successfully in ${end - start}ms`);
	} catch (error) {
		logger.error(`Error in deleteFile: ${error.message}`);
		next(error);
	}
};
