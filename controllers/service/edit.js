const mongoose = require("mongoose");
const Service = require("../../models/service/service");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");
const { updateInGCS, uploadToGCS } = require("../../utils/storage");

async function updateImages(newImages, existingUrls) {
	let updatedUrls = [];
	try {
		for (let i = 0; i < existingUrls.length; i++) {
			let oldUrl = existingUrls[i];
			let newImage = newImages[i];

			if (newImage) {
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
			} else {
				updatedUrls.push(oldUrl);
			}
		}
	} catch (error) {
		logger.error(`Error updating images: ${error.message}`);
	}
	return updatedUrls;
}

async function addNewGalleryImages(newImages) {
	let newUrls = [];
	for (const image of newImages) {
		if (image) {
			try {
				const newUrl = await uploadToGCS(image);
				newUrls.push(newUrl);
			} catch (error) {
				logger.error(
					`Error adding new gallery image: ${error.message}`
				);
			}
		}
	}
	return newUrls;
}

exports.editService = async (req, res, next) => {
	const {
		name,
		slug,
		introDescription,
		contentBlocks,
		prices,
		requirements,
		faqs,
	} = req.body;
	const { serviceID } = req.params;
	const user = req.user;

	const thumbnail = req.files.thumbnail;
	const contentImages = req.files.image;
	const contentGallery = req.files.gallery;

	const errors = [];
	if (!name) errors.push("Service name is required");
	if (!introDescription) errors.push("Service short description is required");
	if (!slug || !["aff", "tandem"].includes(slug))
		errors.push("Service slug must be either 'aff' or 'tandem'");
	if (!contentBlocks) errors.push("Service contentBlocks is required");
	if (!prices) errors.push("Service prices is required");
	if (!requirements) errors.push("Service requirements is required");
	if (!serviceID || !mongoose.isValidObjectId(serviceID))
		errors.push("Service ID is required and must be a valid ID");

	if (errors.length > 0) {
		logger.error(
			`Validation error in EditService Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		//Check if the service exists
		const existingService = await Service.findOne({ _id: serviceID });
		if (!existingService) {
			return next(new ErrorResponse("Service not found", 404));
		}

        // Ensure contentImages and contentGallery are arrays
		const contentImageFiles = Array.isArray(contentImages)
        ? contentImages
        : [contentImages].filter((img) => img);

        //Loop through the contentBlocks
		const existingImageUrls =
        existingService.contentBlocks.map((block) => block.image) || [];
    const existingGalleryUrls = existingService.gallery || [];

		// Update images for content blocks
		let updatedContentImageUrls = [];
		if (contentImages) {
			updatedContentImageUrls = await updateImages(
				contentImageFiles,
				existingImageUrls
			);
		}

		

		

		const contentGalleryFiles = Array.isArray(contentGallery)
			? contentGallery
			: [contentGallery].filter((img) => img);

		const [thumbnailUrl, contentImageUrls, galleryImageUrls] =
			await Promise.all([
				thumbnail
					? updateImages([thumbnail[0]], [existingService.thumbnail])
					: Promise.resolve([existingService.thumbnail]),

				contentImages
					? updateImages(contentImageFiles, existingImageUrls)
					: Promise.resolve([existingImageUrls]),
				contentGallery
					? addNewGalleryImages(contentGalleryFiles)
					: Promise.resolve([existingGalleryUrls]),
			]);

		const updatedContentBlocks = contentBlocks.map((block, index) => ({
			...block,
			image: contentImageUrls[index] || existingImageUrls[index],
		}));

		const updatedGallery = existingGalleryUrls.concat(galleryImageUrls);

		console.log("Existing gallery images", existingGalleryUrls);
		console.log("Updated images", updatedGallery);
		console.log("Content images", contentImageUrls);
		console.log("Content block images", updatedContentBlocks);

		let updatedService = {
			name,
			introDescription,
			contentBlocks: updatedContentBlocks,
			prices: JSON.parse(prices),
			requirements: JSON.parse(requirements),
			faqs: JSON.parse(faqs),
			thumbnail: thumbnailUrl[0],
			gallery: updatedGallery,
			slug,
		};

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

		const notification = {
			details: `Service ${name} has been updated successfully by user ${user.fullname}`,
			createdBy: user._id,
			type: "edit",
			relatedModel: "Service",
			relatedModelID: service._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		res.status(200).json({
			success: true,
			message: "Service updated successfully",
			data: service,
		});
	} catch (error) {
		logger.error(`Error in EditService Controller: ${error.message}`);
		next(error);
	}
};
