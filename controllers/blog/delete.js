/**
 * Delete Single Blog
 * =================================================
 * This controller is responsible for deleting a single blog.
 *
 * Steps:
 * - Validate the request parameter
 * - Check if blog exists if not return error
 * - Get the filename from blog.images if it exists
 * - delete the file in GCS
 * - Delete the blog
 * - Send a response to the client
 * - Log the success
 *
 */

//imports
const mongoose = require("mongoose");
const Blog = require("../../models/blog/blog");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { deleteFromGCS } = require("../../utils/storage");
const { createNotification } = require("../notification/new");

//helper function to get filename from url
function getFilenameFromUrl(url) {
	try {
		console.log("The url", url)
		// The filename is typically the last part of the pathname
		const filename = url.split("/").pop();
		console.log("The filename", filename)

		return filename;
	} catch (error) {
		logger.error(`Error extracting filename from URL: ${error.message}`);
		return null;
	}
}

//the controller
exports.deleteBlog = async (req, res, next) => {
	const { blogID } = req.params;
	const user = req.user;

	if (!blogID || !mongoose.Types.ObjectId.isValid(blogID)) {
		return next(new ErrorResponse("Invalid Blog ID", 400));
	}

	try {
		const start = performance.now();

		// Find the blog
		const blog = await Blog.findById(blogID);
		if (!blog) {
			return next(new ErrorResponse("Blog not found", 404));
		}

		// Check if the user is authorized to delete the blog
		if (blog.author.toString() !== user._id.toString()) {
			return next(
				new ErrorResponse("Unauthorized to delete this blog", 403)
			);
		}

		// Delete associated images from GCS
		const startDelete = performance.now();

		if (blog.thumbnail) {
			await deleteFromGCS(getFilenameFromUrl(blog.thumbnail));
		}
		for (const block of blog.contentBlocks) {
			if (block.image) {
				await deleteFromGCS(getFilenameFromUrl(block.image));
			}
		}
		const endDelete = performance.now();

		// Delete the blog
		await Blog.deleteOne({ _id: blogID });

		// Create notification
		const notification = {
			details: `Blog deleted successfully`,
			createdBy: user._id,
			type: "delete",
			relatedModel: "Blog",
			relatedModelID: blog._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		res.status(200).json({
			success: true,
			message: "Blog deleted successfully",
		});

		const end = performance.now();
		logger.info(`Blog deleted successfully in ${end - start}ms`);
		logger.info(`File deletion time: ${endDelete - startDelete}ms`);
	} catch (error) {
		logger.error(`Error in deleteBlog Controller: ${error}`);
		next(error);
	}
};
