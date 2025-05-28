# Media Upload API Documentation

This document provides detailed specifications for the media upload endpoints in the SmartEdu platform. These endpoints handle the upload, management, and retrieval of media files such as images, videos, and documents.

## Overview

The Media Upload API allows users to upload various types of media files to the platform. The API supports different media types, provides progress tracking, and returns URLs that can be used to access the uploaded files.

## Base URL

```
http://34.249.241.206:5000/api/v1
```

## Authentication

All media upload endpoints require authentication. Include a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Media Types

The API supports the following media types:

- `image`: Images (JPEG, PNG, GIF, WebP)
- `video`: Videos (MP4, WebM, OGG)
- `document`: Documents (PDF, Word, Excel, PowerPoint)
- `audio`: Audio files (MP3, WAV, OGG)

## Endpoints

### Upload Media

Uploads a media file to the server.

- **URL**: `/media/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Required

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `files` | File | Yes | The media file(s) to upload (binary) |
| `mediaType` | String | Yes | The type of media (`image`, `video`, `document`, `audio`) |
| `folder` | String | Yes | Folder path to store the media in (e.g., "course-thumbnails", "profile-avatars") |

#### Response

```json
{
  "success": true,
  "message": "Successfully uploaded 1 file(s)",
  "data": {
    "files": [
      {
        "originalName": "IMG-20250525-WA0009.jpg",
        "filename": "IMG-20250525-WA0009-1748402826404-723016183.jpg",
        "path": "images\\IMG-20250525-WA0009-1748402826404-723016183.jpg",
        "url": "/courseTB/IMG-20250525-WA0009-1748402826404-723016183.jpg",
        "size": 46169,
        "mimetype": "image/jpeg",
        "uploadedAt": "2025-05-28T03:27:06.825Z",
        "uploadedBy": "32a14be8-70d9-437a-b9d0-42e5ab3c8c47"
      }
    ],
    "count": 1
  }
}
```

#### Error Response

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

### Get Media by ID

Retrieves information about a media file by its ID.

- **URL**: `/media/:mediaId`
- **Method**: `GET`
- **Authentication**: Required

#### Response

```json
{
  "success": true,
  "data": {
    "url": "https://storage.example.com/images/1234567890-image.jpg",
    "mediaId": "media_1234567890",
    "mediaType": "image",
    "filename": "image.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "uploadedBy": "user_123",
    "createdAt": "2023-05-20T12:34:56.789Z",
    "updatedAt": "2023-05-20T12:34:56.789Z"
  },
  "message": "Media retrieved successfully"
}
```

### Delete Media

Deletes a media file by its ID.

- **URL**: `/media/:mediaId`
- **Method**: `DELETE`
- **Authentication**: Required

#### Response

```json
{
  "success": true,
  "message": "Media deleted successfully"
}
```

## File Size Limits

The API enforces the following file size limits:

- Images: 10MB
- Videos: 100MB
- Documents: 20MB
- Audio: 50MB

## Allowed File Types

### Images
- JPEG/JPG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Videos
- MP4 (.mp4)
- WebM (.webm)
- OGG (.ogg)

### Documents
- PDF (.pdf)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- PowerPoint (.ppt, .pptx)

### Audio
- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)

## Implementation Notes for Backend Developers

### Storage Strategy

Media files should be stored in a scalable, reliable storage solution such as:

1. **Cloud Storage**: AWS S3, Google Cloud Storage, or Azure Blob Storage
2. **Local File System**: For development or small-scale deployments
3. **Content Delivery Network (CDN)**: For improved performance and global distribution

### File Processing

Consider implementing the following processing steps:

1. **Validation**: Verify file type, size, and content
2. **Virus Scanning**: Scan files for malware
3. **Image Processing**: Generate thumbnails, resize images, optimize for web
4. **Video Processing**: Generate thumbnails, transcode to different formats/qualities
5. **Metadata Extraction**: Extract and store metadata (dimensions, duration, etc.)

### Security Considerations

1. **Authentication**: Ensure all endpoints require authentication
2. **Authorization**: Verify the user has permission to upload/access/delete media
3. **Rate Limiting**: Prevent abuse by implementing rate limits
4. **Content Validation**: Validate file content matches the declared MIME type
5. **Secure URLs**: Consider using signed URLs for sensitive media

### Database Schema

The media files should be tracked in a database with the following fields:

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

### Progress Tracking

For large file uploads, implement progress tracking using:

1. **Chunked Uploads**: Split large files into smaller chunks
2. **WebSockets**: Provide real-time progress updates
3. **Resumable Uploads**: Allow resuming interrupted uploads

## Frontend Integration

The frontend should use the following approach for media uploads:

1. **Two-Phase Rendering**:
   - First phase: Show local preview URL from `URL.createObjectURL(file)`
   - Second phase: Replace with remote URL from server after upload

2. **Progress Tracking**:
   - Display progress bar during upload
   - Show upload speed and estimated time remaining

3. **Error Handling**:
   - Validate files before upload
   - Display meaningful error messages
   - Provide retry functionality

4. **Cleanup**:
   - Revoke object URLs to prevent memory leaks
   - Clean up temporary files

## Example Implementation

### Backend (Node.js with Express and Multer)

```javascript
const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mediaType = req.body.mediaType || 'other';
    const folder = path.join('uploads', mediaType + 's');
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueId}${extension}`);
  }
});

// Configure upload limits
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Implement file type validation here
    cb(null, true);
  }
});

// Upload endpoint
router.post('/upload', upload.array('files'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const mediaType = req.body.mediaType || 'image';
    const folder = req.body.folder || 'uploads';

    // Process uploaded files
    const uploadedFiles = req.files.map(file => {
      // Generate URL (in production, this would be a CDN URL)
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const url = `/${folder}/${file.filename}`;

      return {
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        url,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString(),
        uploadedBy: req.user?.id || 'anonymous'
      };
    });

    // In a real implementation, save file info to database

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload file(s)'
    });
  }
});

module.exports = router;
```
