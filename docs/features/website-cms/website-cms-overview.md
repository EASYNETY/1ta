# Website Content Management System (CMS)

A WordPress-like content management system for managing public website pages, sections, media, and settings.

## Overview

The Website CMS provides administrators with complete control over the public website content, including:

- **Page Management**: Create, edit, and manage website pages
- **Section Management**: Reusable page sections with different types
- **Media Management**: Upload and organize images, videos, and documents
- **Website Settings**: Global configuration and branding
- **Dynamic Rendering**: Real-time content updates

## Features

### 📄 Page Management
- Create and edit website pages
- SEO optimization (meta titles, descriptions, keywords)
- Draft/Published status
- Page analytics and views tracking
- Slug management for URLs

### 🧩 Section Management
- Reusable page sections
- Multiple section types (hero, content, features, etc.)
- Drag-and-drop section ordering
- Enable/disable sections
- Section templates and presets

### 🖼️ Media Management
- Upload images, videos, and documents
- Media library with search and filtering
- Usage tracking (where media is used)
- Grid and list view modes
- File size and dimension information

### ⚙️ Website Settings
- Global site configuration
- SEO settings
- Contact information
- Social media links
- Branding (colors, logos)
- Feature toggles

## Navigation

Access the Website CMS through the admin navigation:

```
Admin Tools > Website
```

### Main Pages

1. **Website Dashboard** (`/admin/website`)
   - Overview statistics
   - Quick actions
   - Recent pages

2. **Pages Management** (`/admin/website/pages`)
   - List all pages
   - Create new pages
   - Edit existing pages

3. **Media Library** (`/admin/website/media`)
   - Upload and manage media files
   - View usage statistics
   - Organize media assets

4. **Section Library** (`/admin/website/sections`)
   - Manage reusable sections
   - Section templates
   - Usage tracking

5. **Website Settings** (`/admin/website/settings`)
   - Global configuration
   - SEO settings
   - Contact information
   - Social media links

## Section Types

The CMS supports various section types:

### Hero Section
- Large banner with title, subtitle, and CTAs
- Background image support
- Primary and secondary call-to-action buttons

### Content Section
- Rich text content
- Title and description
- Flexible content blocks

### Features Section
- Grid of features with icons
- Feature cards with descriptions
- Customizable layouts

### Courses Section
- Dynamic course display
- Integration with course system
- Filtering and search

### Technologies Section
- Technology showcase
- Icon displays
- Skill representations

### Testimonials Section
- Customer testimonials
- Carousel displays
- User photos and ratings

### Contact Section
- Contact forms
- Company information
- Social media links
- Address and phone details

### Call-to-Action (CTA) Section
- Action-oriented sections
- Button groups
- Conversion-focused content

## Technical Implementation

### File Structure

```
├── app/(authenticated)/admin/website/
│   ├── page.tsx                    # Main dashboard
│   ├── pages/
│   │   ├── page.tsx               # Pages list
│   │   ├── [id]/page.tsx          # Edit page
│   │   └── landing/page.tsx       # Landing page editor
│   ├── media/
│   │   └── page.tsx               # Media management
│   ├── sections/
│   │   └── page.tsx               # Section management
│   └── settings/
│       └── page.tsx               # Website settings
├── app/api/website/
│   ├── pages/
│   │   ├── route.ts               # Pages API
│   │   └── [id]/route.ts          # Individual page API
│   ├── media/
│   │   └── route.ts               # Media API
│   └── settings/
│       └── route.ts               # Settings API
├── components/website/
│   └── dynamic-section-renderer.tsx # Dynamic content rendering
├── features/website/
│   └── store/website-slice.ts     # Redux state management
├── hooks/
│   └── useWebsiteData.ts          # Custom hooks for CMS data
└── types/
    └── website.types.ts           # TypeScript definitions
```

### State Management

The CMS uses Redux Toolkit for state management:

