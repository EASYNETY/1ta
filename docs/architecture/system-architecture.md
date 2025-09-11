# 🏗️ SmartEdu System Architecture

## Overview

SmartEdu is a modern educational management system built with Next.js, React, TypeScript, and Redux. This document provides an overview of the system architecture, including the frontend, backend, and integration points.

## System Components

### Frontend Architecture

The SmartEdu frontend is built with the following technologies:

- **Next.js 14**: For server-side rendering and routing
- **React 18**: For building the user interface
- **TypeScript 5**: For type safety
- **Redux Toolkit**: For state management
- **Tailwind CSS**: For styling
- **Shadcn UI**: For UI components

### Backend Integration

The frontend integrates with a backend API built with:

- **Node.js**: For the server runtime
- **Express**: For the API framework
- **MongoDB**: For the database
- **JWT**: For authentication

### Authentication Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthAPI
    participant TokenService
    
    User->>Frontend: Enter credentials
    Frontend->>AuthAPI: Login request
    AuthAPI->>TokenService: Validate credentials
    TokenService->>AuthAPI: Generate tokens
    AuthAPI->>Frontend: Return tokens
    Frontend->>Frontend: Store tokens
    Frontend->>User: Redirect to dashboard
\`\`\`

### Data Flow

\`\`\`mermaid
flowchart TD
    A[User Interaction] --> B[React Components]
    B --> C[Redux Actions]
    C --> D[Redux Thunks]
    D --> E[API Client]
    E --> F[Backend API]
    F --> G[Database]
    F --> E
    E --> D
    D --> H[Redux Store]
    H --> B
\`\`\`

## Directory Structure

\`\`\`
smartedu-frontend/
├── app/                  # Next.js app directory
│   ├── (authenticated)/  # Authenticated routes
│   ├── (public)/         # Public routes
│   └── api/              # API routes
├── components/           # Reusable React components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   └── feature-specific/ # Feature-specific components
├── features/             # Feature modules
│   ├── auth/             # Authentication
│   ├── courses/          # Courses
│   ├── attendance/       # Attendance
│   └── ...               # Other features
├── lib/                  # Utility functions
│   ├── api-client.ts     # API client
│   └── utils/            # Utility functions
├── store/                # Redux store
│   ├── index.ts          # Store configuration
│   └── hooks.ts          # Custom hooks
├── styles/               # Global styles
├── public/               # Static assets
└── docs/                 # Documentation
\`\`\`

## State Management

SmartEdu uses Redux Toolkit for state management. The state is organized by feature, with each feature having its own slice of the state.

### Redux Store Structure

\`\`\`typescript
interface RootState {
  auth: AuthState;
  courses: CoursesState;
  attendance: AttendanceState;
  schedule: ScheduleState;
  grades: GradesState;
  assignments: AssignmentsState;
  notifications: NotificationsState;
  search: SearchState;
  // ... other slices
}
\`\`\`

### Redux Toolkit Slices

Each feature has its own slice, which includes:

- Initial state
- Reducers
- Thunks for async operations
- Selectors

Example slice structure:

\`\`\`typescript
// features/courses/store/course-slice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      return await get('/courses');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    // Synchronous reducers
  },
  extraReducers: (builder) => {
    // Async reducers
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectAllCourses = (state) => state.courses.courses;

export default courseSlice.reducer;
\`\`\`

## API Integration

The frontend integrates with the backend API using a custom API client that handles:

- Authentication
- Error handling
- Request/response formatting
- Retry logic

See [API Integration Guide](../api/ApiGuide.md) for more details.

## Authentication & Authorization

SmartEdu uses JWT for authentication. The authentication flow is:

1. User logs in with credentials
2. Backend validates credentials and returns access and refresh tokens
3. Frontend stores tokens in memory and localStorage
4. Frontend includes access token in all API requests
5. When access token expires, frontend uses refresh token to get a new access token
6. If refresh token is invalid, user is logged out

## Responsive Design

SmartEdu is designed to be responsive and work on all devices. The UI is built with:

- Mobile-first approach
- Responsive breakpoints
- Adaptive layouts
- Touch-friendly interactions

## Performance Optimization

SmartEdu includes several performance optimizations:

- Server-side rendering for initial page load
- Code splitting for faster loading
- Memoization to prevent unnecessary re-renders
- Lazy loading of components and images
- Optimized bundle size

## Security Measures

SmartEdu includes several security measures:

- JWT for secure authentication
- HTTPS for all API requests
- Input validation
- XSS protection
- CSRF protection

## Conclusion

This document provides an overview of the SmartEdu system architecture. For more detailed information on specific components, please refer to the relevant documentation.

## Related Documentation

- [API Integration Guide](../api/ApiGuide.md)
- [Backend Requirements](../backend/backend-requirements.md)
- [Application Flow](../frontend/flow.md)
- [UI Design Guidelines](../ui/apple-inspired-design.md)
