
## 1Tech Academy / oneTechAcademy - Backend Documentation

**Version:** 1.0
**Status:** Based on MVP Code Snippets

### 1. Introduction

This document outlines the backend architecture, database schema, API endpoints, and key flows for the 1Tech Academy platform (transitioning to oneTechAcademy). The backend provides the data persistence, business logic, and API layer necessary to support the frontend application described in the "Frontend Developer Guide".

It serves as the central authority for managing users (Students, Teachers, Admins), courses, attendance, payments, communication (chat), support, and other core LMS functionalities.

### 2. Technology Stack

| Category          | Technology/Library | Purpose                                       |
| :---------------- | :----------------- | :-------------------------------------------- |
| **Runtime**       | Node.js            | JavaScript runtime environment                |
| **Framework**     | Express.js         | Web application framework for Node.js         |
| **ORM**           | Sequelize          | Promise-based Node.js ORM for SQL databases   |
| **Database**      | PostgreSQL / MySQL | (Assumed) Relational Database                 |
| **Authentication**| JWT (jsonwebtoken) | Token-based authentication                    |
| **Password Hashing**| bcryptjs           | Secure password hashing                       |
| **Validation**    | express-validator  | API request validation middleware           |
| **Real-time**     | Socket.IO (Implied)| (Post-MVP) For features like real-time chat |

### 3. Architecture Overview

The backend follows a standard layered or MVC-like architecture:

*   **Routes (`routes/`):** Define the API endpoints, handle HTTP requests, apply middleware (auth, validation), and delegate logic to controllers.
*   **Controllers (`controllers/`):** Contain the core business logic for handling requests, interacting with services/models, and formatting responses. (Explicit controllers referenced but code not fully provided).
*   **Models (`models/`):** Define the database schema using Sequelize, including attributes, data types, validations, hooks (e.g., password hashing), and associations between tables.
*   **Middleware (`middleware/`):** Functions executed during the request-response cycle (e.g., `auth.js` for JWT verification, `validateRequest.js` for handling validation errors).
*   **Configuration (`config/`):** Database connection details (`database.js`), environment variables (likely via `.env`).
*   **Services (Implied):** May exist to encapsulate reusable business logic accessed by controllers (e.g., PaymentService, NotificationService).

### 4. Database Schema (Based on Models)

#### Models:

*   **`Student`**: Represents a student user. Stores personal info, login credentials, associations.
    *   Key Attributes: `id`, `name`, `email`, `password` (hashed), `dateOfBirth`, `classId`, `guardianId`, `barcodeId`, `isActive`, `lastLogin`.
*   **`Guardian`**: Represents a student's parent or guardian.
    *   Key Attributes: `id`, `name`, `email`, `phone`, `relationship`, `address`, `isPrimary`.
*   **`Class`**: Represents a scheduled class or section of a course.
    *   Key Attributes: `id`, `name`, `teacherId` (FK to Teacher), `courseId` (FK to Course - *Course model implied*), `startTime`, `endTime`, `daysOfWeek`, `room`, `isActive`, `maxStudents`.
*   **`Attendance`**: Records student attendance for a specific class on a specific date.
    *   Key Attributes: `id`, `studentId` (FK), `classId` (FK), `date`, `status` (enum: present, absent, late, excused), `notes`, `markedById` (FK to Teacher - *Teacher model implied*).
*   **`ChatRoom`**: Represents a chat room, likely associated with a class or group.
    *   Key Attributes: `id`, `name`, `createdById` (FK to Student/User), `isActive`, `lastMessageId` (FK).
*   **`ChatMessage`**: Represents a single message within a ChatRoom.
    *   Key Attributes: `id`, `roomId` (FK), `senderId` (FK to Student/User), `content`, `type` (enum: text, image, file).
*   **`ChatRoomParticipant`**: Join table for ChatRoom and Student (Many-to-Many).
*   **`ChatMessageRead`**: Join table tracking which Student has read which ChatMessage (Many-to-Many).
*   **`Payment`**: Records a financial transaction.
    *   Key Attributes: `id`, `invoiceId` (FK), `studentId` (FK), `amount`, `currency`, `status` (enum: pending, completed, failed, refunded), `paymentMethod` (enum), `paymentIntentId` (e.g., Stripe ID), `metadata`.
*   **`Invoice`**: Represents a bill issued to a student.
    *   Key Attributes: `id`, `studentId` (FK), `amount`, `description`, `dueDate`, `status` (enum: pending, paid, overdue, cancelled).
