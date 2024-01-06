const express = require("express");
const router = express.Router();

//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");
const { upload } = require("../utils/multer");

// controller inputs
const { createHomepage } = require("../controllers/homepage/new");
const { editHomepage } = require("../controllers/homepage/edit");
const { fetchHomepage } = require("../controllers/homepage/fetch");

//routes
router.post(
	"/:userID/post",
	authMiddleware,
	checkUserExistence,
	upload.fields([
		{ name: "banner", maxCount: 1 },
		{ name: "introBackgroundImage", maxCount: 1 },
		{ name: "tandemBackgroundImage", maxCount: 1 },
		{ name: "tandemGallery", maxCount: 10 },
		{ name: "affBackgroundImage", maxCount: 1 },
		{ name: "affGallery", maxCount: 10 },
		{ name: "subscribeImage", maxCount: 1 },
		{ name: "subscribeBackgroundImage", maxCount: 1 },
		{ name: "footerBackgroundImage", maxCount: 1 },
		{ name: "bannerVideo", maxCount: 1 },
	]),
	createHomepage
);

router.put(
	"/:userID/edit",
	authMiddleware,
	checkUserExistence,
	upload.fields([
		{ name: "banner", maxCount: 1 },
		{ name: "introBackgroundImage", maxCount: 1 },
		{ name: "tandemBackgroundImage", maxCount: 1 },
		{ name: "tandemGallery", maxCount: 10 },
		{ name: "affBackgroundImage", maxCount: 1 },
		{ name: "affGallery", maxCount: 10 },
		{ name: "subscribeImage", maxCount: 1 },
		{ name: "subscribeBackgroundImage", maxCount: 1 },
		{ name: "footerBackgroundImage", maxCount: 1 },
		{ name: "bannerVideo", maxCount: 1 },
	]),
	editHomepage
);

router.get("/fetch", fetchHomepage);

module.exports = router;