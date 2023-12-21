const express = require("express");
const router = express.Router();

//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

// controller inputs
const { createBlog } = require("../controllers/blog/new");
const { upload } = require("../utils/multer");
const { fetchAllBlogs, fetchBlogByID } = require("../controllers/blog/fetch");

//routes
router.post(
	"/:userID/post",
	authMiddleware,
	checkUserExistence,
	upload.fields([
		{ name: "thumbnail", maxCount: 1 },
		{ name: "image", maxCount: 10 },
	]),
	createBlog
);

router.get(
	"/fetch/all",
	fetchAllBlogs
);

router.get(
	"/fetch/:blogID",
	fetchBlogByID
)

//export
module.exports = router;
