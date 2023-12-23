/**
 * Lead model
 * ======================
 * This is the model for the lead collection in the database
 * 
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

//schema options
const SchemaOptions = {
	timestamps: true,
	collection: "Lead",
	optimisticConcurrency: true,
};

//the schema
const LeadSchema = new Schema(
	{
		fullname: {
			type: String,
			minLength: [4, "Minimum characters required for fullname is 4"],
			maxLength: [100, "Maximum characters required for fullname is 100"],
			trim: true,
			index: true,
		},
		message: {
			type: String,
			minLength: [4, "Minimum characters required for message is 4"],
			maxLength: [1000, "Maximum characters required for message is 1000"],
			trim: true,
		},
		email: {
			type: String,
			minLength: [4, "Minimum characters required for email is 4"],
			maxLength: [50, "Maximum characters required for email is 50"],
			match: [
				/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
				"Your email format should be __@__.__, instead got {VALUE}",
			],
			lowercase: true,
			trim: true,
			required: [true, "Email is required"],
			index: true,
		},
		telephone: {
			type: String,
			minLength: [
				3,
				"Minimum characters required for telephone number is 3",
			],
			maxLength: [
				20,
				"Maximum characters required for telephone number is 20",
			],
			trim: true,
			index: true,
		},
		city: {
			type: String,
			minLength: [4, "Minimum characters required for city is 4"],
			maxLength: [100, "Maximum characters required for city is 100"],
			trim: true,
		},
		country: {
			type: String,
			minLength: [4, "Minimum characters required for country is 4"],
			maxLength: [60, "Maximum characters required for country is 60"],
			trim: true,
			required: true,
		},
		company: {
			type: String,
			minLength: [4, "Minimum characters required for company is 4"],
			maxLength: [100, "Maximum characters required for company is 100"],
			trim: true,
		},
		leadSource: {
			type: String,
			enum: {
				values: [
					"Google",
					"Email",
					"Phone",
					"Website",
					"Referral",
					"Facebook",
					"TikTok",
					"Instagram",
					"Other",
				],
				message: "{VALUE} is not supported",
			},
		},
		service: {
			type: Schema.Types.ObjectId,
			ref: "Service",
			default: null
		},
	}, SchemaOptions
);

//model
const Lead = mongoose.model("Lead", LeadSchema);

//export
module.exports = Lead;