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
const { fetchAllCurriculums, fetchCurriculumByID } = require("../controllers/curriculum/fetch");

//routes
router.post(
	"/:userID/new",
	authMiddleware,
	checkUserExistence,
	upload.fields([
		{ name: "thumbnail", maxCount: 1 },
		{ name: "file", maxCount: 10 },
	]),
	createCurriculum
);
router.put(
	"/:userID/edit/:curriculumID",
	authMiddleware,
	checkUserExistence,
	upload.fields([
		{ name: "thumbnail", maxCount: 1 },
		{ name: "file", maxCount: 10 },
	]),
	editCurriculum
);
router.delete(
	"/:userID/delete/:curriculumID",
	authMiddleware,
	checkUserExistence,
	deleteCurriculum
);
router.get(
	"/:userID/fetch/all",
	authMiddleware,
	checkUserExistence,
	fetchAllCurriculums
);
router.get(
	"/:userID/fetch/single/:curriculumID",
	authMiddleware,
	checkUserExistence,
	fetchCurriculumByID
);

//export
module.exports = router;