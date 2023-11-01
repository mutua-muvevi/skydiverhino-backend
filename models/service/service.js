/**
 * Service model
 * =========================
 * This is the model for the service collection in the database
 *
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

//schema options
const ServiceSchemaOptions = {
	timestamps: true,
	collection: "Service",
	optimisticConcurrency: true,
};



//the schema
const ServiceSchema = new Schema(
	{
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
		leads: [
			{
				type: Schema.Types.ObjectId,
				ref: "Lead",
			},
		],
	},
	ServiceSchemaOptions
);

//the model
const Service = mongoose.model("Service", ServiceSchema);

//export
module.exports = Service;
