const express = require("express");
const router = express.Router();

//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");
const { upload } = require("../utils/multer");
// controller inputs
const { deleteEvent } = require("../controllers/event/delete");
const { editEvent } = require("../controllers/event/edit");
const { createEvent } = require("../controllers/event/new");
const {
	fetchAllEvents,
	fetchEventByID,
} = require("../controllers/event/fetch");

//routes
router.post(
	"/:userID/post",
	authMiddleware,
	checkUserExistence,
	upload.single("thumbnail"),
	createEvent
);

router.put(
	"/:userID/edit/:eventID",
	authMiddleware,
	checkUserExistence,
	upload.single("thumbnail"),
	editEvent
);

router.get("/fetch/all", fetchAllEvents);
router.get("/fetch/:eventID", fetchEventByID);

router.delete(
	"/:userID/delete/:eventID",
	authMiddleware,
	checkUserExistence,
	deleteEvent
);

//export
module.exports = router;
