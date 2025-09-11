// lib/services/media-upload-service.ts
import { post } from "@/lib/api-client";

/**
 * Media types supported by the upload service
 */
export enum MediaType {
	IMAGE = "image",
	VIDEO = "video",
	DOCUMENT = "document",
	AUDIO = "audio",
}

/**
 * Individual file data from the backend response
 */
export interface UploadedFileData {
	originalName: string;
	filename: string;
	path: string;
	url: string;
	size: number;
	mimetype: string;
	uploadedAt: string; // Assuming these are part of the backend's file data
	uploadedBy: string; // Assuming these are part of the backend's file data
}

/**
 * Structure of the `data` field within the full successful backend response.
 * This is what the `api-client`'s `post` method is expected to return directly.
 */
interface ApiClientSuccessData {
	files: UploadedFileData[];
	count: number;
}

/**
 * Full response structure from the media upload API (backend format for success).
 * This is what the `uploadMedia` service function aims to return.
 */
export interface MediaUploadResponse {
	success: true;
	message: string;
	data: ApiClientSuccessData; // Embeds the structure returned by api-client
}

/**
 * Full error response from the media upload API (backend format for failure).
 * This structure is expected in `error.response.data` if the api-client propagates HTTP errors.
 */
export interface MediaUploadError {
	success: false;
	message: string;
	errors?: Record<string, string[]>;
}

/**
 * Options for media upload
 */
export interface MediaUploadOptions {
	mediaType: MediaType;
	folder?: string;
	onProgress?: (progress: number) => void;
	maxSize?: number;
	allowedTypes?: string[];
}

const DEFAULT_OPTIONS: Record<MediaType, Partial<MediaUploadOptions>> = {
	[MediaType.IMAGE]: {
		maxSize: 10 * 1024 * 1024, // 10MB
		allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
	},
	[MediaType.VIDEO]: {
		maxSize: 100 * 1024 * 1024, // 100MB
		allowedTypes: ["video/mp4", "video/webm", "video/ogg"],
	},
	[MediaType.DOCUMENT]: {
		maxSize: 20 * 1024 * 1024, // 20MB
		allowedTypes: [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		],
	},
	[MediaType.AUDIO]: {
		maxSize: 50 * 1024 * 1024, // 50MB
		allowedTypes: ["audio/mpeg", "audio/wav", "audio/ogg"],
	},
};

export function validateFile(
	file: File,
	options: Partial<MediaUploadOptions> = {}
): { valid: true } | { valid: false; error: string } {
	const mediaType = options.mediaType || getMediaTypeFromFile(file);
	const defaultOpts = DEFAULT_OPTIONS[mediaType] || {};
	const maxSize = options.maxSize || defaultOpts.maxSize;
	const allowedTypes = options.allowedTypes || defaultOpts.allowedTypes;

	if (maxSize && file.size > maxSize) {
		const maxSizeMB = Math.round(maxSize / (1024 * 1024));
		return {
			valid: false,
			error: `File size exceeds the maximum allowed size (${maxSizeMB}MB)`,
		};
	}
	if (
		allowedTypes &&
		allowedTypes.length > 0 &&
		!allowedTypes.includes(file.type)
	) {
		return {
			valid: false,
			error: `File type not supported. Allowed types: ${allowedTypes.map((type) => type.split("/")[1]).join(", ")}`,
		};
	}
	return { valid: true };
}

export function getMediaTypeFromFile(file: File): MediaType {
	const mimeType = file.type.toLowerCase();
	if (mimeType.startsWith("image/")) return MediaType.IMAGE;
	if (mimeType.startsWith("video/")) return MediaType.VIDEO;
	if (mimeType.startsWith("audio/")) return MediaType.AUDIO;
	return MediaType.DOCUMENT;
}

