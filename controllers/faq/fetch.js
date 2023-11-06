/**
 * FETCH LEAD CONTROLLER
 * ==========================
 *
 * Fetch All FAQs:
 *
 * Fetch All FAQs for User:
 *
 * Fetch Single FAQ:
 *
 */

//package import
const mongoose = require("mongoose");
const FAQ = require("../../models/faq/faq");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//fetch all faqs in the database
exports.fetchAllFAQs = async (req, res, next) => {
	try {
		const start = performance.now();

		//find all faqs
		const faqs = await FAQ.find().sort({ createdAt: -1 }).lean();

		if (!faqs) {
			return next(new ErrorResponse("No faqs found", 404));
		}

		//send a success response back to the faq with the list of faqs
		res.status(200).json({
			success: true,
			count: faqs.length,
			data: faqs,
		});

		const end = performance.now();

		logger.info(`Fetched all faqs in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAll FAQs: ${error.message}`);
		next(error);
	}
};

//fetch a single faq
exports.fetchFAQByID = async (req, res, next) => {
	const { FAQID } = req.params;
	const user = req.user;

	if (!mongoose.Types.ObjectId.isValid(FAQID)) {
		return next(new ErrorResponse("Invalid faq id", 400));
	}

	try {
		const start = performance.now();

		//find the faq
		const faq = await FAQ.findOne({
			_id: FAQID,
		}).lean();

		if (!faq) {
			return next(new ErrorResponse("FAQ not found", 404));
		}

		//send a success response back to the faq with the faq
		res.status(200).json({
			success: true,
			data: faq,
		});

		const end = performance.now();

		logger.info(
			`Fetched faq: {${FAQID}} for user: {${user._id}} in ${
				end - start
			}ms.`
		);
	} catch (error) {
		logger.error(`Error in fetchFAQByID: ${error.message}`);
		next(error);
	}
};
