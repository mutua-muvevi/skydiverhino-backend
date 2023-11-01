const express = require("express");
const router = express.Router();

const { registerJWT } = require("../controllers/user/register/registerjwt");

const { loginJWT } = require("../controllers/user/login/loginjwt");

const { forgotPassword } = require("../controllers/user/password/forget");
const { resetpassword } = require("../controllers/user/password/reset");
const { verifyOTP } = require("../controllers/user/otp/otp");
const { fetchMe } = require("../controllers/user/fetch/me");

//middlewares imports
const { getMe } = require("../middlewares/me");
const { authMiddleware } = require("../middlewares/authentication");

router.post("/register", registerJWT);

router.post("/login", loginJWT);

//security routes
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:resetToken", resetpassword);
router.post("/otp", verifyOTP);

//fetch routes
router.get("/fetch/me", authMiddleware, getMe, fetchMe);


module.exports = router;
