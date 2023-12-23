const express = require("express");
const router = express.Router();

//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

// controller inputs
const { createClient } = require("../controllers/client/new");
const { editClient } = require("../controllers/client/edit");
const { fetchAllClients, fetchClientByID } = require("../controllers/client/fetch");
const { deleteClient, deleteClients } = require("../controllers/client/delete");
const { upload } = require("../utils/multer");
const { addFileToClient } = require("../controllers/client/addfile");
const { removeFileFromClient } = require("../controllers/client/removefile");
const { convertToClient } = require("../controllers/client/convertlead");

//routes
router.post("/:userID/post", authMiddleware, checkUserExistence, createClient);
router.put(
	"/:userID/edit/:clientID",
	authMiddleware,
	checkUserExistence,
	editClient
);
router.get(
	"/:userID/fetch/all",
	authMiddleware,
	checkUserExistence,
	fetchAllClients
);
router.get(
	"/:userID/fetch/single/:clientID",
	authMiddleware,
	checkUserExistence,
	fetchClientByID
);
router.delete(
	"/:userID/delete/single/:clientID",
	authMiddleware,
	checkUserExistence,
	deleteClient
);
router.delete(
	"/:userID/delete/many",
	authMiddleware,
	checkUserExistence,
	deleteClients
);
router.put(
	"/:userID/edit/:clientID/addfile",
	authMiddleware,
	checkUserExistence,
	upload.single("file"),
	addFileToClient
);
router.put(
	"/:userID/edit/:clientID/removefile",
	authMiddleware,
	checkUserExistence,
	removeFileFromClient
);
router.get(
	"/:userID/convert/lead/:leadID",
	authMiddleware,
	checkUserExistence,
	convertToClient
)

//export
module.exports = router;