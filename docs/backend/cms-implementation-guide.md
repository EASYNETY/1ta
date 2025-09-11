# CMS Implementation Guide - Complete Backend Setup

This document provides a step-by-step guide for implementing the comprehensive CMS backend for SmartEdu.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [API Routes Setup](#api-routes-setup)
7. [Testing](#testing)
8. [Deployment](#deployment)

## Prerequisites

### Required Dependencies

\`\`\`json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.32.1",
    "mysql2": "^3.6.0",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.5",
    "fluent-ffmpeg": "^2.1.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "sequelize-cli": "^6.6.1"
  }
}
\`\`\`

### Environment Variables

\`\`\`env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smartedu_cms
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Server Configuration
PORT=8080
NODE_ENV=development
BASE_URL=http://localhost:3000

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# CMS Configuration
CMS_ENABLED=true
CMS_ADMIN_ROLE=admin
CMS_DEBUG=true

# CDN Configuration (Optional)
CDN_URL=https://your-cdn.com
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket
\`\`\`

## Project Structure

\`\`\`
backend/
├── config/
│   ├── database.js
│   └── multer.js
├── controllers/
│   ├── base-cms-controller.js
│   ├── cms-pages-controller.js
│   ├── cms-media-controller.js
│   ├── cms-landing-controller.js
│   └── cms-analytics-controller.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── error-handler.js
├── models/
│   ├── index.js
│   ├── cms-page.js
│   ├── cms-media.js
│   ├── cms-landing-section.js
│   ├── cms-page-analytics.js
│   └── cms-settings.js
├── routes/
│   ├── cms-pages.js
│   ├── cms-media.js
│   ├── cms-landing.js
│   └── cms-analytics.js
├── services/
│   ├── media-integration-service.js
│   ├── analytics-service.js
│   └── cache-service.js
├── validation/
│   ├── cms-page-validation.js
│   ├── cms-media-validation.js
│   ├── cms-landing-validation.js
│   └── custom-validators.js
├── migrations/
│   ├── 001-create-cms-tables.js
│   ├── 002-add-cms-indexes.js
│   └── 003-seed-default-data.js
├── tests/
│   ├── controllers/
│   ├── models/
│   └── routes/
├── uploads/
├── app.js
└── server.js
\`\`\`

## Installation Steps

### 1. Initialize Project

\`\`\`bash
# Create project directory
mkdir smartedu-cms-backend
cd smartedu-cms-backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express sequelize mysql2 express-validator multer sharp fluent-ffmpeg cors helmet compression morgan dotenv jsonwebtoken bcryptjs

# Install dev dependencies
npm install --save-dev nodemon jest supertest sequelize-cli
\`\`\`

### 2. Setup Database Configuration

\`\`\`javascript
// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

module.exports = sequelize;
\`\`\`

### 3. Setup Main Application

\`\`\`javascript
// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const cmsPageRoutes = require('./routes/cms-pages');
const cmsMediaRoutes = require('./routes/cms-media');
const cmsLandingRoutes = require('./routes/cms-landing');
const cmsAnalyticsRoutes = require('./routes/cms-analytics');

// Import middleware
const errorHandler = require('./middleware/error-handler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/cms/pages', cmsPageRoutes);
app.use('/api/cms/media', cmsMediaRoutes);
app.use('/api/cms/landing', cmsLandingRoutes);
app.use('/api/cms/analytics', cmsAnalyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;
\`\`\`

### 4. Setup Server

\`\`\`javascript
// server.js
const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 8080;

// Database connection and server startup
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync database models (only in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 CMS Backend server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

startServer();
\`\`\`

## Database Setup

### 1. Run Migrations

\`\`\`bash
# Initialize Sequelize CLI
npx sequelize-cli init

# Create database
npx sequelize-cli db:create

# Run migrations
npx sequelize-cli db:migrate

# Seed default data (optional)
npx sequelize-cli db:seed:all
\`\`\`

### 2. Create Default Admin User

\`\`\`javascript
// scripts/create-admin.js
const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      email: 'admin@smartedu.com',
      password: hashedPassword,
      name: 'CMS Administrator',
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin user created:', admin.email);
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
  }
}

createAdmin();
\`\`\`

## API Routes Setup

### Example Route Implementation

\`\`\`javascript
// routes/cms-pages.js
const express = require('express');
const router = express.Router();
const cmsPageController = require('../controllers/cms-pages-controller');
const pageValidation = require('../validation/cms-page-validation');
const auth = require('../middleware/auth');

// Public routes
router.get('/', pageValidation.validatePageQuery, cmsPageController.getAllPages);
router.get('/:pageType', pageValidation.validatePageType, cmsPageController.getPageByType);

// Protected routes (require authentication)
router.use(auth.requireAuth);

// Admin-only routes
router.put('/:pageType', 
  auth.requireAdmin,
  pageValidation.validatePageType,
  pageValidation.createOrUpdatePage,
  cmsPageController.updatePageByType
);

router.delete('/:id',
  auth.requireAdmin,
  pageValidation.validatePageId,
  cmsPageController.deletePage
);

router.post('/:pageType/publish',
  auth.requireAdmin,
  pageValidation.validatePageType,
  cmsPageController.publishPage
);

router.get('/:pageType/analytics',
  auth.requireAdmin,
  pageValidation.validatePageType,
  cmsPageController.getPageAnalytics
);

module.exports = router;
\`\`\`

## Testing

### Setup Test Environment

\`\`\`javascript
// tests/setup.js
const { sequelize } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
\`\`\`

### Example Test

\`\`\`javascript
// tests/controllers/cms-pages.test.js
const request = require('supertest');
const app = require('../../app');

describe('CMS Pages Controller', () => {
  describe('GET /api/cms/pages', () => {
    it('should return paginated pages', async () => {
      const response = await request(app)
        .get('/api/cms/pages')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('PUT /api/cms/pages/:pageType', () => {
    it('should update page content', async () => {
      const pageData = {
        title: 'Test Page',
        sections: [
          {
            id: 'test-section',
            type: 'content',
            enabled: true,
            order: 1,
            data: {
              title: 'Test Section',
              content: 'Test content'
            }
          }
        ]
      };

      const response = await request(app)
        .put('/api/cms/pages/privacy-policy')
        .send(pageData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Page');
    });
  });
});
\`\`\`

## Deployment

### Production Configuration

\`\`\`javascript
// config/production.js
module.exports = {
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    }
  },
  server: {
    port: process.env.PORT || 8080,
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  }
};
\`\`\`

### Docker Configuration

\`\`\`dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
\`\`\`

### Docker Compose

\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  cms-backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_NAME=smartedu_cms
      - DB_USER=cms_user
      - DB_PASSWORD=cms_password
    depends_on:
      - mysql
    volumes:
      - ./uploads:/app/uploads

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=smartedu_cms
      - MYSQL_USER=cms_user
      - MYSQL_PASSWORD=cms_password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
\`\`\`

## Next Steps

1. **Implement Authentication**: Set up JWT-based authentication
2. **Add Caching**: Implement Redis caching for better performance
3. **Setup Monitoring**: Add logging and monitoring solutions
4. **Configure CDN**: Set up cloud storage and CDN for media files
5. **Add Rate Limiting**: Implement API rate limiting
6. **Setup Backup**: Configure automated database backups
7. **Performance Optimization**: Add database query optimization
8. **Security Hardening**: Implement additional security measures

This comprehensive backend implementation provides a solid foundation for the SmartEdu CMS system with all the features requested in the frontend requirements.
