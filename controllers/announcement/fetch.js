/**
 * FETCH ALL ANNOUNCEMENTS
 * ===================================
 * This controller is responsible for fetching all announcements.
 *
 * Steps:
 * - Validate the request body
 * - Fetch all announcements
 * - Send a response to the client
 * - Log the success
 *
 */

//imports
//imports
const mongoose = require("mongoose");
const Announcement = require("../../models/announcement/announcement");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//the controller
exports.fetchAllAnnouncements = async (req, res, next) => {
	try {
		const start = performance.now();

		//fetch all announcements
		const announcements = await Announcement.find({})
			.lean()
			.sort({ createdAt: -1 })
			.populate({
				path: "uploadedBy",
				select: "fullname -_id",
			});

		//send a response to the client
		res.status(200).json({
			success: true,
			data: announcements,
			message: "Announcements fetched successfully",
		});

		//log the success
		const end = performance.now();
		logger.info(
			`Announcements fetched in ${end - start}ms}`
		);
	} catch (error) {
		next(error);
	}
};


/**
 * FETCH A SINGLE ANNOUNCEMENT
 * ===================================
 * This controller is responsible for fetching a single announcement.
 *
 * Steps:
 * - Validate the request body
 * - Fetch the announcement
 * - Send a response to the client
 * - Log the success
 *
 */


//the controller
exports.fetchAnnouncementByID = async (req, res, next) => {
	const { announcementID } = req.params;

	if (!announcementID || !mongoose.Types.ObjectId.isValid(announcementID)) {
		return next(new ErrorResponse("Invalid announcement id", 400));
	}

	try {
		const start = performance.now();

		//fetch the announcement
		const announcement = await Announcement.findById(announcementID)
			.lean()
			.select("-updatedAt")
			.populate({
				path: "uploadedBy",
				select: "fullname email",
			});

		//send a response to the client
		res.status(200).json({
			success: true,
			data: announcement,
			message: "Announcement fetched successfully",
		});

		//log the success
		const end = performance.now();
		logger.info(
			`Announcement fetched in ${end - start}ms:}`
		);
	} catch (error) {
		next(error);
	}
};