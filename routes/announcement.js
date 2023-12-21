const express = require("express");
const router = express.Router();

//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

// controller inputs
const { createAnnouncement } = require("../controllers/announcement/new");
const { fetchAllAnnouncements, fetchAnnouncementByID } = require("../controllers/announcement/fetch");
const { deleteAnnouncement, deleteAnnouncements } = require("../controllers/announcement/delete");

//routes
router.post(
	"/:userID/post",
	authMiddleware,
	checkUserExistence,
	createAnnouncement
);

router.get("/fetch/all", fetchAllAnnouncements);
router.get("/fetch/:announcementID", fetchAnnouncementByID);

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