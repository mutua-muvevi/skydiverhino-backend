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
)
console.log("No blockage in routes");

//export
module.exports = router;