```typescript
// Store structure
interface WebsiteState {
  pages: WebsitePage[]
  currentPage: WebsitePage | null
  mediaFiles: MediaFile[]
  settings: WebsiteSettings | null
  loading: LoadingStates
  error: ErrorStates
  pagination: PaginationStates
}
```

### API Endpoints

- `GET /api/website/pages` - List pages
- `POST /api/website/pages` - Create page
- `GET /api/website/pages/[id]` - Get page
- `PUT /api/website/pages/[id]` - Update page
- `DELETE /api/website/pages/[id]` - Delete page
- `GET /api/website/media` - List media files
- `POST /api/website/media/upload` - Upload media
- `GET /api/website/settings` - Get settings
- `PUT /api/website/settings` - Update settings

### Custom Hooks

```typescript
// Available hooks
const { pages, loading, error } = useWebsitePages()
const { page, updateCurrentPage } = useWebsitePage(pageId)
const { mediaFiles, uploadNewMedia } = useWebsiteMedia()
const { settings, saveSettings } = useWebsiteSettings()
const { landingPage, sections } = useLandingPageData()
```

## Making Pages Dynamic

To make a page dynamic (pulling content from CMS):

1. **Use the Dynamic Section Renderer**:
```tsx
import { DynamicSectionRenderer } from '@/components/website/dynamic-section-renderer'
import { useLandingPageData } from '@/hooks/useWebsiteData'

export default function DynamicPage() {
  const { sections, loading } = useLandingPageData()
  
  if (loading) return <LoadingComponent />
  
  return (
    <div>
      <NavBar />
      <main>
        <DynamicSectionRenderer sections={sections} />
      </main>
      <Footer />
    </div>
  )
}
```

2. **Replace Static Content**:
   - Replace hardcoded text with CMS data
   - Use section-based rendering
   - Implement loading and error states

## Database Schema

### Pages Table
```sql
CREATE TABLE website_pages (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  status ENUM('published', 'draft'),
  meta_title VARCHAR,
  meta_description TEXT,
  meta_keywords VARCHAR,
  sections JSON,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  author VARCHAR,
  views INTEGER DEFAULT 0
);
```

### Media Table
```sql
CREATE TABLE website_media (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  type ENUM('image', 'video', 'document'),
  url VARCHAR NOT NULL,
  size INTEGER,
  dimensions JSON,
  alt_text VARCHAR,
  caption TEXT,
  uploaded_at TIMESTAMP,
  used_in JSON
);
```

### Settings Table
```sql
CREATE TABLE website_settings (
  id VARCHAR PRIMARY KEY,
  key VARCHAR UNIQUE NOT NULL,
  value JSON,
  updated_at TIMESTAMP
);
```

## Usage Examples

### Creating a New Page
1. Navigate to `/admin/website/pages`
2. Click "New Page"
3. Fill in page details
4. Add sections
5. Configure SEO settings
6. Publish or save as draft

### Editing Landing Page
1. Go to `/admin/website/pages/landing`
2. Toggle sections on/off
3. Edit section content
4. Update CTAs and links
5. Save changes

### Managing Media
1. Visit `/admin/website/media`
2. Upload new files
3. Organize in folders
4. View usage statistics
5. Delete unused files

### Configuring Settings
1. Access `/admin/website/settings`
2. Update site information
3. Configure SEO defaults
4. Set contact details
5. Update social media links

## Best Practices

1. **SEO Optimization**
   - Always fill meta titles and descriptions
   - Use descriptive page slugs
   - Optimize images with alt text

2. **Performance**
   - Compress images before upload
   - Use appropriate image formats
   - Minimize section complexity

3. **Content Management**
   - Use consistent naming conventions
   - Organize media in logical folders
   - Regular content audits

4. **Security**
   - Validate all user inputs
   - Sanitize content before rendering
   - Implement proper access controls

## Future Enhancements

- [ ] Visual page builder (drag-and-drop)
- [ ] Content versioning and rollback
- [ ] Multi-language support
- [ ] Advanced SEO tools
- [ ] Content scheduling
- [ ] A/B testing capabilities
- [ ] Advanced analytics integration
- [ ] Content approval workflows
