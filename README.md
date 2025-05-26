# 📘 1TechAcademy Platform - Frontend Developer Guide

> 🛠️ **Currently Evolving:** The frontend is being adapted into a student-first experience under the new platform name **oneTechAcademy**. All references to 1TechAcademy remain valid during transition, but components, flows, and messaging are being personalized for individual users (students, teachers, staff, admins).

**Project:** 1TechAcademy SaaS Platform Frontend
**Client:** 1Tech Academy
**Prepared by:** EASYNET TELSURVE CO
**Status:** MVP Development

---

## ✨ Overview & Philosophy

Welcome to the frontend codebase for the 1TechAcademy platform, the next-generation learning management system for 1Tech Academy.

This project aims to deliver a highly polished, performant, and accessible user experience, drawing inspiration from Apple's intuitive design principles and leveraging modern web technologies.

Our frontend development is guided by the **DyraneUI** philosophy: a custom interaction and aesthetic layer built upon robust foundations. Key tenets include:

- **Performance First:** Targeting high Lighthouse scores (>=95) and optimized Core Web Vitals.
- **Pixel-Perfect Implementation:** Faithful translation of design mockups with meticulous attention to detail.
- **Meaningful Motion:** Utilizing Framer Motion for fluid, purposeful animations that enhance usability, not distract. Consistency via `lib/motion.tokens.ts`.
- **Architectural Soundness:** Clean, scalable code with clear separation of concerns (Next.js App Router, Feature-based structure).
- **Accessibility:** Adherence to WCAG 2.1 AA standards is non-negotiable.
- **Code Quality:** Enforced via TypeScript (strict mode), ESLint, Prettier, and comprehensive testing.

---

## 🔧 Core Frontend Tech Stack

| Category             | Tool / Library           | Purpose & Notes                                          |
| :------------------- | :----------------------- | :------------------------------------------------------- |
| **Framework**        | Next.js 14+              | App Router, SSR/SSG/ISR, RSC/Client Components           |
| **Language**         | TypeScript               | Strict Mode Enabled                                      |
| **Styling**          | TailwindCSS              | Utility-first CSS                                        |
| **UI Primitives**    | Shadcn UI                | Accessible base components (via Radix UI)                |
| **Design System**    | **DyraneUI Layer**       | Custom wrappers (`Dyrane*`) over Shadcn for motion/style |
| **Animation**        | Framer Motion            | UI animations, transitions, gestures                     |
| **State Management** | Redux Toolkit (RTK)      | Centralized state (auth, user, UI)                       |
| **Forms**            | React Hook Form + Zod    | Efficient form handling & schema validation              |
| **Data Fetching**    | Custom API Client        | Axios/Fetch wrapper (handles auth, errors, mock data)    |
| **Real-time**        | `socket.io-client`       | (Post-MVP) For features like chat                        |
| **Testing**          | Jest + React Testing Lib | Unit / Integration Testing                               |
| **Testing (E2E)**    | Cypress                  | End-to-end testing                                       |
| **Linting/Format**   | ESLint + Prettier        | Code quality and consistency                             |
| **Package Manager**  | `pnpm`                   | Recommended                                              |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or higher - Use NVM recommended)
- pnpm (Install via `npm install -g pnpm`)
- Git
- VS Code (Recommended) + Extensions (ESLint, Prettier, Tailwind IntelliSense)
- Access to the project Git repository.
- Access to backend API documentation (OpenAPI/Swagger).

### Local Setup

1.  **Clone:**
    ```bash
    git clone <repository_url>
    cd 1techacademy-frontend
    ```
2.  **Install Dependencies:**
    ```bash
    pnpm install
    ```
3.  **Environment Variables:**
    ```bash
    cp .env.example .env.local
    ```
    - Edit `.env.local` and fill in required values (API URL, Auth keys, `NEXT_PUBLIC_API_IS_LIVE` flag for mocking). **Do not commit `.env.local`**.
4.  **Run Development Server:**
    ```bash
    pnpm dev
    ```
    - Access at `http://localhost:3000` (or configured port).
5.  **Run Backend:** Ensure the backend service is running and accessible at the configured API URL.

### Useful Commands

- `pnpm dev`: Start development server.
- `pnpm build`: Create production build.
- `pnpm start`: Run production build locally.
- `pnpm lint`: Check for linting errors.
- `pnpm format`: Format code with Prettier.
- `pnpm test`: Run unit/integration tests.
- `pnpm cypress:open`: Open Cypress runner GUI.
- `pnpm cypress:run`: Run Cypress tests headlessly.

---

## 📂 Project Structure

