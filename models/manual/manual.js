/**
 * Manual Model
 * ==============================
 * This model is used to store the manual data
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

//schema options
const SchemaOptions = {
	timestamps: true,
	collection: "Manual",
	optimisticConcurrency: true,
};

//manual schema
const ManualSchema = new Schema(
	{
		name: {
			type: String,
			minLength: [4, "Minimum characters required for name is 4"],
			maxLength: [100, "Maximum characters required for name is 100"],
			trim: true,
			required: [true, "Name is required"],
			index: true,
		},
		description: {
			type: String,
			minLength: [4, "Minimum characters required for description is 4"],
			maxLength: [
				1000,
				"Maximum characters required for description is 1000",
			],
			trim: true,
		},
		type: {
			type: String,
			enum: {
				values: ["manual", "safety", "others"],
				message: "Type should be either manual, safety or others got {VALUE} instead",
			},
		},
		file: {
			type: String,
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
const Manual = mongoose.model("Manual", ManualSchema);

//export
module.exports = Manual;