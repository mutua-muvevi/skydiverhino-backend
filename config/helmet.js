/**
 * Enhanced Helmet configuration for securing Express applications:
 *
 * - Content Security Policy (CSP): Helps prevent XSS attacks and other code injection attacks by restricting sources of content.
 * - DNS Prefetch Control: Controls browser's DNS prefetching. May enhance performance but can leak information.
 * - Expect Certificate Transparency: Ensures the site will be in CT logs.
 * - Frameguard: Prevents clickjacking by restricting who can put the site in an iframe.
 * - Hide Powered By: Removes the X-Powered-By header, which can expose potentially sensitive information.
 * - HTTP Strict Transport Security (HSTS): Ensures the app is only accessed over HTTPS.
 * - IE No Open: Prevents IE from executing downloads in site's context.
 * - No Sniff: Stops browsers from trying to guess (and potentially change) the MIME type.
 * - Cross-domain Policy: Restricts Adobe Flash and Acrobat from loading data on the site.
 * - Referrer Policy: Controls the Referer header to protect user's privacy.
 * - XSS Filter: Protects against cross-site scripting attacks.
 *
 * This configuration is tailored to maximize security by setting up HTTP headers.
 * Adjustments may be needed based on specific needs of the application.
 */

const helmet = require("helmet");

const helmetConfig = helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			baseUri: ["'self'"],
			blockAllMixedContent: [],
			fontSrc: ["'self'", "https:", "data:"],
			frameAncestors: ["'self'"],
			imgSrc: ["'self'", "data:"],
			objectSrc: ["'none'"],
			scriptSrc: ["'self'"],
			upgradeInsecureRequests: [],
		},
	},
	dnsPrefetchControl: false,
	expectCt: {
		maxAge: 0,
		enforce: true,
	},
	frameguard: {
		action: "deny",
	},
	hidePoweredBy: true,
	hsts: {
		maxAge: 15552000, // 180 days
		includeSubDomains: true,
		preload: true,
	},
	ieNoOpen: true,
	noSniff: true,
	permittedCrossDomainPolicies: {
		permittedPolicies: "none",
	},
	referrerPolicy: {
		policy: "no-referrer",
	},
	xssFilter: true,
});

module.exports = helmetConfig;
