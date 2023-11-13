const express = require("express");
const router = express.Router();

//middlewares
const { authMiddleware } = require("../middlewares/authentication");
const checkUserExistence = require("../middlewares/checkuser");

//utils
const { upload } = require("../utils/multer");

//controllers
const { createVoicemail } = require("../controllers/voicemail/new");
const { editVoicemail } = require("../controllers/voicemail/edit");
const { deleteVoicemail } = require("../controllers/voicemail/delete");
const { fetchAllVoicemails, fetchVoicemailByID } = require("../controllers/voicemail/fetch");

//routes
router.post(
	"/:userID/new",
	authMiddleware,
	checkUserExistence,
	upload.single("file"),
	createVoicemail
);
router.put(
	"/:userID/edit/:voicemailID",
	authMiddleware,
	checkUserExistence,
	upload.single("file"),
	editVoicemail
);
router.delete(
	"/:userID/delete/:voicemailID",
	authMiddleware,
	checkUserExistence,
	deleteVoicemail
);
router.get(
	"/:userID/fetch/all",
	authMiddleware,
	checkUserExistence,
	fetchAllVoicemails
);
router.get(
	"/:userID/fetch/single/:voicemailID",
	authMiddleware,
	checkUserExistence,
	fetchVoicemailByID
);

//export
module.exports = router;