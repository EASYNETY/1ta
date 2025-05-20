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

## Implementation Details

### Two-Phase Rendering

The media upload components use a two-phase rendering approach:

1. **First Phase**: When a file is selected, a local preview URL is generated using `URL.createObjectURL(file)`. This allows for immediate feedback to the user.

2. **Second Phase**: After the file is uploaded to the server, the local preview URL is replaced with the remote URL returned by the server.

### Defensive Coding

The media upload components use defensive coding techniques to handle various edge cases:

1. **File Validation**: Files are validated before upload to ensure they meet the requirements (size, type, etc.).

2. **Error Handling**: Errors are caught and displayed to the user with meaningful messages.

3. **Memory Management**: Object URLs are revoked when they are no longer needed to prevent memory leaks.

4. **Progress Tracking**: Upload progress is tracked and displayed to the user.

5. **Fallbacks**: If the upload fails, the user can retry or select a different file.

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
