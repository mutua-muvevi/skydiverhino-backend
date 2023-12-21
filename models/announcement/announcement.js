/**
 * Announcement Schema
 * @module models/announcement/announcement
 * @requires mongoose
 * ================================================
 * 
 * @description
 * Creates a new schema for an announcement
 * 
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

//schema options
const SchemaOptions = {
	timestamps: true,
	collection: "Announcement",
	optimisticConcurrency: true,
};

//the schema
const AnnouncementSchema = new Schema(
	{
		title: {
			type: String,
			minLength: [4, "Minimum characters required for title is 4"],
			maxLength: [100, "Maximum characters required for title is 100"],
			trim: true,
			required: [true, "Title is required"],
			index: true,
		},
		description: {
			type: String,
			minLength: [4, "Minimum characters required for description is 4"],
			maxLength: [1000, "Maximum characters required for description is 1000"],
			trim: true,
			required: [true, "Description is required"],
		},
		uploadedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Uploaded by is required"],
		},
	},
	SchemaOptions
);

//the model
const Announcement = mongoose.model("Announcement", AnnouncementSchema);

//export the model
module.exports = Announcement;