```
1techacademy-frontend/
├── src/
│   ├── app/                 # Next.js App Router (Routes, Layouts, Pages, API Routes)
│   ├── components/
│   │   ├── dyrane-ui/       # Custom DyraneUI wrapper components (DyraneButton, DyraneCard)
│   │   └── ui/              # Base Shadcn UI components (generated)
│   ├── features/            # Feature modules (auth, courses, dashboard, etc.)
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── /* store slice if feature-specific */
│   │   └── ...
│   ├── hooks/               # Shared custom hooks (e.g., useScrollPosition)
│   ├── lib/                 # Shared utilities, constants, API client, motion tokens
│   ├── store/               # Redux Toolkit setup (root store, providers, shared slices)
│   ├── styles/              # Global CSS, Tailwind base/config extensions
│   └── types/               # Shared TypeScript types and interfaces
├── public/                  # Static assets (images, fonts, logos)
├── .env.example             # Example environment variables
├── .env.local               # Local environment variables (Gitignored)
├── .eslintrc.json           # ESLint configuration
├── .gitignore               # Git ignore rules
├── components.json          # Shadcn UI configuration
├── next.config.mjs          # Next.js configuration
├── package.json             # Project manifest, dependencies, scripts
├── pnpm-lock.yaml           # Lockfile for reproducible installs
├── postcss.config.js        # PostCSS configuration (for Tailwind)
├── tailwind.config.ts       # TailwindCSS configuration (Themes, Plugins)
└── tsconfig.json            # TypeScript configuration
```

---

## 🏛️ Key Architectural Concepts

- **Next.js App Router:** Understand Server Components (default, data fetching) vs. Client Components (`'use client'`, interactivity, hooks). Use appropriately for performance and capability.
- **DyraneUI Layer:**
  - Builds upon Shadcn UI primitives.
  - Provides motion and specific styling via custom wrapper components (e.g., `<DyraneButton>`, `<DyraneCard>`) located in `src/components/dyrane-ui/`.
  - **Rule:** Always import and use `Dyrane*` components instead of base Shadcn components (`src/components/ui/`) to ensure consistency.
  - Motion parameters are centralized in `src/lib/motion.tokens.ts`.
- **State Management (RTK):**
  - Global state (auth status, user profile, shared UI states) managed via RTK slices in `src/store/` or feature folders.
  - Use `useSelector` to read state, `useDispatch` to dispatch actions.
  - Utilize local component state (`useState`, `useReducer`) for non-shared state.
- **API Client (`src/lib/apiClient.ts` or similar):**
  - Centralized service/hook for all backend communication.
  - Handles base URL, attaching auth tokens, consistent error handling, and potential retries.
  - Includes logic to toggle between live API calls and mock data based on the `NEXT_PUBLIC_API_IS_LIVE` environment variable.
- **Authentication Flow:**
  - Managed via integration with Firebase/Auth0 SDKs.
  - `src/features/auth/components/auth-provider.tsx` (or similar) likely listens for auth state changes and updates Redux.
  - Protected routes are handled via layout checks or dedicated wrapper components verifying Redux auth state.

---

## 🌟 Features Overview (MVP Scope)

The initial MVP focuses on core functionality. Refer to the detailed MVP Scope Document for specifics.

1.  **Marketing Landing Page (`/`)**: Static page showcasing the platform. Uses DyraneUI hover effects. Built with Server Components where possible.
2.  **Authentication (`/login`, `/signup`, etc.)**: Email/Password & Google OAuth flows. Uses React Hook Form/Zod for forms. Manages state via Redux.
3.  **Core Application Shell (Authenticated Routes)**: Main layout (`AppLayout`) with header/sidebar navigation (using DyraneUI animated components). Includes basic Profile page and placeholder Dashboard.
4.  **Course Management (Basic)**: Views for available/enrolled courses (using `DyraneCard`/`DyraneTable`). Simple course creation form for Admin/Teacher roles. Basic API interactions.

**Explicitly Deferred from MVP:** Content authoring, real-time chat/courses, attendance tracking, reporting/analytics, payments, advanced admin dashboards, i18n.

---

## ✍️ Development Standards

- **TypeScript:** Use strict mode. Define clear types/interfaces (`src/types/`). Avoid `any` where possible.
- **Linting/Formatting:** ESLint & Prettier are enforced via Husky/lint-staged on pre-commit. Run `pnpm lint` / `pnpm format` manually if needed.
- **Naming Conventions:** `PascalCase` for components/types, `camelCase` for variables/functions.
- **Component Design:** Functional components with hooks. Aim for small, reusable, and well-defined components.
- **Styling:** Prioritize Tailwind utility courses. Create custom CSS/components sparingly.
- **Accessibility:** Build with accessibility in mind from the start (semantic HTML, ARIA, keyboard navigation, color contrast). Test regularly.
- **Testing:** Write meaningful unit/integration tests (Jest/RTL) for components/hooks/utils and E2E tests (Cypress) for critical user flows.
- **Git Workflow:** Use Feature Branch workflow (branch from `main`/`develop`, descriptive commits, Pull Requests with reviews).

---

## 📚 Documentation

This project includes comprehensive documentation organized in the `docs/` folder:

### 🏗️ Architecture & Design
- [System Architecture](./docs/architecture/README.md) - Overview of the system architecture
- [Application Flow](./docs/architecture/flow.md) - User journeys and application flow

