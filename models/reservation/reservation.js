/**
 * Reservation model
 * ====================
 * This is the model for the client collection in the database
 *
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

//schema options
const SchemaOptions = {
	timestamps: true,
	collection: "Reservation",
	optimisticConcurrency: true,
};

//participants subdocument
const ParticipantsSchema = new Schema(
	{
		fullname: {
			type: String,
			minLength: [4, "Minimum characters required for fullname is 4"],
			maxLength: [100, "Maximum characters required for fullname is 100"],
			trim: true,
			required: [true, "Fullname is required"],
			index: true,
		},
		details: {
			type: String,
			minLength: [4, "Minimum characters required for details is 4"],
			maxLength: [1000, "Maximum characters required for details is 1000"],
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
		phone: {
			type: String,
			minLength: [
				3,
				"Minimum characters required for phone number is 3",
			],
			maxLength: [
				20,
				"Maximum characters required for phone number is 20",
			],
			trim: true,
			index: true,
		},
		dateOfBirth: {
			type: String,
			required: [true, "date of birth is required"],
			index: true,
		},
		videoOption: {
			type: String,
			enum: ["yes", "no"],
			default: "yes",
			index: true,
		},
	},
);

//Agreements Schema
const AgreementSchema = new Schema({
	above18Years: {
		type: Boolean,
		default: false,
		index: true,
	},
	termsAndConditions: {
		type: Boolean,
		default: false,
		index: true,
	},
})

//schema
const ReservationSchema = new Schema(
	{
		date: {
			type: Date,
			required: [true, "Date is required"],
			index: true,
		},
		time: {
			type: String,
			index: true,
		},
		participants: [ParticipantsSchema],
		agreements: [AgreementSchema],
		service: {
			type: Schema.Types.ObjectId,
			ref: "Service",
			index: true,
		},
	}, SchemaOptions
);

//the model
const Reservation = mongoose.model("Reservation", ReservationSchema);

//export the model
module.exports = Reservation;