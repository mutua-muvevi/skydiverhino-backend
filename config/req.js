/**
 * ## Request Middleware
 *
 * This middleware enhances the incoming request by attaching user-agent details and geolocation information based on the IP address.
 *
 * ### Step-by-step procedure:
 * 1. Parse the user-agent header to get details about the device, OS, and browser.
 * 2. Extract the IP address of the request, considering possible proxies.
 * 3. Get geolocation data for the extracted IP address.
 * 4. Attach the parsed data to the request object.
 * 5. Continue processing the request.
 *
 * ### Detailed Explanation:
 * - **useragent.parse()**: Parses the user-agent string to extract browser, platform, and device type.
 * - **geoip.lookup()**: Retrieves geolocation data for the given IP address.
 * - **next()**: Proceeds to the next middleware or route handler.
 */

const useragent = require("express-useragent");
const geoip = require("geoip-lite");
const logger = require("../utils/logger");

const requestMiddleware = (req, res, next) => {
	try {
		// 1. Parsing user-agent
		const source = req.headers["user-agent"];
		const agent = useragent.parse(source);

		req.userDetails = {
			browser: agent.browser,
			os: agent.os,
			platform: agent.platform,
			isMobile: agent.isMobile,
			isTablet: agent.isTablet,
			isDesktop: agent.isDesktop,
		};

		logger.info(req.userDetails);
console.log("User details in request is", req.userDetails)
		// 2. Extracting IP address (handling cases with multiple proxies)
		const ip =
			(req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress;

		// 3. Getting geolocation data
		const geo = geoip.lookup(ip);
		if (geo) {
			req.userDetails.location = {
				country: geo.country,
				region: geo.region,
				city: geo.city,
			};
		}

		// 4. Continuing the request processing
		next();
	} catch (error) {
		console.error("Error in requestMiddleware:", error);
		next(error);
	}
};

module.exports = requestMiddleware;
