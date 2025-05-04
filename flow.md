
## 🚀 1TechAcademy Platform: User Flow & Feature Specification

**Version:** [Date of generation]

**Overview:** This document outlines the user experience, core features, and administrative capabilities of the 1TechAcademy platform, designed for students, teachers, and administrators.

---

### 🌍 **1. Public Access & Initial Entry**

*   **Landing Page (`/`)**:
    *   Presents the platform's value proposition, possibly featuring courses.
    *   Provides clear navigation to "Sign In" and "Sign Up".
    *   **Status:** ✅ Done.

---

### 🔐 **2. Authentication & Profile Completion**

*   **Standard Authentication**:
    *   **Sign Up (`/register`):** User registers with email and password. Email verification step included.
    *   **Sign In (`/login`):** User logs in with credentials.
    *   **Password Reset (`/forgot-password`, `/reset-password`):** Standard forgot/reset password flow via email.
    *   **Status:** ✅ Implemented (Core logic, UI).
*   **Post-Authentication Routing & Onboarding**:
    *   Upon successful login/signup, the system checks the user's profile (`profileComplete` flag) and the `skipOnboarding` flag (from Redux state).
    *   **If `profileComplete === false` AND `skipOnboarding === false`**: The user is **redirected** to the `/profile` page to complete necessary information. **There is no separate `/onboarding` page.**
    *   **Otherwise**: The user is redirected to their role-specific dashboard (e.g., `/dashboard`, `/admin/dashboard`).
    *   **Status:** ✅ Implemented (Redirection logic, profile check concept).
*   **Profile Page (`/profile`)**:
    *   **Dual Purpose:** Serves as both the **onboarding completion form** and the **standard profile update page**.
    *   **Context Detection:** The page uses an `isOnboarding` state (derived from `profileComplete` and `skipOnboarding`) to adapt its UI, requirements, and submission logic.
    *   **UI Components:** Utilizes modular components: `ProfileAlerts`, `ProfileAvatarInfo`, `ProfileFormFields`, and the enhanced `DatePickerWithYearMonth` for date selection.
    *   **Student Onboarding Flow:**
        *   Required fields: Full Name, Date of Birth, Primary Class/Course selection, Account Type (Individual/Corporate).
        *   Optional role-specific fields (e.g., bio for teacher) may appear but aren't mandatory for initial completion.
        *   **Course Selection:** Defaults intelligently based on cart items (if any) or previously selected/only available course.
        *   **Skip Option:** Allows users to skip onboarding (sets flag, redirects to dashboard). Profile remains incomplete.
    *   **Corporate Manager Onboarding Flow (Conceptual - UI TODO in `/profile`):**
        *   *TODO:* A toggle "Registering for a company?" appears on the `/profile` page during onboarding.
        *   *TODO:* If Yes: Fields for Company Name, Number of Students appear. Course selection becomes multi-select.
        *   *TODO:* "Generate Student Slots" button appears, triggering an API call to create placeholder student accounts linked by `corporateId`.
    *   **Profile Update Flow:** Allows users to update mutable fields (Name, DoB, optional fields) after onboarding. Email/Role are typically read-only.
    *   **Submission & Redirection (Onboarding):**
        *   Updates user profile via API/thunk.
        *   Marks profile as complete (via API/thunk setting `profileComplete=true`).
        *   Clears/sets the `skipOnboarding` flag as appropriate.
        *   **If cart has items:** Redirects to `/pricing` (or `/checkout`) with account type.
        *   **If cart is empty:** Redirects to the user's dashboard.
    *   **Status:** ✅ Implemented (Student path structure, modular components, skip logic, basic submission). ⏳ Corporate flow UI on this page is TODO.

---

### 🏠 **3. Role-Based Dashboards**

