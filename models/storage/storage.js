//package imports
const mongoose = require("mongoose");
const logger = require("../../utils/logger");

//initialization
const { Schema } = mongoose;

//schema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "Storage",
	optimisticConcurrency: true,
};

//main schema
const StorageSchema = new Schema(
	{
		totalStorage: {
			type: Number,
			default: 0,
		},
		storage: {},
	},
	MainSchemaOptions
);

//middleware for storage
StorageSchema.pre("save", async function (next) {
	try {
		if (this.isModified("storage")) {
			let totalStorageSize = 0;

			// Iterate over each category in storage
			Object.values(this.storage).forEach((category) => {
				if (category.files && Array.isArray(category.files)) {
					// Sum the size of all files in the category
					totalStorageSize += category.files.reduce(
						(sum, file) => sum + (file.size || 0),
						0
					);
				}
			});

			// Update the totalStorage field
			this.totalStorage = totalStorageSize;
		}

		next();
	} catch (error) {
		logger.error(`Error in user shcema storage update: ${error}`);
		next(error);
	}
});

//model
const Storage = mongoose.model("Storage", StorageSchema);
module.exports = Storage;
