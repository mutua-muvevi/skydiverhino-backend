/**
 * Curriculum Model
 * ==============================
 * This model is used to store the manual data
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

//schema options
const SchemaOptions = {
	timestamps: true,
	collection: "Curriculum",
	optimisticConcurrency: true,
};

//contentBlock Schema
const ContentBlockSchema = new Schema({
	title: {
		type: String,
		minLength: [4, "Minimum characters required for title is 4"],
		maxLength: [100, "Maximum characters required for title is 100"],
		trim: true,
		required: [true, "Title is required"],
	},
	details: {
		type: String,
		minLength: [20, "Minimum characters required for details is 20"],
		maxLength: [1000, "Maximum characters required for details is 1000"],
		trim: true,
		required: [true, "Content details is required"],
	},
	file: {
		type: String,
	},
	list: {
		type: Array,
		default: [],
	},
});

//manual schema
const CurriculumSchema = new Schema(
	{
		title: {
			type: String,
			minLength: [4, "Minimum characters required for title is 4"],
			maxLength: [100, "Maximum characters required for title is 100"],
			trim: true,
			required: [true, "Title is required"],
			index: true,
		},
		introDescription: {
			type: String,
			minLength: [4, "Minimum characters required for introDescription is 4"],
			maxLength: [1000, "Maximum characters required for introDescription is 1000"],
			trim: true,
		},
		thumbnail: {
			type: String,
		},
		contentBlocks: [ContentBlockSchema],
		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Author is required"],
		},
	},
	SchemaOptions
);

//the model
const Curriculum = mongoose.model("Curriculum", CurriculumSchema);

//export
module.exports = Curriculum;