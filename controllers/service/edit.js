/**
 * SERVICE EDIT CONTROLLER
 * ========================
 *
 * Steps:
 * - Validate the request body and params
 * - Find the service and Update the service
 * - Save the service
 * - Push the updated service to the user's services array (if not already there)
 * - Create a notification
 * - Log the success
 */

//the imports
const mongoose = require("mongoose");
const Service = require("../../models/service/service");

const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");
const { updateInGCS, uploadToGCS } = require("../../utils/storage");

// Helper function to update images and return their URLs
async function updateImages(newImages, existingUrls) {
	try {
		let updatedUrls = [];

		for (let i = 0; i < existingUrls.length; i++) {
			let oldUrl = existingUrls[i];
			let newImage = newImages[i];

			// If a new image is provided, update it in GCS and get the new URL
			if (newImage) {
				try {
					//if the image does not exist in any of the content blocks, upload it to GCS
					if (!oldUrl) {
						let updatedUrl = await uploadToGCS(newImage);
						updatedUrls.push(updatedUrl);
					} else {
						let updatedUrl = await updateInGCS(
							oldUrl.split("/").pop(),
							newImage
						);
						updatedUrls.push(updatedUrl);
					}
				} catch (error) {
					throw new Error(`Error updating image: ${error.message}`);
				}
			} else {
				// If no new image, keep the existing URL
				updatedUrls.push(oldUrl.split("/").pop());
			}
		}

		return updatedUrls;
	} catch (error) {
		logger.error(`Error updating images: ${error.message}`);
		return error;
	}
}

// controller
exports.editService = async (req, res, next) => {
	const { name, shortDescription, contentBlocks, prices, requirements, faqs } =
		req.body;
	const { serviceID } = req.params;
	const user = req.user;

	// Extracting thumbnail and content images from the request
	const thumbnail = req.files.thumbnail;
	const contentImages = req.files.image;

	// Step: Validate the request body
	const errors = [];

	if (!name) errors.push("Service name is required");

	if (!shortDescription) errors.push("Service short description is required");

	//valitate to ensure that contentBlocks, prices and requirements are arrays that contains atleast one object
	if (!contentBlocks) errors.push("Service contentBlocks is required");

	if (!prices) errors.push("Service prices is required");

	if (!requirements) errors.push("Service requirements is required");

	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (!errors.length > 0) {
		logger.warn(
			`Validation error in CreateService Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		// Check if there is a service with a similar name
		const existingService = await Service.findOne({ _id: serviceID });

		if (!existingService) {
			logger.error(`Service with id: ${serviceID} does not exist`);
			return next(new ErrorResponse("Service not found", 404));
		}

		//updating the files in GCS
		const startUpload = performance.now();

		// Updating the thumbnail if provided
		let thumbnailUrl = existingService.thumbnail;

		if (thumbnail) {
			//if service has no thumbnail, upload it
			if (!thumbnailUrl) {
				thumbnailUrl = await uploadToGCS(thumbnail[0]);
			} else {
				//if service has a thumbnail, update it
				thumbnailUrl = await updateInGCS(
					existingService.thumbnail.split("/").pop(),
					thumbnail[0]
				);
			}
		}

		// Updating content block images
		const existingImageUrls = existingService.contentBlocks.map(
			(block) => block.image
		);
		const contentImageUrls = await updateImages(
			contentImages,
			existingImageUrls
		);

		// Assign each updated image URL to the corresponding content block
		const updatedContentBlocks = contentBlocks.map((block, index) => ({
			...block,
			image: contentImageUrls[index] || existingImageUrls[index],
		}));

		const endUpload = performance.now();

		let updatedService = {};

		if (name) updatedService.name = name;
		if (contentBlocks) updatedService.contentBlocks = updatedContentBlocks;
		if (prices) updatedService.prices = prices;
		if (requirements) updatedService.requirements = requirements;
		if (faqs) updatedService.faqs = faqs;

		// Find the service and update
		const service = await Service.findOneAndUpdate(
			{ _id: serviceID },
			updatedService,
			{ new: true, runValidators: true, context: "query" }
		);

		if (!service) {
			return next(
				new ErrorResponse("Not authorized to edit this service", 401)
			);
		}

		// Create a notification
		const notification = {
			details: `Service ${name} has been updated successfully by user ${user.fullname}`,
			createdBy: user._id,
			type: "edit",
			relatedModel: "Service",
			relatedModelID: service._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		// Send the response
		res.status(200).json({
			success: true,
			message: "Service updated successfully",
			data: service,
		});

		const end = performance.now();
		logger.info(
			`Service : ${serviceID} updated successfully for user: {${
				user._id
			}} in ${end - start}ms`
		);
		logger.info(`Upload time is ${endUpload - startUpload}ms`);
	} catch (error) {
		logger.error(`Error in EditService Controller: ${error.message}`);
		next(error);
	}
};
