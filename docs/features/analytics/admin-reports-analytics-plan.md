# Admin Reports and Analytics System

This document outlines the comprehensive plan for implementing an admin reports and analytics system for the 1Tech Academy platform. The system will provide administrators with powerful tools for data visualization, reporting, and analysis.

## Table of Contents
- [Overview](#overview)
- [Core Components](#core-components)
- [Data Sources](#data-sources)
- [Technical Implementation](#technical-implementation)
- [UI Design](#ui-design)
- [Report Types](#report-types)
- [Analytics Features](#analytics-features)
- [Export Functionality](#export-functionality)
- [Implementation Plan](#implementation-plan)

## Overview

The admin reports and analytics system will provide a comprehensive set of tools for administrators to:

1. View key metrics through interactive dashboards
2. Generate detailed reports with filtering capabilities
3. Export data in CSV format for further analysis
4. Analyze student demographics and performance
5. Track financial metrics and payment trends
6. Monitor attendance patterns and course completion rates
7. Make data-driven decisions based on visualizations and projections

## Core Components

### 1. Analytics Dashboard
- Overview dashboard with key metrics
- Role-based analytics for administrators
- Interactive charts and visualizations
- Bento grid layouts for modern, Apple-inspired UI design

### 2. Reports System
- Detailed reports with filtering capabilities
- Multiple report types (students, courses, payments, attendance)
- Student biodata reports with demographic information
- CSV export functionality

### 3. Data Visualization
- Interactive charts using Recharts library
- Trend analysis with historical data
- Predictive analytics for enrolment and revenue projections
- Demographic visualizations for student population analysis

## Data Sources

The system will leverage data from existing Redux slices:

1. `auth` - User data (students, teachers, admins)
2. `public_courses` and `auth_courses` - Course information
3. `paymentHistory` - Payment records
4. `attendanceMarking` - Attendance data
5. `grades` - Student performance data
6. `classes` - Class information
7. `schedule` - Schedule data
8. `support` - Support tickets and feedback

## Technical Implementation

### Redux Slices

1. **Analytics Slice**
   ```typescript
   // features/analytics/store/analytics-slice.ts
   export interface AnalyticsState {
     dashboardStats: {
       studentStats: { total: number, active: number, newThisMonth: number, growthRate: number };
       courseStats: { total: number, active: number, averageCompletion: number, mostPopular: string };
       paymentStats: { totalRevenue: number, revenueThisMonth: number, growthRate: number, averageOrderValue: number };
       attendanceStats: { averageRate: number, trendsData: { date: string, rate: number }[] };
     };
     status: "idle" | "loading" | "succeeded" | "failed";
     error: string | null;
   }
   ```

2. **Reports Slice**
   ```typescript
   // features/analytics/store/reports-slice.ts
   export interface ReportsState {
     studentReports: { data: StudentReport[], total: number, status: string, error: string | null };
     courseReports: { data: CourseReport[], total: number, status: string, error: string | null };
     paymentReports: { data: PaymentReport[], total: number, status: string, error: string | null };
     attendanceReports: { data: AttendanceReport[], total: number, status: string, error: string | null };
     studentBiodataReports: { data: StudentBiodataReport[], total: number, status: string, error: string | null };
   }
   ```

3. **Student Biodata Slice**
   ```typescript
   // features/analytics/store/student-biodata-slice.ts
   export interface StudentBiodataState {
     stats: {
       genderDistribution: { male: number, female: number, other: number, notSpecified: number };
       ageDistribution: { under18: number, age18to24: number, age25to34: number, age35to44: number, age45Plus: number };
       corporateVsIndividual: { corporate: number, individual: number };
       locationDistribution: Record<string, number>;
       enrollmentTrends: { month: string, enrollments: number }[];
       completionRates: { courseId: string, courseTitle: string, completionRate: number }[];
     };
     status: "idle" | "loading" | "succeeded" | "failed";
     error: string | null;
   }
   ```

### Async Thunks

1. **Dashboard Stats**
   ```typescript
   export const fetchAnalyticsDashboard = createAsyncThunk(
     "analytics/fetchDashboard",
     async (_, { rejectWithValue }) => {
       try {
         const response = await get<{ success: boolean, data: any, message?: string }>("/admin/analytics/dashboard");
         if (!response || !response.success) {
           throw new Error(response?.message || "Failed to fetch analytics");
         }
         return response.data;
       } catch (error: any) {
         return rejectWithValue(error.message || "Failed to fetch analytics");
       }
     }
   );
   ```

2. **Report Data**
   ```typescript
   export const fetchStudentReports = createAsyncThunk(
     "analytics/fetchStudentReports",
     async (filter: ReportFilter, { rejectWithValue }) => {
       // Implementation details
     }
   );
   ```

3. **Student Biodata**
   ```typescript
   export const fetchStudentBiodataStats = createAsyncThunk(
     "analytics/fetchStudentBiodataStats",
     async (_, { rejectWithValue }) => {
       // Implementation details
     }
   );
   ```

### Utility Functions

1. **CSV Export**
   ```typescript
   export function exportToCSV<T>(data: T[], filename: string) {
     const csv = Papa.unparse(data);
     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
     saveAs(blob, `${filename}.csv`);
   }
   ```

## UI Design

### Dashboard Layout

The dashboard will use a bento grid layout with:

1. **Key Metrics Cards** - Top row showing important numbers
2. **Chart Sections** - Middle section with interactive visualizations
3. **Recent Activity** - Bottom section showing latest events
4. **Filter Controls** - Side panel for customizing the view

### Report Pages

Report pages will include:

1. **Filter Section** - Top area with date ranges, search, and filters
2. **Data Table** - Main content showing tabular data with sorting
3. **Export Controls** - Buttons for exporting to CSV
4. **Pagination** - Controls for navigating large datasets

## Report Types

### 1. Student Performance Reports
- Academic progress across courses
- Attendance rates and patterns
- Assignment completion and grades
- Payment history and status

### 2. Course Reports
- Enrolment statistics
- Completion rates
- Revenue generation
- Student satisfaction metrics

### 3. Payment Reports
- Transaction history
- Revenue by course
- Payment method distribution
- Outstanding payments

### 4. Attendance Reports
- Attendance rates by course
- Attendance trends over time
- Individual student attendance
- Absence patterns

### 5. Student Biodata Reports
- Demographic information (age, gender)
- Corporate vs. individual distribution
- Geographic distribution
- Enrolment trends and projections

## Analytics Features

### 1. Trend Analysis
- Historical data visualization
- Pattern identification
- Seasonal trends
- Year-over-year comparisons

### 2. Predictive Analytics
- Enrolment projections
- Revenue forecasting
- Completion rate predictions
- Retention analysis

### 3. Demographic Analysis
- Age distribution visualization
- Gender distribution charts
- Corporate account analysis
- Geographic heat maps

### 4. Performance Metrics
- Course completion rates
- Student success indicators
- Revenue per student
- Attendance correlation with performance

## Export Functionality

### CSV Export Options
- Full dataset export
- Filtered data export
- Custom field selection
- Date range specification

### Export Use Cases
- Financial reporting
- Regulatory compliance
- Data analysis in external tools
- Backup and archiving

## Implementation Plan

This step-by-step implementation plan outlines the sequence of tasks to efficiently build the admin reports and analytics system.

### Phase 1: Foundation (Week 1)

1. **Setup Project Structure**
   - Create `features/analytics` folder structure
   - Set up base types and interfaces
   - Add necessary dependencies (recharts, file-saver, papaparse)

2. **Create Redux Slices**
   - Implement `analytics-slice.ts` for dashboard stats
   - Implement `reports-slice.ts` for report data
   - Implement `student-biodata-slice.ts` for demographic data
   - Register slices in the root store

3. **Implement Mock Data Services**
   - Create mock data generators for analytics
   - Set up API client handlers for mock endpoints
   - Implement basic thunks with mock data

4. **Create Base UI Components**
   - Implement analytics card components
   - Create chart wrapper components
   - Build filter components for reports

### Phase 2: Core Dashboard (Week 2)

5. **Build Analytics Dashboard Page**
   - Create `/admin/analytics` route and page component
   - Implement overview dashboard with key metrics
   - Add basic charts with mock data
   - Implement tab navigation for different views

6. **Implement Data Fetching**
   - Connect dashboard to Redux store
   - Implement data fetching logic with thunks
   - Add loading states and error handling
   - Test data flow from API to UI

7. **Enhance Dashboard Visualizations**
   - Implement interactive charts
   - Add tooltips and legends
   - Create responsive layouts for different screen sizes
   - Implement theme support for charts

### Phase 3: Reports System (Week 3)

8. **Build Reports Framework**
   - Create `/admin/analytics/reports` route and page
   - Implement report type selection
   - Build filter UI for reports
   - Create base table components for report data

9. **Implement Report Types**
   - Build student performance reports
   - Implement course reports
   - Create payment reports
   - Develop attendance reports

10. **Add CSV Export Functionality**
    - Implement CSV generation utilities
    - Add export buttons to report pages
    - Test export with different data sets
    - Implement export options (filters, fields)

### Phase 4: Student Biodata Analytics (Week 4)

11. **Build Student Demographics Dashboard**
    - Create `/admin/analytics/student-biodata` route and page
    - Implement demographic visualizations
    - Add corporate vs. individual analysis
    - Create location distribution charts

12. **Implement Biodata Reports**
    - Build detailed student biodata reports
    - Add filtering by demographic attributes
    - Implement export functionality
    - Create printable report views

13. **Add Predictive Analytics**
    - Implement enrolment trend projections
    - Add revenue forecasting
    - Create completion rate predictions
    - Build retention analysis tools

### Phase 5: Integration and Polish (Week 5)

14. **Integrate with Navigation**
    - Add analytics links to admin sidebar
    - Implement breadcrumbs for navigation
    - Create shortcuts for common reports
    - Add deep linking to specific reports

15. **Implement Advanced Filtering**
    - Add date range selection
    - Implement multi-select filters
    - Create saved filter presets
    - Add search functionality

16. **Performance Optimization**
    - Implement data caching
    - Add pagination for large datasets
    - Optimize chart rendering
    - Reduce bundle size

17. **Final Testing and Documentation**
    - Conduct end-to-end testing
    - Create user documentation
    - Add inline help and tooltips
    - Prepare training materials for admins

### Implementation Milestones

| Milestone | Deliverable | Timeline |
|-----------|-------------|----------|
| M1 | Foundation setup complete | End of Week 1 |
| M2 | Core dashboard functional | End of Week 2 |
| M3 | Reports system with export | End of Week 3 |
| M4 | Student biodata analytics | End of Week 4 |
| M5 | Fully integrated system | End of Week 5 |

### Dependencies and Prerequisites

1. **Technical Dependencies**
   - Recharts library for visualizations
   - File-saver and PapaParse for CSV export
   - Redux toolkit for state management
   - API endpoints for data retrieval

2. **Data Requirements**
   - Student demographic data available in API
   - Course enrolment and completion data
   - Payment transaction history
   - Attendance records with timestamps

3. **Design Assets**
   - Chart color schemes
   - Icon set for analytics
   - Bento grid layout templates
   - Report print templates
