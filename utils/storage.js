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

// Step 1: Configure Google Cloud Storage
const storage = new Storage({
	projectId: process.env.GCP_PROJECT_ID,
	keyFilename: path.join(__dirname, "../gcpkeys.json"),
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);

// console.log("The bucket here is ", bucket)

const getFolderByExtension = (extension) => {
	const mappings = {
		".jpg": "images",
		".jpeg": "images",
		".png": "images",

		".mp4": "videos",
		".mkv": "videos",
		".flv": "videos",
		".avi": "videos",
		".mov": "videos",

		".mp3": "audio",
		".m4a": "audio",

		".pdf": "documents",
		".doc": "documents",
		".docx": "documents",
		".txt": "documents",
		".xls": "documents",
		".xlsx": "documents",
		".ppt": "documents",
		".pptx": "documents",

		".ai": "designs",

		".py": "code",
		".js": "code",
		".ts": "code",
		".json": "code",
		".jsx": "code",
		".java": "code",
		".c": "code",
		".html": "code",
		".htm": "code",
		".css": "code",
		// ... add more mappings as needed
	};

	return mappings[extension] || "others";
};
// Step 3: Upload file to Google Cloud Storage
const uploadToGCS = async (file) => {
	return new Promise((resolve, reject) => {
		if (!file) {
			return reject(new Error("No file provided"));
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

module.exports = {
	uploadToGCS,
	updateInGCS,
	deleteFromGCS,
};