### 🔧 Backend Documentation
- [CMS API Requirements](./docs/backend/cms-api-requirements.md) - Complete API requirements for CMS
- [CMS Database Models](./docs/backend/cms-database-models.md) - Database schemas and Sequelize models
- [CMS Controllers](./docs/backend/cms-controllers.md) - Business logic and controller implementations
- [CMS Validation Schemas](./docs/backend/cms-validation-schemas.md) - Request/response validation
- [CMS Media Integration](./docs/backend/cms-media-integration.md) - Media management system integration
- [CMS Implementation Guide](./docs/backend/cms-implementation-guide.md) - Step-by-step backend setup

### 📱 Features
- [Cache Management](./docs/features/cache-management/solution.md) - App update and cache management system
- [Media Upload](./docs/features/media-upload/README.md) - Media upload components and services
- [Barcode Scanner](./docs/features/barcode/README.md) - Hybrid barcode scanning implementation

### 🔌 API Integration
- [Data Types Reference](./docs/api-integration/data-types-reference.md) - TypeScript types for backend compatibility
- [Mock Data Replacement](./docs/api-integration/mock-data-replacement.md) - Guide for replacing mock data with real APIs

### 👨‍💻 Development
- [Defensive Programming Guide](./docs/development/defensive-programming-comprehensive-guide.md) - Best practices for robust code
- [Safe Redux Selectors](./docs/development/safe-redux-selectors.md) - Redux state management patterns

For a complete overview of all documentation, see the [Documentation Index](./docs/index.md).

---

## 🔗 Useful Links (Placeholders)

- **Design Files:** [Link to Figma/Zeplin]
- **API Documentation:** [Link to Swagger/OpenAPI Docs]
- **Backend Repository:** [Link to Backend Git Repo]
- **Project Management:** [Link to Jira/Trello/Linear Board]
- **DyraneUI Detailed Docs:** [Link to Separate Design System Docs if applicable]

## Authentication Flow and Cart System Explanation

I've implemented a comprehensive authentication system with persistent storage, Stripe integration, and consistent navigation across auth pages. Here's a detailed explanation of the implementation:

### 1. Shared Authentication Layout

I created a shared layout for all authentication pages (`app/(auth)/layout.tsx`) that uses the same navbar and footer as the landing page. This ensures a consistent user experience across the site and makes it easy for users to navigate back to the landing page or between auth pages.

### 2. Persistent Storage with Redux Persist

I've implemented Redux Persist to maintain state across page refreshes and browser sessions:

- **Cart State**: Stores course items, prices, and total
- **Auth State**: Stores user information and authentication status
- **Persistence**: Uses local storage to maintain state even when the browser is closed


This allows users to add courses to their cart, navigate away, and return later to complete their purchase.

### 3. Multi-Step Registration Flow

I've created a comprehensive multi-step registration process:

1. **Account Information**: Basic user details and role selection
2. **Profile Information**: Additional details based on user role
3. **Payment** (optional): Only shown for students enrolling in courses


The flow adapts based on the user's role:

- **Students**: Complete all steps including payment if enrolling in courses
- **Teachers/Admins**: Skip the payment step


### 4. Stripe Payment Integration

I've integrated Stripe for secure payment processing:

- **Client-Side Integration**: Uses Stripe Elements for secure card collection
- **Payment Intent**: Creates a payment intent on the server
- **Confirmation**: Processes payment before completing registration


For demo purposes, the payment is simulated, but in a production environment, it would connect to a real Stripe account.

### 5. Cart System

I've implemented a full-featured cart system:

- **Add to Cart**: From course detail pages
- **View Cart**: Dedicated cart page with course details
- **Remove Items**: Individual items or clear entire cart
- **Checkout**: Redirects to signup with cart items preserved


### 6. User Role-Based Flows

The system handles different user types elegantly:

- **Students**: Can enrol in courses, requiring payment
- **Teachers**: Can create and manage courses
- **Admins**: Have access to all features


### 7. Navigation Consistency

All authentication pages use the same navbar and footer as the landing page, ensuring:

- **Brand Consistency**: Same logo, styling, and theme
- **Easy Navigation**: Users can always return to the landing page
- **Familiar Experience**: Reduces cognitive load during the auth process


### Complete User Journey

1. **Discovery**: User browses courses on the landing page
2. **Course Selection**: User views course details and adds to cart
3. **Cart Management**: User reviews cart and proceeds to checkout
4. **Registration**:
   1. Step 1: Account information (with role selection)
   2. Step 2: Profile details
   3. Step 3: Payment (if applicable)
5. **Confirmation**: User receives confirmation and is redirected to dashboard
6. **Learning**: User can access enrolled courses from dashboard

### 8. Smart App Update System

I've implemented a simple, reliable app update detection system that ensures users always have the latest version:

#### **Development Experience**
- **No interference**: Update detection is disabled during development to prevent interruption of hot reloading
- **Immediate code visibility**: Changes show instantly without cache conflicts
- **Manual testing**: Developers can test update functionality through Settings

#### **Production Features**
- **Automatic detection**: Uses chunk error detection and periodic server checks
- **Non-intrusive notifications**: Toast messages instead of modal popups
- **One-click updates**: "Refresh Now" button handles cache clearing and reload
- **Auth preservation**: Updates never log users out or lose important data

