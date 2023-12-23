/**
 * Client model
 * ====================
 * This is the model for the client collection in the database
 *
 */

const mongoose = require("mongoose");
const Payment = require("../payment/payment");
const { Schema } = mongoose;

//schema options
const SchemaOptions = {
	timestamps: true,
	collection: "Client",
	optimisticConcurrency: true,
};

//the schema
const ClientSchema = new Schema(
	{
		fullname: {
			type: String,
			minLength: [4, "Minimum characters required for fullname is 4"],
			maxLength: [100, "Maximum characters required for fullname is 100"],
			trim: true,
			required: [true, "Fullname is required"],
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
		projects: [
			{
				type: Schema.Types.ObjectId,
				ref: "Project",
			},
		],
		payments: [
			{
				type: Schema.Types.ObjectId,
				ref: "Payment",
			},
		],
		totalPayments: {
			type: Number,
			default: 0,
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
		files: [
			{
				type: String,
			},
		],
		service: {
			type: Schema.Types.ObjectId,
			ref: "Service",
			default: null
		},
	},
	SchemaOptions
);

//the model
const Client = mongoose.model("Client", ClientSchema);

//export the model
module.exports = Client;
