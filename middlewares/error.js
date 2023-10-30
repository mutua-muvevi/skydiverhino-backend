const ErrorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {

	// Log the error for the developer
	let error = { message: err.message, statusCode: err.statusCode };


	// Mongoose bad ObjectId
	if (err.name === "CastError") {
		const message = `Resource not found with id of ${err.value}`;
		error = new ErrorResponse(message, 404);
	}

	// Mongoose duplicate key
	if (err.code === 11000) {
		const field = Object.keys(err.keyValue)[0];
		const value = err.keyValue[field];
		const message = `Duplicate field value entered: ${field} with value ${value}. Please use another value.`;
		error = new ErrorResponse(message, 400);
	}

	// Mongoose validation error
	if (err.name === "ValidationError") {
		const messages = Object.values(err.errors).map(
			(value) => value.message
		);
		error = new ErrorResponse(messages, 400);
	}

	// JWT authentication error
	if (err.name === "JsonWebTokenError") {
		const message = "Not authorized";
		error = new ErrorResponse(message, 401);
	}

	// JWT token expired error
	if (err.name === "TokenExpiredError") {
		const message = "Token expired";
		error = new ErrorResponse(message, 401);
	}

	// Syntax error, like malformed JSON
	if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
		const message = "Invalid JSON payload";
		error = new ErrorResponse(message, 400);
	}

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || "Server Error",
	});
};

module.exports = errorHandler;