export async function uploadMedia(
	file: File,
	options: Partial<MediaUploadOptions> = {}
): Promise<MediaUploadResponse> {
	const mediaType = options.mediaType || getMediaTypeFromFile(file);
	const validation = validateFile(file, { ...options, mediaType });
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const formData = new FormData();
	formData.append("files", file);
	formData.append("mediaType", mediaType);
	if (options.folder) {
		formData.append("folder", options.folder);
	}

	console.log("📁 Uploading file:", {
		name: file.name,
		size: file.size,
		type: file.type,
		mediaType,
		folder: options.folder,
	});

	const postOptions: Record<string, any> = { headers: {} };
	if (options.onProgress && typeof options.onProgress === "function") {
		postOptions.onUploadProgress = (progressEvent: any) => {
			if (progressEvent.lengthComputable && progressEvent.total > 0) {
				const percentCompleted = Math.round(
					(progressEvent.loaded * 100) / progressEvent.total
				);
				options.onProgress!(percentCompleted);
			}
		};
	}

	try {
		// `post` is expected to return the content of the `data` field from the backend response
		const apiClientResponseData = await post<ApiClientSuccessData>(
			"/media/upload",
			formData,
			postOptions
		);

		// Validate the structure received from the api-client
		if (
			!apiClientResponseData ||
			!apiClientResponseData.files ||
			!Array.isArray(apiClientResponseData.files) ||
			typeof apiClientResponseData.count !== "number"
		) {
			console.error(
				"Malformed data structure received from API client (expected files array and count):",
				apiClientResponseData
			);
			throw new Error(
				"Received unexpected data structure from server after upload."
			);
		}

		// If a single file was uploaded, we expect at least one file in the response.
		// Backend might support batch uploads where count > files.length if some fail,
		// but for a single file upload, files.length should be > 0 for success.
		if (apiClientResponseData.files.length === 0) {
			console.warn(
				"API client reported success, but no files were processed in the data:",
				apiClientResponseData
			);
			throw new Error(
				"Server processed the upload, but no file details were returned."
			);
		}

		// Construct the full MediaUploadResponse that this service function promises
		const successResponse: MediaUploadResponse = {
			success: true,
			message: `Successfully uploaded ${apiClientResponseData.files.length} file(s)`,
			data: apiClientResponseData,
		};
		console.log('✅ Media upload successful:', successResponse.data);
		return successResponse;

	} catch (error: any) {
		console.error("Media upload failed:", error);

		// Check if the error is one of our known pre-upload or post-data-validation errors
		if (
			error.message &&
			(error.message.startsWith("File size exceeds") ||
				error.message.startsWith("File type not supported") ||
				error.message.startsWith(
					"Received unexpected data structure from server after upload."
				) ||
				error.message.startsWith(
					"Server processed the upload, but no file details were returned."
				))
		) {
			throw error; // Rethrow specific, already clear errors
		}

		let errorMessage = "Failed to upload file due to an unexpected error.";

		// This part assumes api-client throws an error where error.response.data
		// is the *full backend error response* { success: false, message: ..., errors: ... }
		if (error.response && error.response.data) {
			const backendErrorPayload = error.response.data as Partial<MediaUploadError>;

			if (
				typeof backendErrorPayload.success === "boolean" &&
				backendErrorPayload.success === false &&
				backendErrorPayload.message
			) {
				errorMessage = backendErrorPayload.message;
				if (backendErrorPayload.errors) {
					const errorDetails = Object.entries(backendErrorPayload.errors)
						.map(([field, messages]) => `${field}: ${messages.join(", ")}`)
						.join("; ");
					errorMessage += ` Details: ${errorDetails}`;
				}
			} else if (backendErrorPayload.message) {
				// If 'success' isn't explicitly false but a message exists
				errorMessage = backendErrorPayload.message;
			} else {
				// Fallback for less structured errors from the server
				errorMessage = `Server error: ${error.response.status} - ${error.response.statusText || "Unknown error"}. Response data: ${JSON.stringify(error.response.data).substring(0, 200)}`;
			}
		} else if (error.request) {
			// Request was made but no response received
			errorMessage = "No response from server. Please check your network connection.";
		} else if (error.message) {
			// Other client-side errors (e.g., from FormData issues not caught earlier)
			errorMessage = error.message;
		}

		// Create a new error with the processed message but try to preserve original error details
		const enhancedError = new Error(errorMessage) as any;
		if (error.response) enhancedError.response = error.response; // For further inspection if needed
		if (error.request) enhancedError.request = error.request;
		if (error.stack) enhancedError.stack = error.stack; // Preserve original stack

		throw enhancedError;
	}
}

export function createMockUploadResponse(file: File): MediaUploadResponse {
	const url = URL.createObjectURL(file);
	const fileData: UploadedFileData = {
		originalName: file.name,
		filename: `mock-${Date.now()}-${file.name}`,
		path: `mock/${file.name.replace(/\\/g, "/")}`,
		url,
		size: file.size,
		mimetype: file.type,
		uploadedAt: new Date().toISOString(),
		uploadedBy: "mock-user-id",
	};
	return {
		success: true,
		message: "Successfully uploaded 1 file(s) (mock)",
		data: {
			files: [fileData],
			count: 1,
		},
	};
}
