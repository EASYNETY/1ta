# Media Upload Components

This document provides detailed information about the media upload components in the SmartEdu platform. These components allow users to upload, preview, and manage media files such as images, videos, and documents.

## Overview

The media upload system in SmartEdu is designed to provide a seamless experience for uploading and managing media files. It supports various media types, provides real-time previews, and handles the upload process with progress tracking and error handling.

## Components

### 1. MediaUpload Component

The `MediaUpload` component is a reusable component for uploading media files. It supports different media types, provides a preview of the selected file, and handles the upload process.

#### Usage

```tsx
import { MediaUpload } from '@/components/ui/media-upload';
import { MediaType } from '@/lib/services/media-upload-service';

function MyComponent() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <MediaUpload
      mediaType={MediaType.IMAGE}
      label="Upload Image"
      description="PNG, JPG or GIF up to 10MB"
      initialUrl={imageUrl}
      onUrlChange={setImageUrl}
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mediaType` | `MediaType` | `MediaType.IMAGE` | The type of media to upload |
| `label` | `string` | Depends on media type | The label for the upload button |
| `description` | `string` | Depends on media type | The description text |
| `disabled` | `boolean` | `false` | Whether the upload is disabled |
| `initialUrl` | `string \| null` | `null` | The initial URL (for editing existing media) |
| `onFileSelect` | `(file: File \| null) => void` | - | Callback when a file is selected |
| `onUploadSuccess` | `(response: MediaUploadResponse) => void` | - | Callback when upload is successful |
| `onUploadError` | `(error: Error) => void` | - | Callback when upload fails |
| `onUrlChange` | `(url: string \| null) => void` | - | Callback when the URL changes |
| `showPreview` | `boolean` | `true` | Whether to show the preview |
| `showFileName` | `boolean` | `true` | Whether to show the file name |
| `showRemoveButton` | `boolean` | `true` | Whether to show the remove button |
| `autoUpload` | `boolean` | `true` | Whether to automatically upload the file when selected |
| `uploadOptions` | `Partial<UseMediaUploadOptions>` | `{}` | Additional options for the upload hook |

### 2. FormMediaUpload Component

The `FormMediaUpload` component is a form field wrapper for the `MediaUpload` component. It integrates with React Hook Form and provides form validation.

#### Usage

```tsx
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormMediaUpload } from '@/components/ui/form-media-upload';
import { MediaType } from '@/lib/services/media-upload-service';

// Define the form schema
const formSchema = z.object({
  profileImage: z.string().nullable().optional(),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileImage: null,
    },
  });

  const onSubmit = (data) => {
    console.log('Form submitted:', data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormMediaUpload
          name="profileImage"
          label="Profile Image"
          description="Upload a profile image"
          mediaType={MediaType.IMAGE}
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | The name of the form field |
| `label` | `string` | The label for the form field |
| `description` | `string` | The description for the form field |
| `...props` | `MediaUploadProps` | All props from `MediaUpload` component |

### 3. AvatarUpload Component

The `AvatarUpload` component is a specialized component for uploading and displaying avatar images. It provides a circular preview and supports different sizes.

#### Usage

```tsx
import { AvatarUpload } from '@/components/ui/avatar-upload';

