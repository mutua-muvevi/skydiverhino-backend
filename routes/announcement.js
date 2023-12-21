const express = require("express");
const router = express.Router();

//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");
// controller inputs
const { createAnnouncement } = require("../controllers/announcement/new");
const {
	deleteAnnouncement,
	deleteAnnouncements,
} = require("../controllers/announcement/delete");
const {
	fetchAllAnnouncements,
	fetchAnnouncementByID,
} = require("../controllers/announcement/fetch");

//routes
router.post(
	"/:userID/post",
	authMiddleware,
	checkUserExistence,
	createAnnouncement
);

router.get("/fetch/all", fetchAllAnnouncements);
router.get("/fetch/single/:announcementID", fetchAnnouncementByID);

router.delete(
	"/:userID/delete/single/:announcementID",
	authMiddleware,
	checkUserExistence,
	deleteAnnouncement
);

router.delete(
	"/:userID/delete/multiple",
	authMiddleware,
	checkUserExistence,
	deleteAnnouncements
);

//export
module.exports = router;