*   **`InvoiceItem`**: Represents a line item within an Invoice.
    *   Key Attributes: `id`, `invoiceId` (FK), `description`, `amount`, `quantity`.
*   **`Feedback`**: Stores feedback submitted by students.
    *   Key Attributes: `id`, `studentId` (FK), `rating`, `comment`, `type` (enum), `status` (enum: new, reviewed, actioned).
*   **`SupportTicket`**: Represents a support request from a student.
    *   Key Attributes: `id`, `studentId` (FK), `subject`, `description`, `priority` (enum), `status` (enum: open, in_progress, resolved, closed).
*   **`TicketResponse`**: Represents a response (likely from staff) to a SupportTicket.
    *   Key Attributes: `id`, `ticketId` (FK), `userId` (FK to User/Staff - *User model implied*), `message`.
*   **`Teacher` (Implied)**: Represents a teacher user. Referenced by `Class.teacherId` and `Attendance.markedById`.
*   **`Course` (Implied)**: Represents a course offering. Referenced by `Class.courseId`.
*   **`User` (Implied)**: Generic user model, potentially base for Student/Teacher/Admin or used for staff responding to tickets. Referenced by `TicketResponse.userId`.

#### Key Relationships (Defined in `models/index.js`):

*   Student `1:1` (Optional) Guardian (`guardianId`)
*   Student `M:N` Class (through `StudentClass` join table, `classId` also direct FK in `Student`)
*   Student `1:N` Attendance (`studentId`)
*   Student `1:N` Payment (`studentId`)
*   Student `1:N` Invoice (`studentId`)
*   Student `1:N` Feedback (`studentId`)
*   Student `1:N` SupportTicket (`studentId`)
*   Class `1:N` Attendance (`classId`)
*   Class `1:N` ChatRoom (`classId`) (*Assuming ChatRoom is per class*)
*   ChatRoom `M:N` Student (through `ChatRoomParticipant`)
*   ChatRoom `1:N` ChatMessage (`roomId`)
*   ChatMessage `M:N` Student (through `ChatMessageRead` for read status)
*   Invoice `1:N` Payment (`invoiceId`)
*   Invoice `1:N` InvoiceItem (`invoiceId`)
*   SupportTicket `1:N` TicketResponse (`ticketId`)
*   Teacher (Implied) `1:N` Class (`teacherId`)
*   Teacher (Implied) `1:N` Attendance (`markedById`)
*   Course (Implied) `1:N` Class (`courseId`)
*   User (Implied) `1:N` TicketResponse (`userId`)

*(An Entity Relationship Diagram (ERD) would visually represent these relationships)*

### 5. Authentication & Authorization

*   **Authentication:** Achieved using JSON Web Tokens (JWT).
    *   The `POST /auth/login` endpoint validates credentials.
    *   Upon success, it generates a JWT signed with a secret (`process.env.JWT_SECRET`).
    *   The token contains user identifiers (e.g., `id`, `email`, potentially `role`).
    *   The token has an expiration time (`process.env.JWT_EXPIRES_IN`).
    *   The frontend sends this token in the `Authorization` header (e.g., `Bearer <token>`) for subsequent protected requests.
    *   The `middleware/auth.js` verifies the token's validity and signature, attaching user info to `req.user` (or similar).
*   **Authorization:** Role-Based Access Control (RBAC) is implicitly required.
    *   While not explicitly shown in all middleware snippets, routes prefixed with `/admin` are intended for users with an 'Admin' role.
    *   The `auth` middleware likely decodes the role from the JWT.
    *   Specific route handlers or dedicated authorization middleware should check `req.user.role` against required roles (e.g., only Admins can access `/admin/students`).
    *   Other roles (Teacher, Student) have access limited to relevant data (e.g., a student can only access their own attendance, payments, tickets via endpoints like `/attendance/student/:studentId`).

### 6. API Endpoints

*(Based on provided `routes/*.js` files)*

#### 6.1. Admin Routes (`/admin`)

*   **Authentication:** All routes require Admin role authentication.

