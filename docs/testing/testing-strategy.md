# 🧪 SmartEdu Testing Strategy

## Overview

This document outlines the testing strategy for the SmartEdu platform. It covers the different types of tests, testing tools, and best practices for ensuring the quality and reliability of the application.

## Testing Pyramid

SmartEdu follows the testing pyramid approach, with a focus on having a solid foundation of unit tests, complemented by integration tests and a smaller number of end-to-end tests.

\`\`\`
    /\
   /  \
  /    \
 / E2E  \
/--------\
/          \
/ Integration \
/--------------\
/                \
/     Unit Tests   \
/--------------------\
\`\`\`

## Types of Tests

### Unit Tests

Unit tests focus on testing individual components, functions, and modules in isolation. They are fast, reliable, and provide immediate feedback.

**Tools:**
- Jest: For test running and assertions
- React Testing Library: For testing React components
- MSW (Mock Service Worker): For mocking API requests

**Coverage Target:** 80% code coverage

**Example Unit Test:**

\`\`\`typescript
// features/auth/store/__tests__/auth-slice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { login, logout } from '../auth-slice';

describe('auth slice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

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

### Integration Tests

Integration tests focus on testing the interaction between different parts of the application, such as components, Redux store, and API client.

**Tools:**
- Jest: For test running and assertions
- React Testing Library: For testing React components
- MSW (Mock Service Worker): For mocking API requests

**Coverage Target:** 60% code coverage

**Example Integration Test:**

\`\`\`typescript
// features/courses/components/__tests__/CourseList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CourseList from '../CourseList';
import coursesReducer, { fetchCourses } from '../../store/courses-slice';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock API response
const courses = [
  { id: '1', title: 'Course 1', description: 'Description 1' },
  { id: '2', title: 'Course 2', description: 'Description 2' },
];

// Setup MSW server
const server = setupServer(
  rest.get('/api/courses', (req, res, ctx) => {
    return res(ctx.json(courses));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Setup store
const store = configureStore({
  reducer: {
    courses: coursesReducer,
  },
});

describe('CourseList', () => {
  it('should render loading state initially', () => {
    render(
      <Provider store={store}>
        <CourseList />
      </Provider>
    );
    
    expect(screen.getByText('Loading courses...')).toBeInTheDocument();
  });

  it('should render courses after loading', async () => {
    render(
      <Provider store={store}>
        <CourseList />
      </Provider>
    );
    
    // Dispatch the fetchCourses action
    store.dispatch(fetchCourses());
    
    // Wait for courses to be rendered
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('Course 2')).toBeInTheDocument();
    });
  });

  it('should handle API error', async () => {
    // Override the default handler to return an error
    server.use(
      rest.get('/api/courses', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );
    
    render(
      <Provider store={store}>
        <CourseList />
      </Provider>
    );
    
    // Dispatch the fetchCourses action
    store.dispatch(fetchCourses());
    
    // Wait for error message to be rendered
    await waitFor(() => {
      expect(screen.getByText('Failed to load courses')).toBeInTheDocument();
    });
  });
});
\`\`\`

### End-to-End Tests

End-to-end tests focus on testing the application as a whole, simulating user interactions and verifying that the application works correctly from the user's perspective.

**Tools:**
- Cypress: For end-to-end testing
- Playwright: For cross-browser testing

**Coverage Target:** Key user flows

**Example E2E Test:**

\`\`\`typescript
// cypress/e2e/login.cy.ts
describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully with valid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        user: { id: '1', name: 'Test User' },
        token: 'test-token',
      },
    }).as('loginRequest');

    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, Test User');
  });

  it('should show error message with invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        message: 'Invalid credentials',
      },
    }).as('loginRequest');

    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.contains('Invalid credentials');
    cy.url().should('include', '/login');
  });
});
\`\`\`

## Testing Workflow

1. **Local Development Testing:**
   - Developers run unit tests and integration tests locally before pushing code
   - Pre-commit hooks ensure tests pass before committing

2. **Continuous Integration:**
   - All tests run on every pull request
   - Code coverage reports are generated
   - End-to-end tests run on the staging environment

3. **Release Testing:**
   - Full test suite runs before each release
   - Manual testing of key user flows
   - Performance testing

## Test Organization

Tests are organized alongside the code they test, following the same directory structure:

\`\`\`
features/
├── auth/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   └── __tests__/
│   │       └── LoginForm.test.tsx
│   ├── store/
│   │   ├── auth-slice.ts
│   │   └── __tests__/
│   │       └── auth-slice.test.ts
│   └── ...
├── courses/
│   ├── ...
└── ...
\`\`\`

## Best Practices

1. **Write Tests First:** Follow Test-Driven Development (TDD) principles when possible
2. **Test Behavior, Not Implementation:** Focus on what the code does, not how it does it
3. **Keep Tests Simple:** Each test should verify one specific behavior
4. **Use Descriptive Test Names:** Test names should describe the expected behavior
5. **Avoid Test Duplication:** Don't repeat the same test logic in multiple tests
6. **Mock External Dependencies:** Use mocks for API calls, databases, etc.
7. **Maintain Test Quality:** Refactor tests when refactoring code

## Conclusion

This testing strategy provides a comprehensive approach to ensuring the quality and reliability of the SmartEdu platform. By following this strategy, we can catch bugs early, prevent regressions, and maintain a high level of code quality.

## Related Documentation

- [Unit Testing Guide](./unit-testing-guide.md)
- [Integration Testing Guide](./integration-testing-guide.md)
- [End-to-End Testing Guide](./e2e-testing-guide.md)
