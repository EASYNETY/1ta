**Technical Fix Document / E-Ticket Summary**

**Project:** SmartEdu Frontend Application
**Date Reported:** May 27, 2025
**Reporter:** Israel

---

**Ticket #1: Student Profile Data Not Populating Post-Signup**

- **ID:** BUG-001
- **Severity:** Medium
- **Component:** User Signup, Profile Completion
- **Summary:** Student information entered during signup (e.g., address) is not pre-filled in the "Complete Your Profile" section.
- **Steps to Reproduce:**
  1.  Navigate to the signup page.
  2.  Complete the signup form with all required information, including address.
  3.  Successfully sign up.
  4.  Be redirected or navigate to the "Complete Your Profile" section.
- **Expected Result:** Fields that were filled during signup (like address) should be pre-populated in the "Complete Your Profile" section.
- **Actual Result:** Fields are empty, requiring the student to re-enter the information.
- **Impact:** Poor user experience, redundant data entry.
- **Notes:** This affects the data flow between the initial signup and profile completion stages.

---

**Ticket #2: Incorrect Field Visibility for "Individual" Account Type**

- **ID:** BUG-002
- **Severity:** Medium
- **Component:** Profile Completion - Account Type
- **Summary:** The "Registering on behalf of an organization" option is visible when "Individual" account type is selected.
- **Steps to Reproduce:**
  1.  Navigate to the "Complete Your Profile" section.
  2.  Select "Individual" as the account type.
- **Expected Result:** The "Registering on behalf of an organization" checkbox/option should be hidden.
- **Actual Result:** The "Registering on behalf of an organization" checkbox/option remains visible.
- **Impact:** Confusing UI, potential for incorrect data entry.
- **Notes:** Conditional logic for field visibility based on account type needs review.

---

**Ticket #3: Profile Completion Blocked for "Individual" Accounts**

