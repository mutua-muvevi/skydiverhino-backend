const express = require("express");
const router = express.Router();

//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

// controller inputs
const { createFAQ } = require("../controllers/faq/new");
const { editFAQ } = require("../controllers/faq/edit");
const { fetchAllFAQs, fetchFAQByID } = require("../controllers/faq/fetch");
const { deleteFAQ, deleteFAQs } = require("../controllers/faq/delete");

//routes
router.post("/:userID/post", authMiddleware, checkUserExistence, createFAQ);
router.put("/:userID/edit/:FAQID", authMiddleware, checkUserExistence, editFAQ);
router.get(
	"/:userID/fetch/all",
	authMiddleware,
	checkUserExistence,
	fetchAllFAQs
);
router.get(
	"/:userID/fetch/single/:FAQID",
	authMiddleware,
	checkUserExistence,
	fetchFAQByID
);
router.delete(
	"/:userID/delete/single/:faqID",
	authMiddleware,
	checkUserExistence,
	deleteFAQ
);
router.delete(
	"/:userID/delete/many",
	authMiddleware,
	checkUserExistence,
	deleteFAQs
);

module.exports = router;
