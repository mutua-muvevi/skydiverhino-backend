const express = require("express");
const router = express.Router();

//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

//utils
const { upload } = require("../utils/multer");

//controllers
const { createCurriculum } = require("../controllers/curriculum/new");
const { editCurriculum } = require("../controllers/curriculum/edit");
const { deleteCurriculum } = require("../controllers/curriculum/delete");

//routes
router.post(
	"/:userID/new",
	authMiddleware,
	checkUserExistence,
	upload.single("file"),
	createCurriculum
);
router.put(
	"/:userID/edit/:curriculumID",
	authMiddleware,
	checkUserExistence,
	upload.single("file"),
	editCurriculum
);
router.delete(
	"/:userID/delete/:curriculumID",
	authMiddleware,
	checkUserExistence,
	deleteCurriculum
);

//export
module.exports = router;