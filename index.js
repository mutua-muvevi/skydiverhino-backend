//root/index page

//package imports
require("dotenv").config({ path: "./config.env" });
const express = require("express");

const corsMiddleware = require("./config/cors");
const helmetMiddleware = require("./config/helmet");
const compressionMiddleware = require("./config/compression");
const rateLimitMiddleware = require("./config/ratelimit");
const requestMiddleware = require("./config/req");
const expressSanitizer = require("./config/expressSanitizer");
const databaseSanitizer = require("./config/databaseSanitizer");

//custom module imports and initialization
const app = express();
const connectDB = require("./config/database");
const errorHandler = require("./middlewares/error");
const logger = require("./utils/logger");

//connect to database
connectDB();

// middleware
app.use(corsMiddleware);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmetMiddleware);
app.use(compressionMiddleware);
app.use(rateLimitMiddleware);
app.use(requestMiddleware);
app.use(expressSanitizer);
app.use(databaseSanitizer);

//routes
app.use("/api/user", require("./routes/user"));
app.use("/api/lead", require("./routes/lead"));
app.use("/api/service", require("./routes/service"));
app.use("/api/client", require("./routes/client"));
app.use("/api/faq", require("./routes/faq"));
app.use("/api/booking", require("./routes/booking"));


//error middleware
app.use(errorHandler);

// port connection
const PORT = process.env.PORT || 5000
app.listen(PORT, () => logger.info(`Connected to port ${PORT}`))



// process termination after unhandles promise rejection
process.on("unhandledRejection", (error, promise) => {
	if(error){
		logger.error(`Unhandled Promise Rejection Error :${JSON.stringify(error)}`)
		process.exit(1)
	} else {
		logger.info(`Unhandled Promise Rejection Promise :${JSON.stringify(promise)}`)
	}
})
// console.log("No blockage");

// server error check
app.on("error", (err) => {
	logger.error("Express server error:", err);
});

module.exports = app;