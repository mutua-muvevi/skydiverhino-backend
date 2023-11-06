/**
 * NEW FAQ CONTROLLER
 * ========================
 * This controller is responsible for creating a new faq.
 *
 * Steps:
 * - Validate the request body
 * - Create a new faq
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

// controller
exports.createFAQ = async (req, res, next) => {
	const {
		question,
		answer
	} = req.body;
	const user = req.user;

	//Step: validate the request body
	let errors = [];

	if (!question) errors.push("FAQ question is required");
	if (!answer) errors.push("FAQ answer is required");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in CreateFAQ Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//check if there is a faq with similar fullname
		const faqs = await FAQ.find({ question });

		if (faqs.length > 0) {
			logger.warn(
				`FAQ with question: ${question} already exists in your account`
			);
			return next(
				new ErrorResponse(
					"FAQ with this question already exists in your account",
					400
				)
			);
		}


		//create the faq
		const faq = new FAQ({
			question,
			answer,
			createdBy: user._id,
		});

		if (!faq) {
			logger.error(`Error in creating new faq for user: {${user._id}}`);
			return next(new ErrorResponse("Error in creating faq", 500));
		}

		//save the faq
		await faq.save();

		//create notification
		const notification = {
			details: `A new faq ${question} has been created successfully`,
			type: "create",
			relatedModel: "FAQ",
			relatedModelID: faq._id,
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		// send response to faq
		res.status(201).json({
			success: true,
			message: "FAQ created successfully",
			data: faq,
		});

		const end = performance.now();

		//logging success
		logger.info(
			`FAQ created successfully for user: {${user._id}} in ${
				end - start
			}ms`
		);
	} catch (error) {
		logger.error(`Error in CreateFAQ Controller: ${error.message}`);
		next(error);
	}
};