#### **User Experience**
- **Smart timing**: Checks for updates when users return to the app
- **Clear messaging**: Shows current version and explains what updates contain
- **Manual control**: Users can check for updates anytime in Settings → App Maintenance

#### **Technical Implementation**
- **Server endpoint**: `/api/version` provides reliable version information
- **Multiple detection methods**: Chunk loading failures + periodic checks + visibility-based checks
- **Comprehensive cache clearing**: Handles API cache, browser storage, and Redux persist data
- **Platform integration**: Works automatically with Vercel, Netlify, and other deployment platforms

The system uses established web platform patterns for maximum reliability and minimal maintenance overhead.


Alright — let's prepare a **clean professional document** for adding the **Cart Display to the Navbar**.
I'll format it the way you'd write a proper internal or public **PRD (Product Requirements Doc)** or **feature spec**.

---

# 📄 1Tech Academy – Cart Display in Navbar
*(Document for Development/Integration)*

---

## 🎯 Purpose:
Integrate a responsive, live-updating **Cart Display** directly into the **Navbar**.
Enhance visibility of selected courses and provide a frictionless transition toward checkout/enrolment.

---

## ✨ Key Objectives:
- Display a **Cart Icon** inside the **NavigationMenuList** (beside nav links).
- Show a **Badge** with number of items when the cart is not empty.
- Add a **Glowing Focus Effect** on the cart icon when cart has items.
- On **Hover** over Cart Icon (desktop only):
  - **Spring Animate a Dropdown** showing a mini-preview of cart items.
- **Mobile sheet menu** separately handles cart display (later, separate).

---

## 🧱 Feature Breakdown:

### Desktop Navbar
| Component       | Behavior |
|:----------------|:---------|
| Cart Icon        | Lucide `ShoppingCart` Icon |
| Badge            | Small counter badge (`h-5 w-5`) on top right of icon |
| Focus Glow       | `ring-2 ring-primary ring-offset-2 shadow-primary/40` when items exist |
| Hover Dropdown   | Framer Motion animated spring dropdown |
| Course Mini Cards | Shows image (if exists), title, instructor, price |

---

### Cart Item Mini Display (`CourseMiniCard`)
| Field           | Content |
|:----------------|:--------|
| Image (optional) | Rounded thumbnail (if available) |
| Title           | Course title (bold) |
| Instructor (optional) | Muted subtext (small font) |
| Price          | Highlighted, show discount if exists |

✅ Clicking anywhere inside a mini-card **redirects to `/cart`**.

---

### Hover Dropdown Animation
- **Motion Type:** `spring`
- **Transition:** `ease-[cubic-bezier(0.77,0,0.175,1)]`
- **Animation Behavior:**
  - Fade in
  - Scale slight up from 95% → 100%
  - Y axis slight down from `-5px` → `0`
- **Dropdown Max Height:** 300px
- **Scroll inside dropdown** if more than 3 cart items.

---

## 🛠️ Technical Components

| Component Name | Purpose |
|:---------------|:--------|
| `CartNavItem.tsx` | Handles Cart Icon with badge and glow |
| `CartDropdown.tsx` | Animated Dropdown with mini-cart items |
| `CourseMiniCard.tsx` | Reusable component to display each cart item preview |

---

## 📐 Layout Placement

| Location        | Details |
|:----------------|:--------|
| Inside `NavigationMenuList` | After the last nav link (e.g., after "Testimonials" or "Contact Us") |
| No change to login/signup buttons | They remain at far right as is. |
| Responsive behavior | Only show hover dropdown on devices `lg:` and up (desktop). |

---

## ⚡ UX Notes

| Situation | Behavior |
|:----------|:---------|
| Empty cart | Show Cart Icon without badge/glow. Dropdown says: "No courses selected yet." |
| Items added to cart | Badge updates instantly. Icon glows subtly. Dropdown shows course previews. |
| Click cart item | Redirect to `/cart` for full checkout view. |
| No need for Remove functionality (V1) | Keep it minimal for MVP. |

---

## 🚀 Next Steps After Navbar Integration
- Implement mobile sheet cart display (similar mini-cards under nav links).
- Add optional "Proceed to Checkout" CTA button inside the dropdown in future.
- Animate badge entrance for even more polish (later).

---

# **Navigation:**

1.  **Authentication Routes (`authRoutes.js`):**
    *   `POST /register`: Implies a **Signup Page** (`/signup`). Primarily for students in MVP.
    *   `POST /login`: Implies a **Login Page** (`/login`).
    *   `POST /forgot-password`: Implies a **Forgot Password Page** (`/forgot-password`).
    *   `POST /reset-password`: Implies a **Reset Password Page** (`/reset-password`).

