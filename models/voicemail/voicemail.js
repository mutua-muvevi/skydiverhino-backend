/**
 * Voicemail Model
 * ==============================
 * This model is used to store the manual data
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

//schema options
const SchemaOptions = {
	timestamps: true,
	collection: "Voicemail",
	optimisticConcurrency: true,
};

//manual schema
const VoicemailSchema = new Schema(
	{
		name: {
			type: String,
			minLength: [4, "Minimum characters required for name is 4"],
			maxLength: [100, "Maximum characters required for name is 100"],
			trim: true,
			required: [true, "Name is required"],
			index: true,
		},
		transcription: {
			type: String,
			minLength: [4, "Minimum characters required for transcription is 4"],
			maxLength: [
				1000,
				"Maximum characters required for transcription is 1000",
			],
			required: [true, "Transcription is required"],
			trim: true,
		},
		type: {
			type: String,
			enum: {
				values: ["voicemail", "call", "sms", "email", "others"],
				message: "{VALUE} is not supported",
			},
			required: [true, "Type is required"],
			index: true,
		},
		date: {
			type: Date,
			index: true,
			default: Date.now(),
		},
		uploadedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			index: true,
		},
	},
	SchemaOptions
);

//the model
const Voicemail = mongoose.model("Voicemail", VoicemailSchema);

//export
module.exports = Voicemail;