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

//transaction imports
const { createTransaction } = require("../controllers/user/transaction/new");
const {
	fetchAllTransactions,
	fetchTransactionsByID,
	fetchAllUsersTransactions,
} = require("../controllers/user/transaction/fetch");
const {
	deleteTransaction,
	deleteManyTransactions,
} = require("../controllers/user/transaction/delete");

//plan imports
const { createSubscriptionPlan } = require("../controllers/user/plan/new");
const checkUserExistence = require("../middlewares/checkuser");
const { deleteSubscriptionPlan } = require("../controllers/user/plan/delete");

//subscription imports
const { createSubscription } = require("../controllers/user/subscription/new");
const { editSubscription } = require("../controllers/user/subscription/edit");
const { fetchSubscription } = require("../controllers/user/subscription/fetch");
const { deleteSubscription } = require("../controllers/user/subscription/delete");

router.post("/register", registerJWT);

router.post("/login", loginJWT);


//security routes
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:resetToken", resetpassword);
router.post("/otp", verifyOTP);

//fetch routes
router.get("/fetch/me", authMiddleware, getMe, fetchMe);

//plan routes
router.post(
	"/:userID/plan/post",
	authMiddleware,
	checkUserExistence,
	createSubscriptionPlan
);
router.delete(
	"/:userID/plan/delete/:planID",
	authMiddleware,
	checkUserExistence,
	deleteSubscriptionPlan
);

//subscriptions routes
router.post(
	"/:userID/subscription/post",
	authMiddleware,
	checkUserExistence,
	createSubscription
);
router.put(
	"/:userID/subscription/edit/:subscriptionID",
	authMiddleware,
	checkUserExistence,
	editSubscription
);
router.get(
	"/:userID/subscription/get/:subscriptionID",
	authMiddleware,
	checkUserExistence,
	fetchSubscription
)
router.delete(
	"/:userID/subscription/delete/:subscriptionID",
	authMiddleware,
	checkUserExistence,
	deleteSubscription
)

//transaction routes
router.post(
	"/:userID/transaction/post",
	authMiddleware,
	checkUserExistence,
	createTransaction
);
router.delete(
	"/:userID/transaction/delete/:transactionID",
	authMiddleware,
	checkUserExistence,
	deleteTransaction
);
router.delete(
	"/:userID/transaction/delete/many/transactions",
	authMiddleware,
	checkUserExistence,
	deleteManyTransactions
);
router.get(
	"/:userID/transaction/get/all",
	authMiddleware,
	checkUserExistence,
	fetchAllTransactions
);
router.get(
	"/:userID/transaction/get/all/transactions",
	authMiddleware,
	checkUserExistence,
	// admin middleware here
	fetchAllUsersTransactions
);
router.get(
	"/:userID/transaction/get/single/:transactionID",
	authMiddleware,
	checkUserExistence,
	fetchTransactionsByID
);

module.exports = router;