//imports
const mongoose = require("mongoose");
const Service = require("../../models/service/service");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//POST REQUIREMENT CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Push the prices to the service array
// 4. Save the service
// 5. Log the success

//controller
exports.addPrice = async (req, res, next) => {
	const { title, listItems, price } = req.body;
	const serviceID = req.params.serviceID;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!title) errors.push("Price title is required");

	if (!listItems) errors.push("Price listItems is required");

	if (!price) errors.push("Price is required");

	//check if price is an object
	if (price && typeof price !== "object")
		errors.push("Price must be an object");

	//check if price object has amount and currency
	if (price && (!price.amount || !price.currency))
		errors.push("Price must have amount and currency");

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in AddPrice Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		//Step: Find the service
		const service = await Service.findById(serviceID);

		if (!service) {
			logger.warn(
				`Service not found in AddPrice Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Push the prices to the service array
		service.prices.push({ title, listItems, price });

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`AddPrice Controller success: ${user.email} added a new price to ${service.name}`
		);

		res.status(201).json({
			success: true,
			message: "Price added successfully",
		});
	} catch (error) {
		logger.error(`AddPrice Controller Error: ${error.message}`);
		next(error);
	}
};

//EDIT PRICE CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Push the prices to the service array
// 4. Save the service
// 5. Log the success

//controller
exports.editPrice = async (req, res, next) => {
	const {
		title,
		listItems,
		price: { amount, currency },
	} = req.body;
	const serviceID = req.params.serviceID;
	const priceID = req.params.priceID;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!title) errors.push("Price title is required");

	if (!listItems) errors.push("Price listItems is required");

	if ((!amount, !currency))
		errors.push("Price amount and currency are required");

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (!priceID || !mongoose.isValidObjectId(priceID))
		errors.push("Price ID is required and must be a valid ID");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in EditPrice Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		//Step: Find the service
		const service = await Service.findById(serviceID);

		if (!service) {
			logger.warn(
				`Service not found in EditPrice Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Find the price
		const price = service.prices.find((price) => price._id == priceID);

		if (!price) {
			logger.warn(`Price not found in EditPrice Controller: ${priceID}`);
			return next(new ErrorResponse("Price not found", 404));
		}

		//Step: Update the price
		price.title = title;
		price.listItems = listItems;
		price.price = { amount, currency };

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`EditPrice Controller success: ${user.email} edited a price in ${service.name}`
		);

		res.status(200).json({
			success: true,
			message: "Price edited successfully",
		});
	} catch (error) {
		logger.error(`EditPrice Controller Error: ${error.message}`);
		next(error);
	}
};

//DELETE PRICE CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Find the price
// 4. Delete the price
// 5. Save the service
// 6. Log the success

//controller
exports.deleteSinglePrice = async (req, res, next) => {
	const serviceID = req.params.serviceID;
	const priceID = req.params.priceID;
	const user = req.user;

	//Step: Validate the request body
	const errors = [];

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (!priceID || !mongoose.isValidObjectId(priceID))
		errors.push("Price ID is required and must be a valid ID");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in DeletePrice Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		//Step: Find the service
		const service = await Service.findById(serviceID);

		if (!service) {
			logger.warn(
				`Service not found in DeletePrice Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Find the price
		const price = service.prices.find((price) => price._id == priceID);

		if (!price) {
			logger.warn(
				`Price not found in DeletePrice Controller: ${priceID}`
			);
			return next(new ErrorResponse("Price not found", 404));
		}

		//Step: Delete the price
		service.prices.remove(priceID);

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`DeletePrice Controller success: ${user.email} deleted a price in ${service.name}`
		);

		res.status(200).json({
			success: true,
			message: "Price deleted successfully",
		});
	} catch (error) {
		logger.error(`DeletePrice Controller Error: ${error.message}`);
		next(error);
	}
};

//DELETE MANY PRICES CONTROLLER
//-----------------------------------------------------------------
//Steps:
// 1. Validate the request body
// 2. Find the service
// 3. Find the prices
// 4. Delete the prices
// 5. Save the service
// 6. Log the success

//controller
exports.deleteManyPrices = async (req, res, next) => {
	const serviceID = req.params.serviceID;
	const user = req.user;
	const { priceIDs } = req.body;

	//Step: Validate the request body
	const errors = [];

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (!priceIDs || !Array.isArray(priceIDs))
		errors.push("Prices is required and must be an array");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in DeleteManyPrices Controller: ${errors.join(
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
				`Service not found in DeleteManyPrices Controller: ${serviceID}`
			);
			return next(new ErrorResponse("Service not found", 404));
		}

		//Step: Delete the priceIDs
		priceIDs.forEach((priceID) => {
			service.prices.remove(priceID);
		});

		//Step: Save the service
		await service.save();

		//Step: Log the success
		logger.info(
			`DeleteManyPrices Controller success: ${user.email} deleted prices in ${service.name}`
		);

		res.status(200).json({
			success: true,
			message: "Prices deleted successfully",
		});
	} catch (error) {
		logger.error(`DeleteManyPrices Controller Error: ${error.message}`);
		next(error);
	}
};
