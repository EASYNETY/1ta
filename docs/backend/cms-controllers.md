# CMS Controllers and Business Logic

This document outlines the comprehensive controller implementations for the SmartEdu CMS backend.

## Table of Contents
1. [Controller Architecture](#controller-architecture)
2. [CMS Pages Controller](#cms-pages-controller)
3. [CMS Media Controller](#cms-media-controller)
4. [CMS Landing Controller](#cms-landing-controller)
5. [CMS Analytics Controller](#cms-analytics-controller)
6. [Error Handling](#error-handling)

## Controller Architecture

### Base Controller Structure

```javascript
// controllers/base-cms-controller.js
const { validationResult } = require('express-validator');

class BaseCMSController {
  constructor() {
    this.handleValidationErrors = this.handleValidationErrors.bind(this);
    this.handleError = this.handleError.bind(this);
    this.sendSuccess = this.sendSuccess.bind(this);
  }

  handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }

  handleError(res, error, message = 'Internal server error') {
    console.error('CMS Controller Error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Resource already exists',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  sendSuccess(res, data, message = 'Operation successful', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  sendPaginatedSuccess(res, data, pagination, message = 'Data retrieved successfully') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination
    });
  }
}

module.exports = BaseCMSController;
```

## CMS Pages Controller

```javascript
// controllers/cms-pages-controller.js
const BaseCMSController = require('./base-cms-controller');
const { CMSPage, CMSPageAnalytics } = require('../models');
const { Op } = require('sequelize');

class CMSPagesController extends BaseCMSController {

  // GET /api/cms/pages
  async getAllPages(req, res) {
    try {
      const { status, pageType, search, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};

      if (status) {
        whereClause.status = status;
      }

      if (pageType) {
        whereClause.pageType = pageType;
      }

      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { metaDescription: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await CMSPage.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['updatedAt', 'DESC']],
        attributes: ['id', 'title', 'slug', 'pageType', 'status', 'metaTitle', 'views', 'createdAt', 'updatedAt']
      });

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      };

      return this.sendPaginatedSuccess(res, rows, pagination);
    } catch (error) {
      return this.handleError(res, error, 'Failed to fetch pages');
    }
  }

  // GET /api/cms/pages/:pageType
  async getPageByType(req, res) {
    try {
      const { pageType } = req.params;

      const page = await CMSPage.findOne({
        where: { pageType },
        include: [{
          model: CMSPageAnalytics,
          as: 'analytics',
          attributes: ['id', 'visitorIp', 'visitedAt'],
          limit: 10,
          order: [['visitedAt', 'DESC']]
        }]
      });

      if (!page) {
        return res.status(404).json({
          success: false,
          message: 'Page not found'
        });
      }

      // Increment view count
      await page.increment('views');

      return this.sendSuccess(res, page);
    } catch (error) {
      return this.handleError(res, error, 'Failed to fetch page');
    }
  }

  // PUT /api/cms/pages/:pageType
  async updatePageByType(req, res) {
    try {
      const { pageType } = req.params;
      const { title, sections, metaTitle, metaDescription, metaKeywords, status } = req.body;
      const userId = req.user?.id;

      let page = await CMSPage.findOne({ where: { pageType } });

      if (!page) {
        // Create new page if it doesn't exist
        page = await CMSPage.create({
          title,
          pageType,
          sections,
          metaTitle,
          metaDescription,
          metaKeywords,
          status: status || 'draft',
          createdBy: userId,
          updatedBy: userId
        });
      } else {
        // Update existing page
        await page.update({
          title,
          sections,
          metaTitle,
          metaDescription,
          metaKeywords,
          status,
          updatedBy: userId
        });
      }

      return this.sendSuccess(res, page, 'Page updated successfully');
    } catch (error) {
      return this.handleError(res, error, 'Failed to update page');
    }
  }

  // DELETE /api/cms/pages/:id
  async deletePage(req, res) {
    try {
      const { id } = req.params;

      const page = await CMSPage.findByPk(id);
      if (!page) {
        return res.status(404).json({
          success: false,
          message: 'Page not found'
        });
      }

      await page.destroy();

      return this.sendSuccess(res, null, 'Page deleted successfully');
    } catch (error) {
      return this.handleError(res, error, 'Failed to delete page');
    }
  }

  // POST /api/cms/pages/:pageType/publish
  async publishPage(req, res) {
    try {
      const { pageType } = req.params;
      const userId = req.user?.id;

      const page = await CMSPage.findOne({ where: { pageType } });
      if (!page) {
        return res.status(404).json({
          success: false,
          message: 'Page not found'
        });
      }

      await page.update({
        status: 'published',
        updatedBy: userId
      });

      return this.sendSuccess(res, page, 'Page published successfully');
    } catch (error) {
      return this.handleError(res, error, 'Failed to publish page');
    }
  }

  // GET /api/cms/pages/:pageType/analytics
  async getPageAnalytics(req, res) {
    try {
      const { pageType } = req.params;
      const { startDate, endDate, limit = 100 } = req.query;

      const page = await CMSPage.findOne({ where: { pageType } });
      if (!page) {
        return res.status(404).json({
          success: false,
          message: 'Page not found'
        });
      }

      const whereClause = { pageId: page.id };

      if (startDate && endDate) {
        whereClause.visitedAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const analytics = await CMSPageAnalytics.findAll({
        where: whereClause,
        limit: parseInt(limit),
        order: [['visitedAt', 'DESC']],
        attributes: ['id', 'visitorIp', 'userAgent', 'referer', 'visitedAt', 'durationSeconds']
      });

      // Calculate summary statistics
      const totalViews = analytics.length;
      const uniqueVisitors = new Set(analytics.map(a => a.visitorIp)).size;
      const avgDuration = analytics.reduce((sum, a) => sum + (a.durationSeconds || 0), 0) / totalViews;

      const summary = {
        totalViews,
        uniqueVisitors,
        averageDuration: Math.round(avgDuration),
        recentVisits: analytics.slice(0, 10)
      };

      return this.sendSuccess(res, summary, 'Analytics retrieved successfully');
    } catch (error) {
      return this.handleError(res, error, 'Failed to fetch analytics');
    }
  }
}

module.exports = new CMSPagesController();
```

## CMS Media Controller

```javascript
// controllers/cms-media-controller.js
const BaseCMSController = require('./base-cms-controller');
const { CMSMedia } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

class CMSMediaController extends BaseCMSController {

  // GET /api/cms/media
  async getAllMedia(req, res) {
    try {
      const { type, folder, search, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};

      if (type) {
        whereClause.fileType = type;
      }

      if (folder) {
        whereClause.folder = folder;
      }

      if (search) {
        whereClause[Op.or] = [
          { filename: { [Op.like]: `%${search}%` } },
          { originalName: { [Op.like]: `%${search}%` } },
          { altText: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await CMSMedia.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['uploadedAt', 'DESC']]
      });

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      };

      return this.sendPaginatedSuccess(res, rows, pagination);
    } catch (error) {
      return this.handleError(res, error, 'Failed to fetch media files');
    }
  }

  // POST /api/cms/media/upload
  async uploadMedia(req, res) {
    try {
      const { folder, alt, caption } = req.body;
      const file = req.file;
      const userId = req.user?.id;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided'
        });
      }

      // Determine file type
      const fileType = this.getFileType(file.mimetype);

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substr(2, 9);
      const extension = path.extname(file.originalname);
      const filename = `${timestamp}_${randomString}${extension}`;

      // Create upload directory if it doesn't exist
      const uploadDir = path.join(process.env.UPLOAD_DIR || 'uploads', folder || '');
      await fs.mkdir(uploadDir, { recursive: true });

      // Save file
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, file.buffer);

      // Generate URL
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const url = `${baseUrl}/uploads/${folder ? folder + '/' : ''}${filename}`;

      // Get image dimensions if it's an image
      let dimensions = null;
      if (fileType === 'image') {
        dimensions = await this.getImageDimensions(filePath);
      }

      // Create media record
      const mediaFile = await CMSMedia.create({
        filename,
        originalName: file.originalname,
        url,
        fileType,
        fileSize: file.size,
        mimeType: file.mimetype,
        altText: alt,
        caption,
        dimensions,
        folder,
        uploadedBy: userId,
        metadata: {
          uploadedAt: new Date().toISOString(),
          originalSize: file.size,
          processedSize: file.size // Could be different after processing
        }
      });

      return this.sendSuccess(res, mediaFile, 'File uploaded successfully', 201);
    } catch (error) {
      return this.handleError(res, error, 'Failed to upload file');
    }
  }

  // PUT /api/cms/media/:id
  async updateMedia(req, res) {
    try {
      const { id } = req.params;
      const { altText, caption, folder } = req.body;
      const userId = req.user?.id;

      const media = await CMSMedia.findByPk(id);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: 'Media file not found'
        });
      }

      await media.update({
        altText,
        caption,
        folder,
        metadata: {
          ...media.metadata,
          lastModified: new Date().toISOString(),
          modifiedBy: userId
        }
      });

      return this.sendSuccess(res, media, 'Media file updated successfully');
    } catch (error) {
      return this.handleError(res, error, 'Failed to update media file');
    }
  }

  // DELETE /api/cms/media/:id
  async deleteMedia(req, res) {
    try {
      const { id } = req.params;

      const media = await CMSMedia.findByPk(id);
      if (!media) {
        return res.status(404).json({
          success: false,
          message: 'Media file not found'
        });
      }

      // Check if media is being used
      if (media.usedIn && media.usedIn.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete media file that is currently in use',
          usedIn: media.usedIn
        });
      }

      // Delete physical file
      try {
        const filePath = this.getFilePathFromUrl(media.url);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('Failed to delete physical file:', fileError.message);
      }

      // Delete database record
      await media.destroy();

      return this.sendSuccess(res, null, 'Media file deleted successfully');
    } catch (error) {
      return this.handleError(res, error, 'Failed to delete media file');
    }
  }

  // GET /api/cms/media/stats
  async getMediaStats(req, res) {
    try {
      const stats = await CMSMedia.findAll({
        attributes: [
          'fileType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('fileSize')), 'totalSize']
        ],
        group: ['fileType']
      });

      const totalFiles = await CMSMedia.count();
      const totalSize = await CMSMedia.sum('fileSize');

      const formattedStats = {
        totalFiles,
        totalSize: this.formatFileSize(totalSize),
        byType: stats.reduce((acc, stat) => {
          acc[stat.fileType] = {
            count: parseInt(stat.getDataValue('count')),
            size: this.formatFileSize(stat.getDataValue('totalSize'))
          };
          return acc;
        }, {})
      };

      return this.sendSuccess(res, formattedStats, 'Media statistics retrieved successfully');
    } catch (error) {
      return this.handleError(res, error, 'Failed to fetch media statistics');
    }
  }

  // Helper methods
  getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  async getImageDimensions(filePath) {
    // This would require a library like 'sharp' or 'jimp'
    // For now, return null - implement based on your image processing library
    return null;
  }

  getFilePathFromUrl(url) {
    // Extract file path from URL
    const urlParts = url.split('/uploads/');
    return path.join(process.env.UPLOAD_DIR || 'uploads', urlParts[1]);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = new CMSMediaController();
```
