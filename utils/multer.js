/**
 * ## Multer Utility
 *
 * This utility is designed for handling various file uploads in the application.
 *
 * ### Step-by-step procedure:
 * 1. Define the file storage location and naming.
 * 2. Set up the file filtering mechanism.
 * 3. Create a multer instance with the specified storage and filter.
 * 4. Check if the storage backend is a third-party service like cloudinary or another API.
 *
 * ### Detailed Explanation:
 * - **multer**: Middleware for handling `multipart/form-data`, primarily used for uploading files.
 * - **path**: Provides utilities for working with file and directory paths.
 */

const multer = require("multer");
const path = require("path");

// Step 1: Define the memory storage
const storage = multer.memoryStorage();

// Step 2: Set up the file filtering mechanism
const fileFilter = (req, file, cb) => {
	// Convert extension to lowercase
	const ext = path.extname(file.originalname).toLowerCase();
	console.log("The req are", req.files)
	console.log("The req gallery is", req.body)

	const allowedExtensions = [
		".jpg", ".jpeg", ".png",
		".pdf",
		".txt", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
		".mp4", ".mkv", ".flv", ".avi", ".mov",
		".mp3",
		".psd", ".ai",
		".py", ".js", ".ts", ".json", ".jsx", ".java", ".c", ".html", ".htm", ".css"
	];
	
	if (!allowedExtensions.includes(ext)) {
		cb(new Error(`Only ${allowedExtensions.join(", ")} files are allowed`), false);
		return;
	}
	cb(null, true);
};

// Step 3: Create a multer instance with the specified storage and filter
const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: { fileSize: 100 * 1024 * 1024 }  // limit files to 100MB
});

exports.upload = upload;
