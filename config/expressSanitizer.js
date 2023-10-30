/**
 * ## Express Sanitizer Middleware
 *
 * Sanitizes user input to protect against XSS attacks.
 *
 * ### Procedure:
 * 1. Iterate over the request's query, body, and params.
 * 2. For each property, escape dangerous characters.
 * 3. Replace the original value with the sanitized version.
 *
 */
const sanitizeString = (str) => {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
};

const expressSanitizer = (req, res, next) => {
	["query", "body", "params"].forEach((location) => {
		for (let prop in req[location]) {
			if (typeof req[location][prop] === "string") {
				req[location][prop] = sanitizeString(req[location][prop]);
			}
		}
	});

	next();
};

module.exports = expressSanitizer;
