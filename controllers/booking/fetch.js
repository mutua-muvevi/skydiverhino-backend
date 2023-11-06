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
const Booking = require("../../models/booking/booking");
const User = require("../../models/user/user");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

// Fetch all bookings
exports.fetchAllBookings = async (req, res, next) => {
	try {
		const start = performance.now();

		// Find all bookings
		const bookings = await Booking.find().sort({ createdAt: -1 }).lean();

		if (!bookings || bookings.length === 0) {
			return next(new ErrorResponse("No bookings found", 404));
		}

		res.status(200).json({
			success: true,
			count: bookings.length,
			data: bookings,
		});

		const end = performance.now();

		logger.info(`Bookings fetched successfully in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAllBookings: ${error.message}`);
		return next(error);
	}
};


// Fetch single booking by ID
exports.fetchBookingByID = async (req, res, next) => {
	const { bookingID } = req.params;

	// Validate the bookingID
	if (!bookingID || !mongoose.Types.ObjectId.isValid(bookingID)) {
		logger.warn("Validation error in fetchBookingByID: Invalid booking ID");
		return next(new ErrorResponse("Invalid booking ID", 400));
	}

	try {
		const start = performance.now();

		// Find the booking by ID
		const booking = await Booking.findById(bookingID).lean();

		if (!booking) {
			return next(new ErrorResponse("Booking not found", 404));
		}

		res.status(200).json({
			success: true,
			data: booking,
			message: "Booking fetched successfully",
		});

		const end = performance.now();

		logger.info(
			`Booking with ID: ${bookingID} fetched successfully in ${
				end - start
			}ms.`
		);
	} catch (error) {
		logger.error(`Error in fetchBookingByID: ${error.message}`);
		return next(error);
	}
};
