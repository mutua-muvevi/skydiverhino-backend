/**
 * ## Mongoose Database Connection
 *
 * This script establishes a connection to a MongoDB database using Mongoose and provides utility functions to maintain that connection.
 *
 * ### Step-by-step procedure:
 * 1. Import the required modules.
 * 2. Define the `connectDB` asynchronous function.
 * 3. Inside `connectDB`, check for the existence of the `MONGO_URI` environment variable.
 * 4. Configure Mongoose to handle deprecation warnings and other settings.
 * 5. Attempt to connect to the MongoDB database using Mongoose.
 * 6. Log the successful database connection.
 * 7. Handle app termination by closing the Mongoose connection gracefully.
 * 8. If any errors occur during the connection, log them and terminate the process.
 * 9. Export the `connectDB` function for external usage.
 *
 * ### Detailed Explanation:
 * - **MONGO_URI**: An environment variable storing the connection string to the MongoDB.
 * - **mongoose.set()**: Used to set properties on the Mongoose instance.
 * - **mongoose.connect()**: Asynchronously connects to the MongoDB database.
 * - **process.on("SIGINT")**: Event listener for process termination (e.g., Ctrl+C). Ensures Mongoose connection is closed gracefully.
 * - **module.exports**: Exports the function for use in other modules.
 */

const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
	try {
		// Check if the MONGO_URI is provided
		if (!process.env.MONGO_URI) {
			logger.error("MONGO_URI is not defined in the environment.");
			process.exit(1);
		}

		// Mongoose settings to handle deprecation warnings
		mongoose.set("strictQuery", true);

		// Connect to the database
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		logger.info("Connected to the Database");

		// If the Node process ends, close the Mongoose connection
		process.on("SIGINT", () => {
			mongoose.connection.close(() => {
				logger.info(
					"Database connection disconnected through app termination"
				);
				process.exit(0);
			});
		});
	} catch (error) {
		logger.error(`Database Connection Error : ${error.message}`);
		// Exit process with failure
		process.exit(1);
	}
};

module.exports = connectDB;
