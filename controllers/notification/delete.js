// ============================
// TOP COMMENT
//
// Delete Notification:
// Step 1: Validate the request parameters or body data.
// Step 2: Fetch the notification, validate it against the user.
// Step 3: Delete the notification and remove references in the user.

// module imports
const { performance } = require("perf_hooks");
const mongoose = require("mongoose");
const Notification = require("../../models/notification/notification");
const logger = require("../../utils/logger");
const ErrorResponse = require("../../utils/errorResponse");

// Delete a single notification
exports.deleteOneNotification = async (req, res, next) => {
	const { notificationID } = req.params;
	const user = req.user;

	// Step 1: Validate the request parameters
	if (!notificationID || !mongoose.Types.ObjectId.isValid(notificationID)) {
		logger.warn(
			"DeleteOneNotification Controller: Notification ID not provided"
		);
		return next(new ErrorResponse("Notification ID is required", 400));
	}

	try {
		const start = performance.now();

		// Step 2: Fetch the notification and validate
		const notification = await Notification.findById(notificationID);

		if (!notification) {
			logger.warn(
				`DeleteOneNotification Controller: Notification not found for ID ${notificationID}`
			);
			return next(new ErrorResponse("Notification not found", 404));
		}

		// Ensure the user is authorized to delete this notification
		if (notification.createdBy.toString() !== user._id.toString()) {
			logger.warn(
				"DeleteOneNotification Controller: Unauthorized action"
			);
			return next(
				new ErrorResponse(
					"Not authorized to delete this notification",
					403
				)
			);
		}

		// Step 3: Delete the notification and update user references
		await Notification.deleteOne({ _id: notificationID });


		//deleting from user
		user.notifications = user.notifications.filter(
			(notificationID) => !notificationID._id.equals(notification._id)
		);
		await user.save();

		const end = performance.now();

		logger.info(
			`DeleteOneNotification Controller Success: ${end - start}ms`
		);
		res.status(200).json({
			success: true,
			message: "Notification deleted successfully",
		});
	} catch (error) {
		logger.error(`DeleteOneNotification Controller: ${error}`);
		next(error);
	}
};

// Delete multiple notifications
exports.deleteManyNotifications = async (req, res, next) => {
	const { notificationIds } = req.body;
	const user = req.user;

	// Step 1: Validate the request body
	if (!notificationIds || notificationIds.length === 0) {
		logger.warn(
			"DeleteManyNotification Controller: Notification IDs not provided"
		);
		return next(
			new ErrorResponse("At least one Notification ID is required", 400)
		);
	}

	try {
		const start = performance.now();

		// Step 2: Fetch the notifications and validate
		const notifications = await Notification.find({
			_id: { $in: notificationIds },
		});

		if (notifications.length === 0) {
			logger.warn(
				"DeleteManyNotification Controller: No notifications found for provided IDs"
			);
			return next(new ErrorResponse("No notifications found", 404));
		}

		const authorizedNotificationIds = notifications
			.filter((n) => n.createdBy.toString() === user._id.toString())
			.map((n) => n._id);

		if (authorizedNotificationIds.length === 0) {
			logger.warn(
				"DeleteManyNotification Controller: Unauthorized action"
			);
			return next(
				new ErrorResponse(
					"Not authorized to delete the provided notifications",
					403
				)
			);
		}

		// Step 3: Delete the authorized notifications and update user references
		await Notification.deleteMany({
			_id: { $in: authorizedNotificationIds },
		});

		user.notifications = user.notifications.filter(
			(notificationID) => !authorizedNotificationIds.includes(notificationID.toString())
		);

		await user.save();

		const end = performance.now();

		logger.info(
			`DeleteManyNotification Controller Success: Deleted ${
				authorizedNotificationIds.length
			} notifications in ${end - start}ms`
		);

		res.status(200).json({
			success: true,
			message: `${authorizedNotificationIds.length} notifications deleted successfully`,
		});
	} catch (error) {
		logger.error(`DeleteManyNotification Controller: ${error}`);
		next(error);
	}
};
