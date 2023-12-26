/**
 * Edit blog
 * @route PATCH /blog/:blogID
 * ============================================
 *
 * Steps:
 * - Validate the request body
 * - Check if blog exists if not return error
 * - Update the files in GCS
 * - Update the blog
 * - Send a response to the client
 *
 */

//imports
const Blog = require("../../models/blog/blog");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { updateInGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

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
					let updatedUrl = await updateInGCS(
						oldUrl.split("/").pop(),
						newImage
					);
					updatedUrls.push(updatedUrl);
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

//the controller
exports.editBlog = async (req, res, next) => {
	const user = req.user;
	const { blogID } = req.params;
	let { title, introDescription, contentBlocks, tags } = req.body;

	// Extracting thumbnail and content images from the request
	const thumbnail = req.files.thumbnail;
	const contentImages = req.files.image;

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

	//though this is done in the middleware, we still need to check
	if (!user) {
		errors.push("User is required");
	}

	if (errors.length > 0) {
		logger.warn(
			`Validation error in editBlog controller: ${errors.join(", ")}`
		);
		return next(new ErrorResponse(errors.join(", "), 400));
	}

	try {
		const start = performance.now();

		//check if the blog exist
		const blog = await Blog.findOne({ _id: blogID});

		if (!blog) {
			logger.warn(`Blog with id: ${blogID} not found`);
			return next(new ErrorResponse("Blog not found", 404));
		}

		//updating the files in GCS
		const startUpload = performance.now();

		// Updating the thumbnail if provided
		let thumbnailUrl = blog.thumbnail;
		
		if (thumbnail) {
			thumbnailUrl = await updateInGCS(
				blog.thumbnail.split("/").pop(),
				thumbnail[0]
			);
		}

		// Updating content block images
		const existingImageUrls = blog.contentBlocks.map(
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

		//parsiong the tags
		tags = JSON.parse(tags);

		// Update the blog
		blog.title = title || blog.title;
		blog.introDescription = introDescription || blog.introDescription;
		blog.contentBlocks = updatedContentBlocks;
		blog.tags = tags || blog.tags;
		blog.thumbnail = thumbnailUrl;
		blog.updatedBy = user._id;

		await blog.save();

		//create notification
		const notification = {
			details: `Blog was created sucessfully`,
			createdBy: user._id,
			type: "create",
			relatedModel: "Blog",
			relatedModelID: blog._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		res.status(201).json({
			success: true,
			message: "Blog edited successfully",
			data: blog,
		});

		const end = performance.now();

		logger.info(
			`Created edit blog with title: ${title} in ${end - start}ms`
		);
		logger.info(`Upload time is ${endUpload - startUpload}ms`);
	} catch (error) {
		logger.error(`Error creating edit blog: ${error}`);
		return next(new ErrorResponse(error.message, 500));
	}
};