2.  **Student Model & Associations (`Student.js`, `index.js`):**
    *   Students belong to a `Class`.
    *   Students have `Attendance`.
    *   Students have `Payments` / `Invoices`.
    *   Students participate in `ChatRooms` / `ChatMessages`.
    *   Students have `Feedback` / `SupportTickets`.
    *   Students have a `Guardian` (optional).
    *   This implies **Student-Specific Pages** within an authenticated dashboard:
        *   Student Dashboard Home (Overview) (`/dashboard/student`)
        *   My Courses / Courses Page
        *   My Attendance Page
        *   My Payments / Billing History Page
        *   Chat Page(s) (potentially per class)
        *   My Support Tickets Page
        *   My Profile / Settings Page (to view/edit basic info, potentially link Guardian)
        *   *(Maybe)* A Timetable/Schedule Page (though no specific Timetable model was shown, Class association implies it).

3.  **Admin Routes (`adminRoutes.js`):**
    *   `GET /dashboard`: Implies an **Admin Dashboard Home** (`/admin/dashboard` or `/dashboard/admin`) showing statistics (Total Students, Courses, Payments, Tickets) and recent activities.
    *   `GET /students` (paginated): Implies an **Admin - Manage Students Page** (displaying a table/list of students).
    *   `GET /courses` (paginated): Implies an **Admin - Manage Courses Page**.
    *   `GET /payments` (paginated): Implies an **Admin - View Payments Page**.
    *   `GET /support-tickets` (paginated): Implies an **Admin - Manage Support Tickets Page**.
    *   `GET /feedback` (paginated): Implies an **Admin - View Feedback Page**.
    *   *(Missing but Implied)*: Routes/pages for *creating/editing* Students, Courses, potentially Admins/Teachers would also be needed in a full admin section.

4.  **Other Models:**
    *   `Guardian`: Might imply a separate Guardian view/login later, but not explicitly required by routes shown. For MVP, might just be info linked to a Student profile.
    *   `Class`: Implies a need for pages related to courses (viewing details, maybe content later).
    *   `Attendance`, `Payment`, `Invoice`, `Chat*`, `Feedback`, `SupportTicket`: These imply detail views or sections within other pages (e.g., viewing attendance *for a specific class*, viewing payment details *for an invoice*, viewing messages *within a chat room*).

**Estimated Page Count (Focusing on distinct views/routes):**

Based *only* on the provided backend code snippets and MVP focus:

**Public / Unauthenticated:**

1.  Landing Page (`/`)
2.  Login Page (`/login`)
3.  Signup Page (`/signup`)
4.  Forgot Password Page (`/forgot-password`)
5.  Reset Password Page (`/reset-password`)

**Authenticated - Student Role:**

6.  Student Dashboard (`/dashboard/student` or `/dashboard`) - *Could consolidate some views here.*
7.  My Courses/Courses Page
8.  My Profile/Settings Page
9.  *(Maybe)* My Attendance (could be part of My Courses)
10. *(Maybe)* My Payments (could be part of Profile/Settings initially)
11. *(Maybe)* Support/Feedback Submission Page

**Authenticated - Admin Role (Based on provided GET routes):**

12. Admin Dashboard (`/admin/dashboard` or `/dashboard/admin`) - Statistics Overview
13. Admin - Students List Page
14. Admin - Courses List Page
15. Admin - Payments List Page
16. Admin - Support Tickets List Page
17. Admin - Feedback List Page

**Total Estimated Distinct Pages/Views (MVP based on files): ~17**

**Important Considerations:**

*   **Consolidation:** Many "pages" listed for authenticated users (especially students) could be implemented as sections or tabs within a single dashboard layout rather than entirely separate page routes. The exact number depends heavily on the chosen dashboard UI/UX design.
*   **CRUD Operations:** The backend snippets primarily show `GET` routes for admin lists and specific auth `POST` routes. A full application would need pages/modals for *Creating*, *Updating*, and *Deleting* (CRUD) Students, Courses, etc., especially within the Admin section. These pages aren't explicitly defined by the provided routes but would be necessary.
*   **Teacher Role:** No specific backend routes for Teachers were provided, but typically they would need pages to manage their assigned courses, view student attendance/progress for those courses, manage assignments/grades (post-MVP), etc.
*   **Detail Views:** While list pages are implied (e.g., Admin Student List), clicking on an item would require a *Detail Page* or *Modal* (e.g., Admin Student Detail Page, Support Ticket Detail Page).

So, while the provided backend code directly implies around 17 distinct views/routes, a functional application (even MVP focused on students and basic admin viewing) would likely require consolidating some student views and adding necessary CRUD interfaces for the admin, potentially bringing the practical number closer to **15-20 core page templates/authenticated views**.

---

# **DyraneUI Navigation System Specification v1.0**

---

## **1. Overview**

The DyraneUI Navigation System is crafted to deliver a fluid, intelligent, and beautiful user experience across mobile, tablet, and desktop platforms.
It is designed around **human-like motion**, **organic transitions**, **soft visuals**, and **minimal clutter**.
Every navigation element responds dynamically to user behavior with **blur effects**, **rounded glassmorphism**, and **natural animation curves** — resulting in a delightful and deeply immersive environment.

---

## **2. Navigation Groups**

### **Main Navigation**
Primary, most important app destinations (example: Dashboard, Courses, Messages, Payments, Settings).
- Maximum 5 items.
- Always visible where possible (sidebar on tablet/desktop, bottom bar on mobile).

