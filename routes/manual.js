const express = require("express");
const router = express.Router();

//middlewares imports
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

//utils
const { upload } = require("../utils/multer");

//controller imports
const { createManual } = require("../controllers/manual/new");
const { editManual } = require("../controllers/manual/edit");
const { deleteManual } = require("../controllers/manual/delete");
const { fetchAllManuals, fetchManualByID } = require("../controllers/manual/fetch");

//routes
router.post(
	"/:userID/new",
	authMiddleware,
	checkUserExistence,
	upload.single("file"),
	createManual
);
router.put(
	"/:userID/edit/:manualID",
	authMiddleware,
	checkUserExistence,
	upload.single("file"),
	editManual
);
router.delete(
	"/:userID/delete/:manualID",
	authMiddleware,
	checkUserExistence,
	deleteManual
);
router.get(
	"/:userID/fetch/all",
	authMiddleware,
	checkUserExistence,
	fetchAllManuals
);
router.get(
	"/:userID/fetch/single/:manualID",
	authMiddleware,
	checkUserExistence,
	fetchManualByID
)

//export
module.exports = router;
