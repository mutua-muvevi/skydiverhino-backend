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

//requirement controller inputs
const { addRequirement, editRequirement, deleteSingleRequirement, deleteManyRequirements } = require("../controllers/service/requirement");

//price controller inputs
const { addPrice, editPrice, deleteSinglePrice, deleteManyPrices } = require("../controllers/service/prices");

//faq controller inputs
const { addFAQ, editFAQ, deleteSingleFAQ, deleteManyFAQs } = require("../controllers/service/faq");

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

//requirement controller
router.put(
	"/:userID/:serviceID/requirement/add",
	authMiddleware,
	checkUserExistence,
	addRequirement
);
router.put(
	"/:userID/:serviceID/requirement/edit/:requirementID",
	authMiddleware,
	checkUserExistence,
	editRequirement
);
router.delete(
	"/:userID/:serviceID/requirement/delete/single/:requirementID",
	authMiddleware,
	checkUserExistence,
	deleteSingleRequirement
);
router.delete(
	"/:userID/:serviceID/requirement/delete/many",
	authMiddleware,
	checkUserExistence,
	deleteManyRequirements
);

//price controller
router.put(
	"/:userID/:serviceID/price/add",
	authMiddleware,
	checkUserExistence,
	addPrice
);
router.put(
	"/:userID/:serviceID/price/edit/:priceID",
	authMiddleware,
	checkUserExistence,
	editPrice
);
router.delete(
	"/:userID/:serviceID/price/delete/single/:priceID",
	authMiddleware,
	checkUserExistence,
	deleteSinglePrice
);
router.delete(
	"/:userID/:serviceID/price/delete/many",
	authMiddleware,
	checkUserExistence,
	deleteManyPrices
);

//faq controller
router.put(
	"/:userID/:serviceID/faq/add",
	authMiddleware,
	checkUserExistence,
	addFAQ
);
router.put(
	"/:userID/:serviceID/faq/edit/:faqID",
	authMiddleware,
	checkUserExistence,
	editFAQ
);
router.delete(
	"/:userID/:serviceID/faq/delete/single/:faqID",
	authMiddleware,
	checkUserExistence,
	deleteSingleFAQ
);
router.delete(
	"/:userID/:serviceID/faq/delete/many",
	authMiddleware,
	checkUserExistence,
	deleteManyFAQs
);

module.exports = router;
