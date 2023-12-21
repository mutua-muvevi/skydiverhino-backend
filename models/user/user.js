//package imports
const mongoose = require("mongoose");
const logger = require("../../utils/logger");

//initialization
const { Schema } = mongoose;

//shema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "User",
	optimisticConcurrency: true,
};

//main schema
const UserSchema = new Schema(
	{

		fullname: {
			type: String,
			minLength: [5, "Minimum characters required for fullname is 5"],
			maxLength: [50, "Maximum characters required for fullname is 50"],
			lowercase: true,
			trim: true,
			required: [true, "Your fullname is required"],
		},
		email: {
			type: String,
			minLength: [5, "Minimum characters required for email is 5"],
			maxLength: [50, "Maximum characters required for email is 50"],
			match: [
				/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
				"Your email format should be __@_.__, instead got {VALUE}",
			],
			lowercase: true,
			trim: true,
			immutable: true,
			required: [true, "Your email is required"],
			unique: true,
			index: true,
		},
		city: {
			type: String,
			minLength: [2, "Minimum characters required for city is 2"],
			maxLength: [100, "Maximum characters required for city is 100"],
			lowercase: true,
			trim: true,
		},
		country: {
			type: String,
			minLength: [4, "Minimum characters required for country is 4"],
			maxLength: [56, "Maximum characters required for country is 56"],
			lowercase: true,
			trim: true,
		},
		telephone: {
			type: String,
			minLength: [3, "Minimum characters required for phone number is 3"],
			maxLength: [
				15,
				"Maximum characters required for phone number is 15",
			],
			trim: true,
		},
		role: {
			type: String,
			required: true
		},
		image: { type: String },
		imageID: { type: String },

		hash: String,
		salt: String,
		otp: {
			code: String,
			expiry: Date,
		},

		
		notifications: [
			{
				type: Schema.Types.ObjectId,
				ref: "Notification",
			},
		],

		//announcement
		announcements: [
			{
				type: Schema.Types.ObjectId,
				ref: "Announcement",
			},
		],

		//storage
		storage: {},
		totalStorage: {
			type: Number,
			default: 0,
		},

		resetPasswordToken: String,
		resetPasswordExpiry: Date,

	}, MainSchemaOptions
);


//middleware for storage
UserSchema.pre("save", async function (next) {
	try {
		if (this.isModified("storage")) {
			let totalStorageSize = 0;

			// Iterate over each category in storage
			Object.values(this.storage).forEach((category) => {
				if (category.files && Array.isArray(category.files)) {
					// Sum the size of all files in the category
					totalStorageSize += category.files.reduce(
						(sum, file) => sum + (file.size || 0),
						0
					);
				}
			});

			// Update the totalStorage field
			this.totalStorage = totalStorageSize;
		}

		next();
	} catch (error) {
		logger.error(`Error in user shcema storage update: ${error}`);
		next(error);
	}
});

//model
const User = mongoose.model("User", UserSchema);
module.exports = User;
