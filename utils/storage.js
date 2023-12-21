/**
 * ## GCP Upload Utility
 *
 * This utility is designed for handling file uploads to Google Cloud Storage.
 *
 * ### Step-by-step procedure:
 * 1. Configure Google Cloud Storage.
 * 3. Upload file to Google Cloud Storage.
 *
 * ### Detailed Explanation:
 * - **@google-cloud/storage**: Provides Google Cloud Storage client for Node.js.
 * - **path**: Provides utilities for working with file and directory paths.
 */

const { Storage } = require("@google-cloud/storage");
const path = require("path");
const { extensionMappings } = require("../config/extensionMapping");

// Step 1: Configure Google Cloud Storage
const storage = new Storage({
	projectId: process.env.GCP_PROJECT_ID,
	keyFilename: path.join(__dirname, "../gcpkeys.json"),
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);
const bucketName = process.env.GCP_BUCKET_NAME;

// console.log("The bucket here is ", bucket)

const getFolderByExtension = (extension) => {
	return extensionMappings[extension] || "others";
};
// Step 3: Upload file to Google Cloud Storage
const uploadToGCS = async (file) => {
	return new Promise((resolve, reject) => {
		if (!file || !file.originalname || !file.buffer) {
			console.log("The file is ", file)
			throw new Error("File is undefined or missing required properties");
		}

		const extension = path.extname(file.originalname).toLowerCase();
		const folderName = getFolderByExtension(extension);
		const newFileName = `${folderName}/${Date.now()}-${file.originalname}`;

		let fileUpload = bucket.file(newFileName);

		const blobStream = fileUpload.createWriteStream({
			metadata: {
				contentType: file.mimetype,
			},
		});

		blobStream.on("error", (error) => {
			reject(new Error(`Unable to upload. Error: ${error.message}`));
		});

		blobStream.on("finish", () => {
			// Make the file public
			fileUpload.makePublic((err, _) => {
				if (err) {
					reject(
						new Error(
							`Failed to make the file public. Error: ${err.message}`
						)
					);
				} else {
					const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
					resolve(url);
				}
			});
		});

		blobStream.end(file.buffer);
	});
};

/**
 * ## GCP Update Utility
 *
 * This utility is designed for updating files in Google Cloud Storage.
 *
 * ### Step-by-step procedure:
 * 1. Upload the new file to Google Cloud Storage.
 * 2. Delete the old file from Google Cloud Storage.
 * 3. Return the new file's URL.
 *
 * ### Detailed Explanation:
 * - **uploadToGCS**: Uploads the new file to Google Cloud Storage.
 * - **deleteFromGCS**: Deletes a specified file from Google Cloud Storage.
 * - The old file is deleted only after ensuring the new file is successfully uploaded.
 */
const updateInGCS = async (oldFileName, file) => {
	try {
		console.log("The file is ", file)
		console.log("The oldFileName is ", oldFileName)
		// Step 1: Upload the new file
		const newFileURL = await uploadToGCS(file);

		// Step 2: Delete the old file
		await deleteFromGCS(oldFileName);

		// Step 3: Return the new file's URL
		return newFileURL;
	} catch (error) {
		throw new Error(`Unable to update. Error: ${error.message}`);
	}
};

/**
 * ## GCP Delete Utility
 *
 * This utility is designed for deleting files from Google Cloud Storage.
 *
 * ### Step-by-step procedure:
 * 1. Check if the filename is provided.
 * 2. Use the `file.delete()` method to delete the specified file.
 * 3. Return a success message upon successful deletion.
 *
 * ### Detailed Explanation:
 * - **bucket.file()**: References a file in the specified bucket.
 * - **file.delete()**: Deletes the referenced file.
 */

const deleteFromGCS = async (oldFileName) => {
	if (!oldFileName || typeof oldFileName !== "string") {
		throw new Error("No filename provided or is not a valid string");
	}

	const extension = path.extname(oldFileName).toLowerCase();
	const folderName = getFolderByExtension(extension);

	const fullPath = `${folderName}/${oldFileName}`;
	const file = bucket.file(fullPath);

	try {
		await file.delete();
		return `Successfully deleted ${fullPath}`;
	} catch (err) {
		throw new Error(`Unable to delete. Error: ${err.message}`);
	}
};

//get storage details
const getStorageDetails = async () => {
	try {
		const [files] = await bucket.getFiles();
		return files;
	} catch (error) {
		console.error("Error fetching storage details:", error);
		throw error;
	}
};

const calculateStorageUsage = (files) => {
	const storageData = {};

	files.forEach((file) => {
		// Correct the way the folder is extracted from the file name.
		// Assuming the first part of the file name before the first '/' is the folder name.
		const folder = file.name.split("/")[0]; // Changed from [1] to [0]

		// It's good to have defensive programming here to handle any unexpected cases.
		if (!folder) return;

		const fileSize = parseInt(file.metadata.size, 10) || 0;

		// Ensure that a folder entry exists in storageData.
		if (!storageData[folder]) {
			storageData[folder] = { files: [], size: 0 };
		}

		// Construct the file URL correctly.
		const fileUrl = `https://storage.googleapis.com/${file.bucket.name}/${file.name}`;

		storageData[folder].files.push({
			number: storageData[folder].files.length + 1,
			file: fileUrl,
			size: fileSize,
			uploaded: new Date(file.metadata.timeCreated).toISOString(),
		});

		// Accumulate the file size to the folder's total size.
		storageData[folder].size += fileSize;
	});

	return storageData;
};

//Step: download file from GCS

/**
 * Downloads a file from Google Cloud Storage.
 * @param {string} filename The name of the file to be downloaded.
 * @param {Object} user The user object containing user-specific details.
 * @returns {Promise<stream.Readable>} A readable stream of the file.
 */
const downloadFromGCS = async (user, filename) => {
	if (!filename) {
		throw new Error("Filename is required");
	}

	if (!user) {
		throw new Error("User information is incomplete or not provided");
	}

	const extension = path.extname(filename).toLowerCase();
	const folderName = getFolderByExtension(extension);

	const fullPath = `${folderName}/${filename}`;
	const file = bucket.file(fullPath);

	try {
		const exists = await file.exists();
		if (!exists[0]) {
			throw new Error("File does not exist in GCS");
		}

		const readStream = file.createReadStream();
		return readStream;
	} catch (error) {
		throw new Error(`Error in downloading from GCS: ${error.message}`);
	}
};

module.exports = {
	uploadToGCS,
	updateInGCS,
	deleteFromGCS,
	downloadFromGCS,

	getStorageDetails,
	calculateStorageUsage,
};