### **Secondary Navigation**
User-specific actions and notifications.
- User Profile
- Notifications
- Settings
- Cart

Accessed through sheets opened via avatar (left) or notification icon (right).

### **Helper Actions**
Supporting links or tools.
- Support
- Theme Toggle
- Search
- Logout

Placed in sheets or footer areas, keeping the primary surfaces uncluttered.

---

## **3. Behavior by Platform**

### **Mobile**

- **Bottom Bar**: Floating, scroll-sensitive, icon-only navigation (no labels).
- **Navbar**: Lightweight — only Avatar (left), Logo (center), Theme Toggle + Notification Icon (right).
- **Sheets**:
  - Avatar → Left Sheet (Profile, Cart, Support, etc.)
  - Notification → Right Sheet (Notification feed).
- **Floating Plus (+) Button**: Context-sensitive CRUD action, positioned top-right of Bottom Bar.
- **Scroll Sensitivity**:
  - Scrolling down (content moving up) → Bottom Bar hides softly with blur.
  - Scrolling up (content moving down) → Bottom Bar reappears.

### **Tablet**

- **Left Sidebar**: Collapsible, shows Main Navigation. Profile card moved to sidebar footer.
- **Navbar**:
  - Avatar (left), Logo (center), Theme Toggle + Notifications (right).
- **Right Sidebar**: Collapsible, used for notifications or contextual panels.
- **Floating Plus (+) Button**: Becomes part of right side interactions.

### **Desktop**

- **Left Sidebar**: Expanded by default, collapsible manually.
- **Right Sidebar**: Expanded by default for Notifications or any secondary panels.
- **Navbar**: Slim — centered Logo, left Avatar, right Theme Toggle and Notifications.

No floating action button needed; actions are integrated in sidebars or top bars.

---

## **4. Navigation Components**

### **Bottom Bar (Mobile)**
- Max 5 icons.
- Icons only (no text), must be self-explanatory.
- Active state uses filled variant.
- Rounded floating background (`bg-background/50`) with blur.
- Smart hide/reveal on scroll.

### **Navbar**
- Always visible.
- Very light and decluttered.
- No extra borders or heavy shadows.
- Responsive behavior based on screen size.

### **Left Sidebar**
- Contains Main Navigation.
- Collapsible on tablet, expanded on desktop.
- Profile Card appears at bottom.
- Sidebar can show Cart item count or badges dynamically.

### **Right Sidebar**
- Houses Notifications and optional support panels.
- Collapsible behavior based on device width.
- Soft blurred background with rounded shape.

### **Sheets (Left and Right)**
- Triggered by Avatar (left) and Notifications (right).
- `rounded-3xl` edges (left or right depending on side).
- Background: `bg-background/50` with backdrop blur.
- Smooth 400ms glide transitions (not snappy).
- No borders or harsh dividers.

---

## **5. Dynamic Behaviors**

### **Scroll Sensitivity**
- **Bottom Bar** hides when user scrolls downward (reading content).
- **Bottom Bar** shows when user scrolls upward (looking for actions).

### **Floating Action Button (FAB)**
- Contextual based on page:
  - "Add Student" on Students page.
  - "Create Course" on Courses page.
- Subtle hover/press animations, with soft curve entry/exit.

### **Badges and Indicators**
- Avatar Badge:
  - Blinks if Cart has items or Support ticket updates.
- Notification Badge:
  - Simple count badge, blinks if unseen notifications exist.
- Cart Badge:
  - Appears in sheets or sidebar dynamically.

---

## **6. Visual and UI Standards**

### **Icons**
- Use **Phosphor Icons** (or similar refined set).
- Install: `pnpm add phosphor-react`
- Use filled variant for active states if available.

### **Backgrounds and Blur**
- Use soft semi-transparent backgrounds `bg-background/50`.
- Always apply `backdrop-blur` for glassmorphism effect.

### **Borders and Rounding**
- Major surfaces (`Bottom Bar`, `Sheets`, `Sidebars`) have `rounded-3xl` or smoother.
- No harsh visible borders — separation is created by blur and depth, not hard lines.

### **Animation Curves**
- Use **custom cubic bezier** for fluid motions:
  - Example: `ease-[cubic-bezier(0.4, 0, 0.2, 1)]`
- 300ms–400ms preferred for entrance/exit animations.
- No snapping or abrupt transitions.

---

## **7. Future Considerations**

- Add **Search overlay sheet** from Navbar or Left Sheet.
- Add **Quick Actions** panel triggered by long-press on Avatar or Notification icons.
- Theme support for dark mode and high contrast versions.
- Extensible notification system with multiple channels (alerts, toasts, sheets).

---
## **8. Navigation Flow Summary (Text Version)**

### **Mobile Navigation Flow**
- **Bottom Bar**:
  - Always visible unless scrolling.
  - Icons only, smart active state.
  - Contextual Plus (+) button appears top-right.
- **Navbar**:
  - Left: Avatar → Opens Left Sheet (Profile, Cart, Support, etc.).
  - Center: Logo → Links to `/dashboard`.
  - Right: Theme Toggle → Notification Icon → Right Sheet (Notifications).

