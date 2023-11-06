//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

//shema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "Notification",
	optimisticConcurrency: true,
};

const NotificationSchema = new Schema(
	{
		details: {
			type: String,
			minLength: [
				5,
				"Minimum characters required for notification details is 5",
			],
			maxLength: [
				200,
				"Maximum characters required for notification details is 200",
			],
			trim: true,
			required: [true, "Title is required"],
		},
		type: {
			type: String,
			enum: {
				values: ["create", "edit", "delete", "convert", "add", "remove", "assign"],
				message: "{VALUE} is not supported",
			},
			required: true,
			index: true,
		},
		relatedModel: {
			type: String,
			enum: {
				values: [
					"User",

					"Project",
					"Task",
					"Team",
					"Member",
					"Contribution",
					
					"Expense",
					"Service",
					"Comment",
					"File",

					"Client",
					"Lead",
					"Payment",
					"Expense",

					"FAQ",
				],
				message: "{VALUE} is not supported",
			},
		},
		relatedModelID: {
			type: mongoose.Schema.Types.ObjectId,
			refPath: "relatedModel",
			default: null,
		},
		isRead: {
			type: Boolean,
			default: false,
			index: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
	},
	MainSchemaOptions
);

//handling the notification retention
const maxNotificationBeforCleanup = process.env.MAX_NOTIFICATIONS_BEFORE_CLEANUP;
const notificationRetentionDays = process.env.NOTIFICATION_RETENTION_DAYS;

NotificationSchema.pre("save", async function (next) {
	try {
		const notificationCount = await this.model(
			"Notification"
		).countDocuments();

		if (notificationCount >= maxNotificationBeforCleanup) {
			const dateLimit = new Date();
			dateLimit.setDate(dateLimit.getDate() - notificationRetentionDays);

			// Delete notifications older than the retention policy
			await this.model("Notification").deleteMany({
				createdAt: { $lt: dateLimit },
			});
		}

		next();
	} catch (error) {
		// Handle the error as per your application's error handling logic
		next(error);
	}
});

//the model
const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
