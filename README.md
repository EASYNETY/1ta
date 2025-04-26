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

**Explicitly Deferred from MVP:** Content authoring, real-time chat/classes, attendance tracking, reporting/analytics, payments, advanced admin dashboards, i18n.

---

## ✍️ Development Standards

- **TypeScript:** Use strict mode. Define clear types/interfaces (`src/types/`). Avoid `any` where possible.
- **Linting/Formatting:** ESLint & Prettier are enforced via Husky/lint-staged on pre-commit. Run `pnpm lint` / `pnpm format` manually if needed.
- **Naming Conventions:** `PascalCase` for components/types, `camelCase` for variables/functions.
- **Component Design:** Functional components with hooks. Aim for small, reusable, and well-defined components.
- **Styling:** Prioritize Tailwind utility classes. Create custom CSS/components sparingly.
- **Accessibility:** Build with accessibility in mind from the start (semantic HTML, ARIA, keyboard navigation, color contrast). Test regularly.
- **Testing:** Write meaningful unit/integration tests (Jest/RTL) for components/hooks/utils and E2E tests (Cypress) for critical user flows.
- **Git Workflow:** Use Feature Branch workflow (branch from `main`/`develop`, descriptive commits, Pull Requests with reviews).

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

- **Students**: Can enroll in courses, requiring payment
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


Alright — let's prepare a **clean professional document** for adding the **Cart Display to the Navbar**.  
I'll format it the way you'd write a proper internal or public **PRD (Product Requirements Doc)** or **feature spec**.

---

# 📄 1Tech Academy – Cart Display in Navbar  
*(Document for Development/Integration)*

---

## 🎯 Purpose:
Integrate a responsive, live-updating **Cart Display** directly into the **Navbar**.  
Enhance visibility of selected courses and provide a frictionless transition toward checkout/enrollment.

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