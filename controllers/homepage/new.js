/**
 * HOMEPAGE CONTROLLER
 * ========================
 * This controller is responsible for creating the homepage data.
 *
 * Steps:
 * - Validate Request body
 * - Add images to gcp
 * - Create the homepage data
 * - Save the homepage data
 *
 */

//the imports
const mongoose = require("mongoose");
const Homepage = require("../../models/homepage/homepage");
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

//the controller
exports.createHomepage = async (req, res, next) => {
	const { banner, intro, tandem, aff, subscribe, footer } = req.body;
	const user = req.user;
	const {
		bannerVideo,
		introBackgroundImage,
		tandemBackgroundImage,
		tandemGallery,
		affBackgroundImage,
		affGallery,
		subscribeImage,
		subscribeBackgroundImage,
		footerBackgroundImage,
	} = req.files;

	// Step: Validate the request body
	const errors = [];

	if (!banner) errors.push("Banner is required");
	if (!intro) errors.push("Intro is required");
	if (!tandem) errors.push("Tandem is required");
	if (!aff) errors.push("AFF is required");
	if (!subscribe) errors.push("Subscribe is required");
	if (!footer) errors.push("Footer is required");

	if (!bannerVideo) errors.push("Banner video is required");
	if (!introBackgroundImage)
		errors.push("Intro background image is required");
	if (!tandemBackgroundImage)
		errors.push("Tandem background image is required");
	if (!tandemGallery || !Array.isArray(tandemGallery))
		errors.push("Tandem gallery is required");
	if (!affBackgroundImage) errors.push("AFF background image is required");
	if (!affGallery || !Array.isArray(affGallery))
		errors.push("AFF gallery is required");
	if (!subscribeImage) errors.push("Subscribe image is required");
	if (!subscribeBackgroundImage)
		errors.push("Subscribe background image is required");
	if (!footerBackgroundImage)
		errors.push("Footer background image is required");

	if (errors.length > 0) {
		logger.warn(
			`Validation error in CreateHomepage Controller: ${errors.join(
				", "
			)}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//check if homepage already exists
		const homepageExist = await Homepage.findOne({});

		if (homepageExist) {
			logger.warn(`Homepage already exists`);
			return next(new ErrorResponse("Homepage already exists", 400));
		}

		//upload images and videos section
		const startUpload = performance.now();

		//upload banner video
		const bannerVideoUrl = await uploadToGCS(bannerVideo);

		//upload intro background image
		const introBackgroundImageUrl = await uploadToGCS(introBackgroundImage);

		//upload tandem background image
		const tandemBackgroundImageUrl = await uploadToGCS(
			tandemBackgroundImage
		);

		//upload tandem gallery images
		const tandemGalleryImageUrls = await uploadImages(tandemGallery);

		//upload aff background image
		const affBackgroundImageUrl = await uploadToGCS(affBackgroundImage);

		//upload aff gallery images
		const affGalleryImageUrls = await uploadImages(affGallery);

		//upload subscribe image
		const subscribeImageUrl = await uploadToGCS(subscribeImage);

		const subscribeBackgroundImageUrl = await uploadToGCS(
			subscribeBackgroundImage
		);

		//upload footer background image
		const footerBackgroundImageUrl = await uploadToGCS(
			footerBackgroundImage
		);

		const endUpload = performance.now();

		//update the fields
		const updatedBanner = {
			...banner,
			video: bannerVideoUrl,
		};

		const updatedIntro = {
			...intro,
			backgroundImage: introBackgroundImageUrl,
		};

		const updatedTandem = {
			...tandem,
			backgroundImage: tandemBackgroundImageUrl,
			gallery: tandemGalleryImageUrls,
		};

		const updatedAff = {
			...aff,
			backgroundImage: affBackgroundImageUrl,
			gallery: affGalleryImageUrls,
		};

		const updatedSubscribe = {
			...subscribe,
			image: subscribeImageUrl,
			backgroundImage: subscribeBackgroundImageUrl,
		};

		const updatedFooter = {
			...footer,
			backgroundImage: footerBackgroundImageUrl,
		};

		//create the homepage
		const homepage = new Homepage({
			banner: updatedBanner,
			intro: updatedIntro,
			tandem: updatedTandem,
			aff: updatedAff,
			subscribe: updatedSubscribe,
			footer: updatedFooter,
		});

		if (!homepage) {
			logger.error(`Error in creating new homepage `);
			return next(new ErrorResponse("Error in creating homepage", 500));
		}

		//save the homepage
		await homepage.save();

		//create notification
		const notification = {
			details: `A new homepage has been created`,
			type: "create",
			relatedModel: "Homepage",
			relatedModelID: homepage._id,
		}

		req.body = notification;
		await createNotification(req, res, next);

		// Send response to the client
		res.status(201).json({
			success: true,
			message: "Homepage created successfully",
			data: homepage,
		});

		const end = performance.now();

		// Logging success
		logger.info(
			`Homepage created successfully for user: {${user._id}} in ${
				end - start
			}ms`
		);
		logger.info(`Upload time is ${endUpload - startUpload}ms`);
	} catch (error) {
		logger.error(
			`Error in CreateHomepage Controller: ${JSON.stringify(
				error.message
			)}`
		);
		next(error);
	}
};
