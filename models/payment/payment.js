/**
 * Payment model
 * ====================================
 * This is the model for the payment collection in the database
 * 
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

//schema options
const SchemaOptions = {
	timestamps: true,
	collection: "Payment",
	optimisticConcurrency: true,
};

//the schema
const PaymentSchema = new Schema(
	{
		name: {
			type: String,
			minLength: [5, "Minimum characters required for expense name is 5"],
			maxLength: [
				50,
				"Maximum characters required for expense name is 50",
			],
			index: true,
			trim: true,
		},
		description: {
			type: String,
			minLength: [
				20,
				"Minimum characters required for expense description is 20",
			],
			maxLength: [
				1000,
				"Maximum characters required for expense description is 1000",
			],
			trim: true,
		},
		amount: {
			type: Number,
			min: [0, "Amount cannot be negative"],
			default: 0,
			required: [true, "Amount is required"],
		},
		currency: {
			type: String,
			default: "USD",
			enum: ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "KES"],
		},
		client: {
			type: Schema.Types.ObjectId,
			ref: "Client",
			required: [true, "Client is required"],
		},
		date: {
			type: Date,
			default: Date.now(),
		},
	},
	SchemaOptions
);

//the model
const Payment = mongoose.model("Payment", PaymentSchema);

//export the model
module.exports = Payment;