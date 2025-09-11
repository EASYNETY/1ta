# Safe Redux Selectors Guide

## Overview

This document outlines best practices for implementing safe Redux selectors that handle null, undefined, or empty data. These techniques help prevent common runtime errors like "Cannot read properties of undefined" and make the application more robust.

## Problem

When working with Redux, we often encounter these issues:

1. **Accessing properties of null/undefined objects**: `TypeError: Cannot read properties of undefined (reading 'length')`
2. **Iterating over null/undefined arrays**: `TypeError: Cannot read properties of undefined (reading 'map')`
3. **Accessing nested properties**: `TypeError: Cannot read properties of undefined (reading 'nestedProperty')`

## Solution: Safe Selectors

We've implemented utility functions in `lib/utils/safe-data.ts` to create safe selectors:

\`\`\`typescript
import { createSelector } from '@reduxjs/toolkit';

// Safely returns an array, ensuring it's never undefined or null
export function safeArray<T>(array: T[] | null | undefined): T[] {
  return Array.isArray(array) ? array : [];
}

// Creates a safe selector for arrays that ensures the result is never undefined or null
export function createSafeArraySelector<State, Result>(
  selector: (state: State) => Result[] | null | undefined
) {
  return createSelector(
    selector,
    (result) => safeArray(result)
  );
}
\`\`\`

## Implementation

### 1. Create Basic Selectors

First, create basic selectors that directly access the state:

\`\`\`typescript
// Basic selectors
export const selectUsers = (state: RootState) => state.auth.users;
export const selectCourseClassOptionsRaw = (state: RootState) => 
  state.classes.courseClassOptions;
\`\`\`

### 2. Create Safe Selectors

Then, create safe selectors using the `createSafeArraySelector` utility:

\`\`\`typescript
// Safe selectors that handle null/undefined values
export const selectSafeUsers = createSafeArraySelector(selectUsers);
export const selectAllCourseClassOptions = createSafeArraySelector(selectCourseClassOptionsRaw);
\`\`\`

### 3. Use Safe Selectors in Components

In your components, use the safe selectors:

\`\`\`typescript
// Component using safe selectors
const users = useAppSelector(selectSafeUsers); // Always returns an array
const classOptions = useAppSelector(selectAllCourseClassOptions); // Always returns an array

// No need for manual fallbacks like:
// const users = useAppSelector(selectUsers) || [];
\`\`\`

### 4. Ensure Reducers Handle Null/Undefined Values

Even with safe selectors, it's good practice to ensure reducers handle null/undefined values:

\`\`\`typescript
builder.addCase(
  fetchUsers.fulfilled,
  (state, action) => {
    state.users = action.payload || []; // Ensure it's never null/undefined
  }
);
\`\`\`

## Example: Auth Selectors

\`\`\`typescript
// features/auth/store/auth-selectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { createSafeArraySelector, safeArray } from '@/lib/utils/safe-data';
import { User } from '@/types/user.types';

// Basic selectors
export const selectAuthState = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectUsers = (state: RootState) => state.auth.users;

// Safe selectors that handle null/undefined values
export const selectSafeUsers = createSafeArraySelector(selectUsers);

// Derived selectors
export const selectUsersByRole = createSelector(
  [selectUsers, (_, role: string) => role],
  (users, role) => safeArray(users).filter(user => user.role === role)
);

export const selectSafeUsersByRole = createSelector(
  [selectSafeUsers, (_, role: string) => role],
  (users, role) => users.filter(user => user.role === role)
);
\`\`\`

## Example: Classes Selectors

\`\`\`typescript
// features/classes/store/classes-slice.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { createSafeArraySelector, safeArray } from '@/lib/utils/safe-data';

// Basic selectors
export const selectMyClasses = (state: RootState) => state.classes.myClasses;
export const selectAllAdminClasses = (state: RootState) => state.classes.allClasses;
export const selectCourseClassOptionsRaw = (state: RootState) => 
  state.classes.courseClassOptions;

// Safe selectors that handle null/undefined values
export const selectAllCourseClassOptions = createSafeArraySelector(selectCourseClassOptionsRaw);
export const selectMyClassesSafe = createSafeArraySelector(selectMyClasses);
export const selectAllAdminClassesSafe = createSafeArraySelector(selectAllAdminClasses);
\`\`\`

## Best Practices

### 1. Always Use Safe Selectors for Arrays

Always use safe selectors when selecting arrays from the Redux store:

\`\`\`typescript
// Good
const users = useAppSelector(selectSafeUsers);

// Bad
const users = useAppSelector(selectUsers);
\`\`\`

### 2. Handle Null/Undefined Values in Reducers

Even with safe selectors, handle null/undefined values in reducers:

\`\`\`typescript
// Good
state.users = action.payload || [];

// Bad
state.users = action.payload;
\`\`\`

### 3. Use Derived Selectors for Complex Logic

Use derived selectors for complex logic:

\`\`\`typescript
// Good
const adminUsers = useAppSelector(state => selectSafeUsersByRole(state, 'admin'));

// Bad
const users = useAppSelector(selectUsers);
const adminUsers = users ? users.filter(user => user.role === 'admin') : [];
\`\`\`

### 4. Provide Default Values for Non-Array Selectors

For non-array selectors, provide default values:

\`\`\`typescript
// Good
export const selectUserName = createSelector(
  [selectCurrentUser],
  (user) => user?.name || ''
);

// Bad
export const selectUserName = createSelector(
  [selectCurrentUser],
  (user) => user.name
);
\`\`\`

## Conclusion

By implementing safe selectors, we can make our Redux store more robust and prevent common runtime errors. The key is to ensure that data is always in a predictable format, even when API responses or other data sources are inconsistent.

Remember:
- Use `createSafeArraySelector` for array selectors
- Handle null/undefined values in reducers
- Use derived selectors for complex logic
- Provide default values for non-array selectors
