/**
 * DELETE FAQ CONTROLLER
 *
 * Delete Single FAQ
 * Steps:
 * - Validate the faq id
 * - Find the faq
 * - Delete the faq
 *
 * Delete Multiple FAQs
 * Steps:
 * - Validate the faq ids
 * - Find the faqs
 * - Delete the faqs
 *
 */

//imports
const mongoose = require("mongoose");
const FAQ = require("../../models/faq/faq");
const Service = require("../../models/service/service");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

//delete single faq controller
exports.deleteFAQ = async (req, res, next) => {
	const { faqID } = req.params;
	const user = req.user;

	//Step: validate the faq id
	if (!faqID || !mongoose.Types.ObjectId.isValid(faqID)) {
		logger.warn(
			`Invalid faq ID provided in DeleteFAQ Controller: ${faqID}`
		);
		return next(new ErrorResponse("Invalid faq ID", 400));
	}

	try {
		const start = performance.now();

		//find and delete faq
		const faq = await FAQ.findByIdAndDelete(faqID);

		if (!faq) {
			return next(
				new ErrorResponse("You are not authorized to delete", 401)
			);
		}

		//create notification
		const notification = {
			details: `The faq has been deleted successfully`,
			type: "delete",
			relatedModel: "FAQ",
			relatedModelID: faq._id,
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		//send data to user
		res.status(200).json({
			success: true,
			data: {},
			message: "FAQ has deleted successfully",
		});

		const end = performance.now();

		//logging the success
		logger.info(
			`FAQ: ${faqID} deleted successfully by user : ${user._id} in ${
				end - start
			}ms`
		);
	} catch (error) {
		logger.error(`Error in DeleteFAQ Controller: ${error.message}`);
		next(error);
	}
};

//delete multiple faqs controller
exports.deleteFAQs = async (req, res, next) => {
	const { faqIDs } = req.body;
	const user = req.user;

	//Step: validate the faq ids
	if (
		!faqIDs ||
		!Array.isArray(faqIDs) ||
		faqIDs.length === 0 ||
		!faqIDs.every((id) => mongoose.Types.ObjectId.isValid(id))
	) {
		logger.warn(
			`Invalid faq IDs provided in DeleteFAQs Controller: ${faqIDs}`
		);
		return next(new ErrorResponse("Invalid faq IDs", 400));
	}

	try {
		const start = performance.now();

		//find the faqs that belong to this user
		await FAQ.deleteMany({ _id: { $in: faqIDs } });

		//create notification
		const notification = {
			details: `${faqIDs.length} faqs have been deleted successfully`,
			type: "delete",
			relatedModel: "FAQ",
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		//send data to user
		res.status(200).json({
			success: true,
			data: {},
			message: "FAQs have deleted successfully",
		});

		const end = performance.now();

		//logging the success
		logger.info(
			`${faqIDs.length} FAQs deleted successfully by user : ${
				user._id
			} in ${end - start}ms`
		);
	} catch (error) {
		logger.error(`Error in deleteManyFAQs Controller: ${error.message}`);
		next(error);
	}
};
