# 📘 SMARTEDU Platform (1Tech Academy) - Frontend Developer Guide

**Project:** Smart Education SaaS Platform Frontend
**Client:** 1Tech Academy
**Prepared by:** EASYNET TELSURVE CO
**Status:** MVP Development

---

## ✨ Overview & Philosophy

Welcome to the frontend codebase for the SMARTEDU platform, the next-generation learning management system for 1Tech Academy.

This project aims to deliver a highly polished, performant, and accessible user experience, drawing inspiration from Apple's intuitive design principles and leveraging modern web technologies.

Our frontend development is guided by the **DyraneUI** philosophy: a custom interaction and aesthetic layer built upon robust foundations. Key tenets include:

*   **Performance First:** Targeting high Lighthouse scores (>=95) and optimized Core Web Vitals.
*   **Pixel-Perfect Implementation:** Faithful translation of design mockups with meticulous attention to detail.
*   **Meaningful Motion:** Utilizing Framer Motion for fluid, purposeful animations that enhance usability, not distract. Consistency via `lib/motion.tokens.ts`.
*   **Architectural Soundness:** Clean, scalable code with clear separation of concerns (Next.js App Router, Feature-based structure).
*   **Accessibility:** Adherence to WCAG 2.1 AA standards is non-negotiable.
*   **Code Quality:** Enforced via TypeScript (strict mode), ESLint, Prettier, and comprehensive testing.

---

## 🔧 Core Frontend Tech Stack

| Category             | Tool / Library             | Purpose & Notes                                       |
| :------------------- | :------------------------- | :---------------------------------------------------- |
| **Framework**        | Next.js 14+                | App Router, SSR/SSG/ISR, RSC/Client Components      |
| **Language**         | TypeScript                 | Strict Mode Enabled                                   |
| **Styling**          | TailwindCSS                | Utility-first CSS                                     |
| **UI Primitives**    | Shadcn UI                  | Accessible base components (via Radix UI)           |
| **Design System**    | **DyraneUI Layer**         | Custom wrappers (`Dyrane*`) over Shadcn for motion/style |
| **Animation**        | Framer Motion              | UI animations, transitions, gestures                |
| **State Management** | Redux Toolkit (RTK)        | Centralized state (auth, user, UI)                     |
| **Forms**            | React Hook Form + Zod      | Efficient form handling & schema validation         |
| **Data Fetching**    | Custom API Client          | Axios/Fetch wrapper (handles auth, errors, mock data) |
| **Real-time**        | `socket.io-client`         | (Post-MVP) For features like chat                    |
| **Testing**          | Jest + React Testing Lib   | Unit / Integration Testing                            |
| **Testing (E2E)**    | Cypress                    | End-to-end testing                                    |
| **Linting/Format**   | ESLint + Prettier          | Code quality and consistency                          |
| **Git Hooks**        | Husky + lint-staged        | Pre-commit checks                                     |
| **Package Manager**  | `pnpm`                     | Recommended                                           |

---

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18.x or higher - Use NVM recommended)
*   pnpm (Install via `npm install -g pnpm`)
*   Git
*   VS Code (Recommended) + Extensions (ESLint, Prettier, Tailwind IntelliSense)
*   Access to the project Git repository.
*   Access to backend API documentation (OpenAPI/Swagger).

### Local Setup

1.  **Clone:**
    ```bash
    git clone <repository_url>
    cd smartedu-frontend
    ```
2.  **Install Dependencies:**
    ```bash
    pnpm install
    ```
3.  **Environment Variables:**
    ```bash
    cp .env.example .env.local
    ```
    *   Edit `.env.local` and fill in required values (API URL, Auth keys, `NEXT_PUBLIC_API_IS_LIVE` flag for mocking). **Do not commit `.env.local`**.
4.  **Run Development Server:**
    ```bash
    pnpm dev
    ```
    *   Access at `http://localhost:3000` (or configured port).
5.  **Run Backend:** Ensure the backend service is running and accessible at the configured API URL.

### Useful Commands

