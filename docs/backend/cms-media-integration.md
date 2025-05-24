# CMS Media Management Integration

This document outlines how to integrate the existing media upload system with the comprehensive CMS backend.

## Table of Contents
1. [Current Media System Analysis](#current-media-system-analysis)
2. [Integration Strategy](#integration-strategy)
3. [Enhanced Media Features](#enhanced-media-features)
4. [CDN and Cloud Storage](#cdn-and-cloud-storage)
5. [Media Processing Pipeline](#media-processing-pipeline)

## Current Media System Analysis

### Existing Components

Based on the codebase analysis, the current media system includes:

1. **Frontend Components**:
   - `components/ui/media-upload.tsx` - Reusable media upload component
   - `hooks/use-media-upload.ts` - Custom hook for media upload logic
   - `lib/services/media-upload-service.ts` - Media upload service

2. **API Routes**:
   - `app/api/website/media/route.ts` - Media listing endpoint
   - `app/api/website/media/upload/route.ts` - Media upload endpoint

3. **Type Definitions**:
   - `types/website.types.ts` - Media-related TypeScript types

### Current Media Types

```typescript
// From types/website.types.ts
export interface MediaFile {
  id: string
  name: string
  type: 'image' | 'video' | 'document' | 'audio'
  url: string
  size: number
  dimensions?: {
    width: number
    height: number
  }
  alt?: string
  caption?: string
  uploadedAt: string
  usedIn: string[] // Array of page/section IDs where media is used
}

export interface MediaFilesResponse {
  success: boolean
  data: MediaFile[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

## Integration Strategy

### 1. Unified Media Model

Extend the existing media system to work with the CMS database models:

```javascript
// Enhanced media model integration
const { CMSMedia, CMSPage, CMSLandingSection } = require('../models');

class MediaIntegrationService {
  
  // Sync existing media with CMS database
  async syncExistingMedia() {
    try {
      // Get all media from current system
      const existingMedia = await this.getCurrentMediaFiles();
      
      for (const media of existingMedia) {
        // Check if already exists in CMS database
        const existingCMSMedia = await CMSMedia.findOne({
          where: { url: media.url }
        });
        
        if (!existingCMSMedia) {
          // Create new CMS media record
          await CMSMedia.create({
            filename: media.name,
            originalName: media.name,
            url: media.url,
            fileType: media.type,
            fileSize: media.size,
            mimeType: this.getMimeTypeFromUrl(media.url),
            altText: media.alt,
            caption: media.caption,
            dimensions: media.dimensions,
            uploadedAt: media.uploadedAt,
            usedIn: media.usedIn || []
          });
        }
      }
      
      console.log('Media sync completed successfully');
    } catch (error) {
      console.error('Media sync failed:', error);
      throw error;
    }
  }

  // Track media usage across CMS pages
  async trackMediaUsage(mediaId, pageId, sectionId = null) {
    try {
      const media = await CMSMedia.findByPk(mediaId);
      if (!media) {
        throw new Error('Media not found');
      }

      const usedIn = media.usedIn || [];
      const usageKey = sectionId ? `${pageId}:${sectionId}` : pageId;
      
      if (!usedIn.includes(usageKey)) {
        usedIn.push(usageKey);
        await media.update({ usedIn });
      }

      return media;
    } catch (error) {
      console.error('Failed to track media usage:', error);
      throw error;
    }
  }

  // Remove media usage tracking
  async removeMediaUsage(mediaId, pageId, sectionId = null) {
    try {
      const media = await CMSMedia.findByPk(mediaId);
      if (!media) {
        return;
      }

      const usedIn = media.usedIn || [];
      const usageKey = sectionId ? `${pageId}:${sectionId}` : pageId;
      const updatedUsedIn = usedIn.filter(usage => usage !== usageKey);
      
      await media.update({ usedIn: updatedUsedIn });
      return media;
    } catch (error) {
      console.error('Failed to remove media usage:', error);
      throw error;
    }
  }

  // Get media usage statistics
  async getMediaUsageStats() {
    try {
      const totalMedia = await CMSMedia.count();
      const usedMedia = await CMSMedia.count({
        where: {
          usedIn: {
            [Op.ne]: '[]'
          }
        }
      });
      
      const unusedMedia = totalMedia - usedMedia;
      
      // Get top used media
      const topUsedMedia = await CMSMedia.findAll({
        attributes: ['id', 'filename', 'url', 'usedIn'],
        order: [[sequelize.fn('JSON_LENGTH', sequelize.col('usedIn')), 'DESC']],
        limit: 10
      });

      return {
        totalMedia,
        usedMedia,
        unusedMedia,
        usagePercentage: Math.round((usedMedia / totalMedia) * 100),
        topUsedMedia: topUsedMedia.map(media => ({
          ...media.toJSON(),
          usageCount: media.usedIn ? media.usedIn.length : 0
        }))
      };
    } catch (error) {
      console.error('Failed to get media usage stats:', error);
      throw error;
    }
  }
}

module.exports = new MediaIntegrationService();
```

### 2. Enhanced Upload Controller

Integrate the existing upload functionality with the CMS system:

```javascript
// controllers/enhanced-media-controller.js
const BaseCMSController = require('./base-cms-controller');
const { CMSMedia } = require('../models');
const MediaIntegrationService = require('../services/media-integration-service');
const sharp = require('sharp'); // For image processing
const ffmpeg = require('fluent-ffmpeg'); // For video processing

class EnhancedMediaController extends BaseCMSController {

  // Enhanced upload with processing
  async uploadWithProcessing(req, res) {
    try {
      const { folder, alt, caption, autoOptimize = true } = req.body;
      const file = req.file;
      const userId = req.user?.id;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided'
        });
      }

      // Process file based on type
      const processedFile = await this.processFile(file, { autoOptimize });
      
      // Create media record
      const mediaFile = await CMSMedia.create({
        filename: processedFile.filename,
        originalName: file.originalname,
        url: processedFile.url,
        fileType: this.getFileType(file.mimetype),
        fileSize: processedFile.size,
        mimeType: file.mimetype,
        altText: alt,
        caption,
        dimensions: processedFile.dimensions,
        folder,
        uploadedBy: userId,
        metadata: {
          originalSize: file.size,
          processedSize: processedFile.size,
          compressionRatio: file.size > 0 ? (file.size - processedFile.size) / file.size : 0,
          processingTime: processedFile.processingTime,
          optimized: autoOptimize
        }
      });

      return this.sendSuccess(res, mediaFile, 'File uploaded and processed successfully', 201);
    } catch (error) {
      return this.handleError(res, error, 'Failed to upload and process file');
    }
  }

  // Process file based on type
  async processFile(file, options = {}) {
    const startTime = Date.now();
    const fileType = this.getFileType(file.mimetype);
    
    let processedFile = {
      filename: this.generateFilename(file.originalname),
      size: file.size,
      dimensions: null,
      processingTime: 0
    };

    try {
      switch (fileType) {
        case 'image':
          processedFile = await this.processImage(file, processedFile, options);
          break;
        case 'video':
          processedFile = await this.processVideo(file, processedFile, options);
          break;
        default:
          // For documents and other files, just save as-is
          processedFile.url = await this.saveFile(file, processedFile.filename);
      }

      processedFile.processingTime = Date.now() - startTime;
      return processedFile;
    } catch (error) {
      console.error('File processing failed:', error);
      // Fallback to original file
      processedFile.url = await this.saveFile(file, processedFile.filename);
      processedFile.processingTime = Date.now() - startTime;
      return processedFile;
    }
  }

  // Process images with optimization
  async processImage(file, processedFile, options) {
    const { autoOptimize } = options;
    
    if (autoOptimize) {
      // Optimize image using Sharp
      const optimizedBuffer = await sharp(file.buffer)
        .resize(2048, 2048, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85, 
          progressive: true 
        })
        .toBuffer();

      // Get dimensions
      const metadata = await sharp(optimizedBuffer).metadata();
      processedFile.dimensions = {
        width: metadata.width,
        height: metadata.height
      };
      
      processedFile.size = optimizedBuffer.length;
      processedFile.url = await this.saveBuffer(optimizedBuffer, processedFile.filename);
    } else {
      // Just get dimensions without optimization
      const metadata = await sharp(file.buffer).metadata();
      processedFile.dimensions = {
        width: metadata.width,
        height: metadata.height
      };
      
      processedFile.url = await this.saveFile(file, processedFile.filename);
    }

    return processedFile;
  }

  // Process videos with thumbnail generation
  async processVideo(file, processedFile, options) {
    // Save original video
    processedFile.url = await this.saveFile(file, processedFile.filename);
    
    // Generate thumbnail
    const thumbnailFilename = processedFile.filename.replace(/\.[^/.]+$/, '_thumb.jpg');
    const thumbnailPath = path.join(this.getUploadDir(), thumbnailFilename);
    
    try {
      await new Promise((resolve, reject) => {
        ffmpeg(processedFile.url)
          .screenshots({
            timestamps: ['00:00:01'],
            filename: thumbnailFilename,
            folder: this.getUploadDir(),
            size: '320x240'
          })
          .on('end', resolve)
          .on('error', reject);
      });

      // Add thumbnail to metadata
      processedFile.metadata = {
        ...processedFile.metadata,
        thumbnail: `${process.env.BASE_URL}/uploads/${thumbnailFilename}`
      };
    } catch (error) {
      console.warn('Failed to generate video thumbnail:', error);
    }

    return processedFile;
  }

  // Bulk operations
  async bulkDelete(req, res) {
    try {
      const { mediaIds } = req.body;
      
      if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Media IDs array is required'
        });
      }

      const results = {
        deleted: [],
        failed: [],
        inUse: []
      };

      for (const mediaId of mediaIds) {
        try {
          const media = await CMSMedia.findByPk(mediaId);
          if (!media) {
            results.failed.push({ id: mediaId, reason: 'Not found' });
            continue;
          }

          // Check if media is in use
          if (media.usedIn && media.usedIn.length > 0) {
            results.inUse.push({ id: mediaId, usedIn: media.usedIn });
            continue;
          }

          // Delete physical file
          try {
            await this.deletePhysicalFile(media.url);
          } catch (fileError) {
            console.warn(`Failed to delete physical file for ${mediaId}:`, fileError);
          }

          // Delete database record
          await media.destroy();
          results.deleted.push(mediaId);
        } catch (error) {
          results.failed.push({ id: mediaId, reason: error.message });
        }
      }

      return this.sendSuccess(res, results, 'Bulk delete operation completed');
    } catch (error) {
      return this.handleError(res, error, 'Failed to perform bulk delete');
    }
  }

  // Media optimization endpoint
  async optimizeMedia(req, res) {
    try {
      const { id } = req.params;
      const { quality = 85, maxWidth = 2048, maxHeight = 2048 } = req.body;

      const media = await CMSMedia.findByPk(id);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: 'Media not found'
        });
      }

      if (media.fileType !== 'image') {
        return res.status(400).json({
          success: false,
          message: 'Only images can be optimized'
        });
      }

      // Download current file
      const response = await fetch(media.url);
      const buffer = await response.buffer();

      // Optimize
      const optimizedBuffer = await sharp(buffer)
        .resize(maxWidth, maxHeight, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ quality, progressive: true })
        .toBuffer();

      // Save optimized version
      const optimizedFilename = media.filename.replace(/\.[^/.]+$/, '_optimized.jpg');
      const optimizedUrl = await this.saveBuffer(optimizedBuffer, optimizedFilename);

      // Update media record
      const originalSize = media.fileSize;
      const optimizedSize = optimizedBuffer.length;
      
      await media.update({
        url: optimizedUrl,
        filename: optimizedFilename,
        fileSize: optimizedSize,
        metadata: {
          ...media.metadata,
          originalSize,
          optimizedSize,
          compressionRatio: (originalSize - optimizedSize) / originalSize,
          optimizedAt: new Date().toISOString()
        }
      });

      return this.sendSuccess(res, media, 'Media optimized successfully');
    } catch (error) {
      return this.handleError(res, error, 'Failed to optimize media');
    }
  }
}

module.exports = new EnhancedMediaController();
```
