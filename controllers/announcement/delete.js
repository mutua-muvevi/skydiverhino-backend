/**
 * DELETE SINGE ANNOUNCEMENT
 * ===================================
 * This controller is responsible for deleting single announcement.
 *
 * Steps:
 * - Validate the request body
 * - Check if the announcement exists
 * - Delete the announcement
 * - Remove the announcement from the user's announcements array
 * - Send a response to the client
 * - Log the success
 *
 */

//the imports

const mongoose = require("mongoose");
const Announcement = require("../../models/announcement/announcement");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

//the controller
exports.deleteAnnouncement = async (req, res, next) => {
	const { announcementID } = req.params;
	const user = req.user;
	
	if (!announcementID || !mongoose.Types.ObjectId.isValid(announcementID)) {
		return next(new ErrorResponse("Invalid Announcement ID", 400));
	}

	try {
		const start = performance.now();

		// Find the announcement
		const announcement = await Announcement.findById(
			announcementID
		);

		if (!announcement) {
			return next(new ErrorResponse("Announcement not found", 404));
		}

		// Check if the user is authorized to delete the announcement
		if (announcement.uploadedBy.toString() !== user._id.toString()) {
			return next(
				new ErrorResponse(
					"You are not authorized to delete this announcement",
					401
				)
			);
		}

		// Remove the announcement from the user's announcements array
		user.announcements.pull(announcementID);
		await user.save();

		// Delete the announcement
		await Announcement.findByIdAndDelete(announcementID);

		// Send a response to the client
		res.status(200).json({
			success: true,
			data: {},
			message: "Announcement deleted successfully",
		});

		// Log the success
		const end = performance.now();
		logger.info(
			`Announcement deleted in ${end - start}ms: ${JSON.stringify({
				announcement,
			})}`
		);
	} catch (error) {
		logger.error(`Error deleting announcement: ${error}`)
		next(error);
	}
};


/**
 * DELETE MULTIPLE ANNOUNCEMENTS
 * ===================================
 * This controller is responsible for deleting multiple announcements.
 *
 * Steps:
 * - Validate the request body
 * - Check if the announcements exist
 * - Delete the announcements
 * - Remove the announcements from the user's announcements array
 * - Send a response to the client
 * - Log the success
 *
 */

//the controller
exports.deleteAnnouncements = async (req, res, next) => {
	const { announcementIDs } = req.body;
	const user = req.user;

	if (!announcementIDs || !Array.isArray(announcementIDs)) {
		return next(new ErrorResponse("Invalid Announcement IDs", 400));
	}

	try {
		const start = performance.now();

		// Find the announcements
		const announcements = await Announcement.find({
			_id: { $in: announcementIDs },
		});

		if (announcements.length !== announcementIDs.length) {
			return next(new ErrorResponse("Announcements not found", 404));
		}

		// Check if the user is authorized to delete the announcement
		for (let announcement of announcements) {
			if (announcement.uploadedBy.toString() !== user._id.toString()) {
				return next(
					new ErrorResponse(
						"You are not authorized to delete this announcement",
						401
					)
				);
			}
		}

		// Delete the announcements
		await Announcement.deleteMany({
			_id: { $in: announcementIDs },
		});

		// Remove the announcements from the user's announcements array
		user.announcements = user.announcements.filter(
			(announcementID) => !announcementIDs.includes(announcementID)
		);
		await user.save();

		// Send a response to the client
		res.status(200).json({
			success: true,
			data: {},
			message: "Announcements deleted successfully",
		});

		// Log the success
		const end = performance.now();
		logger.info(
			`Announcements deleted in ${end - start}ms: ${JSON.stringify({
				announcements,
			})}`
		);
	} catch (error) {
		next(error);
	}
};