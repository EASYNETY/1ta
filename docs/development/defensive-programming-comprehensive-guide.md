# 🛡️ Comprehensive Defensive Programming Guide

## Overview

This guide outlines best practices for implementing defensive programming techniques in our codebase to prevent common errors and improve code reliability. Defensive programming is a practice that improves software quality by reducing the number of bugs and making the code more robust against unexpected inputs or states.

## Table of Contents

1. [Introduction](#introduction)
2. [Common Issues](#common-issues)
3. [Safe Data Utilities](#safe-data-utilities)
4. [Safe Data Access](#safe-data-access)
5. [Redux State Management](#redux-state-management)
6. [API Response Handling](#api-response-handling)
7. [Error Boundaries](#error-boundaries)
8. [Type Safety](#type-safety)
9. [Date Handling](#date-handling)
10. [Best Practices](#best-practices)
11. [Code Review Checklist](#code-review-checklist)

## Introduction

Defensive programming is a practice that improves software quality by reducing the number of bugs and making the code more robust against unexpected inputs or states. This guide provides practical techniques for implementing defensive programming in our React/Next.js application.

## Common Issues

When working with data from APIs or Redux store, we often encounter these issues:

1. **Accessing properties of null/undefined objects**: `TypeError: Cannot read properties of undefined (reading 'length')`
2. **Iterating over null/undefined arrays**: `TypeError: Cannot read properties of undefined (reading 'map')`
3. **Accessing nested properties**: `TypeError: Cannot read properties of undefined (reading 'nestedProperty')`
4. **Type coercion issues**: Unexpected behavior when mixing types

## Safe Data Utilities

We've implemented utility functions in `lib/utils/safe-data.ts` to handle these issues:

```typescript
// Example usage
import { safeArray, safeObject, safeString, safeNumber, safeBoolean } from '@/lib/utils/safe-data';

// Instead of: const items = state.items (might be undefined)
const items = safeArray(state.items); // Always returns an array

// Instead of: const user = state.user (might be null)
const user = safeObject(state.user); // Always returns an object

// Instead of: const name = user.name (might be undefined)
const name = safeString(user.name); // Always returns a string

// Instead of: const count = state.count (might be NaN)
const count = safeNumber(state.count); // Always returns a number

// Instead of: const isActive = user.isActive (might be undefined)
const isActive = safeBoolean(user.isActive); // Always returns a boolean
```

### Implementation of Safe Data Utilities

```typescript
export function safeArray<T>(array: T[] | null | undefined): T[] {
  return Array.isArray(array) ? array : [];
}

export function safeObject<T extends object>(obj: T | null | undefined): T {
  return (obj && typeof obj === 'object') ? obj : {} as T;
}

export function safeString(str: string | null | undefined, defaultValue: string = ''): string {
  return (str !== null && str !== undefined) ? String(str) : defaultValue;
}

export function safeNumber(num: number | null | undefined, defaultValue: number = 0): number {
  return (num !== null && num !== undefined && !isNaN(Number(num))) ? Number(num) : defaultValue;
}

export function safeBoolean(bool: boolean | null | undefined, defaultValue: boolean = false): boolean {
  return bool === true ? true : bool === false ? false : defaultValue;
}
```

## Safe Data Access

Always use the safe utility functions when accessing data that might be undefined or null.

### Array Operations

```tsx
// ❌ Bad: Direct array operations without safety checks
const items = data.items.map(item => item.name);

// ✅ Good: Using safe utility functions
import { safeMap, safeArray } from '@/lib/utils/safe-data';
const items = safeMap(data.items, item => item.name);
// or
const items = safeArray(data.items).map(item => item.name);
```

### Object Properties

```tsx
// ❌ Bad: Direct property access without safety checks
const userName = user.profile.name;

// ✅ Good: Using safe utility functions
import { safeGet, safeObject } from '@/lib/utils/safe-data';
const userName = safeGet(user, 'profile.name', 'Unknown');
// or
const profile = safeObject(user.profile);
const userName = profile.name || 'Unknown';
```

### String Operations

```tsx
// ❌ Bad: String operations without safety checks
const firstLetter = text.charAt(0).toUpperCase();

// ✅ Good: Using safe utility functions
import { safeString } from '@/lib/utils/safe-data';
const text = safeString(rawText);
const firstLetter = text.charAt(0).toUpperCase();
```

## Redux State Management

### 1. Safe Initial State

Always initialize arrays as empty arrays and objects as empty objects:

```typescript
const initialState = {
  users: [], // Not null or undefined
  user: {}, // Not null or undefined
  count: 0, // Not null or undefined
  status: 'idle', // Not null or undefined
};
```

### 2. Safe Reducers

When updating state in reducers, ensure values are never null or undefined:

```typescript
// ❌ Bad
state.users = action.payload.users;

// ✅ Good
state.users = action.payload.users || [];
```

### 3. Safe Selectors

Create selectors that handle null/undefined values:

```typescript
// features/auth/store/auth-selectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { createSafeArraySelector, safeArray } from '@/lib/utils/safe-data';

// Basic selector
export const selectUsers = (state: RootState) => state.auth.users;

// Safe selector that handles null/undefined values
export const selectSafeUsers = createSafeArraySelector(selectUsers);

// Usage in components
const users = useAppSelector(selectSafeUsers); // Always returns an array
```

### 4. Safe Component Usage

When using data in components, apply defensive programming:

```typescript
// ❌ Bad
const items = useAppSelector(state => state.items);
const itemCount = items.length; // Might cause error if items is undefined

// ✅ Good
import { safeArray } from '@/lib/utils/safe-data';

const items = useAppSelector(state => state.items);
const safeItems = safeArray(items);
const itemCount = safeItems.length; // Safe, always works
```

## API Response Handling

Use the safe API client and validators to handle API responses.

```tsx
// ❌ Bad: Direct API calls without validation
const user = await get<User>('/users/123');

// ✅ Good: Using safe API client with validation
import { safeGet } from '@/lib/safe-api-client';
import type { ApiResponseValidator } from '@/lib/safe-api-client';

const userValidator: ApiResponseValidator<User> = {
  id: 'string',
  name: 'string',
  email: (value) => typeof value === 'string' && value.includes('@')
};

const defaultUser: User = { id: '', name: '', email: '' };
const user = await safeGet<User>('/users/123', userValidator, defaultUser);
```

## Error Boundaries

Use error boundaries to catch and handle errors gracefully.

```tsx
// ❌ Bad: No error handling
<MyComponent />

// ✅ Good: Using error boundaries
import GlobalErrorBoundary from '@/components/error-boundary/GlobalErrorBoundary';

<GlobalErrorBoundary>
  <MyComponent />
</GlobalErrorBoundary>
```

For functional components, use the `useErrorHandler` hook:

```tsx
import useErrorHandler from '@/hooks/useErrorHandler';

function MyComponent() {
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const fetchData = withErrorHandling(async () => {
    // Async operation that might throw
    const data = await api.fetchSomething();
    return data;
  });
  
  // Use fetchData safely
  useEffect(() => {
    fetchData();
  }, []);
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return <div>My Component</div>;
}
```

## Type Safety

Use TypeScript effectively to catch type errors at compile time.

```tsx
// ❌ Bad: Using any type
function processData(data: any) {
  return data.items.map(item => item.name);
}

// ✅ Good: Using proper types with optional properties
interface Item {
  name: string;
  description?: string;
}

interface Data {
  items?: Item[];
}

function processData(data: Data) {
  return safeMap(data.items, item => item.name);
}
```

## Date Handling

Always use safe date parsing and formatting.

```tsx
// ❌ Bad: Direct date parsing without safety checks
const date = new Date(dateString);
const formattedDate = format(date, 'yyyy-MM-dd');

// ✅ Good: Using safe date utilities
import { safeParseDate, safeFormatDate } from '@/lib/utils/safe-data';
import { format } from 'date-fns';

const date = safeParseDate(dateString);
const formattedDate = safeFormatDate(date, d => format(d, 'yyyy-MM-dd'), 'Invalid date');
```

## Best Practices

### 1. Redux State Structure

- **Arrays**: Always initialize as `[]`, never as `null` or `undefined`
- **Objects**: Always initialize as `{}`, never as `null` or `undefined`
- **Primitives**: Use sensible defaults (`0`, `''`, `false`)
- **Status flags**: Use explicit string values (`'idle'`, `'loading'`, `'succeeded'`, `'failed'`)

### 2. Redux Extra Reducers

When handling async thunks, ensure data is never null/undefined:

```typescript
builder.addCase(
  fetchUsers.fulfilled,
  (state, action) => {
    state.status = 'succeeded';
    // Ensure users is always an array
    state.users = action.payload.users || [];
    state.total = action.payload.total || 0;
  }
);
```

### 3. Component Rendering

Use conditional rendering or default values:

```tsx
// Conditional rendering
{users.length > 0 ? (
  <UserList users={users} />
) : (
  <NoUsersMessage />
)}

// Default values with optional chaining
<span>{user?.name || 'Anonymous'}</span>
```

### 4. Type Guards

Use TypeScript type guards to handle different data types:

```typescript
function isUser(obj: any): obj is User {
  return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj;
}

// Usage
if (isUser(data)) {
  // TypeScript knows data is User here
  console.log(data.name);
}
```

## Code Review Checklist

When reviewing code, check for these defensive programming practices:

- [ ] Are safe utility functions used for data access?
- [ ] Are API responses properly validated?
- [ ] Are error boundaries used to catch and handle errors?
- [ ] Are proper TypeScript types used instead of `any`?
- [ ] Are safe selectors used for Redux state access?
- [ ] Are dates safely parsed and formatted?
- [ ] Are there appropriate fallback values for potentially undefined data?
- [ ] Are there console.error statements for debugging in catch blocks?
- [ ] Are arrays initialized as empty arrays, not null or undefined?
- [ ] Are objects initialized as empty objects, not null or undefined?
- [ ] Are primitives initialized with sensible defaults?

## Conclusion

By implementing these defensive programming techniques, we can make our Redux store and components more robust, preventing common runtime errors and improving the user experience. The key is to ensure that data is always in a predictable format, even when API responses or other data sources are inconsistent.
