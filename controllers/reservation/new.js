/**
 * NEW Reservation CONTROLLER
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
const Reservation = require("../../models/reservation/reservation");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

// controller
exports.createReservation = async (req, res, next) => {
	const { date, participants, agreements } = req.body;

	//Step: validate the request body
	let errors = [];

	if (!date) errors.push("Reservation date is required");
	if(!participants || participants.length < 1) errors.push("Reservation participants are required");
	if(!agreements || agreements.length < 1) errors.push("Reservation agreements are required");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in CreateReservation Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//create the booking
		const booking = await Reservation.create({
			date,
			participants,
			agreements,
		});
		
		if(!booking) {
			logger.warn(`Reservation not created`);
			return next(new ErrorResponse(`Reservation not created`, 400));
		}
		
		
		//create notification
		const notification = {
			details: `Reservation created by succsessfully`,
			type: "create",
			relatedModel: "Reservation",
			relatedModelID: booking._id
		};
		// return res.send(booking)
		// console.log("Reservation", booking)
		
		req.body = notification;
		await createNotification(req, res, next);

		//return success
		res.status(201).json({
			success: true,
			message: "Reservation created successfully",
			data: booking,
		});

		//log success
		const timeElapsed = performance.now() - start;
		logger.info(
			`CreateReservation Controller success, Time elapsed: ${timeElapsed} ms`
		);
	} catch (error) {
		logger.error(`CreateReservation Controller error: ${error.message}`);
		return next(new ErrorResponse(error.message, 500));
	}


}