const express = require("express");
const router = express.Router();

//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

// controller inputs
const { createService } = require("../controllers/service/new");
const { editService } = require("../controllers/service/edit");
const {
	fetchAllServices,
	fetchServiceByID,
} = require("../controllers/service/fetch");
const {
	deleteSingleService,
	deleteManyServices,
} = require("../controllers/service/delete");

//details controller inputs
const { addDetail, editDetail, deleteSingleDetail, deleteManyDetails } = require("../controllers/service/details");

//routes
router.post("/:userID/post", authMiddleware, checkUserExistence, createService);
router.put(
	"/:userID/edit/:serviceID",
	authMiddleware,
	checkUserExistence,
	editService
);
router.get(
	"/:userID/fetch/all",
	authMiddleware,
	checkUserExistence,
	fetchAllServices
);
router.get(
	"/:userID/fetch/single/:serviceID",
	authMiddleware,
	checkUserExistence,
	fetchServiceByID
);
router.delete(
	"/:userID/delete/single/:serviceID",
	authMiddleware,
	checkUserExistence,
	deleteSingleService
);
router.delete(
	"/:userID/delete/many",
	authMiddleware,
	checkUserExistence,
	deleteManyServices
);

//details routes
router.put(
	"/:userID/:serviceID/details/add",
	authMiddleware,
	checkUserExistence,
	addDetail
);
router.put(
	"/:userID/:serviceID/details/edit/:detailID",
	authMiddleware,
	checkUserExistence,
	editDetail
);
router.delete(
	"/:userID/:serviceID/details/delete/single/:detailID",
	authMiddleware,
	checkUserExistence,
	deleteSingleDetail
);
router.delete(
	"/:userID/:serviceID/details/delete/many",
	authMiddleware,
	checkUserExistence,
	deleteManyDetails
);

module.exports = router;
