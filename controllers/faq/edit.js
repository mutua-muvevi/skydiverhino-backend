/**
 * EDIT FAQ CONTROLLER
 * ===========================
 * This controller is responsible for editing a faq.
 *
 * Steps:
 * - Validate the request body
 * - Find and edit the faq
 * - Save the faq
 * - Create notification
 * - Log the success
 *
 */

//the imports
const mongoose = require("mongoose");
const FAQ = require("../../models/faq/faq");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

//controller
exports.editFAQ = async (req, res, next) => {
	const {
		question,
		answer
	} = req.body;
	const user = req.user;
	const { FAQID } = req.params;

	
	//Step: validate the request params
	let errors = [];

	if (!FAQID || !mongoose.Types.ObjectId.isValid(FAQID))
		errors.push("FAQ ID is required");


	if (errors.length > 0) {
		logger.warn(
			`Validation error in EditFAQ Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	//updating the fields
	const updatedFAQ = {};

	if (question) updatedFAQ.question = question;
	if (answer) updatedFAQ.answer = answer;

	try {
		const start = performance.now();

		const faq = await  FAQ.findByIdAndUpdate(
			FAQID,
			{ $set: updatedFAQ },
			{ new: true }
		);

		//create notification
		const notification = {
			details: `FAQ has been edited successfully`,
			type: "edit",
			relatedModel: "FAQ",
			relatedModelID: faq._id,
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		// send response
		res.status(200).json({
			success: true,
			message: "FAQ edited successfully",
			data: faq,
		});

		const end = performance.now();

		//logging success
		logger.info(
			`FAQ edited successfully for user: {${user._id}} in ${
				end - start
			}ms`
		);
	} catch (error) {
		console.log("Error", error)
		logger.error(`Error in EditClient Controller: ${error.message}`);
		next(error);
	}
}