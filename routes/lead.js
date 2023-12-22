const express = require("express");
const router = express.Router();

//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

// controller inputs
const { createLead } = require("../controllers/lead/new");
const { editLead } = require("../controllers/lead/edit");
const { fetchAllLeads, fetchLeadByID } = require("../controllers/lead/fetch");
const { deleteLead, deleteLeads } = require("../controllers/lead/delete");

//routes
router.post("/post", createLead);
router.put(
	"/:userID/edit/:leadID",
	authMiddleware,
	checkUserExistence,
	editLead
);
router.get(
	"/:userID/fetch/all",
	authMiddleware,
	checkUserExistence,
	fetchAllLeads
);
router.get(
	"/:userID/fetch/single/:leadID",
	authMiddleware,
	checkUserExistence,
	fetchLeadByID
);
router.delete(
	"/:userID/delete/single/:leadID",
	authMiddleware,
	checkUserExistence,
	deleteLead
);
router.delete(
	"/:userID/delete/many",
	authMiddleware,
	checkUserExistence,
	deleteLeads
);

module.exports = router;