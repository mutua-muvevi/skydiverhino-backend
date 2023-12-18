/**
 * FETCH CONTROLLERS FOR MEMBER
 *
 * Fetch All Members:
 *
 * Fetch All Members for Team:
 *
 * Fetch Single Member By ID:
 *
 */

// packages import
const mongoose = require("mongoose");
const Service = require("../../models/service/service");
const User = require("../../models/user/user");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

// Fetch all services
exports.fetchAllServices = async (req, res, next) => {
	try {
		const start = performance.now();

		// Find all services
		const services = await Service.find()
			.sort({ createdAt: -1 })
			.lean()
			.select("-__v")
			.populate({
				path: "leads",
				select: "-__v fullname email country",
			});

		if (!services || services.length === 0) {
			return next(new ErrorResponse("No services found", 404));
		}

		res.status(200).json({
			success: true,
			count: services.length,
			data: services,
		});

		const end = performance.now();

		logger.info(`Services fetched successfully in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAllServices: ${error.message}`);
		return next(error);
	}
};

// Fetch single service by ID
exports.fetchServiceByID = async (req, res, next) => {
	const { serviceID } = req.params;

	// Validate the serviceID
	if (!serviceID || !mongoose.Types.ObjectId.isValid(serviceID)) {
		logger.warn("Validation error in fetchServiceByID: Invalid service ID");
		return next(new ErrorResponse("Invalid service ID", 400));
	}

	try {
		const start = performance.now();

		// Find the service by ID
		const service = await Service.findById(serviceID).lean();

		if (!service) {
			return next(new ErrorResponse("Service not found", 404));
		}

		res.status(200).json({
			success: true,
			data: service,
			message: "Service fetched successfully",
		});

		const end = performance.now();

		logger.info(
			`Service with ID: ${serviceID} fetched successfully in ${
				end - start
			}ms.`
		);
	} catch (error) {
		logger.error(`Error in fetchServiceByID: ${error.message}`);
		return next(error);
	}
};