| Method | Path                | Description                                          | Request (Query/Body)                   | Success Response (200)                       |
| :----- | :------------------ | :--------------------------------------------------- | :------------------------------------- | :------------------------------------------- |
| GET    | `/dashboard`        | Get dashboard stats & recent activity                | -                                      | `{ statistics: {...}, recentPayments, recentSupportTickets }` |
| GET    | `/students`         | Get list of students (paginated, searchable)         | `?page=1&limit=10&search=`             | `{ total, page, totalPages, students: [] }` |
| GET    | `/courses`          | Get list of courses (paginated, searchable)          | `?page=1&limit=10&search=`             | `{ total, page, totalPages, courses: [] }`   |
| GET    | `/payments`         | Get list of payments (paginated, filter by status)   | `?page=1&limit=10&status=`             | `{ total, page, totalPages, payments: [] }`  |
| GET    | `/support-tickets`  | Get list of support tickets (paginated, filter by status) | `?page=1&limit=10&status=`             | `{ total, page, totalPages, tickets: [] }`   |
| GET    | `/feedback`         | Get list of feedback (paginated, filter by type)     | `?page=1&limit=10&type=`               | `{ total, page, totalPages, feedback: [] }`  |
| *(Implied CRUD)* | `/students`, `/courses`, etc. | *POST, PUT, DELETE endpoints are expected for full admin management but not shown in `adminRoutes.js` (some might be in resource-specific routes like `studentRoutes.js`)* | *(Varies)*                             | *(Varies)*                                   |

#### 6.2. Attendance Routes (`/attendance`)

| Method | Path                 | Description                               | Auth     | Request (Params/Body)                                  | Success Response (20x)                   |
| :----- | :------------------- | :---------------------------------------- | :------- | :----------------------------------------------------- | :--------------------------------------- |
| POST   | `/verify-barcode`    | Verify student barcode for attendance     | Required | Body: `{ barcodeId }`                                  | Varies (controller logic)                |
| GET    | `/`                  | Get all attendance records (Likely Admin/Teacher) | Required?| -                                                      | `[Attendance]`                           |
| GET    | `/student/:studentId`| Get attendance for a specific student   | Required | Param: `studentId`                                     | `[Attendance]`                           |
| GET    | `/class/:classId`    | Get attendance for a specific class     | Required | Param: `classId`                                       | `[Attendance]`                           |
| POST   | `/`                  | Mark attendance for a student             | Required | Body: `{ studentId, classId, date, status, notes, markedById }` | `Attendance` (201)                       |
| PUT    | `/:id`               | Update an existing attendance record      | Required | Param: `id`, Body: `{ status?, notes? }`                 | `Attendance` (200)                       |
| GET    | `/stats/:studentId`  | Get attendance stats for a student      | Required | Param: `studentId`                                     | `[{ status, count }]`                    |

#### 6.3. Auth Routes (`/auth`)

| Method | Path                | Description                   | Auth     | Request (Body)                                         | Success Response (20x)                       |
| :----- | :------------------ | :---------------------------- | :------- | :----------------------------------------------------- | :------------------------------------------- |
| POST   | `/register`         | Register a new user (Student) | No       | Body: `{ name, email, password, dateOfBirth, classId, guardianId?, barcodeId }` (Validation rules apply) | `{ message, token, student: {...} }` (201) |
| POST   | `/login`            | Login a user (Student)        | No       | Body: `{ email, password }` (Validation rules apply)   | `{ message, token, student: {...} }` (200) |
| POST   | `/forgot-password`  | Initiate password reset       | No       | Body: `{ email }` (Validation rules apply)             | Controller logic (e.g., sends email)         |
| POST   | `/reset-password`   | Reset password using token    | No       | Body: `{ token, password }` (Validation rules apply) | Controller logic                             |

#### 6.4. Chat Routes (`/chat`)

| Method | Path                          | Description                       | Auth     | Request (Params/Query/Body)                                | Success Response (20x)                   |
| :----- | :---------------------------- | :-------------------------------- | :------- | :--------------------------------------------------------- | :--------------------------------------- |
| GET    | `/messages`                   | Get messages for a room (paginated) | Required | Query: `roomId`, `page?`, `limit?` (Validation)          | Controller logic (`[ChatMessage]`)         |
| POST   | `/messages`                   | Create a new message              | Required | Body: `{ roomId, content }` (Validation)                   | `ChatMessage` (201) / Controller logic   |
| POST   | `/rooms`                      | Create a new chat room            | Required | Body: `{ name, participants: [studentId] }` (Validation) | `ChatRoom` (201) / Controller logic      |
| GET    | `/rooms/student/:studentId`   | Get chat rooms for a student      | Required | Param: `studentId`                                         | `[ChatRoom]`                             |
| GET    | `/rooms/:roomId/messages`     | Get all messages in a room        | Required | Param: `roomId`                                            | `[ChatMessage]`                          |
| POST   | `/messages/:messageId/read` | Mark a message as read by student | Required | Param: `messageId`, Body: `{ studentId }`                | `{ message: "..." }` (200)               |
| GET    | `/messages/unread/count/:studentId` | Get unread message count for student | Required | Param: `studentId`                                         | `{ unreadCount }`                        |