---

### **Tablet Navigation Flow**
- **Left Sidebar**:
  - Expanded/collapsed manually.
  - Main Navigation at top.
  - Profile Card at bottom.
- **Navbar**:
  - Avatar (Left) → Profile Sheet (optional).
  - Logo (Center).
  - Theme Toggle + Notifications (Right).
- **Right Sidebar**:
  - Collapsible notifications panel.

---

### **Desktop Navigation Flow**
- **Left Sidebar**:
  - Expanded by default.
  - Full Main Navigation.
- **Navbar**:
  - Avatar (Left), Logo (Center), Theme Toggle + Notifications (Right).
- **Right Sidebar**:
  - Always expanded unless manually collapsed.
  - Notifications feed or optional side panels.

---

## **9. Important Behavior Rules**

- **Sheets have priority**:
  - If a sheet is open, no other interaction should trigger new sheets.
  - Sheets can be dismissed by clicking outside or swiping.

- **Bottom Bar Scroll Behavior**:
  - Scroll **down** → Hide Bottom Bar.
  - Scroll **up** → Show Bottom Bar.
  - Animations must be blurred, transparent, and soft.

- **Badges and Blink Effects**:
  - Cart Badge blinks softly if >0 items.
  - Avatar Badge blinks for cart updates or profile alerts.
  - Notification Badge blinks for unseen notifications.

- **Action Context Awareness**:
  - Floating Plus Button (+) understands page context.
  - Sidebar navigation highlights current active link softly (no harsh borders).

---

## **10. Design and Development Notes**

- **Use DyraneUI principles**: motion, structure, softness, fluid interactions.
- **No heavy shadowing**: use depth through blur and transparency.
- **Animations**:
  - Entrances = Glide, 400ms preferred.
  - Exits = Fade/slide away, 300ms preferred.
  - Curves = Natural bezier (0.4, 0, 0.2, 1) or custom if needed.

- **Visual balance**:
  - Left and Right sheets must mirror each other in rounding and size.
  - Bottom bar aligns visually with sheets' rounding and background tone.

---

## **Final Short Version: DyraneUI Navigation Philosophy**

- **Minimal**: No clutter. Only the necessary.
- **Beautiful**: Soft glassmorphism, blur, perfect rounded edges.
- **Dynamic**: Smart scroll detection, context-aware actions.
- **Immersive**: Subtle animations, natural motion.
- **Extensible**: Designed for growth without redesigning.

---
# **Final Notes**

This Navigation System embodies DyraneUI's belief in **fluidity, beauty, and clarity**.
It respects the user’s focus, giving them maximum screen real estate when needed, and presenting actions only when they're ready for them.

We don't chase trends — we build **timelessly smooth experiences**.

**Dashboard** page, considering the different user roles (Admin, Teacher, Student) and leveraging the backend routes provided, specifically the `/admin/dashboard` endpoint for administrators.

**Goal:** Create a dynamic Dashboard page (`/dashboard`) that displays relevant information based on the logged-in user's role.

**Backend Data Source:**

*   **Admin:** Primarily uses the `GET /admin/dashboard` endpoint which returns:
    *   `statistics`: `{ totalStudents, totalCourses, totalPayments, totalSupportTickets }`
    *   `recentPayments`: Array of recent Payment objects (including Student info).
    *   `recentSupportTickets`: Array of recent SupportTicket objects (including Student info).
*   **Teacher (Implied):** Would need backend endpoints (e.g., `GET /api/teacher/dashboard` or `GET /api/users/me/dashboard`) providing:
    *   List of assigned courses.
    *   Recent activity in those courses (e.g., new messages, submissions - Post-MVP).
    *   Upcoming schedule/timetable events for their courses.
    *   Quick attendance summary (Post-MVP).
*   **Student (Implied):** Would need backend endpoints (e.g., `GET /api/student/dashboard` or `GET /api/users/me/dashboard`) providing:
    *   List of enrolled courses/courses.
    *   Upcoming schedule/timetable events.
    *   Recent grades or feedback (Post-MVP).
    *   Unread messages/notifications count (Post-MVP).

**Frontend Strategy:**

1.  **Main Dashboard Page (`src/app/dashboard/page.tsx`):**
    *   This page will be a **Client Component** (`'use client'`) because it needs to fetch data based on the logged-in user and potentially render different components conditionally.
    *   It will use `useAppSelector` to get the authenticated `user` object (including their `role`).
    *   Based on the `user.role`, it will conditionally render specific dashboard components (e.g., `<AdminDashboard />`, `<TeacherDashboard />`, `<StudentDashboard />`).
2.  **Role-Specific Dashboard Components:**
    *   Create separate components for each role's dashboard view (e.g., `src/features/dashboard/components/AdminDashboard.tsx`, `StudentDashboard.tsx`, etc.).
    *   Each component will be responsible for fetching its specific data using async thunks or custom hooks that utilize the `apiClient`.