- **ID:** BUG-003
- **Severity:** High
- **Component:** Profile Completion - Individual Account
- **Summary:** Students cannot complete their profile as "Individual" due to a mandatory "Registering on behalf of an organization" field and subsequent validation errors.
- **Steps to Reproduce:**
  1.  Navigate to the "Complete Your Profile" section.
  2.  Select "Individual" as the account type.
  3.  Attempt to complete the profile without checking "Registering on behalf of an organization".
  4.  Observe: Profile completion is likely blocked.
  5.  Check "Registering on behalf of an organization" (even though it's an individual account).
  6.  Attempt to complete the profile.
- **Expected Result:** Students should be able to complete their profile as "Individual" without interacting with organization-specific fields. No validation errors should occur if all _relevant_ individual fields are filled.
- **Actual Result:** Profile completion is blocked. Even if the organization box is ticked (incorrectly for an individual), a validation error occurs, preventing profile completion.
- **Impact:** Core functionality blocked for individual users.
- **Notes:** This seems related to BUG-002. Validation rules and required fields for "Individual" accounts need to be corrected.

---

**Ticket #4: Profile Completion Failure for "Corporate" Accounts**

- **ID:** BUG-004
- **Severity:** High
- **Component:** Profile Completion - Corporate Account
- **Summary:** Corporate users receive a "Failed to update profiles" error when attempting to complete their profile.
- **Steps to Reproduce:**
  1.  Navigate to the "Complete Your Profile" section.
  2.  Select "Corporate" (or similar) as the account type.
  3.  Fill in all required fields for a corporate profile.
  4.  Click "Complete Profile".
- **Expected Result:** The corporate profile should be saved successfully.
- **Actual Result:** An error message "Failed to update profiles" is displayed.
- **Impact:** Core functionality blocked for corporate users.
- **Notes:** Investigate backend API endpoint for profile updates, request payload, and server-side error logs.

---

**Ticket #5: Course Price Editing Error in Super Admin**

- **ID:** BUG-005
- **Severity:** High
- **Component:** Super Admin - Course Management
- **Summary:** Super Admin encounters an error when attempting to edit prices for specific courses (UI/UX and React.js).
- **Steps to Reproduce:**
  1.  Log in as Super Admin.
  2.  Navigate to the course management section.
  3.  Attempt to edit the price for the "UI/UX" course.
  4.  Attempt to edit the price for the "React.js" course.
- **Expected Result:** The price should be successfully updated and saved.
- **Actual Result:** An error occurs, and the price update fails.
- **Impact:** Prevents admin from managing critical course information.
- **Notes:** Check API endpoint for course price updates. Are there specific validation rules or data issues tied to these particular courses? Review server logs for error details.

---

**Ticket #6: Course Prices Display as ₦0 on Student Side**

- **ID:** BUG-006
- **Severity:** Critical
- **Component:** Student Portal - Course Display, Cart, Checkout
- **Summary:** All courses show a price of ₦0 for students, despite prices being set in Super Admin. This also affects the cart and checkout.
- **Steps to Reproduce:**
  1.  Ensure course prices are set in Super Admin.
  2.  Log in as a student.
  3.  Browse courses.
  4.  Add courses to the cart.
  5.  Proceed to checkout.
- **Expected Result:** Courses should display their configured prices. Cart and checkout should reflect these prices.
- **Actual Result:** All courses display ₦0. Cart and checkout totals are ₦0.
- **Impact:** Prevents sales, major financial impact, incorrect billing.
- **Notes:** Investigate data retrieval for course prices on the student-facing side. Check currency formatting and if the pricing data is correctly propagated/fetched.

---

**Ticket #7: Cart - "Remove" Button Non-Functional**

- **ID:** BUG-007
- **Severity:** Medium
- **Component:** Student Portal - Cart
- **Summary:** Students are unable to remove courses from their cart using the remove icon/button.
- **Steps to Reproduce:**
  1.  Log in as a student.
  2.  Add one or more courses to the cart.
  3.  Navigate to the cart page.
  4.  Attempt to click the remove icon/button for a course.
- **Expected Result:** The selected course should be removed from the cart, and the cart total should update.
- **Actual Result:** The remove functionality does not work; the course remains in the cart.
- **Impact:** Poor user experience, students cannot manage their cart effectively.
- **Notes:** Check frontend event handlers and API calls associated with the remove cart item functionality.

---

**Ticket #8: Student Barcode Missing from Dashboard**

- **ID:** BUG-008
- **Severity:** Medium
- **Component:** Student Portal - Dashboard
- **Summary:** The student's barcode is not visible on their dashboard as per design specifications.
- **Steps to Reproduce:**
  1.  Log in as a student.
  2.  Navigate to the student dashboard.
- **Expected Result:** The student's barcode should be displayed beside the "Browse Courses" button.
- **Actual Result:** The barcode is not present in the specified location.
- **Impact:** Feature unavailability, potentially impacting attendance tracking or other barcode-dependent processes.
- **Notes:** Verify the UI implementation and data fetching for the barcode on the dashboard. Confirm design specification from the last meeting.

---

**Ticket #9: Non-Functional Barcode on Attendance Page**

- **ID:** BUG-009
- **Severity:** Low
- **Component:** Student Portal - Attendance Page
- **Summary:** A barcode appears on the attendance page but is non-functional and should be removed.
- **Steps to Reproduce:**
  1.  Log in as a student.
  2.  Navigate to the attendance page.
  3.  Observe the barcode.
- **Expected Result:** The non-functional barcode on the attendance page should be removed to avoid confusion (as the primary student barcode should be on the dashboard - see BUG-008).
- **Actual Result:** A non-functional barcode is present on the attendance page.
- **Impact:** User confusion, redundant UI element.
- **Notes:** This is a cleanup task to remove an unnecessary element.

---

**Ticket #10: Application Error on Timetable/Classes Page**

- **ID:** BUG-010
- **Severity:** High
- **Component:** Student Portal - Timetable/Classes
- **Summary:** Students encounter an application error when clicking "Classes" under the timetable section.
- **Steps to Reproduce:**
  1.  Log in as a student.
  2.  Navigate to the Timetable section.
  3.  Click on "Classes".
- **Expected Result:** The student's class schedule or relevant information should be displayed.
- **Actual Result:** An application error message appears.
- **Impact:** Students cannot access their class information.
- **Notes:** Refer to the attached screenshot (mentioned in original email) for the specific error message. Investigate frontend routing, API calls for class data, and backend server logs related to this feature.

---

**Ticket #11: Clarification Needed for "Schedule" Option Under Timetable**

- **ID:** QUERY-001
- **Severity:** N/A (Clarification)
- **Component:** Student Portal - Timetable/Schedule
- **Summary:** The purpose and functionality of the "Schedule" option under the Timetable section are unclear to the user.
- **Request:** Provide a functional explanation or documentation for the "Schedule" feature within the student portal's timetable section.
- **Impact:** Potential user confusion if the feature's intent is not obvious.
- **Notes:** This is a request for information to understand the intended functionality, which may then lead to documentation updates or UI/UX improvements if necessary.

---

**Ticket #12: Missing Information in Attendance Scan Student Info Modal**

- **ID:** BUG-011 (_Note: Incrementing from BUG-010, assuming QUERY-001 is a separate numbering scheme_)
- **Severity:** Medium
- **Component:** Attendance Scanning System - Student Information Modal
- **Summary:** When a student's barcode is scanned for attendance, the pop-up modal displaying their information is missing key details.
- **Steps to Reproduce:**
  1.  Use the attendance scanning system/device.
  2.  Scan a registered student's barcode.
  3.  Observe the information displayed in the pop-up modal.
- **Expected Result:** The student information modal should display:
  - Student's Full Name
  - Current Payment Status (e.g., "Paid," "Outstanding," "Partial Payment")
  - Date and Time of Check-in (for the current scan)
  - The specific Lecture/Class they are checking in for.
- **Actual Result:** One or more of the expected fields (Name, Payment Status, Check-in Time, Lecture) are missing from the modal.
- **Impact:** Incomplete information for administrators/instructors at the point of attendance taking, potentially hindering quick verification of payment status or class relevance.
- **Notes:** This requires updating the data fetched and displayed in the student information modal that appears upon a successful barcode scan for attendance. Ensure the backend API provides all necessary fields and the frontend modal is updated to render them.

---

**Ticket #13: Display Number of Remaining Slots for Selected Course in Onboarding**

- **ID:** FEAT-001 (_Using FEAT for a new feature/enhancement, distinct from BUG or QUERY_)
- **Severity:** Medium
- **Component:** Student Onboarding - Course Selection
- **Summary:** When a student selects a course during the onboarding/enrollment process, the UI does not indicate how many slots are still available for that course.
- **User Story / Requirement:** As a prospective student, when I select a course during onboarding, I want to see the number of remaining slots available so I can understand the urgency or availability before proceeding.
- **Proposed Solution:**
  1.  When a course is selected (e.g., from a dropdown, list, or by clicking a course card) in the onboarding flow:
  2.  Fetch or make available the total capacity and current enrollment numbers for that specific course.
  3.  Calculate the number of remaining slots (Capacity - Current Enrollments).
  4.  Display this information clearly near the selected course details (e.g., "X slots left!", "Limited seats: Y remaining", or "Availability: Z slots").
  5.  If a course is full (0 slots left), this should also be clearly indicated, potentially disabling further selection or prompting the user to join a waitlist (if applicable).
- **Expected Result:** Upon selecting a course in the onboarding flow, the student can see a clear indication of the number of remaining slots for that course.
- **Actual Result (Current State):** No information about remaining course slots is displayed during onboarding course selection.
- **Impact:**
  - Students may proceed with a course selection only to find out later it's full, leading to frustration.
  - Lack of transparency regarding course availability.
  - Could create a sense of urgency if slots are genuinely limited, encouraging faster sign-ups.
- **Notes:**
  - Requires backend API endpoint(s) to provide course capacity and current enrollment counts.
  - Frontend UI needs to be updated to fetch and display this information dynamically upon course selection.
  - Consider edge cases: What to display if capacity is unlimited? How to handle real-time updates if many users are signing up simultaneously (though a snapshot at the time of selection is likely sufficient for a first pass)?
  - This feature enhances the user experience by providing valuable context during a critical decision-making step.

---