#### 6.5. Content Routes (`/content`)

*(Purpose less clear, potentially for external/partner content integration)*

| Method | Path               | Description                  | Auth     | Request (Params/Query)                     | Success Response (200)   |
| :----- | :----------------- | :--------------------------- | :------- | :----------------------------------------- | :----------------------- |
| GET    | `/partner/:partnerId` | Get content for a partner    | Required | Param: `partnerId` (Validation)            | Controller logic         |
| GET    | `/partner/search`  | Search partner content       | Required | Query: `query`, `filters?` (Validation)  | Controller logic         |

#### 6.6. Payment Routes (`/payments`)

| Method | Path           | Description                     | Auth     | Request (Query/Body)                                  | Success Response (20x)   |
| :----- | :------------- | :------------------------------ | :------- | :---------------------------------------------------- | :----------------------- |
| POST   | `/initiate`    | Initiate payment for an invoice | Required | Body: `{ invoiceId }` (Validation)                    | Controller logic (e.g., Stripe client secret) |
| POST   | `/webhook`     | Handle payment provider webhook | No       | Body: (Specific to provider, e.g., Stripe event)      | Controller logic (200 OK) |
| GET    | `/history`     | Get user's payment history      | Required | Query: `page?`, `limit?` (Validation)                 | Controller logic (`[Payment]`) |
| GET    | `/:id`         | Get payment by ID               | Required | Param: `id`                                           | Controller logic (`Payment`) |

#### 6.7. Student Routes (`/students`)

*(Note: These seem geared towards Admin CRUD, conflicting slightly with `/admin/students` GET)*

| Method | Path    | Description                   | Auth      | Request (Params/Body) | Success Response (20x)   |
| :----- | :------ | :---------------------------- | :-------- | :-------------------- | :----------------------- |
| GET    | `/`     | Get all students              | Required? | -                     | `[Student]`              |
| GET    | `/:id`  | Get a single student by ID    | Required? | Param: `id`           | `Student` (200)          |
| POST   | `/`     | Create a new student (Admin?) | Required? | Body: `{...Student}`  | `Student` (201)          |
| PUT    | `/:id`  | Update a student              | Required? | Param: `id`, Body: `{...}` | `Student` (200)          |
| DELETE | `/:id`  | Delete a student              | Required? | Param: `id`           | `{ message: "..." }` (200) |

#### 6.8. Support Routes (`/support`)

| Method | Path          | Description                 | Auth     | Request (Query/Body)                                  | Success Response (20x)   |
| :----- | :------------ | :-------------------------- | :------- | :---------------------------------------------------- | :----------------------- |
| POST   | `/ticket`     | Create a new support ticket | Required | Body: `{ subject, description, priority }` (Validation) | `SupportTicket` (201) / Controller logic |
| GET    | `/my-tickets` | Get user's support tickets  | Required | Query: `page?`, `limit?` (Validation)                 | Controller logic (`[SupportTicket]`) |
| POST   | `/feedback`   | Submit feedback             | Required | Body: `{ rating, comment, type }` (Validation)        | Controller logic (201)   |

#### 6.9. Timetable Routes (`/timetable`)

| Method | Path         | Description                     | Auth     | Request (Query)                     | Success Response (200)   |
| :----- | :----------- | :------------------------------ | :------- | :---------------------------------- | :----------------------- |
| GET    | `/`          | Get timetable for user/class    | Required | Query: `startDate?`, `endDate?` (Validation) | Controller logic (`[ClassSchedule]`) |
| GET    | `/upcoming`  | Get upcoming courses for user | Required | -                                   | Controller logic (`[Class]`) |

### 7. Environment & Setup

*   **Dependencies:** Install using `npm install` or `pnpm install`.
*   **Environment Variables:** Requires a `.env` file based on `.env.example` containing:
    *   `DATABASE_URL` or individual DB connection params (host, port, user, password, database name)
    *   `JWT_SECRET`: Secret key for signing JWTs.
    *   `JWT_EXPIRES_IN`: Token expiration time (e.g., `1d`, `7h`).
    *   `PORT`: Port the server listens on (e.g., `5000`).
    *   (Potentially) Stripe API keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
    *   (Potentially) Email service credentials.
