//imports
const mongoose = require("mongoose");
const Service = require("../../models/service/service");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

//POST DETAILS CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Push the details to the service array
// 4. Save the service
// 5. Log the success

//controller
exports.addDetail = async (req, res, next) => {
	const { title, details, image } = req.body;
	const serviceID = req.params.serviceID;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!title) errors.push("Detail title is required");

	if (!details) errors.push("Detail details is required");

	if(!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in AddDetail Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		//Step: Find the service
		const service = await Service.findById(serviceID);

		if (!service) {
			logger.warn(
				`Service not found in AddDetail Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Push the details to the service array
		service.details.push({ title, details, image });

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`AddDetail Controller success: ${user.email} added a new detail to ${service.name}`
		);

		//Step: Send the response
		res.status(200).json({
			success: true,
			message: "Detail added successfully",
			data: service,
		});
	} catch (error) {
		logger.error(`AddDetail Controller error: ${error.message}`);
		next(error);
	}
};

//EDIT DETAILS CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Find the detail
// 4. Update the detail
// 5. Save the service
// 6. Log the success

//controller
exports.editDetail = async (req, res, next) => {
	const { title, details, image } = req.body;
	const serviceID = req.params.serviceID;
	const detailID = req.params.detailID;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!title) errors.push("Detail title is required");

	if (!details) errors.push("Detail details is required");

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (!detailID || !mongoose.isValidObjectId(detailID))
		errors.push("Detail ID is required and must be a valid ID");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in EditDetail Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		//Step: Find the service
		const service = await Service.findById(serviceID);

		if (!service) {
			logger.warn(
				`Service not found in EditDetail Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Find the detail
		const detail = service.details.id(detailID);

		if (!detail) {
			logger.warn(
				`Detail not found in EditDetail Controller: ${detailID}`
			);
			return next(new ErrorResponse("Detail not found", 404));
		}

		//Step: Update the detail
		detail.title = title;
		detail.details = details;
		detail.image = image;

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`EditDetail Controller success: ${user.email} edited a detail in ${service.name}`
		);

		//Step: Send the response
		res.status(200).json({
			success: true,
			message: "Detail edited successfully",
			data: service,
		});
	} catch (error) {
		logger.error(`EditDetail Controller error: ${error.message}`);
		next(error);
	}
};

//DELETE SINGLE DETAIL CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Find the service
// 2. Find the detail
// 3. Delete the detail
// 4. Save the service
// 5. Log the success

//controller
exports.deleteSingleDetail = async (req, res, next) => {
	const serviceID = req.params.serviceID;
	const detailID = req.params.detailID;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (!detailID || !mongoose.isValidObjectId(detailID))
		errors.push("Detail ID is required and must be a valid ID");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in DeleteSingleDetail Controller: ${errors.join(
				", "
			)}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		//Step: Find the service
		const service = await Service.findById(serviceID);

		if (!service) {
			logger.warn(
				`Service not found in DeleteSingleDetail Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Find the detail
		const detail = service.details.id(detailID);

		if (!detail) {
			logger.warn(
				`Detail not found in DeleteSingleDetail Controller: ${detailID}`
			);
			return next(new ErrorResponse("Detail not found", 404));
		}

		//Step: Delete the detail
		service.details.remove(detailID);

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`DeleteSingleDetail Controller success: ${user.email} deleted a detail in ${service.name}`
		);

		//Step: Send the response
		res.status(200).json({
			success: true,
			message: "Detail deleted successfully",
			data: service,
		});
	} catch (error) {
		logger.error(`DeleteSingleDetail Controller error: ${error.message}`);
		next(error);
	}
};

//DELETE MANY DETAILS CONTROLLER
//-----------------------------------------------------------------
// Steps
// 1. Validate the request body
// 2. Find the service
// 3. Find the details
// 4. Delete the details
// 5. Save the service
// 6. Log the success

//controller
exports.deleteManyDetails = async (req, res, next) => {
	const serviceID = req.params.serviceID;
	const detailIDs = req.body.detailIDs;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (!detailIDs || !Array.isArray(detailIDs))
		errors.push("Detail IDs is required and must be an array");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in DeleteManyDetails Controller: ${errors.join(
				", "
			)}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		//Step: Find the service
		const service = await Service.findById(serviceID);

		if (!service) {
			logger.warn(
				`Service not found in DeleteManyDetails Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Find the details
		const details = service.details.filter((detail) =>
			detailIDs.includes(detail._id.toString())
		);

		if (details.length === 0) {
			logger.warn(
				`Details not found in DeleteManyDetails Controller: ${detailIDs.join(
					", "
				)}`
			);
			return next(new ErrorResponse("Details not found", 404));
		}

		//Step: Delete the details
		details.forEach((detail) => service.details.remove(detail._id));

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`DeleteManyDetails Controller success: ${user.email} deleted details in ${service.name}`
		);

		//Step: Send the response
		res.status(200).json({
			success: true,
			message: "Details deleted successfully",
			data: service,
		});
	} catch (error) {
		logger.error(`DeleteManyDetails Controller error: ${error.message}`);
		next(error);
	}
};