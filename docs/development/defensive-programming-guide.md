# Defensive Programming Guide

This guide outlines best practices for defensive programming in our codebase to prevent common errors and improve code reliability.

## Table of Contents

1. [Introduction](#introduction)
2. [Safe Data Access](#safe-data-access)
3. [API Response Handling](#api-response-handling)
4. [Error Boundaries](#error-boundaries)
5. [Type Safety](#type-safety)
6. [Redux State Management](#redux-state-management)
7. [Date Handling](#date-handling)
8. [Code Review Checklist](#code-review-checklist)

## Introduction

Defensive programming is a practice that improves software quality by reducing the number of bugs and making the code more robust against unexpected inputs or states. This guide provides practical techniques for implementing defensive programming in our React/Next.js application.

## Safe Data Access

Always use the safe utility functions from `lib/utils/safe-data.ts` when accessing data that might be undefined or null.

### Array Operations

\`\`\`tsx
// ❌ Bad: Direct array operations without safety checks
const items = data.items.map(item => item.name);

// ✅ Good: Using safe utility functions
import { safeMap, safeArray } from '@/lib/utils/safe-data';
const items = safeMap(data.items, item => item.name);
// or
const items = safeArray(data.items).map(item => item.name);
\`\`\`

### Object Properties

\`\`\`tsx
// ❌ Bad: Direct property access without safety checks
const userName = user.profile.name;

// ✅ Good: Using safe utility functions
import { safeGet, safeObject } from '@/lib/utils/safe-data';
const userName = safeGet(user, 'profile.name', 'Unknown');
// or
const profile = safeObject(user.profile);
const userName = profile.name || 'Unknown';
\`\`\`

### String Operations

\`\`\`tsx
// ❌ Bad: String operations without safety checks
const firstLetter = text.charAt(0).toUpperCase();

// ✅ Good: Using safe utility functions
import { safeString } from '@/lib/utils/safe-data';
const text = safeString(rawText);
const firstLetter = text.charAt(0).toUpperCase();
\`\`\`

## API Response Handling

Use the safe API client and validators to handle API responses.

\`\`\`tsx
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
\`\`\`

## Error Boundaries

Use error boundaries to catch and handle errors gracefully.

\`\`\`tsx
// ❌ Bad: No error handling
<MyComponent />

// ✅ Good: Using error boundaries
import GlobalErrorBoundary from '@/components/error-boundary/GlobalErrorBoundary';

<GlobalErrorBoundary>
  <MyComponent />
</GlobalErrorBoundary>
\`\`\`

For functional components, use the `useErrorHandler` hook:

\`\`\`tsx
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
\`\`\`

## Type Safety

Use TypeScript effectively to catch type errors at compile time.

\`\`\`tsx
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
\`\`\`

## Redux State Management

Use safe selectors to access Redux state.

\`\`\`tsx
// ❌ Bad: Direct state access without safety checks
const users = useAppSelector(state => state.auth.users);
users.map(user => user.name); // Might cause error if users is undefined

// ✅ Good: Using safe selectors
import { useSafeArraySelector } from '@/store/safe-hooks';
const users = useSafeArraySelector(state => state.auth.users);
users.map(user => user.name); // Safe, users is guaranteed to be an array
\`\`\`

## Date Handling

Always use safe date parsing and formatting.

\`\`\`tsx
// ❌ Bad: Direct date parsing without safety checks
const date = new Date(dateString);
const formattedDate = format(date, 'yyyy-MM-dd');

// ✅ Good: Using safe date utilities
import { safeParseDate, safeFormatDate } from '@/lib/utils/safe-data';
import { format } from 'date-fns';

const date = safeParseDate(dateString);
const formattedDate = safeFormatDate(date, d => format(d, 'yyyy-MM-dd'), 'Invalid date');
\`\`\`

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

By following these defensive programming practices, we can significantly reduce the number of runtime errors and improve the reliability of our application.
