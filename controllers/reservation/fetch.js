/**
 * FETCH CONTROLLERS FOR MEMBER
 *
 * Fetch All Members:
 *
 * Fetch All Members for Team:
 *
 * Fetch Single Member By ID:
 *
 */

// packages import
const mongoose = require("mongoose");
const Reservation = require("../../models/reservation/reservation");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

// Fetch all bookings
exports.fetchAllReservations = async (req, res, next) => {
	try {
		const start = performance.now();

		// Find all bookings
		const bookings = await Reservation.find().sort({ createdAt: -1 }).lean();

		if (!bookings || bookings.length === 0) {
			return next(new ErrorResponse("No bookings found", 404));
		}

		res.status(200).json({
			success: true,
			count: bookings.length,
			data: bookings,
		});

		const end = performance.now();

		logger.info(`Reservations fetched successfully in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAllReservations: ${error.message}`);
		return next(error);
	}
};


// Fetch single booking by ID
exports.fetchReservationByID = async (req, res, next) => {
	const { bookingID } = req.params;

	// Validate the bookingID
	if (!bookingID || !mongoose.Types.ObjectId.isValid(bookingID)) {
		logger.warn("Validation error in fetchReservationByID: Invalid booking ID");
		return next(new ErrorResponse("Invalid booking ID", 400));
	}

	try {
		const start = performance.now();

		// Find the booking by ID
		const booking = await Reservation.findById(bookingID).lean();

		if (!booking) {
			return next(new ErrorResponse("Reservation not found", 404));
		}

		res.status(200).json({
			success: true,
			data: booking,
			message: "Reservation fetched successfully",
		});

		const end = performance.now();

		logger.info(
			`Reservation with ID: ${bookingID} fetched successfully in ${
				end - start
			}ms.`
		);
	} catch (error) {
		logger.error(`Error in fetchReservationByID: ${error.message}`);
		return next(error);
	}
};
