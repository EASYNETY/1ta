// lib/services/media-upload-service.ts
import { post } from '@/lib/api-client';

/**
 * Media types supported by the upload service
 */
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
}

/**
 * Response from the media upload API (frontend format)
 */
export interface MediaUploadResponse {
  success: boolean;
  data: {
    url: string;
    mediaId: string;
    mediaType: MediaType;
    filename: string;
    size: number;
    mimeType: string;
  };
  message?: string;
}

/**
 * Response from the backend media upload API (backend format)
 */
export interface BackendMediaUploadResponse {
  success: boolean;
  data: {
    files: Array<{
      url: string;
      filename: string;
      originalName: string;
      size: number;
      mimetype: string;
      mediaType?: string;
      mediaId?: string;
      mimeType?: string;
    }>;
    count: number;
  };
  message?: string;
}

/**
 * Error response from the media upload API
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
  /**
   * The type of media being uploaded
   */
  mediaType: MediaType;

  /**
   * Optional folder path to store the media in
   */
  folder?: string;

  /**
   * Optional callback to track upload progress
   */
  onProgress?: (progress: number) => void;

  /**
   * Optional maximum file size in bytes
   * Default: 10MB for images, 100MB for videos
   */
  maxSize?: number;

  /**
   * Optional allowed file types (MIME types)
   */
  allowedTypes?: string[];
}

/**
 * Default options for different media types
 */
const DEFAULT_OPTIONS: Record<MediaType, Partial<MediaUploadOptions>> = {
  [MediaType.IMAGE]: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  [MediaType.VIDEO]: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  },
  [MediaType.DOCUMENT]: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  [MediaType.AUDIO]: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  },
};

/**
 * Validates a file before upload
 */
export function validateFile(
  file: File,
  options: Partial<MediaUploadOptions> = {}
): { valid: true } | { valid: false; error: string } {
  const mediaType = options.mediaType || getMediaTypeFromFile(file);
  const defaultOpts = DEFAULT_OPTIONS[mediaType] || {};

  const maxSize = options.maxSize || defaultOpts.maxSize;
  const allowedTypes = options.allowedTypes || defaultOpts.allowedTypes;

  // Check file size
  if (maxSize && file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds the maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  // Check file type
  if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported. Allowed types: ${allowedTypes
        .map((type) => type.split('/')[1])
        .join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Determines the media type from a file's MIME type
 */
export function getMediaTypeFromFile(file: File): MediaType {
  const mimeType = file.type.toLowerCase();

  if (mimeType.startsWith('image/')) return MediaType.IMAGE;
  if (mimeType.startsWith('video/')) return MediaType.VIDEO;
  if (mimeType.startsWith('audio/')) return MediaType.AUDIO;

  return MediaType.DOCUMENT;
}

/**
 * Uploads a file to the server
 */
export async function uploadMedia(
  file: File,
  options: Partial<MediaUploadOptions> = {}
): Promise<MediaUploadResponse> {
  // Determine media type if not provided
  const mediaType = options.mediaType || getMediaTypeFromFile(file);

  // Validate file before upload
  const validation = validateFile(file, { ...options, mediaType });
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create form data
  const formData = new FormData();
  formData.append('files', file); // Changed from 'file' to 'files' to match backend
  formData.append('mediaType', mediaType);

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  console.log('📁 Uploading file:', {
    name: file.name,
    size: file.size,
    type: file.type,
    mediaType,
    folder: options.folder
  });

  try {
    // Call the backend upload endpoint
    const response = await post<BackendMediaUploadResponse>('/media/upload', formData, {
      headers: {
        // Don't set Content-Type header when using FormData
        // The browser will set it with the correct boundary
      },
    });

    console.log('📥 Backend response:', response);

    // Validate the response - handle backend format
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Invalid response from server');
    }

    // Backend returns { data: { files: [...], count: N } }
    // Frontend expects { data: { url: "...", mediaId: "...", ... } }
    if (response.data.files && response.data.files.length > 0) {
      const uploadedFile = response.data.files[0];

      // Transform backend response to frontend format
      const transformedResponse: MediaUploadResponse = {
        success: true,
        data: {
          url: uploadedFile.url,
          mediaId: uploadedFile.mediaId || `media_${Date.now()}`,
          mediaType: (uploadedFile.mediaType as MediaType) || getMediaTypeFromFile(file),
          filename: uploadedFile.filename || uploadedFile.originalName,
          size: uploadedFile.size,
          mimeType: uploadedFile.mimeType || uploadedFile.mimetype,
        },
        message: response.message || 'File uploaded successfully'
      };

      console.log('✅ Media upload successful:', transformedResponse.data);
      return transformedResponse;
    }

    // If no files in response, throw error
    throw new Error('No files were uploaded');
  } catch (error: any) {
    console.error('Media upload failed:', error);

    // Log detailed error information for debugging
    if (error.response) {
      console.error('📥 Server response:', error.response.data);
      console.error('📊 Response status:', error.response.status);
      console.error('📋 Response headers:', error.response.headers);
    }

    // Create a more user-friendly error message
    let errorMessage = 'Failed to upload file';

    if (error.response) {
      // Server responded with an error
      const serverMessage = error.response.data?.message || error.response.data?.error;
      errorMessage = serverMessage || `Server error: ${error.response.status}`;

      // Add debug info for development
      if (error.response.data?.debug) {
        console.error('🐛 Debug info:', error.response.data.debug);
        errorMessage += ` (Debug: ${JSON.stringify(error.response.data.debug)})`;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from server. Please check your connection.';
    } else if (error.message) {
      // Something else went wrong
      errorMessage = error.message;
    }

    // Create a new error with the user-friendly message
    const enhancedError = new Error(errorMessage) as any;

    // Preserve the original error properties
    if (error.response) enhancedError.response = error.response;
    if (error.request) enhancedError.request = error.request;

    throw enhancedError;
  }
}

/**
 * Creates a mock upload response for testing
 * This is used when the API is not available
 */
export function createMockUploadResponse(file: File): MediaUploadResponse {
  const mediaType = getMediaTypeFromFile(file);
  const url = URL.createObjectURL(file);

  return {
    success: true,
    data: {
      url,
      mediaId: `mock-${Date.now()}`,
      mediaType,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    },
    message: 'File uploaded successfully (mock)',
  };
}
