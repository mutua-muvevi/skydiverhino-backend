/**
 * ## Register users with JWT
 *
 * ## Step by Step Procedure
 * 1. Validate the request body
 * 2. Check if the user already exists
 * 3. Create a new user
 * 4. Generate a JWT for the user
 * 5. Send Email to the user
 * 6. Send Email verification link to the user
 * 7. Send response to the user
 * 8. Log the user creation and performance
 * 9. create a notification
 */
// Package imports
const { performance } = require("perf_hooks");
const User = require("../../../models/user/user");
const { issueJWT } = require("../../../middlewares/token");
const { generatePassword } = require("../../../middlewares/password");
const ErrorResponse = require("../../../utils/errorResponse");
const logger = require("../../../utils/logger");
const sendEmail = require("../../../utils/sendMail");
const generateOTP = require("../../../middlewares/generateOTP");
const { createNotification } = require("../../notification/new");

// Register user
exports.registerJWT = async (req, res, next) => {
	const { fullname, email, password, role, country, city, telephone } = req.body;

	try {
		// Step 1: Validate the request body
		let errors = [];
		if (!fullname) errors.push("Fullname is required");
		if (!email) errors.push("Email is required");
		if (!role) errors.push("User's role is required");
		if (!password) errors.push("Password is required");
		if (!country) errors.push("Country is required");

		// If any errors, send them in a single response
		if (errors.length > 0) {
			return next(new ErrorResponse(errors.join(", "), 400));
		}

		// Start performance timer for measuring the time taken for registration
		const start = performance.now();

		// Step 2: Check if user already exists by email
		const emailExist = await User.findOne({ email });
		if (emailExist)
			return next(new ErrorResponse("Email already exists", 400));

		// Check for telephone duplication if provided
		if (telephone) {
			const existingTelephone = await User.findOne({ telephone });
			if (existingTelephone)
				return next(new ErrorResponse("Telephone already exists", 400));
		}

		// Step 3: Create a new user
		const user = new User({
			fullname,
			email,
			password,
			country,
			city,
			telephone,
			role
		});

		// Step 4: Generate password hash and salt
		const { salt, hash } = await generatePassword(password);
		user.salt = salt;
		user.hash = hash;

		// Persist the user to the database
		await user.save();

		// Generate JWT token for the user
		const jwt = issueJWT(user);

		//add user to request
		req.user = user;


		// Step 5: Generate a unique OTP for email verification
		const otpCode = generateOTP();
    
		// Store this OTP in users database with an expiration time (say 10 minutes)
		user.otp = {
			code: otpCode,
			expiry: Date.now() + 10*60*1000 // Adds 10 minutes to current time
		};
		await user.save();

		// Step 6: Send the OTP code for account activation
		const emailHTML = `
			<h1>Please use the following code to activate your account</h1>
			<p><b>${otpCode}</b></p>
			<hr />
			<p>This email may contain sensitive information</p>
			<p>${process.env.CLIENT_URL}</p>
		`;

		const emailData = {
			from: process.env.SEND_EMAIL_FROM,
			to: email,
			subject: "Account Activation Code",
			html: emailHTML,
		};

		const response = await sendEmail(emailData);

		if (!response)
		return next(new ErrorResponse("Error sending email", 500));

		//create a notification
		const notificationData = {
			details: "New user registered successfully",
			type: "create",
			relatedModel: "User",
			relatedModelID: user._id,
		}

		req.body = notificationData;

		await createNotification(req, res, next);


		// Step 7: Send response to the user
		res.status(201).json({
			success: true,
			message: "User created successfully. Please verify your email.",
			user: user,
			token: jwt.token,
			expires: jwt.expires,
		});

		
		// End performance timer
		const end = performance.now();
		const timeTaken = end - start; 

		// Logging user creation and performance
		logger.info(`User created successfully: ${user.email} in ${timeTaken}ms`);
	} catch (error) {
		logger.error(`Error in RegisterJWT Controller: ${error.message}`);
		next(error);
	}
};