*   `pnpm dev`: Start development server.
*   `pnpm build`: Create production build.
*   `pnpm start`: Run production build locally.
*   `pnpm lint`: Check for linting errors.
*   `pnpm format`: Format code with Prettier.
*   `pnpm test`: Run unit/integration tests.
*   `pnpm cypress:open`: Open Cypress runner GUI.
*   `pnpm cypress:run`: Run Cypress tests headlessly.

---

## 📂 Project Structure

```
smartedu-frontend/
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

*   **Next.js App Router:** Understand Server Components (default, data fetching) vs. Client Components (`'use client'`, interactivity, hooks). Use appropriately for performance and capability.
*   **DyraneUI Layer:**
    *   Builds upon Shadcn UI primitives.
    *   Provides motion and specific styling via custom wrapper components (e.g., `<DyraneButton>`, `<DyraneCard>`) located in `src/components/dyrane-ui/`.
    *   **Rule:** Always import and use `Dyrane*` components instead of base Shadcn components (`src/components/ui/`) to ensure consistency.
    *   Motion parameters are centralized in `src/lib/motion.tokens.ts`.
*   **State Management (RTK):**
    *   Global state (auth status, user profile, shared UI states) managed via RTK slices in `src/store/` or feature folders.
    *   Use `useSelector` to read state, `useDispatch` to dispatch actions.
    *   Utilize local component state (`useState`, `useReducer`) for non-shared state.
*   **API Client (`src/lib/apiClient.ts` or similar):**
    *   Centralized service/hook for all backend communication.
    *   Handles base URL, attaching auth tokens, consistent error handling, and potential retries.
    *   Includes logic to toggle between live API calls and mock data based on the `NEXT_PUBLIC_API_IS_LIVE` environment variable.
*   **Authentication Flow:**
    *   Managed via integration with Firebase/Auth0 SDKs.
    *   `src/features/auth/components/auth-provider.tsx` (or similar) likely listens for auth state changes and updates Redux.
    *   Protected routes are handled via layout checks or dedicated wrapper components verifying Redux auth state.

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

*   **TypeScript:** Use strict mode. Define clear types/interfaces (`src/types/`). Avoid `any` where possible.
*   **Linting/Formatting:** ESLint & Prettier are enforced via Husky/lint-staged on pre-commit. Run `pnpm lint` / `pnpm format` manually if needed.
*   **Naming Conventions:** `PascalCase` for components/types, `camelCase` for variables/functions.
*   **Component Design:** Functional components with hooks. Aim for small, reusable, and well-defined components.
*   **Styling:** Prioritize Tailwind utility classes. Create custom CSS/components sparingly.
*   **Accessibility:** Build with accessibility in mind from the start (semantic HTML, ARIA, keyboard navigation, color contrast). Test regularly.
*   **Testing:** Write meaningful unit/integration tests (Jest/RTL) for components/hooks/utils and E2E tests (Cypress) for critical user flows.
*   **Git Workflow:** Use Feature Branch workflow (branch from `main`/`develop`, descriptive commits, Pull Requests with reviews).

---

## 🔗 Useful Links (Placeholders)

*   **Design Files:** [Link to Figma/Zeplin]
*   **API Documentation:** [Link to Swagger/OpenAPI Docs]
*   **Backend Repository:** [Link to Backend Git Repo]
*   **Project Management:** [Link to Jira/Trello/Linear Board]
*   **DyraneUI Detailed Docs:** [Link to Separate Design System Docs if applicable]

---
```

**Key Improvements in this README:**

*   **Clear Title and Context:** Explicitly mentions SmartEdu and 1Tech Academy.
*   **Philosophy First:** Starts with the guiding principles (DyraneUI, Performance, etc.).
*   **Filtered Tech Stack:** Focuses only on the core *frontend* technologies relevant to a developer starting on the project.
*   **Actionable Setup:** Clear, step-by-step instructions for getting the local environment running.
*   **Structured Sections:** Uses clear headings and Markdown formatting for readability.
*   **Key Concepts Explained:** Provides context on *how* to use important parts of the architecture (App Router, DyraneUI Layer, State, API).
*   **MVP Focus:** Summarizes the *frontend aspects* of the MVP features and explicitly lists deferred areas.
*   **Consolidated Standards:** Brings together coding, testing, and Git workflow expectations.
*   **Placeholders:** Includes standard sections for links to other resources.