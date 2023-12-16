const express = require("express");
const router = express.Router();
//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

// controller inputs
const { createReservation } = require("../controllers/reservation/new");
const {
	fetchAllReservations,
	fetchReservationByID,
} = require("../controllers/reservation/fetch");
const { deleteReservation, deleteReservations } = require("../controllers/reservation/delete");

//routes
router.post("/post", createReservation);
router.get(
	"/:userID/fetch/all",
	authMiddleware,
	checkUserExistence,
	fetchAllReservations
);
router.get(
	"/:userID/fetch/single/:reservationID",
	authMiddleware,
	checkUserExistence,
	fetchReservationByID
);
//delete single reservation
router.delete(
	"/:reservationID/delete",
	authMiddleware,
	checkUserExistence,
	deleteReservation
);


//delete multiple reservations
router.delete(
	"/delete/multiple",
	authMiddleware,
	checkUserExistence,
	deleteReservations
);

module.exports = router;
