# 🧪 SmartEdu Unit Testing Guide

## Overview

This guide provides best practices and examples for writing unit tests for the SmartEdu platform. Unit tests focus on testing individual components, functions, and modules in isolation.

## Testing Tools

- **Jest**: Test runner and assertion library
- **React Testing Library**: For testing React components
- **MSW (Mock Service Worker)**: For mocking API requests

## Setting Up a Unit Test

### Basic Test Structure

\`\`\`typescript
// Import the component or function to test
import { functionToTest } from '../path-to-function';

// Describe block groups related tests
describe('functionToTest', () => {
  // Individual test case
  it('should do something specific', () => {
    // Arrange: Set up test data
    const input = 'test input';
    
    // Act: Call the function
    const result = functionToTest(input);
    
    // Assert: Check the result
    expect(result).toBe('expected output');
  });
  
  // More test cases...
});
\`\`\`

### Testing React Components

\`\`\`typescript
// components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('should render with the correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
\`\`\`

### Testing Redux Slices

\`\`\`typescript
// features/auth/store/__tests__/auth-slice.test.ts
import authReducer, { login, logout, initialState } from '../auth-slice';

describe('auth slice', () => {
  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });
  
  it('should handle login.pending', () => {
    const action = { type: login.pending.type };
    const state = authReducer(initialState, action);
    expect(state.isLoading).toBe(true);
    expect(state.error).toBe(null);
  });
  
  it('should handle login.fulfilled', () => {
    const user = { id: '1', name: 'Test User' };
    const token = 'test-token';
    const action = { type: login.fulfilled.type, payload: { user, token } };
    const state = authReducer(initialState, action);
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.token).toEqual(token);
  });
  
  it('should handle login.rejected', () => {
    const error = 'Invalid credentials';
    const action = { type: login.rejected.type, payload: error };
    const state = authReducer(initialState, action);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(error);
  });
  
  it('should handle logout', () => {
    const loggedInState = {
      ...initialState,
      user: { id: '1', name: 'Test User' },
      token: 'test-token',
      isAuthenticated: true,
    };
    const action = { type: logout.type };
    const state = authReducer(loggedInState, action);
    expect(state).toEqual(initialState);
  });
});
\`\`\`

### Testing Redux Thunks

\`\`\`typescript
// features/auth/store/__tests__/auth-thunks.test.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth-slice';
import { loginThunk } from '../auth-thunks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock API response
const mockUser = { id: '1', name: 'Test User' };
const mockToken = 'test-token';

// Setup MSW server
const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json({ user: mockUser, token: mockToken }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Setup store
const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

describe('auth thunks', () => {
  it('should handle successful login', async () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    
    // Dispatch the thunk
    await store.dispatch(loginThunk(credentials));
    
    // Check the state
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toEqual(mockToken);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
  });
  
  it('should handle login failure', async () => {
    // Override the default handler to return an error
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
      })
    );
    
    const credentials = { email: 'test@example.com', password: 'wrongpassword' };
    
    // Dispatch the thunk
    await store.dispatch(loginThunk(credentials));
    
    // Check the state
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Invalid credentials');
  });
});
\`\`\`

### Testing Utility Functions

\`\`\`typescript
// lib/utils/__tests__/format-date.test.ts
import { formatDate } from '../format-date';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    expect(formatDate(date)).toBe('January 1, 2023');
  });
  
  it('should handle invalid date', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('invalid-date')).toBe('');
  });
  
  it('should format date with custom format', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    expect(formatDate(date, 'MM/dd/yyyy')).toBe('01/01/2023');
  });
});
\`\`\`

## Best Practices

### 1. Test Behavior, Not Implementation

Focus on what the code does, not how it does it. This makes your tests more resilient to refactoring.

\`\`\`typescript
// Good: Testing behavior
it('should show error message when form is submitted with empty fields', () => {
  render(<LoginForm />);
  fireEvent.click(screen.getByText('Submit'));
  expect(screen.getByText('Email is required')).toBeInTheDocument();
});

// Bad: Testing implementation details
it('should set error state when form is submitted with empty fields', () => {
  const { result } = renderHook(() => useState(''));
  const [, setError] = result.current;
  setError('Email is required');
  expect(result.current[0]).toBe('Email is required');
});
\`\`\`

### 2. Use Descriptive Test Names

Test names should describe the expected behavior, making it clear what the test is checking.

\`\`\`typescript
// Good: Descriptive test name
it('should display error message when password is less than 8 characters', () => {
  // Test code...
});

// Bad: Vague test name
it('should validate password', () => {
  // Test code...
});
\`\`\`

### 3. Arrange-Act-Assert Pattern

Structure your tests using the Arrange-Act-Assert pattern:

1. **Arrange**: Set up the test data and conditions
2. **Act**: Perform the action being tested
3. **Assert**: Check the result

\`\`\`typescript
it('should calculate total price correctly', () => {
  // Arrange
  const items = [
    { price: 10, quantity: 2 },
    { price: 15, quantity: 1 },
  ];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(35);
});
\`\`\`

### 4. Mock External Dependencies

Use mocks to isolate the code being tested from external dependencies.

\`\`\`typescript
// Mock API client
jest.mock('../api-client', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import { get, post } from '../api-client';

describe('fetchUser', () => {
  it('should fetch user data', async () => {
    // Setup mock
    get.mockResolvedValueOnce({ id: '1', name: 'Test User' });
    
    // Call function
    const user = await fetchUser('1');
    
    // Check result
    expect(user).toEqual({ id: '1', name: 'Test User' });
    expect(get).toHaveBeenCalledWith('/users/1');
  });
});
\`\`\`

### 5. Test Edge Cases

Don't just test the happy path. Test edge cases, error conditions, and boundary values.

\`\`\`typescript
describe('divideNumbers', () => {
  it('should divide two numbers correctly', () => {
    expect(divideNumbers(10, 2)).toBe(5);
  });
  
  it('should handle division by zero', () => {
    expect(() => divideNumbers(10, 0)).toThrow('Cannot divide by zero');
  });
  
  it('should handle negative numbers', () => {
    expect(divideNumbers(-10, 2)).toBe(-5);
    expect(divideNumbers(10, -2)).toBe(-5);
    expect(divideNumbers(-10, -2)).toBe(5);
  });
  
  it('should handle decimal numbers', () => {
    expect(divideNumbers(10, 3)).toBeCloseTo(3.333, 3);
  });
});
\`\`\`

## Running Tests

### Running All Tests

\`\`\`bash
npm test
\`\`\`

### Running Tests for a Specific File

\`\`\`bash
npm test -- path/to/test-file.test.ts
\`\`\`

### Running Tests in Watch Mode

\`\`\`bash
npm test -- --watch
\`\`\`

### Generating Coverage Report

\`\`\`bash
npm test -- --coverage
\`\`\`

## Conclusion

Unit tests are the foundation of a solid testing strategy. By following these best practices and examples, you can write effective unit tests that help ensure the quality and reliability of the SmartEdu platform.

## Related Documentation

- [Testing Strategy](./testing-strategy.md)
- [Integration Testing Guide](./integration-testing-guide.md)
