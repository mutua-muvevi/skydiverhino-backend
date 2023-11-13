const express = require("express");
const router = express.Router();

//controller imports
const { createManual } = require("../controllers/manual/new");

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
console.log("No blockage in routes");

//export
module.exports = router;