*   **Entry Point:** The primary landing area after successful login and profile completion.
*   **Content:** Each role (`student`, `teacher`, `admin`) sees a tailored dashboard displaying relevant summaries, key metrics, quick actions, and navigation.
*   **Status:** ⏳ Conceptual (Specific content and layout for each role's dashboard needs implementation).

---

### 📚 **4. Core Learning & Scheduling Features**

*   **Courses (`/courses`)**:
    *   **Public View:** Students browse available courses (potentially linked from Landing Page).
    *   **Authenticated View:** Users see relevant course lists based on role (e.g., enrolled, taught, all).
    *   **Management (Admin):** Admins manage courses via a tab within `/courses`. (See Admin section).
    *   **Status:** ✅ Implemented (Basic browsing, tab structure). ⏳ Full CRUD UI/Logic pending.
*   **Classes (`/timetable` page - Classes Tab)**:
    *   **Definition:** A specific instance of a Course, assigned to a Teacher and Students, with a defined schedule and attendance tracking.
    *   **Student View (`StudentClassesTab`):** Lists classes the student is enrolled in (using `CourseCard` component).
    *   **Teacher View (`TeacherClassesTab`):** Lists classes the teacher is assigned to teach.
    *   **Admin View (`AdminClassesTab`):** Lists *all* classes with management actions (View, Edit, Delete). Uses `Table` component structure.
    *   **Status:** ✅ Implemented (Role-based tabs, List views for all roles).
*   **Schedule & Timetable (`/timetable` page - Schedule Tab)**:
    *   **Primary View (`ScheduleView.tsx`):** Displays the user's schedule based on their role (student sees enrolled, teacher sees taught, admin potentially sees all or selects).
    *   **Date Navigation:** Includes integrated Month/Year selection via popover, plus "Previous Week", "Next Week", "Today" navigation.
    *   **View Modes:** Toggle between:
        *   **List View:** Groups events by day for the selected week, allows scrolling to specific days.
        *   **Timetable View:** Displays events on a weekly grid against time slots (basic layout implemented).
    *   **Status:** ✅ Implemented (Both view modes, integrated date picker, navigation, role-based data fetching).
*   **Attendance (`/attendance/...`)**:
    *   **Teacher View (`TeacherAttendanceView`):** Implemented. Allows teachers to select a date (using integrated Date Picker with indicators for days with data) and view/search student attendance status for that day's sessions.
    *   **Check-in:** *TODO:* Implement mechanism (QR/Manual/etc.).
    *   **Student View:** *TODO:* Page for students to view their own attendance record.
    *   **Admin View:** *TODO:* Page for admins to get reports/overviews.
    *   **Status:** ✅ Implemented (Teacher View). ⏳ Check-in, Student View, Admin View are TODO.

---

### 🛠️ **5. Management Features (Admin)**

*   **User Management (`/users/...`)**:
    *   **Access:** Restricted to Admins via `AuthorizationGuard`.
    *   **Functionality:** Full CRUD implemented.
    *   **UI:** List view with filtering/tabs (`/users`), Create page (`/users/create`), View page (`/users/[id]`), Edit page (`/users/[id]/edit`). Uses modular table/row/form components. Delete uses `ConfirmationDialog`.
    *   **Status:** ✅ Implemented.
*   **Course Management (`/courses` - Manage Tab & `/courses/...`)**:
    *   **Access:** Restricted to Admins.
    *   **Functionality:** List/Delete implemented within `/courses` tab.
    *   **UI:** Uses modular `ManageCourseTable`/`Row`. Delete uses `ConfirmationDialog`.
    *   **TODO:** Create/View/Edit pages and `CourseForm`. Implement Create/Update thunks.
    *   **Status:** ⏳ Partially Implemented (List/Delete Done).
*   **Class Management (`/timetable` - All Classes Tab & `/classes/...`)**:
    *   **Access:** Restricted to Admins.
    *   **Functionality:** Full CRUD implemented.
    *   **UI:** List view within `/timetable` (`AdminClassesTab`), Create page (`/classes/create`), View page (`/classes/[id]`), Edit page (`/classes/[id]/edit`). Uses `ClassForm`. Delete uses `ConfirmationDialog`.
    *   **TODO:** UI/Logic for adding students/assigning teachers to classes.
    *   **Status:** ✅ Implemented (Core CRUD).
*   **Schedule Event Management (`/manage-schedule/...`)**:
    *   **Access:** Restricted to Admins.
    *   **Functionality:** Full CRUD implemented for individual schedule events (lectures, exams, etc.).
    *   **UI:** List view with filtering (`/manage-schedule`), Create page (`/manage-schedule/create`), View page (`/manage-schedule/[eventId]`), Edit page (`/manage-schedule/[eventId]/edit`). Uses `ScheduleEventForm`, `ScheduleEventTable`, `ScheduleEventTableRow`, `TimePicker`. Delete uses `ConfirmationDialog`.
    *   **Status:** ✅ Implemented.

---

### 📞 **6. Communication & Support**

*   **Discussion Chatrooms (`/chat/...`)**:
    *   *TODO:* Implement course-specific chatrooms. Users can post, teachers moderate. Requires real-time implementation (WebSockets).
    *   **Status:** ⏳ Not Implemented.
*   **Support Ticket System (`/support`, `/admin/support`)**:
    *   *TODO:* Implement system for users to create tickets and admins to manage/respond.
    *   **Status:** ⏳ Not Implemented.

---

### 💳 **7. Payments (`/payment/...`, `/checkout`, `/cart`)**

*   **Flow:** Students pay per course; Corporates pay per seat/course (bulk option). Payment activates course access.
*   **Status:** ⏳ Not Implemented. Needs integration with a payment gateway and updates to user/course activation logic.

---

### ⚙️ **8. Global Rules & Design Principles**

*   **Roles:** Strict 3-role system (Student, Teacher, Admin).
*   **Onboarding:** Handled dynamically via `/profile`, no separate page. ✅
*   **Corporate Logic:** Managed via user metadata (`isCorporateManager`, `corporateId`). (*TODO: Full UI integration*)
*   **Enrollment:** Students currently limited to one primary course/class (enforcement *TODO*).
*   **Capacity:** Course/Class capacity needs enforcement (*TODO*).
*   **UI:** Utilizes **DyraneUI** components alongside Shadcn UI. Focus on responsiveness and smooth transitions (using `framer-motion`). ✅ (Ongoing)
*   **Modularity:** Key features are broken down into reusable components and specific pages/routes. ✅ (Ongoing)

---