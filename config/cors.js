const cors = require("cors");

// Define a whitelist of origins that are allowed to access the API.
// Replace with domain names
const whitelist = ["http://example1.com", "http://example2.com"]; 

const corsOptions = {
	// origin: (origin, callback) => {
	// 	if (whitelist.indexOf(origin) !== -1 || !origin) {
	// 		callback(null, true);
	// 	} else {
	// 		callback(new Error("Not allowed by CORS"));
	// 	}
	// },
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"Origin",
		"X-Requested-With",
		"Accept",
		"X-Access-Token",
	],
	credentials: true, // Allows cookies to be sent with request
	optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

module.exports = cors(corsOptions);
