const express = require("express");
const router = express.Router();
//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

// controller inputs
const { createBooking } = require("../controllers/booking/new");

//routes
router.post("/post", createBooking);


module.exports = router;