*   **Database Migration/Sync:** Sequelize migrations or `sequelize.sync({ alter: true })` (as seen in `models/index.js`) sets up/updates the database schema.
*   **Running:** `npm start` or `npm run dev` (if nodemon is configured).

### 8. Error Handling

*   `express-validator` middleware (`validateRequest`) catches validation errors and returns 400 Bad Request responses.
*   Asynchronous errors in route handlers should be caught (e.g., using `try...catch` or an async error handling middleware) and return appropriate 500 Internal Server Error responses.
*   Specific errors (e.g., 404 Not Found, 401 Unauthorized, 403 Forbidden) are returned based on logic in controllers and middleware.
*   Consistent error response format (e.g., `{ error: "Message" }` or `{ message: "Message" }`) is used.

---

## Application Flow Model

This section describes key user interactions and how the frontend and backend collaborate.

### Flow 1: User Registration (Student)

1.  **Frontend (FE):** User navigates to `/signup` page. Fills registration form (name, email, password, DOB, class choice, barcode).
2.  **FE:** Performs client-side validation (using Zod schema).
3.  **FE:** On submit, calls `apiClient.post('/auth/register', formData)`.
4.  **Backend (BE):** `authRoutes.js` receives `POST /auth/register`.
5.  **BE:** Validation middleware (`registerValidation`) runs. If errors, returns 400.
6.  **BE:** `authController.register` (or inline logic) checks if email exists (`Student.findOne`). If exists, returns 400 ("Student already exists").
7.  **BE:** Hashes the password using `bcryptjs` (via Sequelize hook).
8.  **BE:** Creates a new `Student` record in the database (`Student.create`).
9.  **BE:** Generates a JWT containing student ID, email, role ('student').
10. **BE:** Sends 201 Created response with `{ message, token, student }`.
11. **FE:** `apiClient` receives the response.
12. **FE:** Stores the JWT securely (e.g., Local Storage, HttpOnly Cookie handled by backend).
13. **FE:** Updates Redux state (`authSlice`) with user info and authenticated status.
14. **FE:** Redirects user to the `/dashboard`.

### Flow 2: User Login

1.  **FE:** User navigates to `/login` page. Enters email and password.
2.  **FE:** On submit, calls `apiClient.post('/auth/login', { email, password })`.
3.  **BE:** `authRoutes.js` receives `POST /auth/login`.
4.  **BE:** Validation middleware (`loginValidation`) runs. If errors, returns 400.
5.  **BE:** `authController.login` (or inline logic) finds the student by email (`Student.findOne`). If not found, returns 401 ("Invalid credentials").
6.  **BE:** Compares the provided password with the hashed password using `student.comparePassword()`. If no match, returns 401.
7.  **BE:** Updates `lastLogin` timestamp for the student.
8.  **BE:** Generates a JWT.
9.  **BE:** Sends 200 OK response with `{ message, token, student }`.
10. **FE:** `apiClient` receives the response.
11. **FE:** Stores JWT, updates Redux state.
12. **FE:** Redirects user to `/dashboard`.

### Flow 3: Admin Views Student List

1.  **FE:** Admin user (already logged in) navigates to the "Manage Students" page (e.g., `/admin/students`).
2.  **FE:** Component mounts, dispatches Redux thunk `fetchAdminStudents(page, limit, searchTerm)`.
3.  **FE:** Thunk calls `apiClient.get('/admin/students', { params: { page, limit, search } })`. `apiClient` includes the Admin's JWT in the `Authorization` header.
4.  **BE:** `adminRoutes.js` receives `GET /admin/students`.
5.  **BE:** `auth` middleware verifies JWT, confirms user has 'Admin' role. If not, returns 401/403.
6.  **BE:** Route handler parses `page`, `limit`, `search` from `req.query`.
7.  **BE:** Uses Sequelize (`Student.findAndCountAll`) with `where` (for search), `limit`, `offset`, and `order` to query the database.
8.  **BE:** Sends 200 OK response with `{ total, page, totalPages, students: [...] }`.
9.  **FE:** Thunk receives data, updates Redux state (`adminSlice` or `studentSlice`) with the student list and pagination info.
10. **FE:** Component re-renders, displaying the student data in a table (`DyraneTable`).

### Flow 4: Student Views Dashboard

