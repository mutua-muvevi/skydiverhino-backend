/**
 * DELETE LEAD CONTROLLER
 *
 * Delete Single Lead
 * Steps:
 * - Validate the lead id
 * - Find the lead
 * - Delete the lead
 * - Remove the lead from the user's leads array
 * - Remove the lead from the service's leads array if
 *
 * Delete Multiple Leads
 * Steps:
 * - Validate the lead ids
 * - Find the leads
 * - Delete the leads
 * - Remove the leads from the user's leads array
 *
 */

//imports
const mongoose = require("mongoose");
const Lead = require("../../models/lead/lead");
const Service = require("../../models/service/service");
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { createNotification } = require("../notification/new");

//delete single lead controller
exports.deleteLead = async (req, res, next) => {
	const { leadID } = req.params;
	const user = req.user;

	//Step: validate the lead id
	if (!leadID || !mongoose.Types.ObjectId.isValid(leadID)) {
		logger.warn(
			`Invalid lead ID provided in DeleteLead Controller: ${leadID}`
		);
		return next(new ErrorResponse("Invalid lead ID", 400));
	}

	try {
		const start = performance.now();

		//find the lead that belongs to this user
		const lead = await Lead.findOne({
			_id: leadID,
		});

		if (!lead) {
			return next(
				new ErrorResponse("You are not authorized to delete", 401)
			);
		}

		//if the lead has a service, remove the lead from the service's leads array
		if (lead.service !== null) {
			await Service.updateOne(
				{
					_id: lead.service,
				},
				{
					$pull: { leads: leadID },
				}
			);
		}

		//delete the lead
		await Lead.findByIdAndDelete(leadID);

		//create notification
		const notification = {
			details: `The lead has been deleted successfully`,
			type: "delete",
			relatedModel: "Lead",
			relatedModelID: lead._id,
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		//send data to user
		res.status(200).json({
			success: true,
			data: {},
			message: "Lead has deleted successfully",
		});

		const end = performance.now();

		//logging the success
		logger.info(
			`Lead: ${leadID} deleted successfully by user : ${user._id} in ${
				end - start
			}ms`
		);
	} catch (error) {
		logger.error(`Error in DeleteLead Controller: ${error.message}`);
		next(error);
	}
};

//delete multiple leads controller
exports.deleteLeads = async (req, res, next) => {
	const { leadIDs } = req.body;
	const user = req.user;

	//Step: validate the lead ids
	if (
		!leadIDs ||
		!Array.isArray(leadIDs) ||
		leadIDs.length === 0 ||
		!leadIDs.every((id) => mongoose.Types.ObjectId.isValid(id))
	) {
		logger.warn(
			`Invalid lead IDs provided in DeleteLeads Controller: ${leadIDs}`
		);
		return next(new ErrorResponse("Invalid lead IDs", 400));
	}

	try {
		const start = performance.now();

		//find the leads that belong to this user
		const leads = await Lead.find({
			_id: { $in: leadIDs },
		});

		if (leads.length === 0) {
			return next(
				new ErrorResponse("You are not authorized to delete", 401)
			);
		}

		if (leads.length !== leadIDs.length) {
			logger.warn("Some leads not found or not authorized");
			return next(
				new ErrorResponse("Some leads not found or not authorized", 403)
			);
		}

		//remove the leads from the user's leads array
		user.updateOne({ $pull: { leads: { $in: leadIDs } } }).exec();

		//if the lead has a service, remove the lead from the service's leads array
		const serviceIDs = leads.map((lead) => lead.service);

		if (serviceIDs.length > 0) {
			await Service.updateMany(
				{
					_id: { $in: serviceIDs },
				},
				{
					$pull: { leads: { $in: leadIDs } },
				}
			);
		}

		//delete the leads
		await Lead.deleteMany({ _id: { $in: leadIDs } });

		//create notification
		const notification = {
			details: `${leadIDs.length} leads have been deleted successfully`,
			type: "delete",
			relatedModel: "Lead",
			createdBy: user._id,
		};

		req.body = notification;
		await createNotification(req, res, next);

		//send data to user
		res.status(200).json({
			success: true,
			data: {},
			message: "Leads have deleted successfully",
		});

		const end = performance.now();

		//logging the success
		logger.info(
			`${leadIDs.length} Leads deleted successfully by user : ${
				user._id
			} in ${end - start}ms`
		);
	} catch (error) {
		logger.error(`Error in deleteManyLeads Controller: ${error.message}`);
		next(error);
	}
};