function MyComponent() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  return (
    <AvatarUpload
      initialUrl={avatarUrl}
      onUrlChange={setAvatarUrl}
      name="John Doe"
      size="lg"
    />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialUrl` | `string \| null` | `null` | The initial URL of the avatar |
| `name` | `string` | `'User'` | The name to use for the fallback avatar |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'lg'` | The size of the avatar |
| `disabled` | `boolean` | `false` | Whether the avatar is disabled |
| `onUrlChange` | `(url: string \| null) => void` | - | Callback when the avatar URL changes |
| `uploadOptions` | `Partial<UseMediaUploadOptions>` | `{}` | Additional options for the upload hook |
| `className` | `string` | - | Additional class name |

## Hooks

### useMediaUpload Hook

The `useMediaUpload` hook is a custom hook that handles the media upload process. It provides state management, file selection, upload, and error handling.

#### Usage

```tsx
import { useMediaUpload } from '@/hooks/use-media-upload';
import { MediaType } from '@/lib/services/media-upload-service';

function MyComponent() {
  const {
    file,
    previewUrl,
    remoteUrl,
    progress,
    isUploading,
    isUploaded,
    error,
    selectFile,
    upload,
    reset,
  } = useMediaUpload({
    mediaType: MediaType.IMAGE,
    autoUpload: true,
    onUploadSuccess: (response) => {
      console.log('Upload successful:', response);
    },
  });

  return (
    <div>
      {previewUrl && <img src={previewUrl} alt="Preview" />}
      <button onClick={() => selectFile(null)}>Select File</button>
      {file && !isUploaded && (
        <button onClick={() => upload()}>Upload</button>
      )}
      {isUploading && <progress value={progress} max="100" />}
      {error && <p>{error}</p>}
    </div>
  );
}
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mediaType` | `MediaType` | - | The type of media to upload |
| `autoUpload` | `boolean` | `true` | Whether to automatically upload the file when selected |
| `useMock` | `boolean` | `false` | Whether to use mock uploads (for testing) |
| `initialUrl` | `string \| null` | `null` | Initial file URL (for editing existing media) |
| `onUploadSuccess` | `(response: MediaUploadResponse) => void` | - | Callback when upload is successful |
| `onUploadError` | `(error: Error) => void` | - | Callback when upload fails |
| `onProgress` | `(progress: number) => void` | - | Callback to track upload progress |
| `maxSize` | `number` | Depends on media type | Maximum file size in bytes |
| `allowedTypes` | `string[]` | Depends on media type | Allowed file types (MIME types) |
| `folder` | `string` | - | Optional folder path to store the media in |

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `file` | `File \| null` | The selected file |
| `previewUrl` | `string \| null` | Local preview URL for the file |
| `remoteUrl` | `string \| null` | Remote URL for the uploaded file |
| `progress` | `number` | Upload progress (0-100) |
| `isUploading` | `boolean` | Whether the file is currently being uploaded |
| `isUploaded` | `boolean` | Whether the file has been uploaded successfully |
| `error` | `string \| null` | Error message if upload failed |
| `metadata` | `Partial<MediaUploadResponse['data']> \| null` | Additional metadata about the uploaded file |
| `selectFile` | `(file: File \| null) => void` | Function to select a file |
| `upload` | `(file?: File) => Promise<MediaUploadResponse>` | Function to upload the file |
| `reset` | `() => void` | Function to reset the state |

## Services

### Media Upload Service

The `media-upload-service.ts` file provides utilities for validating and uploading media files.

#### MediaType Enum

```typescript
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
}
```

#### Functions

| Function | Description |
|----------|-------------|
| `validateFile(file: File, options?: Partial<MediaUploadOptions>)` | Validates a file before upload |
| `getMediaTypeFromFile(file: File)` | Determines the media type from a file's MIME type |
| `uploadMedia(file: File, options?: Partial<MediaUploadOptions>)` | Uploads a file to the server |
| `createMockUploadResponse(file: File)` | Creates a mock upload response for testing |

## Backend Implementation Guide

This section provides guidance for backend developers on how to implement the necessary endpoints to support the media upload system.

### Required Endpoints

#### 1. Media Upload Endpoint

- **URL**: `/api/v1/media/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Required

##### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | The media file to upload |
| `mediaType` | String | Yes | The type of media (`image`, `video`, `document`, `audio`) |
| `folder` | String | No | Optional folder path to store the media in (e.g., "avatars", "course-thumbnails") |

##### Expected Response Schema

```json
{
  "success": true,
  "data": {
    "url": "https://example.com/storage/images/user-avatars/1234567890.jpg",
    "mediaId": "media_1234567890",
    "mediaType": "image",
    "filename": "profile.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "width": 800,
    "height": 600
  },
  "message": "File uploaded successfully"
}
```

##### Error Response Schema

```json
{
  "success": false,
  "message": "Failed to upload file",
  "errors": {
    "file": ["File size exceeds the maximum allowed size (10MB)"],
    "mediaType": ["Invalid media type"]
  }
}
```

#### 2. Media Deletion Endpoint (Optional but Recommended)

- **URL**: `/api/v1/media/:mediaId`
- **Method**: `DELETE`
- **Authentication**: Required

##### Expected Response Schema

```json
{
  "success": true,
  "message": "Media deleted successfully"
}
```

### Implementation Requirements

1. **Storage Strategy**:
   - Store files in a secure, scalable storage solution (AWS S3, Google Cloud Storage, etc.)
   - Generate unique filenames to prevent collisions
   - Organize files in folders based on the `folder` parameter
   - Implement proper access controls

2. **File Processing**:
   - Validate file types and sizes before accepting uploads
   - For images: generate thumbnails, optimize for web
   - For videos: generate thumbnails, consider transcoding
   - Scan files for malware/viruses

3. **Response Requirements**:
   - The `url` field in the response is **critical** - it must be a fully qualified URL that can be directly used in the frontend
   - Include metadata like size, dimensions (for images), and duration (for videos/audio) when available
   - Ensure consistent response format across all media types

4. **Error Handling**:
   - Provide specific error messages for validation failures
   - Handle storage service errors gracefully
   - Return appropriate HTTP status codes (400 for validation errors, 500 for server errors)

5. **Performance Considerations**:
   - Implement direct-to-storage uploads for large files when possible
   - Consider using signed URLs for client-side uploads to storage services
   - Implement progress tracking for large file uploads

### Database Schema

We recommend tracking uploaded media in a database with a schema similar to:

```sql
CREATE TABLE media (
  id VARCHAR(255) PRIMARY KEY,
  url VARCHAR(1024) NOT NULL,
  media_type VARCHAR(50) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by VARCHAR(255) NOT NULL,
  folder VARCHAR(255),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Integration with User Profiles

For avatar uploads, the backend should:

1. Accept the avatar image through the media upload endpoint
2. Return the URL as described above
3. Allow the URL to be included in profile update requests

Example profile update endpoint:

- **URL**: `/api/v1/users/:userId`
- **Method**: `PUT`
- **Content-Type**: `application/json`

```json
{
  "name": "John Doe",
  "avatarUrl": "https://example.com/storage/images/user-avatars/1234567890.jpg",
  "bio": "Software developer"
}
```

The frontend will handle uploading the avatar image first, then include the returned URL in the profile update request.

### Handling Different Media Types

The backend should handle different media types appropriately:

#### Images
- Validate dimensions and aspect ratios
- Generate thumbnails in different sizes
- Optimize for web (compress, strip metadata)
- Support common formats: JPEG, PNG, GIF, WebP
- Return additional metadata: width, height, aspect ratio

#### Videos
- Generate thumbnail/poster image
- Consider transcoding to web-friendly formats
- Validate duration and file size
- Support common formats: MP4, WebM
- Return additional metadata: duration, dimensions, codec

#### Documents
- Generate preview images for the first few pages
- Validate file structure to ensure it's not corrupted
- Support common formats: PDF, DOCX, XLSX, PPTX
- Return additional metadata: page count, author

#### Audio
- Generate waveform visualization
- Validate audio quality
- Support common formats: MP3, WAV, OGG
- Return additional metadata: duration, bitrate, artist/title if available

The frontend components are designed to handle these different media types and display appropriate previews and fallbacks.

## Implementation Details

### Simplified Upload Flow

The media upload components follow a simple, consistent flow:

1. **File Selection**: User selects a file through the component's interface.

2. **Local Preview**: Immediately after selection, a local preview URL is generated using `URL.createObjectURL(file)` and displayed to the user.

3. **Automatic Upload**: The file is automatically uploaded to the server (if `autoUpload` is true, which is the default).

4. **URL Return**: Once the upload is complete, the component returns the remote URL through the `onUrlChange` callback.

5. **Form Integration**: The returned URL can be directly used in form payloads or other application logic.

### Two-Phase Rendering

The media upload components use a two-phase rendering approach for a seamless user experience:

1. **First Phase**: When a file is selected, a local preview URL is generated using `URL.createObjectURL(file)`. This allows for immediate feedback to the user without waiting for the upload to complete.

2. **Second Phase**: After the file is uploaded to the server, the local preview URL is replaced with the remote URL returned by the server. This ensures that the form submission uses the permanent server URL.

### Using the URL in Forms

The URL returned by the media upload components can be directly used in form payloads:

```tsx
// Example of using the avatar URL in a profile update
function ProfilePage() {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: null
  });

  // Handle avatar URL change
  const handleAvatarChange = (url: string | null) => {
    // Update the form data with the new URL
    setFormData(prev => ({
      ...prev,
      avatarUrl: url
    }));
  };

  // Submit the form with the avatar URL
  const handleSubmit = () => {
    // The avatarUrl is already part of the form data
    submitProfileUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other form fields */}

      {/* Avatar upload component */}
      <AvatarUpload
        initialUrl={formData.avatarUrl}
        onUrlChange={handleAvatarChange}
        name={formData.name}
      />

      <button type="submit">Update Profile</button>
    </form>
  );
}
```

### Defensive Coding

The media upload components use defensive coding techniques to handle various edge cases:

1. **File Validation**: Files are validated before upload to ensure they meet the requirements (size, type, etc.).

2. **Error Handling**: Errors are caught and displayed to the user with meaningful messages. The system includes retry logic with exponential backoff for transient errors.

3. **Memory Management**: Object URLs are revoked when they are no longer needed to prevent memory leaks.

4. **Progress Tracking**: Upload progress is tracked and displayed to the user.

5. **Fallbacks**: Components provide fallbacks when URLs are missing or invalid:
   - AvatarUpload shows initials when no image is available
   - MediaUpload shows appropriate placeholders based on media type
   - Error states are clearly communicated to the user

## Examples

### Basic Image Upload

```tsx
import { MediaUpload } from '@/components/ui/media-upload';
import { MediaType } from '@/lib/services/media-upload-service';

function ImageUploadExample() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <div>
      <h2>Image Upload</h2>
      <MediaUpload
        mediaType={MediaType.IMAGE}
        label="Upload Image"
        description="PNG, JPG or GIF up to 10MB"
        initialUrl={imageUrl}
        onUrlChange={setImageUrl}
      />
      {imageUrl && (
        <div>
          <h3>Uploaded Image</h3>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
}
```

### Form Integration

```tsx
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormMediaUpload } from '@/components/ui/form-media-upload';
import { MediaType } from '@/lib/services/media-upload-service';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  profileImage: z.string().nullable().optional(),
});

function ProfileForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      profileImage: null,
    },
  });

  const onSubmit = (data) => {
    console.log('Form submitted:', data);
    // The profileImage field contains the URL returned from the server
    // This URL can be directly used in API calls or stored in the database
  };

  return (
    <FormProvider {...form}>
      <Form>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your name" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormMediaUpload
            name="profileImage"
            label="Profile Image"
            description="Upload a profile image"
            mediaType={MediaType.IMAGE}
          />

          <Button type="submit">Save Profile</Button>
        </form>
      </Form>
    </FormProvider>
  );
}
```

### Real-World Example: Profile Avatar Integration

The following example shows how the AvatarUpload component is integrated into the user profile page:

```tsx
// ProfileAvatarInfo.tsx - A component that displays user avatar and info
export function ProfileAvatarInfo({ user, onAvatarChange }: ProfileAvatarInfoProps) {
  const { toast } = useToast();

  // Handle avatar URL change - simply pass it up to the parent component
  const handleAvatarChange = (url: string | null) => {
    // Call the parent callback if provided
    if (onAvatarChange) {
      onAvatarChange(url);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <AvatarUpload
          initialUrl={user.avatarUrl || null}
          name={user.name || "User"}
          size="xl"
          onUrlChange={handleAvatarChange}
          uploadOptions={{
            folder: "avatars",
            onUploadError: (error) => {
              toast({
                title: "Upload Failed",
                description: error.message || "There was a problem uploading your image.",
                variant: "destructive",
              });
            },
          }}
        />
      </div>
      <h2 className="text-xl font-semibold">{user.name}</h2>
      <p className="text-muted-foreground">{user.email}</p>
    </div>
  );
}

// ProfilePage.tsx - The parent component that handles profile updates
function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  return (
    <div>
      <Card>
        <CardContent>
          <ProfileAvatarInfo
            user={user}
            onAvatarChange={(url) => {
              // When avatar URL changes, update the profile
              if (user) {
                dispatch(updateUserProfileThunk({
                  avatarUrl: url
                }))
                .unwrap()
                .then(() => {
                  toast({
                    title: "Profile Updated",
                    description: "Your profile picture has been updated successfully.",
                    variant: "success",
                  });
                })
                .catch((error) => {
                  toast({
                    title: "Update Failed",
                    description: error.message || "There was a problem updating your profile picture.",
                    variant: "destructive",
                  });
                });
              }
            }}
          />

          {/* Rest of the profile form */}
        </CardContent>
      </Card>
    </div>
  );
}
```
