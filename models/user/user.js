//package imports
const mongoose = require("mongoose");
const Expense = require("../expenses/expenses");
const logger = require("../../utils/logger");
const Payment = require("../payment/payment");

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
		
		resetPasswordToken: String,
		resetPasswordExpiry: Date,
	},
	MainSchemaOptions
);

//Update the toalExpenses field in User schema
UserSchema.pre("save", async function (next) {
	try {
		if (this.isModified("expenses")) {
			const expenses = await Expense.aggregate([
				{ $match: { owner: this._id } },
				{ $group: { _id: null, total: { $sum: "$amount" } } },
			]);

			this.totalExpenses = expenses[0]?.total || 0;
		}

		next();
	} catch (error) {
		logger.error(`Error in UserSchema.pre("save") expenses: ${error}`);
		next(error);
	}
});

//Update the totalIncome field in User schema
UserSchema.pre("save", async function(next){
	try {
		if(this.isModified("income")){
			const income = await Payment.aggregate([
				{ $match: { owner: this._id } },
				{ $group: { _id: null, total: { $sum: "$amount" } } }
			]);

			this.totalIncome = income[0]?.total || 0;

			next()
		}
	} catch (error) {
		logger.error(`Error in UserSchema.pre("save") income: ${error}`);
		next(error);
	}
})

//model
const User = mongoose.model("User", UserSchema);
module.exports = User;
