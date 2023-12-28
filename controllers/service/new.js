/**
 * NEW SERVICE CONTROLLER
 * ========================
 * This controller is responsible for creating a new service.
 *
 * Steps:
 * - Validate the request body
 * - Create a new service
 * - Save the service
 * - Push the service to the user's services array
 * - Create notification
 * - Log the success
 *
 */

// the imports
const Service = require("../../models/service/service");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { uploadToGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

// Helper function to upload images and return their URLs
async function uploadImages(images) {
	if (!images || !Array.isArray(images) || images.length < 1) {
		return [];
	}

	return Promise.all(
		images.map((img, index) => {
			console.log(`Processing image ${index}: `, img);
			return uploadToGCS(img);
		})
	);
}

// the controller
exports.createService = async (req, res, next) => {
	const { name, introDescription, contentBlocks, prices, requirements, faq } = req.body;
	const user = req.user;

	
	// Extracting thumbnail and content images from the request
	const thumbnail = req.files.thumbnail;
	const contentImages = req.files.image;
	const contentGallery = req.files.gallery;

	// Step: Validate the request body
	const errors = [];

	if (!name) errors.push("Service name is required");

	if (!introDescription) errors.push("Service short description is required");

	//valitate to ensure that contentBlocks, prices and requirements are arrays that contains atleast one object
	if (!contentBlocks) errors.push("Service details is required");

	if (!prices ) errors.push("Service prices is required");

	if (!requirements) errors.push("Service requirements is required");

	if (!thumbnail) errors.push("Thumbnail image is required");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in CreateService Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		// Check if there is a service with a similar name
		const existingService = await Service.findOne({ name });

		if (existingService) {
			logger.warn(`Service with name: ${name} already exists`);
			return next(
				new ErrorResponse("Service with this name already exists", 400)
			);
		}

		// Upload the images
		const startUpload = performance.now();

		const [thumbnailUrl, detailImageUrls, galleryImages] = await Promise.all([
			uploadToGCS(thumbnail[0]),
			uploadImages(contentImages),
			uploadImages(contentGallery),
		]);

		// Assign each image URL to the corresponding content block
		const updatedContentBlocks = contentBlocks.map((block, index) => ({
			...block,
			image: detailImageUrls[index],
		}));


		const endUpload = performance.now();

		//parsing the stringified fields
		const parsedPrices = JSON.parse(prices);
		const parsedRequirements = JSON.parse(requirements);
		const parsedFAQ = JSON.parse(faq);

		// Create the service
		const service = await Service.create({
			thumbnail: thumbnailUrl,
			name,
			introDescription,
			contentBlocks: updatedContentBlocks,
			requirements: parsedRequirements,
			prices : parsedPrices,
			faqs :parsedFAQ,
			gallery: galleryImages,
		});

		if (!service) {
			logger.error(
				`Something went wrong while creating the service in the createService controller`
			);
			return next(
				new ErrorResponse(
					"Something went wrong while creating the service",
					500
				)
			);
		}

		// Create a notification
		const notification = {
			details: `A new service ${name} has been created successfully by user ${user._id}`,
			type: "create",
			relatedModel: "Service",
			relatedModelID: service._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		// Send response to the client
		res.status(201).json({
			success: true,
			message: "Service created successfully",
			data: service,
		});

		const end = performance.now();

		// Logging success
		logger.info(
			`Service created successfully for user: {${user._id}} in ${
				end - start
			}ms`
		);
		logger.info(`Upload time is ${endUpload - startUpload}ms`);
	} catch (error) {
		logger.error(`Error in CreateService Controller: ${error.message}`);
		next(error);
	}
};
