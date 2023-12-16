/**
 * NEW Booking CONTROLLER
 * ========================
 * This controller is responsible for creating a new bookings.
 *
 * Steps:
 * - Validate the request body
 * - Create a new bookings
 * - Save the bookings
 * - Create notification
 * - Log the success
 *
 */

//imports
const Booking = require("../../models/booking/booking");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

// controller
exports.createBooking = async (req, res, next) => {
	const { date, participants, agreements } = req.body;
	console.log("Booking Body", req.body)

	//Step: validate the request body
	let errors = [];

	if (!date) errors.push("Booking date is required");
	if(!participants || participants.length < 1) errors.push("Booking participants are required");
	if(!agreements || agreements.length < 1) errors.push("Booking agreements are required");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in CreateBooking Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//create the booking
		const booking = await Booking.create({
			date,
			participants,
			agreements,
		});
		
		if(!booking) {
			logger.warn(`Booking not created`);
			return next(new ErrorResponse(`Booking not created`, 400));
		}
		
		
		//create notification
		const notification = {
			details: `Booking created by succsessfully`,
			type: "create",
			relatedModel: "Booking",
			relatedModelID: booking._id
		};
		// return res.send(booking)
		// console.log("Booking", booking)
		
		req.body = notification;
		await createNotification(req, res, next);

		//return success
		res.status(201).json({
			success: true,
			message: "Booking created successfully",
			data: booking,
		});

		//log success
		const timeElapsed = performance.now() - start;
		logger.info(
			`CreateBooking Controller success, Time elapsed: ${timeElapsed} ms`
		);
	} catch (error) {
		logger.error(`CreateBooking Controller error: ${error.message}`);
		return next(new ErrorResponse(error.message, 500));
	}


}