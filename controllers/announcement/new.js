/**
 * NEW ANNOUNCEMENT CONTROLLER
 * ===================================
 * This controller is responsible for creating a new announcement.
 *
 * Steps:
 * - Validate the request body
 * - Create a new announcement
 * - Save the announcement
 * - Push the announcement to the user's announcements array
 * - Create notification
 * - Log the success
 *
 */

//the imports
const Announcement = require("../../models/announcement/announcement");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

// controller
exports.createAnnouncement = async (req, res, next) => {
	const { title, description } = req.body;
	const user = req.user;

	//Step: validate the request body
	let errors = [];

	if (!title) errors.push("Announcement title is required");
	if (!description) errors.push("Announcement description is required");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in CreateAnnouncement Controller: ${errors.join(
				", "
			)}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//check if there is an announcement with similar title
		const announcements = await Announcement.find({ title });

		if (announcements.length > 0) {
			logger.warn(`Announcement with title: ${title} already exists`);
			return next(
				new ErrorResponse(
					"Announcement with this title already exists",
					400
				)
			);
		}

		//create the announcement
		const announcement = new Announcement({
			title,
			description,
			uploadedBy: user._id,
		});

		//save the announcement
		await announcement.save();

		//push the announcement to the user's announcements array
		user.announcements.push(announcement._id);

		//save the user
		await user.save();

		//create notification
		const notification = {
			details: `New announcement: ${title}`,
			type: "create",
			relatedModel: "Announcement",
			relatedModelID: announcement._id,
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		//return the response
		res.status(200).json({
			success: true,
			data: announcement ,
			message: "Announcement created successfully",
		});

		const end = performance.now();

		logger.info(
			`New announcement: ${title} created successfully in ${
				end - start
			}ms`
		);
	} catch (error) {
		logger.error(`Error creating new announcement: ${error.message}`);
		return next(new ErrorResponse("Error creating new announcement", 500));
	}
};