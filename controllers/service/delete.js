/**
 * DELETE SERVICE CONTROLLERS
 *
 * Delete Single Service:
 *
 * Steps:
 * - Validate the service ID
 * - Find the service and delete it
 * - Update the lead.service field if service.leads exists
 * - Create notification
 * - Log the success
 *
 * Delete Many Services:
 *
 * Steps:
 * - Validate the service IDs
 * - Find the services and delete them
 * - Update the lead.service field if service.leads exists
 * - Create notification
 * - Log the success
 *
 */

// Package imports
const mongoose = require("mongoose");
const Service = require("../../models/service/service");
const User = require("../../models/user/user");
const Lead = require("../../models/lead/lead");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

// Delete single service controller
exports.deleteSingleService = async (req, res, next) => {
	const { serviceID } = req.params;
	const user = req.user;

	// Step 1: Validate the service ID
	if (!serviceID || !mongoose.Types.ObjectId.isValid(serviceID)) {
		logger.warn("Invalid service ID");
		return next(new ErrorResponse("Invalid service ID", 400));
	}

	try {
		const start = performance.now();

		// Step 2: Find the service and delete it
		const service = await Service.findOne({
			_id: serviceID,
		});

		if (!service) {
			logger.warn("Service not found or not authorized");
			return next(
				new ErrorResponse("Service not found or not authorized", 403)
			);
		}

		//if service.leads > 0 do not delete
		if (service.leads && service.leads.length > 0) {
			logger.warn("Service has leads, cannot delete");
			return next(
				new ErrorResponse(
					"Cannot delete service with associated leads, you have to delete the leads first",
					403
				)
			);
		}

		//Step 3: Update the lead.service field if service.leads exists
		if (service.leads && service.leads.length > 0) {
			const leadsToUpdate = service.leads.map(
				(lead) => new mongoose.Types.ObjectId(lead)
			);
			await Lead.updateMany(
				{ _id: { $in: leadsToUpdate } },
				{ $unset: { service: "" } }
			);
		}

		// Step 5: Delete the service
		await Service.deleteOne({ _id: serviceID });

		const notification = {
			details: `Service  deleted successfully`,
			createdBy: user._id,
			relatedModel: "Service",
			relatedModelID: serviceID,
			type: "delete",
		};

		req.body = notification;
		await createNotification(req, res, next);

		const end = performance.now();

		// Step 6: Log the success
		logger.info(
			`Service ${serviceID} deleted successfully by user ${user._id} in ${
				end - start
			}ms`
		);

		res.status(200).json({
			success: true,
			message: "Service deleted successfully",
		});
	} catch (error) {
		logger.error(`Error in deleteSingleService: ${error.message}`);
		console.error(error);
		next(error);
	}
};

// Delete many services controller
exports.deleteManyServices = async (req, res, next) => {
	const { serviceIDs } = req.body;
	const user = req.user;

	// Step: Validate the service IDs
	if (
		!Array.isArray(serviceIDs) ||
		serviceIDs.some((id) => !mongoose.Types.ObjectId.isValid(id))
	) {
		logger.warn("Invalid service IDs");
		return next(new ErrorResponse("Invalid service IDs", 400));
	}

	try {
		const start = performance.now();

		// Step: Find the services and delete them
		const services = await Service.find({
			_id: { $in: serviceIDs },
		});

		//TODO ensure that this logic is in every delete many controller
		if (services.length !== serviceIDs.length) {
			logger.warn("Some services not found or not authorized");
			return next(
				new ErrorResponse(
					"You do not have permission to delete some or all of the selected services",
					403
				)
			);
		}

		if (!services || services.length === 0) {
			logger.warn("Services not found or not authorized");
			return next(
				new ErrorResponse("Services not found or not authorized", 403)
			);
		}

		// Check if any service has leads
		const serviceWithLeads = services.find(
			(service) => service.leads && service.leads.length > 0
		);

		if (serviceWithLeads) {
			logger.warn("Some services have leads, cannot delete");
			return next(
				new ErrorResponse(
					"Cannot delete services with associated leads, you have to delete the leads first",
					403
				)
			);
		}

		// Step : Remove the services from the user's services array
		await User.updateOne(
			{ _id: user._id },
			{ $pullAll: { services: serviceIDs } }
		);

		//Step: Delete the services
		await Service.deleteMany({
			_id: { $in: serviceIDs },
		});

		// Step : Create notification
		const notification = {
			details: "Services deleted successfully",
			type: "delete",
			relatedModel: "Service",
			createdBy: user._id,
		};

		req.body = notification;

		try {
			await createNotification(req, res, next);
		} catch (notifError) {
			logger.warn(
				`Issue with creating notification: ${notifError.message}`
			);
		}

		res.status(200).json({
			success: true,
			data: {},
			message: "Services deleted successfully",
		});

		const end = performance.now();

		// Step 6: Log the success
		logger.info(
			`Services ${serviceIDs.join(", ")} deleted successfully by user ${
				user._id
			} in ${end - start}ms`
		);
	} catch (error) {
		logger.error(`Error in deleteManyServices: ${error.message}`);
		next(error);
	}
};
