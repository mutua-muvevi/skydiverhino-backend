const mongoose = require("mongoose");
const Reservation = require("../../models/reservation/reservation");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//delete single reservation
exports.deleteReservation = async (req, res, next) => {
	const { reservationID } = req.params;

	//validate the reservationID
	if (!reservationID || !mongoose.Types.ObjectId.isValid(reservationID)) {
		logger.warn("Validation error in deleteReservation: Invalid reservation ID");
		return next(new ErrorResponse("Invalid reservation ID", 400));
	}

	try {
		const start = performance.now();

		//find the reservation by ID
		const reservation = await Reservation.findById(reservationID).lean();

		if (!reservation) {
			return next(new ErrorResponse("Reservation not found", 404));
		}

		//delete the reservation
		await Reservation.deleteOne({ _id: reservationID });

		res.status(200).json({
			success: true,
			message: "Reservation deleted successfully",
		});

		const end = performance.now();

		logger.info(`Reservation deleted successfully in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in deleteReservation: ${error.message}`);
		return next(error);
	}
};

//delete multiple reservations
exports.deleteReservations = async (req, res, next) => {
	const { reservationIDs } = req.body;

	//validate the reservationIDs
	if (!reservationIDs || reservationIDs.length < 1) {
		logger.warn("Validation error in deleteReservations: Invalid reservation IDs");
		return next(new ErrorResponse("Invalid reservation IDs", 400));
	}

	try {
		const start = performance.now();

		//find the reservations by IDs
		const reservations = await Reservation.find({
			_id: { $in: reservationIDs },
		}).lean();

		if (!reservations || reservations.length < 1) {
			return next(new ErrorResponse("Reservations not found", 404));
		}

		//delete the reservations
		await Reservation.deleteMany({ _id: { $in: reservationIDs } });

		res.status(200).json({
			success: true,
			message: "Reservations deleted successfully",
		});

		const end = performance.now();

		logger.info(`Reservations deleted successfully in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in deleteReservations: ${error.message}`);
		return next(error);
	}
};