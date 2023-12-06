/**
 * @api {get} /storage/download/:id Download file
 * @apiName DownloadFile
 * @apiGroup Storage
 *
 * DOWNLOADING A FILE
 * ===========================================
 * This controller is responsible for downloading a file from the database.
 *
 * Steps:
 * - Validate the request body
 * - Download the file from GCS
 * - Send a response to the client
 *
 */

//imports
const mongoose = require("mongoose");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { downloadFromGCS } = require("../../utils/storage");

//the controller
exports.downloadFile = async (req, res, next) => {
	const { user } = req;
	const { filename } = req.params;

	//Step: validate the request body
	let errors = [];

	if (!filename) {
		errors.push("Storage ID is not valid");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in downloadFile Controller: ${errors.join(", ")}`
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
			logger.warn(`File not found in downloadFile Controller`);
			return next(new ErrorResponse("File not found", 404));
		}

		//Step: download file from GCS
		let file = null;

		try {
			const startDownload = performance.now();

			fileStream = await downloadFromGCS(user, filename);

			const endDownload = performance.now();

			logger.info(
				`Downloaded file from GCS in ${(
					endDownload - startDownload
				).toFixed(2)}ms`
			);
		} catch (error) {
			logger.error(
				`Error downloading file in downloadFile Controller: ${error}`
			);
			next(new ErrorResponse("Error downloading file", 500));
		}

		// Set headers to indicate a file attachment with the given filename
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${filename}"`
		);
		res.setHeader("Content-Type", "application/octet-stream");

		// Pipe the readable stream (file) from GCS directly to the response
		fileStream.on("error", (streamError) => {
			logger.error(
				`Stream error in downloadFile Controller: ${streamError}`
			);
			next(new ErrorResponse("Error streaming the file", 500));
		});

		fileStream.pipe(res).on("finish", () => {
			logger.info(`File ${filename} downloaded successfully`);
		});

		const end = performance.now();
		logger.info(`Downloaded file in ${(end - start).toFixed(2)}ms`);
	} catch (error) {
		logger.error(`Error in downloadFile Controller: ${error}`);
		return next(new ErrorResponse("Something went wrong", 500));
	}
};
