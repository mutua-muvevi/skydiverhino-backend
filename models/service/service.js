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
		minLength: [4, "Minimum characters required for content clock title is 4"],
		maxLength: [100, "Maximum characters required for title is 100"],
		trim: true,
	},
	details: {
		type: String,
		minLength: [20, "Minimum characters required for details is 20"],
		maxLength: [1000, "Maximum characters required for details is 1000"],
		trim: true,
		required: [true, "Content details is required"],
	},
	image: {
		type: String
	}
});

//requirements subschema
const RequirementSchema = new Schema({
	title: {
		type: String,
		minLength: [4, "Minimum characters required for requirement title is 4"],
		maxLength: [100, "Maximum characters required for title is 100"],
		trim: true,
		required: [true, "Requirement title is required"],
	},
	details: {
		type: String,
		minLength: [20, "Minimum characters required for details is 20"],
		maxLength: [1000, "Maximum characters required for details is 1000"],
		trim: true,
		required: [true, "Requirement details is required"],
	},
});

//pricing subschema
const PricingSchema = new Schema({
	title: {
		type: String,
		minLength: [4, "Minimum characters required for  pricing title is 4"],
		maxLength: [100, "Maximum characters required for title is 100"],
		trim: true,
	},
	listItems: {
		type: [String],
		minLength: [1, "Minimum items required for list item is 1"],
		maxLength: [100, "Maximum items required for list item is 100"],
		trim: true,
	},
	price: {
		amount: {
			type: Number,
			min: [0, "Price cannot be negative"],
			required: [true, "Price is required"],
		},
		currency: {
			type: String,
			enum: ["USD", "EUR", "GBP", "NGN", "KES"],
			required: [true, "Currency is required"],
		},
	},
});


//faq subschema
const FAQSchema = new Schema({
	question: {
		type: String,
		minLength: [4, "Minimum characters required for question is 4"],
		maxLength: [100, "Maximum characters required for question is 100"],
		trim: true,
		required: [true, "Question is required"],
	},
	answer: {
		type: String,
		minLength: [20, "Minimum characters required for answer is 20"],
		maxLength: [1000, "Maximum characters required for answer is 1000"],
		trim: true,
		required: "Answer is required",
	},
});

//the schema
const ServiceSchema = new Schema(
	{
		thumbnail: {
			type: String,
		},
		slug: {
			type: String,
			enum: {
				values: ["aff", "tandem"],
				message: "The slug must be either 'aff' or 'tandem' instead received {VALUE}",
			},
			// required: [true, "Service slug is required"],
		},
		name: {
			type: String,
			minLength: [4, "Minimum characters required for name is 4"],
			maxLength: [100, "Maximum characters required for name is 100"],
			trim: true,
			index: true,
		},
		introDescription: {
			type: String,
			minLength: [20, "Minimum characters required for short description is 20"],
			maxLength: [2500, "Maximum characters required for short description is 2500"],
			trim: true,
		},
		
		contentBlocks: [DescriptionBlockSchema],
		requirements: [RequirementSchema],

		prices: [PricingSchema],
		priceImage: {
			type: String,
		},


		faqs: [FAQSchema],
		faqImage: {
			type: String,
		},
		
		leads: [
			{
				type: Schema.Types.ObjectId,
				ref: "Lead",
			},
		],
		clients: [
			{
				type: Schema.Types.ObjectId,
				ref: "Client",
			},
		],
		gallery: [
			{
				type: String,
			},
		],

	},
	ServiceSchemaOptions
);

//the model
const Service = mongoose.model("Service", ServiceSchema);

//export
module.exports = Service;
