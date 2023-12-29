/**
 * Event model
 * ======================
 * This is the model for the event collection in the database
 * 
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

//schema options
const SchemaOptions = {
	timestamps: true,
	collection: "Event",
	optimisticConcurrency: true,
};

//the schema
const EventSchema = new Schema(
	{
		thumbnail: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
		venue: {
			type: String,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	SchemaOptions
);

// the model
const Event = mongoose.model("Event", EventSchema);

module.exports = Event;