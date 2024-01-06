/**
 * FETCH HOMEPAGE DATA
 */

//package import
const mongoose = require("mongoose");
const Homepage = require("../../models/homepage/homepage");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//fetch the homepage
exports.fetchHomepage = async (req, res, next) => {
	try {
		const start = performance.now();

		//find the homepage
		const homepage = await Homepage.findOne().lean();

		if (!homepage) {
			return next(new ErrorResponse("No homepage found", 404));
		}

		//send a success response back to the client with the homepage data
		res.status(200).json({
			success: true,
			data: homepage,
		});

		const end = performance.now();

		logger.info(`Fetched homepage in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchHomepage: ${error.message}`);
		next(error);
	}
};