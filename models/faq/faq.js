/**
 * FAQ model
 * ======================
 * This is the model for the faq collection in the database
 * 
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

//schema options
const SchemaOptions = {
	timestamps: true,
	collection: "FAQ",
	optimisticConcurrency: true,
};

//the schema
const FAQSchema = new Schema(
	{
		question: {
			type: String,
			minLength: [4, "Minimum characters required for fullname is 4"],
			maxLength: [100, "Maximum characters required for fullname is 100"],
			trim: true,
			index: true,
		},
		answer: {
			type: String,
			minLength: [4, "Minimum characters required for details is 4"],
			maxLength: [1000, "Maximum characters required for details is 1000"],
			trim: true,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User is required"],
		},
	}, SchemaOptions
);

//model
const FAQ = mongoose.model("FAQ", FAQSchema);

//export
module.exports = FAQ;