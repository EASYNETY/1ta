# 💌 CMS API Requirements for Backend Team

## Dear Amazing Backend Developers,

We hope this message finds you well and caffeinated! ☕ We've been working hard on the frontend CMS system and we need your magical backend powers to make everything work seamlessly.

## 🎯 What We Need (With Love)

### 1. **CMS Pages API Endpoints**

We need API endpoints to manage the following public pages through our CMS:

#### **GET /api/cms/pages/{pageType}**
- **Purpose**: Fetch page content for public pages
- **Page Types**: `privacy-policy`, `terms-conditions`, `cookies-policy`, `data-protection-policy`, `help-support`
- **Response Format**:
```json
{
  "id": "privacy-policy",
  "title": "Privacy Policy",
  "lastUpdated": "2024-01-15T10:30:00Z",
  "sections": [
    {
      "id": "overview",
      "type": "content",
      "enabled": true,
      "order": 1,
      "data": {
        "title": "Privacy Policy Overview",
        "description": "How we protect your data",
        "content": "At 1Tech Academy, we take your privacy seriously..."
      }
    },
    {
      "id": "data-collection",
      "type": "content", 
      "enabled": true,
      "order": 2,
      "data": {
        "title": "Information We Collect",
        "description": "What data we gather",
        "content": "We collect the following types of information..."
      }
    }
  ]
}
```

#### **PUT /api/cms/pages/{pageType}**
- **Purpose**: Update page content from admin dashboard
- **Request Body**: Same format as GET response
- **Authentication**: Admin only

#### **GET /api/cms/pages**
- **Purpose**: List all manageable pages
- **Response**: Array of page metadata

### 2. **Landing Page CMS API Endpoints**

#### **GET /api/cms/landing**
- **Purpose**: Fetch landing page sections
- **Response Format**:
```json
{
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "enabled": true,
      "order": 1,
      "data": {
        "title": "Transform Your Tech Career",
        "subtitle": "Join Africa's Premier Tech Academy",
        "primaryCTA": {
          "text": "Start Learning",
          "href": "/signup"
        },
        "secondaryCTA": {
          "text": "View Courses", 
          "href": "/public-courses"
        }
      }
    },
    {
      "id": "about",
      "type": "content",
      "enabled": true,
      "order": 2,
      "data": {
        "title": "About 1Tech Academy",
        "description": "Leading tech education in Africa",
        "content": "We are committed to excellence..."
      }
    },
    {
      "id": "why-us",
      "type": "features",
      "enabled": true,
      "order": 3,
      "data": {
        "title": "Why Choose Us",
        "description": "What makes us different"
      }
    },
    {
      "id": "courses",
      "type": "courses",
      "enabled": true,
      "order": 4,
      "data": {
        "title": "Explore Our Available Courses",
        "description": "Professional training programs"
      }
    },
    {
      "id": "technologies",
      "type": "technologies", 
      "enabled": true,
      "order": 5,
      "data": {
        "title": "Technologies We Teach",
        "description": "Current and future tech stack"
      }
    },
    {
      "id": "testimonials",
      "type": "testimonials",
      "enabled": true,
      "order": 6,
      "data": {
        "title": "Student Success Stories",
        "description": "Hear from our graduates"
      }
    },
    {
      "id": "contact",
      "type": "contact",
      "enabled": true,
      "order": 7,
      "data": {
        "title": "Get In Touch",
        "description": "Ready to start your journey?",
        "address": "17 Aje Street, Sabo, Yaba, Lagos, Nigeria",
        "phone": "+234 (0) 123 456 7890",
        "email": "info@1techacademy.com"
      }
    },
    {
      "id": "cta",
      "type": "cta",
      "enabled": true,
      "order": 8,
      "data": {
        "title": "Get Started with 1Tech Academy",
        "description": "Follow these simple steps"
      }
    }
  ]
}
```

#### **PUT /api/cms/landing**
- **Purpose**: Update landing page sections
- **Request Body**: Same format as GET response
- **Authentication**: Admin only

### 3. **Media Management API Endpoints**

#### **GET /api/cms/media**
- **Purpose**: List uploaded media files
- **Query Parameters**: `?type=image|video&page=1&limit=20`
- **Response**:
```json
{
  "files": [
    {
      "id": "media-123",
      "filename": "hero-image.jpg",
      "url": "https://cdn.example.com/hero-image.jpg",
      "type": "image",
      "size": 1024000,
      "uploadedAt": "2024-01-15T10:30:00Z",
      "alt": "Hero section background"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### **POST /api/cms/media/upload**
- **Purpose**: Upload new media files
- **Request**: Multipart form data with file
- **Response**: Media file object

#### **DELETE /api/cms/media/{fileId}**
- **Purpose**: Delete media file
- **Authentication**: Admin only

### 4. **Website Statistics API**

#### **GET /api/cms/stats**
- **Purpose**: Get website statistics for admin dashboard
- **Response**:
```json
{
  "pages": {
    "total": 8,
    "published": 7,
    "draft": 1
  },
  "media": {
    "total": 45,
    "images": 32,
    "videos": 13,
    "totalSize": "125.5 MB"
  },
  "traffic": {
    "totalViews": 15420,
    "uniqueVisitors": 8930,
    "topPages": [
      {"path": "/", "views": 5420},
      {"path": "/public-courses", "views": 3210}
    ]
  },
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

## 🔧 Technical Requirements

### **Database Schema Suggestions**

```sql
-- CMS Pages Table
CREATE TABLE cms_pages (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  page_type VARCHAR(50) NOT NULL,
  sections JSON NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(255)
);

-- Media Files Table  
CREATE TABLE cms_media (
  id VARCHAR(50) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size BIGINT NOT NULL,
  alt_text VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by VARCHAR(255)
);

-- Page Analytics Table
CREATE TABLE page_analytics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  page_path VARCHAR(255) NOT NULL,
  visitor_ip VARCHAR(45),
  user_agent TEXT,
  visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(255)
);
```

### **Environment Variables**
```env
CMS_ENABLED=true
CMS_ADMIN_ROLE=admin
MEDIA_UPLOAD_MAX_SIZE=10MB
MEDIA_ALLOWED_TYPES=image/jpeg,image/png,image/webp,video/mp4
```

## 🚀 Implementation Priority

1. **High Priority**: Landing page CMS endpoints (`/api/cms/landing`)
2. **Medium Priority**: Public pages CMS endpoints (`/api/cms/pages/*`)
3. **Medium Priority**: Website statistics (`/api/cms/stats`)
4. **Low Priority**: Media management endpoints

## 🎉 What We Promise in Return

- Beautiful, responsive frontend that showcases your amazing API work
- Comprehensive error handling for all your endpoints
- Proper loading states and user feedback
- Thorough testing of all integrations
- Detailed documentation of how we use your APIs
- Lots of appreciation and virtual high-fives! 🙌

## 📞 Questions?

If you have any questions about the API requirements or need clarification on any data structures, please don't hesitate to reach out. We're here to make this integration as smooth as possible!

With much love and appreciation,
**The Frontend Team** 💙

---

*P.S. We've already implemented the frontend components and are ready to integrate as soon as your APIs are ready. You're the best! 🌟*
