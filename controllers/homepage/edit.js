/**
 * EDIT HOMEPAGE
 * ========================
 * This controller is responsible for editing a single part or all homepage data
 * 
 * Steps:
 * - Validate Request body
 * - Find the homepage data
 * - Update the respective files (video, images, etc)
 * - Update the homepage data
 * - Save the homepage data
 * 
 */

//the imports
const mongoose = require("mongoose");
const Homepage = require("../../models/homepage/homepage");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { uploadToGCS, updateInGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//Helper function that will help to update the specific files (video, images, etc)
async function updateFiles(files, existingUrls) {
	let updatedUrls = [];

	try {
		for (let i = 0; i < existingUrls.length; i++) {
			let oldUrl = existingUrls[i];
			let newFile = files[i];

			if (newFile) {
				if (!oldUrl) {
					let updatedUrl = await uploadToGCS(newFile);
					updatedUrls.push(updatedUrl);
				} else {
					let updatedUrl = await updateInGCS(
						oldUrl.split("/").pop(),
						newFile
					);
					updatedUrls.push(updatedUrl);
				}
			} else {
				updatedUrls.push(oldUrl);
			}
		}
	} catch (error) {
		logger.error(`Error updating files: ${error.message}`);
	}
};

//helper function for single file update
async function updateSingleFile(file, existingUrl) {
	let updatedUrl = existingUrl;

	try {
		if (file) {
			if (!existingUrl) {
				updatedUrl = await uploadToGCS(file);
			} else {
				updatedUrl = await updateInGCS(
					existingUrl.split("/").pop(),
					file
				);
			}
		}
		
	} catch (error) {
		logger.error(`Error updating single image: ${error.message}`);
	}

	return updatedUrl;
}

//the controller
exports.updateHomepage = async (req, res, next) => {
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

		// Find the homepage data
		const homepage = await Homepage.findOne();

		// Update the homepage data
		homepage.banner = banner;
		homepage.intro = intro;
		homepage.tandem = tandem;
		homepage.aff = aff;
		homepage.subscribe = subscribe;
		homepage.footer = footer;

		// Update the files
		homepage.bannerVideo = await updateSingleFile(
			bannerVideo,
			homepage.bannerVideo
		);
		homepage.introBackgroundImage = await updateSingleFile(
			introBackgroundImage,
			homepage.introBackgroundImage
		);
		homepage.tandemBackgroundImage = await updateSingleFile(
			tandemBackgroundImage,
			homepage.tandemBackgroundImage
		);
		homepage.affBackgroundImage = await updateSingleFile(
			affBackgroundImage,
			homepage.affBackgroundImage
		);
		homepage.subscribeImage = await updateSingleFile(
			subscribeImage,
			homepage.subscribeImage
		);
		homepage.subscribeBackgroundImage = await updateSingleFile(
			subscribeBackgroundImage,
			homepage.subscribeBackgroundImage
		);
		homepage.footerBackgroundImage = await updateSingleFile(
			footerBackgroundImage,
			homepage.footerBackgroundImage
		);

		homepage.tandemGallery = await updateFiles(
			tandemGallery,
			homepage.tandemGallery
		);
		homepage.affGallery = await updateFiles(
			affGallery,
			homepage.affGallery
		);

		// Save the homepage data
		await homepage.save();

		// Create a notification
		await createNotification({
			notificationType: "success",
			message: "Homepage updated successfully",
			data: homepage,
			user: user,
		});

		const end = performance.now();
		logger.info(
			`Updated homepage in ${end - start}ms, ${homepage._id}`
		);

		return res.status(200).json({
			success: true,
			message: "Homepage updated successfully",
			data: homepage,
		});
	} catch (error) {
		logger.error(`Error updating homepage: ${error.message}`);
		return next(new ErrorResponse("Error updating homepage", 500));
	}
};