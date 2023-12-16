//imports
const mongoose = require("mongoose");
const Service = require("../../models/service/service");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//POST REQUIREMENT CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Push the requirement to the service array
// 4. Save the service
// 5. Log the success

//controller
exports.addRequirement = async (req, res, next) => {
	const { title, details } = req.body;
	const serviceID = req.params.serviceID;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!title) errors.push("Requirement title is required");

	if (!details) errors.push("Requirement details is required");

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in AddRequirement Controller: ${errors.join(
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
				`Service not found in AddRequirement Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Push the requirement to the service array
		service.requirements.push({ title, details });

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`AddRequirement Controller success: ${user.email} added a new requirement to ${service.name}`
		);
		res.status(200).json({
			success: true,
			message: "Requirement added successfully",
		});
	} catch (error) {
		logger.error(`AddRequirement Controller error: ${error.message}`);
		next(error);
	}
};


//EDIT REQUIREMENT CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Find the requirement
// 4. Update the requirement
// 5. Save the service
// 6. Log the success

//controller
exports.editRequirement = async (req, res, next) => {
	const { title, details } = req.body;
	const serviceID = req.params.serviceID;
	const requirementID = req.params.requirementID;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!title) errors.push("Requirement title is required");

	if (!details) errors.push("Requirement details is required");

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (
		!requirementID ||
		!mongoose.isValidObjectId(requirementID)
	)
		errors.push("Requirement ID is required and must be a valid ID");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in EditRequirement Controller: ${errors.join(
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
				`Service not found in EditRequirement Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Find the requirement
		const requirement = service.requirements.find(
			(req) => req._id == requirementID
		);

		if (!requirement) {
			logger.warn(
				`Requirement not found in EditRequirement Controller: ${requirementID}`
			);
			return next(new ErrorResponse("Requirement not found", 404));
		}

		//Step: Update the requirement
		requirement.title = title;
		requirement.details = details;

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`EditRequirement Controller success: ${user.email} edited a requirement in ${service.name}`
		);
		res.status(200).json({
			success: true,
			message: "Requirement edited successfully",
		});
	} catch (error) {
		logger.error(`EditRequirement Controller error: ${error.message}`);
		next(error);
	}
};


//DELETE SINGLE REQUIREMENT CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Find the requirement
// 4. Delete the requirement
// 5. Save the service
// 6. Log the success

//controller
exports.deleteSingleRequirement = async (req, res, next) => {
	const serviceID = req.params.serviceID;
	const requirementID = req.params.requirementID;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (
		!requirementID ||
		!mongoose.isValidObjectId(requirementID)
	)
		errors.push("Requirement ID is required and must be a valid ID");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in DeleteSingleRequirement Controller: ${errors.join(
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
				`Service not found in DeleteSingleRequirement Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Find the requirement
		const requirement = service.requirements.find(
			(req) => req._id == requirementID
		);

		if (!requirement) {
			logger.warn(
				`Requirement not found in DeleteSingleRequirement Controller: ${requirementID}`
			);
			return next(new ErrorResponse("Requirement not found", 404));
		}

		//Step: Delete the requirement
		service.requirements.remove(requirementID);

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`DeleteSingleRequirement Controller success: ${user.email} deleted a requirement in ${service.name}`
		);
		res.status(200).json({
			success: true,
			message: "Requirement deleted successfully",
		});
	} catch (error) {
		logger.error(
			`DeleteSingleRequirement Controller error: ${error.message}`
		);
		next(error);
	}
};


//DELETE MANY REQUIREMENTS CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Find the requirements
// 4. Delete the requirements
// 5. Save the service
// 6. Log the success

//controller
exports.deleteManyRequirements = async (req, res, next) => {
	const serviceID = req.params.serviceID;
	const requirementIDs = req.body.requirementIDs;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (!requirementIDs || requirementIDs.length <= 0)
		errors.push("Requirement IDs are required");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in DeleteManyRequirements Controller: ${errors.join(
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
				`Service not found in DeleteManyRequirements Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Find the requirements
		const requirements = service.requirements.filter((req) =>
			requirementIDs.includes(req._id.toString())
		);

		if (requirements.length <= 0) {
			logger.warn(
				`Requirements not found in DeleteManyRequirements Controller: ${requirementIDs}`
			);
			return next(new ErrorResponse("Requirements not found", 404));
		}

		//Step: Delete the requirements
		requirements.forEach((req) => service.requirements.remove(req._id));

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`DeleteManyRequirements Controller success: ${user.email} deleted requirements in ${service.name}`
		);
		res.status(200).json({
			success: true,
			message: "Requirements deleted successfully",
		});
	} catch (error) {
		logger.error(
			`DeleteManyRequirements Controller error: ${error.message}`
		);
		next(error);
	}
};