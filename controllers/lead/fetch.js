/**
 * FETCH LEAD CONTROLLER
 * ==========================
 *
 * Fetch All Leads:
 *
 * Fetch All Leads for User:
 *
 * Fetch Single Lead:
 *
 */

//package import
const mongoose = require("mongoose");
const Lead = require("../../models/lead/lead");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");

//fetch all leads in the database
exports.fetchAllLeads = async (req, res, next) => {
	try {
		const start = performance.now();

		//find all leads
		const leads = await Lead.find().sort({ createdAt: -1 }).lean();

		if (!leads) {
			return next(new ErrorResponse("No leads found", 404));
		}

		//send a success response back to the client with the list of leads
		res.status(200).json({
			success: true,
			count: leads.length,
			data: leads,
		});

		const end = performance.now();

		logger.info(`Fetched all leads in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAll Leads: ${error.message}`);
		next(error);
	}
};

//fetch a single lead
exports.fetchLeadByID = async (req, res, next) => {
	const { leadID } = req.params;
	const user = req.user;

	if (!mongoose.Types.ObjectId.isValid(leadID)) {
		return next(new ErrorResponse("Invalid client id", 400));
	}

	try {
		const start = performance.now();

		//find the lead
		const lead = await Lead.findOne({
			_id: leadID,
		}).lean();

		if (!lead) {
			return next(new ErrorResponse("Lead not found", 404));
		}

		//send a success response back to the client with the lead
		res.status(200).json({
			success: true,
			data: lead,
		});

		const end = performance.now();

		logger.info(
			`Fetched lead: {${leadID}} for user: {${user._id}} in ${
				end - start
			}ms.`
		);
	} catch (error) {
		logger.error(`Error in fetchLeadByID: ${error.message}`);
		next(error);
	}
};
