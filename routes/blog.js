const express = require("express");
const router = express.Router();

//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

// controller inputs
const { createBlog } = require("../controllers/blog/new");
const { upload } = require("../utils/multer");

//routes
router.post(
	"/:userID/post",
	authMiddleware,
	checkUserExistence,
	upload.fields([
		{ name: "thumbnail", maxCount: 1 },
		{ name: "contentImages", maxCount: 10 },
	]),
	createBlog
);

//export
module.exports = router;
