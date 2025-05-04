
---

# ✅ 1TechAcademy Platform Specification (Critically Refined)

---

### ✅ 1. **Landing Page**

* Status: Done

---

### 🔐 2. **Authentication (Global)**

* Sign up / Sign in (email + password)
* Forgot password / Reset
* Email verification
* **Post-auth logic**:

  * If profile is incomplete → redirect to `/profile`
  * Otherwise → go to dashboard based on role

---

### 👤 3. **Profile Completion Flow** (No separate onboarding page)

#### Trigger

* After login, if `profileComplete === false` → redirect to `/profile`

#### `/profile` Page Behavior

> This is a dynamic page that adapts to both **students** and **corporate users** based on form selection.

##### 🔹 For Normal Students:

1. Fill basic profile: Name, Age, Gender, etc.
2. Select **Course** (only one course allowed)
3. Submit → redirect to `/dashboard`

##### 🔸 For Corporate Users:

1. Toggle: “Are you registering as a corporate?”
2. If toggled `true`, show:

   * Field: **Company Name**
   * Field: **Number of Students to manage**
   * Multi-select: **Available Courses** (respect seat limits)
3. Button: **Generate Student Slots**

   * Creates empty student records linked by `corporateId`
   * Each record has:

     ```ts
     {
       corporateId: "corp_xyz123",
       courseId: "course_id",
       fullName: null,
       email: null,
       profileComplete: false
     }
     ```
4. Submit → redirect to `/dashboard`

---

### 👥 4. **User Management**

#### User Roles

* `student`
* `teacher`
* `corporate`
* `admin`

#### Distinction Between Student Types:

* **Normal Student**: `corporateId = null`
* **Corporate Student**: `corporateId = 'corp_xxx'`

#### API

```http
GET /users?role=student|teacher|corporate|admin
POST /users
PATCH /users/:id
DELETE /users/:id
```

---

### 📚 5. **Course Management**

* Create, edit, delete courses
* Fields: Name, Description, Max Students, Price
* Used in both self-onboarding and corporate bulk assignment

#### API

```http
GET /courses
POST /courses
PUT /courses/:id
DELETE /courses/:id
```

---

### 💳 6. **Payments**

#### For Students:

* Pay per course (required for activation)

#### For Corporates:

* Pay per student per course (bulk payment allowed)

#### API

```http
POST /payment/individual
POST /payment/corporate
GET /payment/status/:userId
```

---

### 🏫 7. **Class Management**

* A **Class** is an instance of a course with:

  * Assigned Teacher
  * Assigned Students
  * Schedule
  * Attendance records

#### API

```http
POST /classes
GET /classes
PUT /classes/:id
POST /classes/:id/add-students
POST /classes/:id/assign-teacher
```

---

### 🗓️ 8. **Schedule Management**

* Timetable per class (weekly structure)
* One-time events (e.g., exams, seminars)

#### API

```http
POST /schedule
GET /schedule/:classId
PUT /schedule/:id
```

---

### 🧾 9. **Attendance Management**

* Tied to scheduled sessions
* Modes: QR/barcode, fingerprint (future), or manual
* Teachers/admins can view, edit, and export

#### API

```http
POST /attendance/check-in
GET /attendance/class/:classId
GET /attendance/student/:studentId
```

---

### 💬 10. **Discussion Chatrooms**

* One per course
* Students can post (no DMs)
* Teachers moderate

#### API

```http
GET /chat/course/:courseId
POST /chat/course/:courseId/message
```

---

### 🛠️ 11. **Support Ticket System**

* Raise tickets from dashboard
* Admin resolves & updates status

#### API

```http
POST /support-ticket
GET /support-ticket?status=open|closed
PATCH /support-ticket/:id
```

---

### 🧠 Global Rules & Design

* **No `/onboarding` page exists**
* All onboarding logic handled inside `/profile`
* Use `corporateId` to group/manage corporate students
* Every course has a **student capacity**
* Every student can enroll in only **one course**
* Payments unlock access
* Admin dashboard includes:

  * Metrics: active users, payments, attendance summaries
* Role-based routing and dashboard experience
* UI: built with **DyraneUI**, responsive, smooth transitions


