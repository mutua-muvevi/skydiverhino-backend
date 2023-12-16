//imports
const mongoose = require("mongoose");
const Service = require("../../models/service/service");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//POST FAQ CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Push the faq to the service array
// 4. Save the service
// 5. Log the success

//controller
exports.addFAQ = async (req, res, next) => {
	const { question, answer } = req.body;
	const serviceID = req.params.serviceID;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!question) errors.push("FAQ question is required");

	if (!answer) errors.push("FAQ answer is required");

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in AddFaq Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		//Step: Find the service
		const service = await Service.findById(serviceID);

		if (!service) {
			logger.warn(
				`Service not found in AddFaq Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Push the faq to the service array
		service.faqs.push({ question, answer });

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`AddFaq Controller success: ${user.email} added a new faq to ${service.name}`
		);

		res.status(201).json({
			success: true,
			message: "FAQ added successfully",
		});
	} catch (error) {
		logger.error(`AddFaq Controller Error: ${error.message}`);
		next(error);
	}
};

//EDIT FAQ CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Find the faq
// 4. Update the faq
// 5. Save the service
// 6. Log the success

//controller
exports.editFAQ = async (req, res, next) => {
	const { question, answer } = req.body;
	const serviceID = req.params.serviceID;
	const faqID = req.params.faqID;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!question) errors.push("FAQ question is required");

	if (!answer) errors.push("FAQ answer is required");

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (!faqID || !mongoose.isValidObjectId(faqID))
		errors.push("FAQ ID is required and must be a valid ID");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in EditFaq Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		//Step: Find the service
		const service = await Service.findById(serviceID);

		if (!service) {
			logger.warn(
				`Service not found in EditFaq Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Find the faq
		const faq = service.faqs.find((faq) => faq._id == faqID);

		if (!faq) {
			logger.warn(`FAQ not found in EditFaq Controller: ${faqID}`);
			return next(new ErrorResponse("FAQ not found", 404));
		}

		//Step: Update the faq
		faq.question = question;
		faq.answer = answer;

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`EditFaq Controller success: ${user.email} edited a faq in ${service.name}`
		);

		res.status(200).json({
			success: true,
			message: "FAQ edited successfully",
		});
	} catch (error) {
		logger.error(`EditFaq Controller Error: ${error.message}`);
		next(error);
	}
};

//DELETE SINGLE FAQ CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Find the faq
// 4. Remove the faq
// 5. Save the service
// 6. Log the success

//controller
exports.deleteSingleFAQ = async (req, res, next) => {
	const serviceID = req.params.serviceID;
	const faqID = req.params.faqID;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (!faqID || !mongoose.isValidObjectId(faqID))
		errors.push("FAQ ID is required and must be a valid ID");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in DeleteFaq Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		//Step: Find the service
		const service = await Service.findById(serviceID);

		if (!service) {
			logger.warn(
				`Service not found in DeleteFaq Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Find the faq
		const faq = service.faqs.find((faq) => faq._id == faqID);

		if (!faq) {
			logger.warn(`FAQ not found in DeleteFaq Controller: ${faqID}`);
			return next(new ErrorResponse("FAQ not found", 404));
		}

		//Step: Remove the faq
		service.faqs = service.faqs.filter((faq) => faq._id != faqID);

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`DeleteFaq Controller success: ${user.email} deleted a faq in ${service.name}`
		);

		res.status(200).json({
			success: true,
			message: "FAQ deleted successfully",
		});
	} catch (error) {
		logger.error(`DeleteFaq Controller Error: ${error.message}`);
		next(error);
	}
};


//DELETE MANY FAQ CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Remove the faqs
// 4. Save the service
// 5. Log the success

//controller
exports.deleteManyFAQs = async (req, res, next) => {
	const serviceID = req.params.serviceID;
	const user = req.user;
	const faqIDs = req.body.faqIDs;

	//Step: Validate the request body
	const errors = [];

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (!faqIDs || faqIDs.length == 0)
		errors.push("FAQ IDs are required and must be an array of IDs");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in DeleteManyFaqs Controller: ${errors.join(
				", "
			)}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		//Step: Find the service
		const service = await Service.findById(serviceID);

		if (!service) {
			logger.warn(
				`Service not found in DeleteManyFaqs Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Remove the faqs
		service.faqs = service.faqs.filter(
			(faq) => !faqIDs.includes(faq._id.toString())
		);

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`DeleteManyFaqs Controller success: ${user.email} deleted faqs in ${service.name}`
		);

		res.status(200).json({
			success: true,
			message: "FAQs deleted successfully",
		});
	} catch (error) {
		logger.error(`DeleteManyFaqs Controller Error: ${error.message}`);
		next(error);
	}
};