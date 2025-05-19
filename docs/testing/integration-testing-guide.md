# 🧪 SmartEdu Integration Testing Guide

## Overview

This guide provides best practices and examples for writing integration tests for the SmartEdu platform. Integration tests focus on testing the interaction between different parts of the application, such as components, Redux store, and API client.

## Testing Tools

- **Jest**: Test runner and assertion library
- **React Testing Library**: For testing React components
- **MSW (Mock Service Worker)**: For mocking API requests
- **Redux Test Utils**: For testing Redux-connected components

## Setting Up an Integration Test

### Testing Connected Components

```typescript
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
```

### Testing Form Submission

```typescript
// features/auth/components/__tests__/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import LoginForm from '../LoginForm';
import authReducer from '../../store/auth-slice';

// Mock API response
const mockUser = { id: '1', name: 'Test User' };
const mockToken = 'test-token';

// Setup MSW server
const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    
    if (email === 'test@example.com' && password === 'password') {
      return res(ctx.json({ user: mockUser, token: mockToken }));
    } else {
      return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
    }
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

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LoginForm', () => {
  it('should submit form with valid credentials', async () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' },
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
    
    // Check store state
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.user).toEqual(mockUser);
    expect(store.getState().auth.token).toEqual(mockToken);
  });
  
  it('should show error message with invalid credentials', async () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
    
    // Fill in form with invalid credentials
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    
    // Check store state
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(store.getState().auth.user).toBe(null);
    expect(store.getState().auth.token).toBe(null);
  });
  
  it('should validate form fields', async () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
    
    // Submit form without filling in fields
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check validation messages
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    
    // Fill in email only
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    // Submit form again
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check validation messages
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});
```

### Testing API Integration

```typescript
// features/courses/api/__tests__/course-api.test.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../course-api';

// Mock API responses
const courses = [
  { id: '1', title: 'Course 1', description: 'Description 1' },
  { id: '2', title: 'Course 2', description: 'Description 2' },
];

// Setup MSW server
const server = setupServer(
  rest.get('/api/courses', (req, res, ctx) => {
    return res(ctx.json(courses));
  }),
  
  rest.post('/api/courses', (req, res, ctx) => {
    const newCourse = { id: '3', ...req.body };
    return res(ctx.status(201), ctx.json(newCourse));
  }),
  
  rest.put('/api/courses/:id', (req, res, ctx) => {
    const { id } = req.params;
    const updatedCourse = { id, ...req.body };
    return res(ctx.json(updatedCourse));
  }),
  
  rest.delete('/api/courses/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Course API', () => {
  it('should fetch courses', async () => {
    const result = await fetchCourses();
    expect(result).toEqual(courses);
  });
  
  it('should create a course', async () => {
    const newCourse = { title: 'New Course', description: 'New Description' };
    const result = await createCourse(newCourse);
    expect(result).toEqual({ id: '3', ...newCourse });
  });
  
  it('should update a course', async () => {
    const updatedCourse = { title: 'Updated Course', description: 'Updated Description' };
    const result = await updateCourse('1', updatedCourse);
    expect(result).toEqual({ id: '1', ...updatedCourse });
  });
  
  it('should delete a course', async () => {
    const result = await deleteCourse('1');
    expect(result).toBe(true);
  });
  
  it('should handle API errors', async () => {
    // Override the default handler to return an error
    server.use(
      rest.get('/api/courses', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );
    
    await expect(fetchCourses()).rejects.toThrow('Failed to fetch courses');
  });
});
```

## Best Practices

### 1. Test Complete User Flows

Integration tests should test complete user flows, not just individual components or functions.

```typescript
it('should allow user to login and view dashboard', async () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  
  // Navigate to login page
  fireEvent.click(screen.getByText('Login'));
  
  // Fill in login form
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password' },
  });
  
  // Submit form
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
  // Wait for dashboard to load
  await waitFor(() => {
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
  });
  
  // Check that courses are loaded
  expect(screen.getByText('My Courses')).toBeInTheDocument();
  expect(screen.getByText('Course 1')).toBeInTheDocument();
  expect(screen.getByText('Course 2')).toBeInTheDocument();
});
```

### 2. Mock External Dependencies

Use MSW to mock API requests and responses, allowing you to test the integration between your components and the API without making actual network requests.

```typescript
// Setup MSW server
const server = setupServer(
  rest.get('/api/courses', (req, res, ctx) => {
    return res(ctx.json(courses));
  }),
  
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    
    if (email === 'test@example.com' && password === 'password') {
      return res(ctx.json({ user: mockUser, token: mockToken }));
    } else {
      return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
    }
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 3. Test Error Handling

Test how your application handles errors, such as API errors, validation errors, and network errors.

```typescript
it('should handle API error when fetching courses', async () => {
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
  
  // Wait for error message to be rendered
  await waitFor(() => {
    expect(screen.getByText('Failed to load courses')).toBeInTheDocument();
  });
});
```

### 4. Use a Real Redux Store

Use a real Redux store with your actual reducers to test the integration between your components and the store.

```typescript
// Setup store with actual reducers
const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    // Add other reducers as needed
  },
});
```

### 5. Test Accessibility

Test that your components are accessible to all users, including those with disabilities.

```typescript
it('should be accessible', async () => {
  const { container } = render(
    <Provider store={store}>
      <LoginForm />
    </Provider>
  );
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Running Tests

### Running All Tests

```bash
npm test
```

### Running Tests for a Specific File

```bash
npm test -- path/to/test-file.test.ts
```

### Running Tests in Watch Mode

```bash
npm test -- --watch
```

### Generating Coverage Report

```bash
npm test -- --coverage
```

## Conclusion

Integration tests are a crucial part of a comprehensive testing strategy. By testing how different parts of your application work together, you can catch issues that unit tests might miss and ensure that your application works correctly as a whole.

## Related Documentation

- [Testing Strategy](./testing-strategy.md)
- [Unit Testing Guide](./unit-testing-guide.md)
