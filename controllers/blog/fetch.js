/**
 * 
 * Fetch all blogs
 * 
 * Fetch a single blog

 * 
 */

//package import
const mongoose = require("mongoose");
const Blog = require("../../models/blog/blog");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//fetch all blogs in the database
exports.fetchAllBlogs = async (req, res, next) => {
	try {
		const start = performance.now();

		//find all blogs
		const blogs = await Blog.find()
			.sort({ createdAt: -1 })
			.lean()
			.populate({
				path: "author",
				select: "fullname email",
			});

		if (!blogs) {
			return next(new ErrorResponse("No blogs found", 404));
		}

		//send a success response back to the blog with the list of blogs
		res.status(200).json({
			success: true,
			count: blogs.length,
			data: blogs,
		});

		const end = performance.now();

		logger.info(`Fetched all blogs in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAll blogs: ${error.message}`);
		next(error);
	}
};

//fetch a single blog
exports.fetchBlogByID = async (req, res, next) => {
	const { blogID } = req.params;

	if (!blogID || !mongoose.Types.ObjectId.isValid(blogID)) {
		return next(new ErrorResponse("Invalid blog id", 400));
	}

	try {
		const start = performance.now();

		//find the blog
		const blog = await Blog.findOne({
			_id: blogID,
		}).lean();

		if (!blog) {
			return next(new ErrorResponse("Blog not found", 404));
		}

		//send a success response back to the blog with the blog
		res.status(200).json({
			success: true,
			data: blog,
		});

		const end = performance.now();

		logger.info(`Fetched blog in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchBlogByID: ${error.message}`);
		next(error);
	}
};