1.  **FE:** Student (already logged in) is redirected to or navigates to `/dashboard`.
2.  **FE:** `/dashboard/page.tsx` checks `user.role` from Redux (`authSlice`). Determines it's 'student'.
3.  **FE:** Renders `<StudentDashboard />` component.
4.  **FE:** `<StudentDashboard />` mounts, dispatches thunk `fetchStudentDashboardData()`.
5.  **FE:** Thunk calls `apiClient.get('/api/student/dashboard')` (or similar endpoint, e.g., `/api/users/me/dashboard`, `/timetable/upcoming`, `/students/:id/courses`). *Note: A dedicated student dashboard endpoint isn't explicitly shown, data might be aggregated from multiple calls.* `apiClient` includes JWT.
6.  **BE:** Relevant endpoint(s) receive the request(s).
7.  **BE:** `auth` middleware verifies JWT.
8.  **BE:** Controller/Service fetches required data (e.g., enroled courses, upcoming schedule from `Class` and `Attendance`, recent payments from `Payment`).
9.  **BE:** Sends 200 OK response with aggregated dashboard data.
10. **FE:** Thunk updates Redux state (`dashboardSlice` or relevant slices).
11. **FE:** `<StudentDashboard />` renders the fetched data using `DyraneCard` components (e.g., "My Courses", "Upcoming Courses").

### Flow 5: Student Sends Chat Message (Simplified - No WebSockets yet)

1.  **FE:** Student is viewing a chat room page. Types a message.
2.  **FE:** On send, calls `apiClient.post('/chat/messages', { roomId, content })`. JWT is included.
3.  **BE:** `chatRoutes.js` receives `POST /chat/messages`.
4.  **BE:** `auth` middleware verifies JWT. Validation runs.
5.  **BE:** Route handler (or `chatController.createMessage`) creates a `ChatMessage` record.
6.  **BE:** Updates `lastMessageId` on the corresponding `ChatRoom`.
7.  **BE:** Sends 201 Created response with the new `ChatMessage` object.
8.  **FE:** `apiClient` receives the response.
9.  **FE:** Updates local component state or Redux state (`chatSlice`) to display the new message instantly for the sender.
10. **FE:** *(Future/Post-MVP with Sockets): BE would emit a 'new_message' event via Socket.IO. Other clients in the room would listen for this event and update their UI.*

### Flow 6: Payment via Stripe (Conceptual)

1.  **FE:** Student adds courses to cart (managed by Redux Persist). Proceeds to checkout/registration.
2.  **FE:** During registration step 3 (or separate checkout), FE requests payment initiation from BE, possibly sending `invoiceId` or `cartDetails`. Calls `apiClient.post('/payments/initiate', { invoiceId })`.
3.  **BE:** `paymentRoutes.js` receives `POST /payments/initiate`.
4.  **BE:** `auth` middleware verifies JWT.
5.  **BE:** `paymentController.initiatePayment`:
    *   Finds the `Invoice` or calculates total amount from cart.
    *   Creates a `Payment` record with status 'pending'.
    *   Interacts with Stripe API (`stripe.paymentIntents.create`) to create a PaymentIntent on Stripe's servers.
    *   Sends the `client_secret` from the Stripe PaymentIntent back to the FE in a 200 OK response.
6.  **FE:** Receives the `client_secret`.
7.  **FE:** Uses Stripe.js Elements to collect card details securely and calls `stripe.confirmCardPayment(client_secret, { payment_method: ... })`.
8.  **Stripe:** Processes the payment.
9.  **Stripe:** Sends a webhook event (e.g., `payment_intent.succeeded`) to the backend endpoint `POST /payments/webhook`.
10. **BE:** `paymentRoutes.js` receives `POST /payments/webhook`. No auth needed, but signature verification is crucial.
11. **BE:** `paymentController.handleWebhook`:
    *   Verifies the webhook signature using `STRIPE_WEBHOOK_SECRET`.
    *   Parses the event data.
    *   If `payment_intent.succeeded`, finds the corresponding `Payment` record (using `paymentIntentId`).
    *   Updates the `Payment` status to 'completed' and the `Invoice` status to 'paid'.
    *   Potentially triggers other actions (enrol student, send confirmation email).
    *   Sends 200 OK response to Stripe to acknowledge receipt.
12. **FE:** The `stripe.confirmCardPayment` call resolves successfully (or fails). FE shows confirmation/error message to the user and potentially redirects (e.g., to dashboard, order confirmation page).

---