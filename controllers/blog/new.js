/**
 * CREATING A NEW BLOG CONTROLLER
 * ==============================
 * This controller is responsible for creating a new blog post.
 *
 * Steps:
 * - Validate the request body
 * - Check if blog with the same title exists
 * - Upload file to GCS
 * - Create the blog
 * - Send a response to the client
 *
 */

//imports
const Blog = require("../../models/blog/blog");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { uploadToGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

// Helper function to upload images and return their URLs
async function uploadImages(images) {
	//if there is no images or images is not an array or images length is less than one return empty array
	if (!images || !Array.isArray(images) || images.length < 1) {
		return [];
	}

	return Promise.all(images.map((img) => uploadToGCS(img)));
}

//the controller
exports.createBlog = async (req, res, next) => {
	const user = req.user;
	const { title, introDescription, contentBlocks, tags } = req.body;

	// Extracting thumbnail and content images from the request
	const thumbnail = req.files.thumbnail;
	const contentImages = req.files.contentImages;

	console.log("The request files are", req.files);
	console.log("The request body are", req.body);

	//Step: validate the request body
	let errors = [];

	if (!title) {
		errors.push("Title is required");
	}

	if (!introDescription) {
		errors.push("Intro description is required");
	}

	if (!contentBlocks || contentBlocks.length < 1) {
		errors.push("Content blocks is required");
	}

	if (!thumbnail) {
		errors.push("Thumbnail image is required");
	}

	//though this is done in the middleware, we still need to check
	if (!user) {
		errors.push("User is required");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in createBlog Controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//check if blog with the same title exists
		const existingBlog = await Blog.findOne({ title });

		if (existingBlog) {
			logger.warn(`Blog with title: ${title} already exists`);
			return next(
				new ErrorResponse(
					`Blog with title: ${title} already exists`,
					400
				)
			);
		}

		//upload the file to GCS`
		const startUpload = performance.now();

		const [thumbnailUrl, contentImageUrls] = await Promise.all([
			uploadToGCS(thumbnail),
			uploadImages(contentImages),
		]);

		// Assign each image URL to the corresponding content block
		const updatedContentBlocks = contentBlocks.map((block, index) => ({
			...block,
			image: contentImageUrls[index],
		}));

		const endUpload = performance.now();

		//create the blog
		const newBlog = await Blog.create({
			title,
			introDescription,
			thumbnail: thumbnailUrl,
			contentBlocks: updatedContentBlocks,
			author: user._id,
			tags,
		});

		if (!newBlog) {
			logger.warn(
				`Something went wrong creating blog with title: ${title}`
			);
			return next(
				new ErrorResponse(
					`Something went wrong creating blog with title: ${title}`,
					400
				)
			);
		}

		//create notification
		const notification = {
			details: `Blog was created sucessfully`,
			createdBy: user._id,
			type: "create",
			relatedModel: "Blog",
			relatedModelID: newBlog._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		res.status(201).json({
			success: true,
			message: "Blog created successfully",
			data: newBlog,
		});

		const end = performance.now();

		logger.info(
			`Created new blog with title: ${title} in ${end - start}ms`
		);
		logger.info(`Upload time is ${endUpload - startUpload}ms`);
	} catch (error) {
		logger.error(`Error creating new blog: ${error.message}`);
		return next(new ErrorResponse(error.message, 500));
	}
};
