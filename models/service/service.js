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

//description blocks subschema
const DescriptionBlockSchema = new Schema({
	title: {
		type: String,
		minLength: [4, "Minimum characters required for title is 4"],
		maxLength: [100, "Maximum characters required for title is 100"],
		trim: true,
	},
	details: {
		type: String,
		minLength: [20, "Minimum characters required for details is 20"],
		maxLength: [1000, "Maximum characters required for details is 1000"],
		trim: true,
	},
	image: {
		type: String
	}
});

//requirements subschema
const RequirementSchema = new Schema({
	title: {
		type: String,
		minLength: [4, "Minimum characters required for title is 4"],
		maxLength: [100, "Maximum characters required for title is 100"],
		trim: true,
	},
	details: {
		type: String,
		minLength: [20, "Minimum characters required for details is 20"],
		maxLength: [1000, "Maximum characters required for details is 1000"],
		trim: true,
	},
});

//pricing subschema
const PricingSchema = new Schema({
	title: {
		type: String,
		minLength: [4, "Minimum characters required for title is 4"],
		maxLength: [100, "Maximum characters required for title is 100"],
		trim: true,
	},
	listItems: {
		type: [String],
		minLength: [1, "Minimum characters required for list item is 1"],
		maxLength: [100, "Maximum characters required for list item is 100"],
		trim: true,
	},
	pricing: {
		amount: {
			type: Number,
			min: [0, "Price cannot be negative"],
		},
		currency: {
			type: String,
			enum: ["USD", "EUR", "GBP", "NGN"],
		},
	},
	image: {
		type: String
	}
});


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
