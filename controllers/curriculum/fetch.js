/**
 * FETCH CLIENT CONTROLLER
 * ==========================
 *
 * Fetch All Curriculums:
 *
 * Fetch Single Curriculum:
 *
 */

//package import
const mongoose = require("mongoose");
const Curriculum = require("../../models/curriculum/curriculum");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//fetch all curriculums in the database
exports.fetchAllCurriculums = async (req, res, next) => {
	try {
		const start = performance.now();

		//find all curriculums
		const curriculums = await Curriculum.find()
			.sort({ createdAt: -1 })
			.lean()
			.populate([
				{
					path: "author",
					select: "fullname email",
				},
				{
					path: "updatedBy",
					select: "fullname email",
				},
			]);

		if (!curriculums) {
			return next(new ErrorResponse("No curriculums found", 404));
		}

		//send a success response back to the curriculum with the list of curriculums
		res.status(200).json({
			success: true,
			count: curriculums.length,
			data: curriculums,
		});

		const end = performance.now();

		logger.info(`Fetched all curriculums in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAll Curriculums: ${error.message}`);
		next(error);
	}
};

//fetch a single curriculum by id
exports.fetchCurriculumByID = async (req, res, next) => {
	const { curriculumID } = req.params;

	if (!mongoose.Types.ObjectId.isValid(curriculumID)) {
		return next(new ErrorResponse("Invalid curriculum id", 400));
	}

	try {
		const start = performance.now();

		//find the curriculum
		const curriculum = await Curriculum.findOne({
			_id: curriculumID,
		})
			.lean()
			.populate([
				{
					path: "author",
					select: "fullname email",
				},
				{
					path: "updatedBy",
					select: "fullname email",
				},
			]);

		if (!curriculum) {
			return next(new ErrorResponse("Curriculum not found", 404));
		}

		//send a success response back to the curriculum with the curriculum
		res.status(200).json({
			success: true,
			data: curriculum,
		});

		const end = performance.now();

		logger.info(`Fetched curriculum by id in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchCurriculumByID: ${error.message}`);
		next(error);
	}
};
