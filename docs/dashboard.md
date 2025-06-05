# Dashboard Enhancement Plan

## Objective
Unify and enhance the DashboardStats component to dynamically render role-based dashboard statistics and recent activities for all user roles: super_admin, admin, teacher (facilitator), and student.

## Current Situation
- The existing `StatsCards` component renders static, hardcoded data per role.
- The `DashboardStats` component fetches live data but lacks role-based dynamic rendering.
- Revenue data is fetched and displayed in the accounting dashboard.
- User counts by role can be derived from the auth slice.
- Recent activities currently show courses for students only.

## Proposed Enhancements

### 1. Unified DashboardStats Component
- Merge the live data fetching capabilities of `DashboardStats` with the role-based rendering logic of `StatsCards`.
- Fetch and display:
  - User counts by role (super_admin, admin, teacher, student) from the auth slice.
  - Revenue statistics from the accounting slice.
  - Assignments, grades, schedule, payments, classes, courses, notifications.
- Implement role-based conditional rendering of stats cards:
  - Super Admin & Admin: Show total students, facilitators, courses, revenue, etc.
  - Teacher: Show my courses, my students, assignments, completion rate.
  - Student: Show enrolled courses, learning hours, completion rate, upcoming events.
- Include loading states and error handling for all data fetches.

### 2. Recent Activities Rendering
- For students: Show recent courses as current implementation.
- For other roles (super_admin, admin, teacher): Show recent notifications dynamically fetched and generated.
- Leverage the existing notifications slice and `NotificationCenter` component logic for dynamic notifications.

### 3. Dashboard Page Updates
- Replace current stats cards usage with the unified `DashboardStats` component.
- Render recent activities based on user role as described.
- Ensure UI consistency and responsiveness across roles and tabs.

### 4. Documentation
- Document the new dashboard architecture, data flow, and role-based rendering logic in this file.
- Include instructions for future enhancements and testing guidelines.

## Data Sources and Selectors
- User counts: Derived from `auth` slice users state (`selectAllUsers`, `selectTotalUsers`).
- Revenue stats: From `accounting` slice (`selectAccountingStats`).
- Assignments, grades, schedule, payments, classes, courses: From respective slices as currently implemented.
- Notifications: From `notifications` slice and dynamic notifications generation.

## Testing Scope (Critical Path)
- Verify role-based rendering of stats cards.
- Verify dynamic fetching and display of user counts and revenue.
- Verify recent activities rendering per role.
- Verify loading and error states.
- Verify integration with existing analytics and accounting dashboards.
- UI/UX consistency on dashboard pages and components.

---

This plan aims to create a dynamic, data-driven dashboard experience tailored to each user role, improving usability and relevance.
