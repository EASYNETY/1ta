# CEO Adjustments & Change Requests

**Document Created:** January 25, 2025
**Last Updated:** January 25, 2025
**Status:** In Progress

---

## Website Changes

### 1. Typography & Text Enhancement
- **Request:** Make All Text Bigger - Increase the font sizes throughout the website to make everything easier to read.
- **Status:** ⏳ Pending
- **Priority:** High
- **Date Requested:** January 25, 2025

### 2. Spelling Standardization - "Enroll Now"
- **Request:** Replace all "Enroll Now" buttons/text with "Enrol now" (British spelling).
- **Status:** ⏳ Pending
- **Priority:** Medium
- **Date Requested:** January 25, 2025

### 3. Section Heading Update - "Technologies We Teach"
- **Request:** Use "Available Courses" instead of "Technologies We Teach."
- **Status:** ⏳ Pending
- **Priority:** Medium
- **Date Requested:** January 25, 2025

### 4. Course Organization Structure
- **Request:** Under the "Available Courses" section, split the list into "Current Courses" and "Future Courses."
- **Status:** ⏳ Pending
- **Priority:** High
- **Date Requested:** January 25, 2025

### 5. Testimonial Images Update
- **Request:** Use pictures of African or black people in the testimonial section so it better represents our audience.
- **Status:** ⏳ Pending
- **Priority:** Medium
- **Date Requested:** January 25, 2025

### 6. Contact Form Bug Fix
- **Request:** The "Send Inquiry" form isn't working — emails are not being received at info@1techacademy. Please fix this so it sends messages correctly.
- **Status:** ⏳ Pending
- **Priority:** Critical
- **Date Requested:** January 25, 2025

### 7. Course Thumbnails Preparation
- **Request:** Course thumbnails will be provided by Monday COB, so please keep space ready for them.
- **Status:** ⏳ Pending (Awaiting Assets)
- **Priority:** Medium
- **Date Requested:** January 25, 2025
- **Deadline:** Monday COB

---

## LMS Portal Changes

### 8. Role-Based Access Control System
- **Request:** Set Up Roles with Different Access:
  - **Super Admin:** Full control including the ability to delete.
  - **Admin:** Full control except analytics dashboard (hidden) and payment dashboard (read-only only) and should not be given ability to delete rather deactivate.
  - **Accounting:** Dynamic dashboard with charts showing payment history and trends (template provided).
  - **Customer Care:** Only access to tickets, feedback, attendance, timetable (read-only), discussion, and student info (read-only only — no delete or detailed view access).
- **Status:** ⏳ Pending
- **Priority:** Critical
- **Date Requested:** January 25, 2025

### 9. Smart Search Implementation
- **Request:** Add a smart search tool to help users find things quickly.
- **Status:** ⏳ Pending
- **Priority:** High
- **Date Requested:** January 25, 2025

### 10. Student Profile Label Update - "Class"
- **Request:** In the student profile summary, replace the word "Class" with "List of Enrolled Courses."
- **Status:** ⏳ Pending
- **Priority:** Low
- **Date Requested:** January 25, 2025

### 11. Student Profile Label Update - "System Information"
- **Request:** In student profile summary, change "System Information" to "Access Information" for clarity.
- **Status:** ⏳ Pending
- **Priority:** Low
- **Date Requested:** January 25, 2025

### 12. Student Dashboard Barcode Display
- **Request:** On the student's dashboard/homepage, show their barcode next to the "Browse Courses" box.
- **Status:** ⏳ Pending
- **Priority:** Medium
- **Date Requested:** January 25, 2025

### 13. Mission & Vision Image Replacement
- **Request:** Replace the current image with the new one we've attached (named accordingly for replacement).
- **Status:** ✅ Completed
- **Priority:** Medium
- **Date Requested:** January 25, 2025
- **Date Completed:** January 25, 2025
- **Notes:** New mission and vision images successfully implemented:
  - Mission: `/images/mission-vision/mission.jpg`
  - Vision: `/images/mission-vision/vision.png`

### 14. Navigation Enhancement
- **Request:** Add a proper navigation bar in the LMS so users can move back and forth easily.
- **Status:** ⏳ Pending
- **Priority:** High
- **Date Requested:** January 25, 2025

### 15. Student Barcode Format Standardization
- **Request:** Barcodes should be automatically generated and numbered like this: STU-00001, STU-00002, etc.
- **Status:** ⏳ Pending
- **Priority:** Medium
- **Date Requested:** January 25, 2025

### 16. Terminology Updates Across LMS
- **Request:** Change Wording Across LMS:
  - Replace all "Teacher" labels with "Facilitator."
  - Replace all "Class Title" with "Course Title."
- **Status:** ⏳ Pending
- **Priority:** Low
- **Date Requested:** January 25, 2025

### 17. Customer Care Barcode Scanning System
- **Request:** When customer care staff logs in and scans a student's barcode, the system should instantly show the student's name, payment status, date/time of sign-in, and course title. They shouldn't have to click anything else — it should appear automatically after the scan.
- **Status:** ⏳ Pending
- **Priority:** High
- **Date Requested:** January 25, 2025

---

## Payment System Template

### Accounting Dashboard Requirements
The following template has been provided for the accounting role's payment history dashboard:

**Required Fields:**
- S/N (Serial Number)
- Student Name
- Student ID (Format: STU-00001)
- Invoice No. (Format: INV-2024-01)
- Fee Type (Tuition, Uniform Fee, PTA Fee, etc.)
- Payment Date
- Amount Billed
- Amount Paid
- Gateway Ref
- Transaction ID
- Payment Method (Card, Bank Transfer, POS, USSD)
- Payment Status (Successful, Failed, Pending)
- Reconciled? (Yes/No/Partial)
- Notes

**Sample Data Structure:**
```
STU-0001 | Jane Doe | INV-2024-01 | Tuition - Term 1 | 01-Sep-2024 | ₦100,000 | ₦100,000 | PGTX-001234 | TXN123456 | Card (Visa) | Successful | Yes | -
```

---

## Assets Added

### ✅ Completed Asset Additions (January 25, 2025)
- **Logo Animation Frames:** 102 SVG animation frames (2560x1440) added to `public/animations/pulsating-background/`
- **Logo Assets:** 1Tech Academy logo (no background) added to `public/images/logos/`
- **Mission & Vision Images:** New images added to `public/images/mission-vision/`
- **Splash Screen System:** Comprehensive splash screen components created for logo animation

---

## Change Log

| Date | Change | Status | Notes |
|------|--------|--------|-------|
| 2025-01-25 | Document created | ✅ Complete | Initial CEO adjustments documentation |
| 2025-01-25 | Static assets added | ✅ Complete | Animations, logos, mission/vision images |
| 2025-01-25 | Repository organized | ✅ Complete | Moved docs to docs/ folder, clean root structure |
| 2025-01-25 | Mission/Vision images updated | ✅ Complete | Successfully implemented local image files |
| 2025-01-25 | Logo update attempted | ❌ Reverted | Dimension mismatch - need to check logo dimensions first |
| 2025-01-25 | Splash screen system created | ✅ Complete | Logo animation splash screen for app loading |

---

## Priority Legend
- 🔴 **Critical:** Must be fixed immediately (affects functionality)
- 🟡 **High:** Important for user experience
- 🟠 **Medium:** Enhances functionality or appearance
- 🟢 **Low:** Nice to have improvements

---

*This document will be updated as changes are implemented and new requests are added.*
