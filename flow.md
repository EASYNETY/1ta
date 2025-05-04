---
# ✅ 1TechAcademy Platform Specification (Simplified Role Model)
---

### 1. **Landing Page**

- ✅ Status: Done

---

### 2. **Authentication**

- Sign up / Sign in (email + password)
- Forgot password / Reset
- Email verification
- **Post-auth logic**:
  - If profile is incomplete → redirect to `/profile`
  - Else → go to dashboard based on role

---

### 3. **Profile Completion Flow**

#### Trigger

- After login, if `profileComplete === false` → redirect to `/profile`

#### `/profile` Page

This dynamic page adapts to student types based on metadata.

##### Individual Students

1. Fill basic info: Name, Age, Gender
2. Select one course
3. Select "Individual" account type (optional UI)
4. Submit → `/dashboard`

##### Corporate Students

1. Created by a Corporate Manager
2. On first login → `/profile`
3. Fill: Name, Email, Password
4. Course may be pre-assigned (read-only or restricted)
5. Cannot change `corporateId` or account type
6. Submit → `/dashboard`

##### Corporate Managers (also `student` role)

- `role: student`, `isCorporateManager: true`

Steps:

1. Toggle: "Registering on behalf of an organization?"
2. If yes:
   - Field: Company Name → `corporateId`
   - Number of Students to Manage
   - Multi-select: Courses to Assign (capacity limits apply)
   - Button: Generate Student Slots
     ```ts
     {
       corporateId: 'corp_xyz123',
       courseId: 'course_id',
       fullName: null,
       email: null,
       profileComplete: false,
       isCorporateManager: false,
       role: 'student'
     }
     ```
3. Submit → `/dashboard`

---

### 4. **User Management**

#### Roles

- `student` (includes corporate student/manager)
- `teacher`
- `admin`

#### Metadata Distinction

| Type               | `role`  | `isCorporateManager` | `corporateId` |
| ------------------ | ------- | -------------------- | ------------- |
| Individual Student | student | false                | null          |
| Corporate Student  | student | false                | corp_xyz123   |
| Corporate Manager  | student | true                 | corp_xyz123   |

#### API

```http
GET /users?role=student|teacher|admin
POST /users
PATCH /users/:id
DELETE /users/:id
```

---

### 5. **Course Management**

- Create/edit/delete courses
- Fields: Name, Description, Max Students, Price
- Used in both individual and corporate onboarding

#### API

```http
GET /courses
POST /courses
PUT /courses/:id
DELETE /courses/:id
```

---

### 6. **Payments**

#### Individual Students

- Pay per course to activate

#### Corporate Managers

- Pay per student per course (bulk)

#### API

```http
POST /payment/individual
POST /payment/corporate
GET /payment/status/:userId
```

---

### 7. **Class Management**

- A **Class** is a course instance with:
  - Assigned Teacher
  - Assigned Students
  - Schedule & Attendance

#### API

```http
POST /classes
GET /classes
PUT /classes/:id
POST /classes/:id/add-students
POST /classes/:id/assign-teacher
```

---

### 8. **Schedule Management**

- Weekly timetable per class
- One-time events (exams, etc.)

#### API

```http
POST /schedule
GET /schedule/:classId
PUT /schedule/:id
```

---

### 9. **Attendance Management**

- Based on scheduled sessions
- Modes: QR/barcode, fingerprint (future), manual
- Editable/exportable by staff

#### API

```http
POST /attendance/check-in
GET /attendance/class/:classId
GET /attendance/student/:studentId
```

---

### 10. **Discussion Chatrooms**

- One per course
- Students post (no DMs)
- Teachers moderate

#### API

```http
GET /chat/course/:courseId
POST /chat/course/:courseId/message
```

---

### 11. **Support Tickets**

- Raise from dashboard
- Admins update & resolve

#### API

```http
POST /support-ticket
GET /support-ticket?status=open|closed
PATCH /support-ticket/:id
```

---

### 🔁 Global Rules

- Only 3 roles: `student`, `teacher`, `admin`
- Corporate logic via metadata: `isCorporateManager`, `corporateId`
- All onboarding via `/profile`
- One course per student
- Course capacity enforced
- Payment required to activate
- Admin Dashboard:
  - Metrics: Active Users, Payments, Attendance
- UI powered by **DyraneUI** (responsive, animated)
