/**
 * ===================================
 * Controller for fetching storage data
 */

//package import
const ErrorResponse = require("../../utils/errorResponse");
const logger = require("../../utils/logger");
const { calculateStorageUsage, getStorageDetails } = require("../../utils/storage");

//fetch all Expenses
exports.fetchStorage = async (req, res, next) => {
	const user = req.user;
	
	try {
		const start = performance.now();

		if(!user){
			return next(new ErrorResponse("You are not Authorized", 401));
		}
		
		const { fullname } = user;

		const files  = await getStorageDetails(fullname);

		const storage = calculateStorageUsage(files)
		
		user.storage = storage;
		await user.save();
		
		//send a success response back to the client with the list of expenses
		res.status(200).json({
			success: true,
			storage
		});
		
		const end = performance.now();
		logger.info(`Fetched all expenses by user ${user._id} in ${end - start}ms.`);
	} catch (error) {
		logger.error(`Error in fetchAll Expenses: ${error.message}`);
		next(error);
	}
};