3.  **Redux Slice/Thunks (Optional but Recommended):**
    *   Consider creating a `dashboardSlice` to manage the loading/error/data state for *each role's dashboard data*.
    *   Define async thunks like `fetchAdminDashboardData`, `fetchTeacherDashboardData`, `fetchStudentDashboardData`. These thunks call the relevant `apiClient` endpoints (`/admin/dashboard`, `/api/teacher/dashboard`, etc.).
    *   The role-specific dashboard components dispatch their corresponding thunk and select data/status from the `dashboardSlice`.
4.  **UI Components:** Utilize Shadcn UI and DyraneUI components (`DyraneCard`, tables, charts - if needed later) to display the fetched data professionally. Use Skeletons for loading states.

---

**Documentation: Dashboard Feature Plan (MVP)**

## Dashboard Feature (`/dashboard`)

### 1. Overview

The main Dashboard serves as the primary landing page for authenticated users after login. Its content dynamically adapts based on the user's role (Admin, Teacher, Student) to provide relevant information and quick access to key functionalities.

### 2. Core Requirements (MVP)

*   Display a distinct view for each user role (Admin, Teacher, Student).
*   Fetch and display role-specific summary data from the backend.
*   Provide clear navigation or links to other relevant sections of the application.
*   Utilize DyraneUI/Shadcn components for a professional and consistent UI.
*   Handle loading and error states gracefully.

### 3. Data Flow & State Management

1.  **User Role Check:** The main `/dashboard` page component reads the `user.role` from the `authSlice`.
2.  **Conditional Rendering:** Based on the role, the page renders the corresponding dashboard component (`<AdminDashboard />`, `<TeacherDashboard />`, or `<StudentDashboard />`).
3.  **Data Fetching (Thunk/Slice Approach):**
    *   A `dashboardSlice` manages state (`adminData`, `teacherData`, `studentData`, `status`, `error`).
    *   Role-specific components (`AdminDashboard`, etc.) dispatch their respective async thunks (`fetchAdminDashboardData`, etc.) on mount if data isn't already loaded.
    *   Thunks call the appropriate `apiClient` endpoints (e.g., `get('/admin/dashboard')`).
    *   `apiClient` handles mock/live switching. Mock functions in `mock-dashboard-data.ts` simulate responses for each role's endpoint.
    *   `extraReducers` in `dashboardSlice` update the state based on thunk lifecycle.
    *   Components select data, status, and error from `dashboardSlice` using `useAppSelector`.
4.  **UI Rendering:** Components use the selected data to render cards, lists, statistics, etc. Skeletons are shown during `loading` status. Alerts are shown during `failed` status.

### 4. Component Structure

*   **`src/app/dashboard/page.tsx`**: Main entry point, performs role check and renders the appropriate role-specific component. Marked `'use client'`.
*   **`src/features/dashboard/components/AdminDashboard.tsx`**: Fetches and displays admin-specific stats, recent payments, recent tickets.
*   **`src/features/dashboard/components/TeacherDashboard.tsx`**: (MVP definition might be simpler) Fetches and displays assigned courses, maybe upcoming schedule.
*   **`src/features/dashboard/components/StudentDashboard.tsx`**: Fetches and displays enrolled courses, upcoming schedule.
*   **`src/features/dashboard/store/dashboard-slice.ts`**: (Optional but recommended) Redux slice for dashboard state.
*   **`src/features/dashboard/store/dashboard-thunks.ts`**: (Optional but recommended) Async thunks for fetching dashboard data.
*   **`src/data/mock-dashboard-data.ts`**: (New file needed) Contains mock functions (`getMockAdminDashboard`, `getMockStudentDashboard`, etc.) called by `apiClient`.

### 5. UI Elements (Examples per Role - MVP)

*   **Admin Dashboard:**
    *   Statistic Cards (`DyraneCard`): Displaying counts for Students, Courses, Payments, Tickets.
    *   Recent Activity Lists (`DyraneCard` with list): Displaying recent payments, recent support tickets (linking to detail views).
*   **Teacher Dashboard:**
    *   My Courses List (`DyraneCard`): List of courses assigned.
    *   Upcoming Schedule/Timetable Preview (`DyraneCard`).
*   **Student Dashboard:**
    *   My Enrolled Courses List (`DyraneCard`): Using `CourseCard` (compact view) or a list.
    *   Upcoming Schedule/Timetable Preview (`DyraneCard`).
    *   *(Post-MVP)* Quick links to grades, attendance, chat.

### 6. Mocking Requirements

*   **`mock-dashboard-data.ts`:**
    *   `getMockAdminDashboard()`: Returns data matching the structure from `GET /admin/dashboard` (stats, recent payments, recent tickets).
    *   `getMockTeacherDashboard()`: Returns mock data for teacher view (e.g., array of assigned courses).
    *   `getMockStudentDashboard()`: Returns mock data for student view (e.g., array of enrolled courses).
*   **`apiClient.ts`:** Update `handleMockRequest` to route GET requests for `/admin/dashboard`, `/teacher/dashboard`, `/student/dashboard` (or `/users/me/dashboard`) to these new mock functions.

---