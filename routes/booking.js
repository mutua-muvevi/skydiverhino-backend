const express = require("express");
const router = express.Router();
//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

// controller inputs
const { createBooking } = require("../controllers/booking/new");
const { fetchAllBookings, fetchBookingByID } = require("../controllers/booking/fetch");

//routes
router.post("/post", createBooking);
router.get("/:userID/fetch/all", authMiddleware, checkUserExistence, fetchAllBookings);
router.get(
	"/:userID/fetch/single/:bookingID",
	authMiddleware,
	checkUserExistence,
	fetchBookingByID
);

module.exports = router;
