const rateLimit = require("express-rate-limit");

/**
 * Scalable Rate Limit Configuration for Express applications:
 * 
 * This configuration aims to:
 * - Cater to genuine users by allowing a reasonable number of requests.
 * - Prevent abuse and ensure high security against brute-force and DDoS attacks.
 * - Be adaptable based on the environment: relaxing limits in the development for easier testing.
 * 
 * Notes:
 * - The configuration uses different limits for development and production to ease the development process.
 * - Developers can adjust the settings based on expected traffic and observed behavior.
 * - Ensure that genuine users have a smooth experience by fine-tuning the values.
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

const requestWindow = 15 * 60 * 1000; // 15 minutes
const maxRequestsInDev = 1000;
const maxRequestsInProd = 100;

const rateLimitConfig = rateLimit({
    windowMs: requestWindow,
    max: isDevelopment ? maxRequestsInDev : maxRequestsInProd, 
    delayMs: 0, // Do not delay requests
    skipSuccessfulRequests: true, // Rate limit only the erroneous requests (status >= 400)
    message: "Too many requests, please try again later.",

    // A function to determine whether to skip rate limiting for a request
    skip: (req, res) => {
        // Example: You might want to skip rate limiting for certain API keys or logged in admin users
        // return req.headers['x-api-key'] === 'trusted-key' || req.user && req.user.isAdmin;
        return false; // Don't skip by default
    }
});

module.exports = rateLimitConfig;