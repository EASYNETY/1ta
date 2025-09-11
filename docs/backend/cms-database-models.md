# CMS Database Models and Schemas

This document outlines the comprehensive database models and schemas required for the SmartEdu CMS backend implementation.

## Table of Contents
1. [Database Schema Overview](#database-schema-overview)
2. [Sequelize Models](#sequelize-models)
3. [Database Migrations](#database-migrations)
4. [Relationships and Associations](#relationships-and-associations)
5. [Indexes and Performance](#indexes-and-performance)

## Database Schema Overview

### Core CMS Tables

\`\`\`sql
-- CMS Pages Table
CREATE TABLE cms_pages (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  page_type VARCHAR(50) NOT NULL,
  status ENUM('published', 'draft') DEFAULT 'draft',
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(500),
  sections JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  views INTEGER DEFAULT 0,
  INDEX idx_page_type (page_type),
  INDEX idx_status (status),
  INDEX idx_slug (slug)
);

-- CMS Media Files Table
CREATE TABLE cms_media (
  id VARCHAR(50) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  alt_text VARCHAR(255),
  caption TEXT,
  dimensions JSON, -- {width: number, height: number}
  metadata JSON, -- Additional file metadata
  folder VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by VARCHAR(255),
  used_in JSON, -- Array of page IDs where this media is used
  INDEX idx_file_type (file_type),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_folder (folder)
);

-- CMS Landing Page Sections Table
CREATE TABLE cms_landing_sections (
  id VARCHAR(50) PRIMARY KEY,
  section_id VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  order_index INTEGER NOT NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(255),
  INDEX idx_section_id (section_id),
  INDEX idx_type (type),
  INDEX idx_enabled (enabled),
  INDEX idx_order (order_index)
);

-- Page Analytics Table
CREATE TABLE cms_page_analytics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  page_path VARCHAR(255) NOT NULL,
  page_id VARCHAR(50),
  visitor_ip VARCHAR(45),
  user_agent TEXT,
  referer VARCHAR(500),
  session_id VARCHAR(255),
  user_id VARCHAR(255), -- If user is authenticated
  visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_seconds INTEGER, -- Time spent on page
  INDEX idx_page_path (page_path),
  INDEX idx_page_id (page_id),
  INDEX idx_visited_at (visited_at),
  INDEX idx_session_id (session_id),
  INDEX idx_user_id (user_id)
);

-- CMS Settings Table
CREATE TABLE cms_settings (
  id VARCHAR(50) PRIMARY KEY,
  key_name VARCHAR(100) UNIQUE NOT NULL,
  value JSON NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(255),
  INDEX idx_key_name (key_name),
  INDEX idx_category (category)
);

-- Media Usage Tracking Table
CREATE TABLE cms_media_usage (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  media_id VARCHAR(50) NOT NULL,
  page_id VARCHAR(50),
  section_id VARCHAR(50),
  usage_type ENUM('page', 'section', 'content') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (media_id) REFERENCES cms_media(id) ON DELETE CASCADE,
  INDEX idx_media_id (media_id),
  INDEX idx_page_id (page_id),
  INDEX idx_usage_type (usage_type)
);
\`\`\`

## Sequelize Models

### CMS Page Model

\`\`\`javascript
// models/cms-page.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CMSPage = sequelize.define('CMSPage', {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isSlug(value) {
          if (!/^[a-z0-9-]+$/.test(value)) {
            throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
          }
        }
      }
    },
    pageType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'page_type',
      validate: {
        isIn: [['landing', 'about', 'courses', 'privacy-policy', 'terms-conditions', 'cookies-policy', 'data-protection-policy', 'help-support']]
      }
    },
    status: {
      type: DataTypes.ENUM('published', 'draft'),
      defaultValue: 'draft'
    },
    metaTitle: {
      type: DataTypes.STRING(255),
      field: 'meta_title'
    },
    metaDescription: {
      type: DataTypes.TEXT,
      field: 'meta_description'
    },
    metaKeywords: {
      type: DataTypes.STRING(500),
      field: 'meta_keywords'
    },
    sections: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    createdBy: {
      type: DataTypes.STRING(255),
      field: 'created_by'
    },
    updatedBy: {
      type: DataTypes.STRING(255),
      field: 'updated_by'
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'cms_pages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['page_type'] },
      { fields: ['status'] },
      { fields: ['slug'] }
    ],
    hooks: {
      beforeCreate: (page) => {
        if (!page.id) {
          page.id = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        if (!page.slug && page.title) {
          page.slug = page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
      },
      beforeUpdate: (page) => {
        if (page.changed('title') && !page.changed('slug')) {
          page.slug = page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
      }
    }
  });

  return CMSPage;
};
\`\`\`

### CMS Media Model

\`\`\`javascript
// models/cms-media.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CMSMedia = sequelize.define('CMSMedia', {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'original_name'
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    fileType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'file_type',
      validate: {
        isIn: [['image', 'video', 'document', 'audio']]
      }
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'file_size',
      validate: {
        min: 0
      }
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'mime_type'
    },
    altText: {
      type: DataTypes.STRING(255),
      field: 'alt_text'
    },
    caption: {
      type: DataTypes.TEXT
    },
    dimensions: {
      type: DataTypes.JSON
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    folder: {
      type: DataTypes.STRING(255)
    },
    uploadedBy: {
      type: DataTypes.STRING(255),
      field: 'uploaded_by'
    },
    usedIn: {
      type: DataTypes.JSON,
      field: 'used_in',
      defaultValue: []
    }
  }, {
    tableName: 'cms_media',
    timestamps: true,
    createdAt: 'uploaded_at',
    updatedAt: false,
    indexes: [
      { fields: ['file_type'] },
      { fields: ['uploaded_by'] },
      { fields: ['folder'] }
    ],
    hooks: {
      beforeCreate: (media) => {
        if (!media.id) {
          media.id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
      }
    }
  });

  return CMSMedia;
};
\`\`\`

### CMS Landing Section Model

\`\`\`javascript
// models/cms-landing-section.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CMSLandingSection = sequelize.define('CMSLandingSection', {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false
    },
    sectionId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'section_id'
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['hero', 'content', 'features', 'courses', 'technologies', 'testimonials', 'contact', 'cta', 'gallery', 'team', 'pricing', 'faq']]
      }
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_index'
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    updatedBy: {
      type: DataTypes.STRING(255),
      field: 'updated_by'
    }
  }, {
    tableName: 'cms_landing_sections',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['section_id'] },
      { fields: ['type'] },
      { fields: ['enabled'] },
      { fields: ['order_index'] }
    ],
    hooks: {
      beforeCreate: (section) => {
        if (!section.id) {
          section.id = `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
      }
    }
  });

  return CMSLandingSection;
};
\`\`\`

### CMS Page Analytics Model

\`\`\`javascript
// models/cms-page-analytics.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CMSPageAnalytics = sequelize.define('CMSPageAnalytics', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    pagePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'page_path'
    },
    pageId: {
      type: DataTypes.STRING(50),
      field: 'page_id'
    },
    visitorIp: {
      type: DataTypes.STRING(45),
      field: 'visitor_ip'
    },
    userAgent: {
      type: DataTypes.TEXT,
      field: 'user_agent'
    },
    referer: {
      type: DataTypes.STRING(500)
    },
    sessionId: {
      type: DataTypes.STRING(255),
      field: 'session_id'
    },
    userId: {
      type: DataTypes.STRING(255),
      field: 'user_id'
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      field: 'duration_seconds'
    }
  }, {
    tableName: 'cms_page_analytics',
    timestamps: true,
    createdAt: 'visited_at',
    updatedAt: false,
    indexes: [
      { fields: ['page_path'] },
      { fields: ['page_id'] },
      { fields: ['visited_at'] },
      { fields: ['session_id'] },
      { fields: ['user_id'] }
    ]
  });

  return CMSPageAnalytics;
};
\`\`\`

### CMS Settings Model

\`\`\`javascript
// models/cms-settings.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CMSSettings = sequelize.define('CMSSettings', {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false
    },
    keyName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'key_name'
    },
    value: {
      type: DataTypes.JSON,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.STRING(50),
      defaultValue: 'general'
    },
    updatedBy: {
      type: DataTypes.STRING(255),
      field: 'updated_by'
    }
  }, {
    tableName: 'cms_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['key_name'] },
      { fields: ['category'] }
    ],
    hooks: {
      beforeCreate: (setting) => {
        if (!setting.id) {
          setting.id = `setting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
      }
    }
  });

  return CMSSettings;
};
\`\`\`

## Database Migrations

### Initial CMS Tables Migration

\`\`\`javascript
// migrations/001-create-cms-tables.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create cms_pages table
    await queryInterface.createTable('cms_pages', {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      page_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('published', 'draft'),
        defaultValue: 'draft'
      },
      meta_title: {
        type: Sequelize.STRING(255)
      },
      meta_description: {
        type: Sequelize.TEXT
      },
      meta_keywords: {
        type: Sequelize.STRING(500)
      },
      sections: {
        type: Sequelize.JSON,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      created_by: {
        type: Sequelize.STRING(255)
      },
      updated_by: {
        type: Sequelize.STRING(255)
      },
      views: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });

    // Add indexes for cms_pages
    await queryInterface.addIndex('cms_pages', ['page_type']);
    await queryInterface.addIndex('cms_pages', ['status']);
    await queryInterface.addIndex('cms_pages', ['slug']);

    // Create cms_media table
    await queryInterface.createTable('cms_media', {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      file_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      file_size: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      alt_text: {
        type: Sequelize.STRING(255)
      },
      caption: {
        type: Sequelize.TEXT
      },
      dimensions: {
        type: Sequelize.JSON
      },
      metadata: {
        type: Sequelize.JSON
      },
      folder: {
        type: Sequelize.STRING(255)
      },
      uploaded_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      uploaded_by: {
        type: Sequelize.STRING(255)
      },
      used_in: {
        type: Sequelize.JSON
      }
    });

    // Add indexes for cms_media
    await queryInterface.addIndex('cms_media', ['file_type']);
    await queryInterface.addIndex('cms_media', ['uploaded_by']);
    await queryInterface.addIndex('cms_media', ['folder']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cms_media');
    await queryInterface.dropTable('cms_pages');
  }
};
\`\`\`

## Relationships and Associations

\`\`\`javascript
// models/index.js - Define associations
module.exports = (sequelize) => {
  const CMSPage = require('./cms-page')(sequelize);
  const CMSMedia = require('./cms-media')(sequelize);
  const CMSLandingSection = require('./cms-landing-section')(sequelize);
  const CMSPageAnalytics = require('./cms-page-analytics')(sequelize);
  const CMSSettings = require('./cms-settings')(sequelize);

  // Define associations
  CMSPageAnalytics.belongsTo(CMSPage, {
    foreignKey: 'pageId',
    as: 'page'
  });

  CMSPage.hasMany(CMSPageAnalytics, {
    foreignKey: 'pageId',
    as: 'analytics'
  });

  return {
    CMSPage,
    CMSMedia,
    CMSLandingSection,
    CMSPageAnalytics,
    CMSSettings
  };
};
\`\`\`

## Indexes and Performance

### Recommended Indexes

\`\`\`sql
-- Performance indexes for analytics queries
CREATE INDEX idx_analytics_date_range ON cms_page_analytics (visited_at, page_path);
CREATE INDEX idx_analytics_user_session ON cms_page_analytics (user_id, session_id, visited_at);

-- Composite indexes for common queries
CREATE INDEX idx_pages_type_status ON cms_pages (page_type, status);
CREATE INDEX idx_media_type_folder ON cms_media (file_type, folder);
CREATE INDEX idx_sections_enabled_order ON cms_landing_sections (enabled, order_index);

-- Full-text search indexes (MySQL)
ALTER TABLE cms_pages ADD FULLTEXT(title, meta_description);
ALTER TABLE cms_media ADD FULLTEXT(filename, alt_text, caption);
\`\`\`
\`\`\`
