/**
 * Homepage Modal
 * ================================================
 * This is the model for the homepage collection in the database
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

//schema options
const SchemaOptions = {
	timestamps: true,
	collection: "Homepage",
	optimisticConcurrency: true,
};

//banner
const BannerSchema = new Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Title is required"],
	},
	subtitle: {
		type: String,
		trim: true,
		required: [true, "Subtitle is required"],
	},
	video: {
		type: String,
		trim: true,
		required: [true, "Background video is required"],
	},
})

//intro
const IntroSchema = new Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Title is required"],
	},
	subtitle: {
		type: String,
		trim: true,
	},
	description: {
		type: String,
		trim: true,
		required: [true, "Description is required"],
	},
	backgroundImage: {
		type: String,
		trim: true,
	},
})

//tandem
const TandemSchema = new Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Title is required"],
	},
	subtitle: {
		type: String,
		trim: true,
	},
	description: {
		type: String,
		trim: true,
		required: [true, "Description is required"],
	},
	backgroundImage: {
		type: String,
		trim: true,
	},
	gallery: {
		type: Array,
		min: [4, "Minimum number of images is 4"],
		max: [10, "Maximum number of images is 10"],
		trim: true,
	},
})

//aff schema
const AffSchema = new Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Title is required"],
	},
	subtitle: {
		type: String,
		trim: true,
	},
	description: {
		type: String,
		trim: true,
		required: [true, "Description is required"],
	},
	backgroundImage: {
		type: String,
		trim: true,
	},
	gallery: {
		type: Array,
		min: [4, "Minimum number of images is 4"],
		max: [10, "Maximum number of images is 10"],
		trim: true,
	},
})

//subscribe schema
const SubscribeSchema = new Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Title is required"],
	},
	subtitle: {
		type: String,
		trim: true,
	},
	image: {
		type: String,
		trim: true,
		required: [true, "Description is required"],
	},
	backgroundImage: {
		type: String,
		trim: true,
	},
})

//social media schema
const SocialMediaSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: [true, "Name is required"],
		enum: {
			values: ["facebook", "instagram", "twitter", "youtube", "linkedin"],
			message: "Invalid social media name",
		},
	},
	link: {
		type: String,
		trim: true,
		required: [true, "Link is required"],
	},
})

//footer schema
const FooterSchema = new Schema({
	subtitle: {
		type: String,
		trim: true,
	},
	image: {
		type: String,
		trim: true,
		required: [true, "Description is required"],
	},
	backgroundImage: {
		type: String,
		trim: true,
	},
	socialMedia: [SocialMediaSchema],
})


//homepage schema
const HomepageSchema = new Schema({
	banner: {
		type: BannerSchema,
		required: [true, "Banner is required"],
	},
	intro: {
		type: IntroSchema,
		required: [true, "Intro is required"],
	},
	tandem: {
		type: TandemSchema,
		required: [true, "Tandem is required"],
	},
	quote: {
		type: String,
		trim: true,
	},
	aff: {
		type: AffSchema,
		required: [true, "AFF is required"],
	},
	subscribe: {
		type: SubscribeSchema,
		required: [true, "Subscribe is required"],
	},
	footer: {
		type: FooterSchema,
		required: [true, "Footer is required"],
	},
}, SchemaOptions)

//the model
const Homepage = mongoose.model("Homepage", HomepageSchema);

module.exports = Homepage;