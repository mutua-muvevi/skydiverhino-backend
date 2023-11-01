
// Notification Fetching:
//
// Fetch All Notifications :
//
// Fetch All Notifications for User:
// Step 1: Retrieve all notifications for the authenticated user.
// Step 2: Send a success response back to the client with the list of notifications.
//
// Fetch Notification By ID:
// Step 1: Validate the provided notification ID.
// Step 2: Retrieve the notification using the provided ID.
// Step 3: Validate the notification belongs to the authenticated user.
// Step 4: Send a success response back to the client with the notification data.
//
// Note: Special attention has been given to Performance, Security, Scalability, Error Handling, and ensuring zero data leakages.
// ============================

// Package imports
const mongoose = require("mongoose");
const Notification = require("../../models/notification/notification");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { performance } = require("perf_hooks");

// Fetching all notifications for a specific user
exports.fetchAllUsersNotifications = async (req, res, next) => {
	const user = req.user;

	try {
		const start = performance.now();

		// Step 1: Retrieve all notifications for the authenticated user.
		const userNotifications = await Notification.find({
			createdBy: user._id,
		});

		const end = performance.now();

		// Step 2: Send a success response back to the client with the list of notifications.
		res.status(200).json({
			success: true,
			count: userNotifications.length,
			data: userNotifications,
		});

		logger.info(`Fetched all notifications for user in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAll Users Notifications: ${error.message}`);
		next(error);
	}
};

// Fetching all notifications
exports.fetchAllNotifications = async (req, res, next) => {
	try {
		const start = performance.now();

		// Step 1: Retrieve all transactions from the Notification collection.
		const transactions = await Notification.find();

		
		// Step 2: Send a success response back to the client with the list of transactions.
		res.status(200).json({
			success: true,
			count: transactions.length,
			data: transactions,
		});

		const end = performance.now();
		logger.info(`Fetched all transactions in ${end - start}ms.`);

	} catch (error) {
		logger.error(`Error in fetchAll Notifications: ${error.message}`);
		next(error);
	}
};

// Fetching notification by ID
exports.fetchNotificationByID = async (req, res, next) => {
	const { notificationID } = req.params;

	// Step 1: Validate the provided notification ID.
	if (!notificationID || !mongoose.Types.ObjectId.isValid(notificationID)) {
		logger.warn(
			`Invalid notification ID provided in fetchByID: ${notificationID}`
		);
		return next(new ErrorResponse("Invalid notification ID", 400));
	}

	try {
		const start = performance.now();

		// Step 2: Retrieve the notification using the provided ID.
		const notification = await Notification.findById(notificationID);

		// Step 3: Validate the notification belongs to the authenticated user.
		if (!notification) {
			return next(new ErrorResponse("Notification not found", 404));
		}
		if (notification.createdBy.toString() !== req.user._id.toString()) {
			logger.warn("Unauthorized access to notification data");
			return next(
				new ErrorResponse(
					"Not authorized to access this notification",
					403
				)
			);
		}

		const end = performance.now();

		// Step 4: Send a success response back to the client with the notification data.
		res.status(200).json({
			success: true,
			data: notification,
		});

		logger.info(
			`Fetched notification with ID: ${notificationID} in ${
				end - start
			}ms.`
		);
	} catch (error) {
		logger.error(`Error in fetchByID Notification: ${error.message}`);
		next(error);
	}
};
