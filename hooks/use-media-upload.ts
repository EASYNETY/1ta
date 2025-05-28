// hooks/use-media-upload.ts
import { useState, useCallback, useEffect } from 'react';
import {
  uploadMedia,
  MediaType,
  MediaUploadOptions,
  MediaUploadResponse,
  createMockUploadResponse
} from '@/lib/services/media-upload-service';

export interface MediaUploadState {
  /**
   * The selected file
   */
  file: File | null;

  /**
   * Local preview URL for the file
   */
  previewUrl: string | null;

  /**
   * Remote URL for the uploaded file
   */
  remoteUrl: string | null;

  /**
   * Upload progress (0-100)
   */
  progress: number;

  /**
   * Whether the file is currently being uploaded
   */
  isUploading: boolean;

  /**
   * Whether the file has been uploaded successfully
   */
  isUploaded: boolean;

  /**
   * Error message if upload failed
   */
  error: string | null;

  /**
   * Additional metadata about the uploaded file
   */
  metadata: MediaUploadResponse['data']['files'][0] | null;
}

export interface UseMediaUploadOptions extends Partial<MediaUploadOptions> {
  /**
   * Whether to automatically upload the file when selected
   * @default true
   */
  autoUpload?: boolean;

  /**
   * Whether to use mock uploads (for testing)
   * @default false
   */
  useMock?: boolean;

  /**
   * Initial file URL (for editing existing media)
   */
  initialUrl?: string | null;

  /**
   * Callback when upload is successful
   */
  onUploadSuccess?: (response: MediaUploadResponse) => void;

  /**
   * Callback when upload fails
   */
  onUploadError?: (error: Error) => void;
}

/**
 * Custom hook for handling media uploads
 */
export function useMediaUpload(options: UseMediaUploadOptions = {}) {
  const {
    autoUpload = true,
    useMock = false,
    initialUrl = null,
    onUploadSuccess,
    onUploadError,
    ...uploadOptions
  } = options;

  const [state, setState] = useState<MediaUploadState>({
    file: null,
    previewUrl: initialUrl,
    remoteUrl: initialUrl,
    progress: 0,
    isUploading: false,
    isUploaded: !!initialUrl,
    error: null,
    metadata: initialUrl ? { url: initialUrl } : null,
  });

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (state.previewUrl && state.previewUrl !== initialUrl) {
        URL.revokeObjectURL(state.previewUrl);
      }
    };
  }, [state.previewUrl, initialUrl]);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    (file: File | null) => {
      // Clean up previous preview URL
      if (state.previewUrl && state.previewUrl !== initialUrl) {
        URL.revokeObjectURL(state.previewUrl);
      }

      if (!file) {
        setState({
          file: null,
          previewUrl: initialUrl,
          remoteUrl: initialUrl,
          progress: 0,
          isUploading: false,
          isUploaded: !!initialUrl,
          error: null,
          metadata: null,
        });
        return;
      }

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);

      setState({
        file,
        previewUrl,
        remoteUrl: null,
        progress: 0,
        isUploading: false,
        isUploaded: false,
        error: null,
        metadata: null,
      });

      // Auto upload if enabled
      if (autoUpload) {
        uploadFile(file);
      }
    },
    [state.previewUrl, initialUrl, autoUpload]
  );

  /**
   * Upload the file to the server
   */
  const uploadFile = useCallback(
    async (fileToUpload: File = state.file!) => {
      if (!fileToUpload) {
        return;
      }

      setState((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }));

      try {
        let response: MediaUploadResponse;

        if (useMock) {
          // Use mock upload for testing
          await new Promise((resolve) => setTimeout(resolve, 1000));
          response = createMockUploadResponse(fileToUpload);
        } else {
          // Real upload with retry logic
          let retryCount = 0;
          const maxRetries = 2;

          while (retryCount <= maxRetries) {
            try {
              // Real upload
              response = await uploadMedia(fileToUpload, {
                ...uploadOptions,
                onProgress: (progress) => {
                  setState((prev) => ({ ...prev, progress }));
                },
              });

              // If we get here, the upload was successful
              break;
            } catch (uploadError: any) {
              // If we've reached max retries, throw the error
              if (retryCount === maxRetries) {
                throw uploadError;
              }

              // Otherwise, increment retry count and try again
              retryCount++;

              // Wait before retrying (exponential backoff)
              await new Promise(resolve =>
                setTimeout(resolve, 1000 * Math.pow(2, retryCount))
              );

              // Update state to show retrying
              setState((prev) => ({
                ...prev,
                progress: 0,
                error: `Retrying upload (${retryCount}/${maxRetries})...`,
              }));
            }
          }
        }

        // Validate the response
        if (!response || !response.data || !response.data.files || response.data.files.length === 0) {
          throw new Error('Invalid response from server');
        }

        // Get the first uploaded file
        const uploadedFile = response.data.files[0];

        setState((prev) => ({
          ...prev,
          remoteUrl: uploadedFile.url,
          isUploading: false,
          isUploaded: true,
          progress: 100,
          metadata: uploadedFile,
          error: null, // Clear any error messages
        }));

        onUploadSuccess?.(response);

        return response;
      } catch (error: any) {
        console.error('Upload failed:', error);

        // Create a user-friendly error message
        let errorMessage = error.message || 'Upload failed';

        // If it's a network error, provide a more helpful message
        if (error.name === 'NetworkError' ||
            (error.message && error.message.includes('network'))) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }

        // If the server is unavailable
        if (error.response && error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }));

        onUploadError?.(error);

        throw error;
      }
    },
    [state.file, uploadOptions, useMock, onUploadSuccess, onUploadError]
  );

  /**
   * Reset the state
   */
  const reset = useCallback(() => {
    // Clean up preview URL
    if (state.previewUrl && state.previewUrl !== initialUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }

    setState({
      file: null,
      previewUrl: initialUrl,
      remoteUrl: initialUrl,
      progress: 0,
      isUploading: false,
      isUploaded: !!initialUrl,
      error: null,
      metadata: null,
    });
  }, [state.previewUrl, initialUrl]);

  return {
    ...state,
    selectFile: handleFileSelect,
    upload: uploadFile,
    reset,
  };
}
