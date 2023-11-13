/**
 * Term model
 * ==============================
 * This is the model for the terms collection in the database
 *
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

//schema options
const TermSchemaOptions = {
	timestamps: true,
	collection: "Term",
	optimisticConcurrency: true,
};

//the schema
const TermSchema = new Schema(
	{
		type: {
			type: String,
			enum: {
				values: [
					"terms",
					"privacy policy",
					"refund policy",
					"sales policy",
					"cookie policy",
					"agreement",
					"waiver",
				],
				message:
					"Type must be either terms, privacy policy, refund policy, sales policy, cookie policy, agreements or waiver",
			},
			required: true,
		},
		name: {
			type: String,
			minLength: [4, "Minimum characters required for name is 4"],
			maxLength: [100, "Maximum characters required for name is 100"],
			trim: true,
			index: true,
		},
		details: {
			type: String,
			minLength: [20, "Minimum characters required for details is 20"],
			maxLength: [
				1000,
				"Maximum characters required for details is 1000",
			],
			trim: true,
		},
		file: {
			type: String,
		},
		uploadedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			index: true,
		},
		updatedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			index: true,
		},
	},
	TermSchemaOptions
);

//the model
const Term = mongoose.model("Term", TermSchema);

//export
module.exports = Term;
