const express = require("express");
const router = express.Router();

//middlewares
const { upload } = require("../utils/multer");
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

const { fetchStorage } = require("../controllers/storage/fetch");
const { addNewFile } = require("../controllers/storage/new");
const { deleteFile } = require("../controllers/storage/delete");
const { downloadFile } = require("../controllers/storage/download");
console.log("The storage in routes");

//routes
router.get(
	"/:userID/fetch",
	authMiddleware,
	checkUserExistence,
	fetchStorage
);

router.post(
	"/:userID/new",
	authMiddleware,
	checkUserExistence,
	upload.single("file"),
	addNewFile
);

router.delete(
	"/:userID/delete/:filename",
	authMiddleware,
	checkUserExistence,
	deleteFile
);

router.get(
	"/:userID/download/:filename",
	authMiddleware,
	checkUserExistence,
	downloadFile
);

//export
module.exports = router;