# CMS Validation Schemas

This document outlines the comprehensive validation schemas for the SmartEdu CMS backend using express-validator.

## Table of Contents
1. [Validation Architecture](#validation-architecture)
2. [Page Validation Schemas](#page-validation-schemas)
3. [Media Validation Schemas](#media-validation-schemas)
4. [Landing Section Validation](#landing-section-validation)
5. [Custom Validators](#custom-validators)

## Validation Architecture

### Base Validation Setup

```javascript
// middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Common validation patterns
const commonValidators = {
  id: param('id').isString().isLength({ min: 1, max: 50 }).withMessage('Invalid ID format'),

  pageType: param('pageType').isIn([
    'landing',
    'about',
    'courses',
    'privacy-policy',
    'terms-conditions',
    'cookies-policy',
    'data-protection-policy',
    'help-support'
  ]).withMessage('Invalid page type'),

  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],

  search: query('search').optional().isString().isLength({ max: 255 }).withMessage('Search term too long'),

  status: query('status').optional().isIn(['published', 'draft']).withMessage('Invalid status')
};

module.exports = { commonValidators };
```

## Page Validation Schemas

### Create/Update Page Validation

```javascript
// validation/cms-page-validation.js
const { body } = require('express-validator');
const { commonValidators } = require('../middleware/validation');

const pageValidation = {
  // Validate page creation/update
  createOrUpdatePage: [
    body('title')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters')
      .trim(),

    body('slug')
      .optional()
      .isString()
      .isLength({ min: 1, max: 255 })
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
      .trim(),

    body('status')
      .optional()
      .isIn(['published', 'draft'])
      .withMessage('Status must be either published or draft'),

    body('metaTitle')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Meta title must not exceed 255 characters')
      .trim(),

    body('metaDescription')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Meta description must not exceed 1000 characters')
      .trim(),

    body('metaKeywords')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Meta keywords must not exceed 500 characters')
      .trim(),

    body('sections')
      .isArray()
      .withMessage('Sections must be an array')
      .custom((sections) => {
        if (!Array.isArray(sections)) {
          throw new Error('Sections must be an array');
        }

        sections.forEach((section, index) => {
          if (!section.id || typeof section.id !== 'string') {
            throw new Error(`Section ${index}: ID is required and must be a string`);
          }

          if (!section.type || typeof section.type !== 'string') {
            throw new Error(`Section ${index}: Type is required and must be a string`);
          }

          if (typeof section.enabled !== 'boolean') {
            throw new Error(`Section ${index}: Enabled must be a boolean`);
          }

          if (!Number.isInteger(section.order) || section.order < 0) {
            throw new Error(`Section ${index}: Order must be a non-negative integer`);
          }

          if (!section.data || typeof section.data !== 'object') {
            throw new Error(`Section ${index}: Data is required and must be an object`);
          }
        });

        return true;
      })
  ],

  // Validate page type parameter
  validatePageType: [
    commonValidators.pageType
  ],

  // Validate page ID parameter
  validatePageId: [
    commonValidators.id
  ],

  // Validate page query parameters
  validatePageQuery: [
    ...commonValidators.pagination,
    commonValidators.search,
    commonValidators.status,
    query('pageType').optional().isString().withMessage('Page type must be a string')
  ]
};

module.exports = pageValidation;
```

### Section Data Validation

```javascript
// validation/section-data-validation.js
const sectionDataValidators = {
  // Hero section validation
  validateHeroSection: (data) => {
    const errors = [];

    if (!data.title || typeof data.title !== 'string' || data.title.length > 255) {
      errors.push('Hero title is required and must not exceed 255 characters');
    }

    if (data.subtitle && (typeof data.subtitle !== 'string' || data.subtitle.length > 500)) {
      errors.push('Hero subtitle must not exceed 500 characters');
    }

    if (data.primaryCTA) {
      if (!data.primaryCTA.text || typeof data.primaryCTA.text !== 'string') {
        errors.push('Primary CTA text is required');
      }
      if (!data.primaryCTA.href || typeof data.primaryCTA.href !== 'string') {
        errors.push('Primary CTA href is required');
      }
    }

    if (data.secondaryCTA) {
      if (!data.secondaryCTA.text || typeof data.secondaryCTA.text !== 'string') {
        errors.push('Secondary CTA text is required');
      }
      if (!data.secondaryCTA.href || typeof data.secondaryCTA.href !== 'string') {
        errors.push('Secondary CTA href is required');
      }
    }

    return errors;
  },

  // Content section validation
  validateContentSection: (data) => {
    const errors = [];

    if (!data.title || typeof data.title !== 'string' || data.title.length > 255) {
      errors.push('Content title is required and must not exceed 255 characters');
    }

    if (data.description && (typeof data.description !== 'string' || data.description.length > 1000)) {
      errors.push('Content description must not exceed 1000 characters');
    }

    if (!data.content || typeof data.content !== 'string') {
      errors.push('Content is required');
    }

    return errors;
  },

  // Contact section validation
  validateContactSection: (data) => {
    const errors = [];

    if (!data.title || typeof data.title !== 'string') {
      errors.push('Contact title is required');
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Invalid phone format');
    }

    return errors;
  },

  // Features section validation
  validateFeaturesSection: (data) => {
    const errors = [];

    if (!data.title || typeof data.title !== 'string') {
      errors.push('Features title is required');
    }

    if (data.features && Array.isArray(data.features)) {
      data.features.forEach((feature, index) => {
        if (!feature.title || typeof feature.title !== 'string') {
          errors.push(`Feature ${index + 1}: Title is required`);
        }
        if (!feature.description || typeof feature.description !== 'string') {
          errors.push(`Feature ${index + 1}: Description is required`);
        }
      });
    }

    return errors;
  }
};

module.exports = sectionDataValidators;
```

## Media Validation Schemas

```javascript
// validation/cms-media-validation.js
const { body, query } = require('express-validator');
const { commonValidators } = require('../middleware/validation');

const mediaValidation = {
  // Validate media upload
  uploadMedia: [
    body('folder')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .matches(/^[a-zA-Z0-9\-_\/]+$/)
      .withMessage('Folder name can only contain letters, numbers, hyphens, underscores, and forward slashes')
      .trim(),

    body('alt')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Alt text must not exceed 255 characters')
      .trim(),

    body('caption')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Caption must not exceed 1000 characters')
      .trim()
  ],

  // Validate media update
  updateMedia: [
    body('altText')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Alt text must not exceed 255 characters')
      .trim(),

    body('caption')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Caption must not exceed 1000 characters')
      .trim(),

    body('folder')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .matches(/^[a-zA-Z0-9\-_\/]+$/)
      .withMessage('Folder name can only contain letters, numbers, hyphens, underscores, and forward slashes')
      .trim()
  ],

  // Validate media query parameters
  validateMediaQuery: [
    ...commonValidators.pagination,
    commonValidators.search,
    query('type')
      .optional()
      .isIn(['image', 'video', 'document', 'audio'])
      .withMessage('Invalid media type'),

    query('folder')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Folder name too long')
  ],

  // Validate media ID parameter
  validateMediaId: [
    commonValidators.id
  ]
};

module.exports = mediaValidation;
```

## Landing Section Validation

```javascript
// validation/cms-landing-validation.js
const { body } = require('express-validator');
const sectionDataValidators = require('./section-data-validation');

const landingValidation = {
  // Validate landing page update
  updateLanding: [
    body('sections')
      .isArray()
      .withMessage('Sections must be an array')
      .custom((sections) => {
        if (!Array.isArray(sections)) {
          throw new Error('Sections must be an array');
        }

        const sectionIds = new Set();
        const errors = [];

        sections.forEach((section, index) => {
          // Basic structure validation
          if (!section.id || typeof section.id !== 'string') {
            errors.push(`Section ${index}: ID is required and must be a string`);
          } else if (sectionIds.has(section.id)) {
            errors.push(`Section ${index}: Duplicate section ID '${section.id}'`);
          } else {
            sectionIds.add(section.id);
          }

          if (!section.type || typeof section.type !== 'string') {
            errors.push(`Section ${index}: Type is required and must be a string`);
          }

          if (typeof section.enabled !== 'boolean') {
            errors.push(`Section ${index}: Enabled must be a boolean`);
          }

          if (!Number.isInteger(section.order) || section.order < 0) {
            errors.push(`Section ${index}: Order must be a non-negative integer`);
          }

          if (!section.data || typeof section.data !== 'object') {
            errors.push(`Section ${index}: Data is required and must be an object`);
          } else {
            // Validate section-specific data
            let dataErrors = [];

            switch (section.type) {
              case 'hero':
                dataErrors = sectionDataValidators.validateHeroSection(section.data);
                break;
              case 'content':
                dataErrors = sectionDataValidators.validateContentSection(section.data);
                break;
              case 'contact':
                dataErrors = sectionDataValidators.validateContactSection(section.data);
                break;
              case 'features':
                dataErrors = sectionDataValidators.validateFeaturesSection(section.data);
                break;
              default:
                // For other section types, just validate basic structure
                if (!section.data.title || typeof section.data.title !== 'string') {
                  dataErrors.push('Title is required');
                }
            }

            dataErrors.forEach(error => {
              errors.push(`Section ${index} (${section.type}): ${error}`);
            });
          }
        });

        if (errors.length > 0) {
          throw new Error(errors.join('; '));
        }

        return true;
      })
  ]
};

module.exports = landingValidation;
```

## Custom Validators

```javascript
// validation/custom-validators.js
const { CMSPage, CMSMedia } = require('../models');

const customValidators = {
  // Check if page slug is unique
  isUniqueSlug: async (slug, { req }) => {
    const existingPage = await CMSPage.findOne({
      where: { slug },
      ...(req.params.id && { where: { slug, id: { [Op.ne]: req.params.id } } })
    });

    if (existingPage) {
      throw new Error('Slug already exists');
    }
    return true;
  },

  // Check if media file exists
  mediaExists: async (mediaId) => {
    const media = await CMSMedia.findByPk(mediaId);
    if (!media) {
      throw new Error('Media file not found');
    }
    return true;
  },

  // Validate file upload
  validateFileUpload: (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit'
      });
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm',
      'application/pdf', 'text/plain'
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'File type not allowed'
      });
    }

    next();
  },

  // Validate JSON structure
  validateJSONStructure: (value, structure) => {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      // Add your JSON structure validation logic here
      return true;
    } catch (error) {
      throw new Error('Invalid JSON structure');
    }
  }
};

module.exports = customValidators;
```

## Usage Examples

```javascript
// routes/cms-pages.js
const express = require('express');
const router = express.Router();
const cmsPageController = require('../controllers/cms-pages-controller');
const pageValidation = require('../validation/cms-page-validation');
const auth = require('../middleware/auth');

// GET /api/cms/pages
router.get('/',
  pageValidation.validatePageQuery,
  cmsPageController.getAllPages
);

// GET /api/cms/pages/:pageType
router.get('/:pageType',
  pageValidation.validatePageType,
  cmsPageController.getPageByType
);

// PUT /api/cms/pages/:pageType
router.put('/:pageType',
  auth.requireAdmin,
  pageValidation.validatePageType,
  pageValidation.createOrUpdatePage,
  cmsPageController.updatePageByType
);

module.exports = router;
```
