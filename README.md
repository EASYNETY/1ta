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

---
