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
		file: {}
	},
	MainSchemaOptions
);


//model
const Storage = mongoose.model("Storage", StorageSchema);
module.exports = Storage;