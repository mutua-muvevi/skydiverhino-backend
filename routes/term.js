const express = require("express");
const router = express.Router();

//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

//utils
const { upload } = require("../utils/multer");

//controllers
const { createTerm } = require("../controllers/terms/new");
const { editTerm } = require("../controllers/terms/edit");
const { deleteTerm } = require("../controllers/terms/delete");


//routes
router.post(
	"/:userID/new",
	authMiddleware,
	checkUserExistence,
	upload.single("file"),
	createTerm
);
router.put(
	"/:userID/edit/:termID",
	authMiddleware,
	checkUserExistence,
	upload.single("file"),
	editTerm
);
router.delete(
	"/:userID/delete/:termID",
	authMiddleware,
	checkUserExistence,
	deleteTerm
);



//export
module.exports = router;