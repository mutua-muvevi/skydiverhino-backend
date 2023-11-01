const express = require("express");
const router = express.Router();

//middlewares imports
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

//controller imports
const {
	deleteOneNotification,
	deleteManyNotifications,
} = require("../controllers/notification/delete");
const { fetchAllNotifications, fetchNotificationByID, fetchAllUsersNotifications } = require("../controllers/notification/fetch");

//routes
//fetch routes
router.get(
	"/:userID/fetch/all",
	authMiddleware,
	checkUserExistence,
	fetchAllNotifications
);
router.get(
	"/:userID/fetch/single/:notificationID",
	authMiddleware,
	checkUserExistence,
	fetchNotificationByID
);
router.get(
	"/:userID/fetch/many",
	authMiddleware,
	checkUserExistence,
	fetchAllUsersNotifications
);

//delete routes
router.delete(
	"/:userID/delete/many",
	authMiddleware,
	checkUserExistence,
	deleteManyNotifications
);
router.delete(
	"/:userID/delete/single/:notificationID",
	authMiddleware,
	checkUserExistence,
	deleteOneNotification
);

module.exports = router;
