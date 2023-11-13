const express = require("express");
const router = express.Router();

//controller imports
const { createManual } = require("../controllers/manual/new");
const { editManual } = require("../controllers/manual/edit");


//middlewares imports
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

//utils
const { upload } = require("../utils/multer");

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
)
console.log("No blockage in routes");

//export
module.exports = router;
