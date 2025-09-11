# SmartEdu Mock Data Replacement Guide

This document outlines the mock data currently used in the SmartEdu frontend application and how it should be replaced with real API calls.

## Table of Contents
1. [Overview](#overview)
2. [Mock Data Files](#mock-data-files)
3. [API Client Integration](#api-client-integration)
4. [Feature-by-Feature Replacement](#feature-by-feature-replacement)
5. [Testing Strategy](#testing-strategy)

## Overview

The SmartEdu frontend currently uses mock data for development purposes. This data is defined in various files in the `/data` directory and is used by the API client when the `IS_LIVE_API` flag is set to `false`. We need to replace all mock data with real API calls to the backend.

## Mock Data Files

The following mock data files are currently used in the application:

| File | Description | Used By |
|------|-------------|---------|
| `/data/mock-auth-data.ts` | Authentication mock data | Auth features |
| `/data/mock-course-data.ts` | Course mock data | Public courses |
| `/data/mock-auth-course-data.ts` | Authenticated course mock data | Auth courses |
| `/data/public-mock-course-data.ts` | Public course mock data | Public courses |
| `/data/mock-attendance-data.ts` | Attendance mock data | Attendance features |
| `/data/mock-pricing-data.ts` | Pricing mock data | Pricing features |
| `/data/mock-schedule-data.ts` | Schedule mock data | Schedule features |
| `/data/mock-classes-data.ts` | Classes mock data | Classes features |
| `/data/mock-settings-data.ts` | Settings mock data | Settings features |
| `/data/mock-support-data.ts` | Support mock data | Support features |
| `/data/mock-payment-data.ts` | Payment mock data | Payment features |
| `/data/mock-chat-data.ts` | Chat mock data | Chat features |
| `/data/mock-corporate-data.ts` | Corporate mock data | Corporate features |
| `/data/mock-assignment-data.ts` | Assignment mock data | Assignment features |
| `/data/mock-grade-data.ts` | Grade mock data | Grade features |

## API Client Integration

The API client (`lib/api-client.ts`) currently handles both mock data and real API calls. The `handleMockRequest` function in this file is responsible for returning mock data based on the endpoint and method.

### Current Implementation

\`\`\`typescript
// --- Config ---
// Base URL for the API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

// Determine if the API is in live mode or mock mode
const IS_LIVE_API = process.env.NEXT_PUBLIC_API_IS_LIVE === "true";

// --- Main API Client ---
async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  // ... authentication and headers setup ...

  // --- MOCK Handling ---
  if (!IS_LIVE_API) {
    console.log(
      `%cAPI Client: Using MOCK for ${options.method || "GET"} ${endpoint}`,
      "color: orange;"
    );
    return handleMockRequest<T>(endpoint, options);
  }

  // --- LIVE Handling ---
  try {
    // ... real API call handling ...
  } catch (error: any) {
    // ... error handling ...
  }
}

// --- Handle MOCK Requests ---
export async function handleMockRequest<T>(
  endpoint: string,
  options: FetchOptions
): Promise<T> {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 300 + 100)
  ); // simulate network delay

  const method = options.method?.toLowerCase() || "get";
  let body: any;

  if (options.body && typeof options.body === "string") {
    try {
      body = JSON.parse(options.body);
    } catch {}
  }

  // --- Primary Debug Log ---
  console.log(
    `%c[DEBUG] handleMockRequest: Entry\n  Endpoint: "${endpoint}"\n  Method: "${method}"\n  options.url: "${options.url}"`,
    "color: blue; font-weight: bold;"
  );

  // --- Courses
  if (endpoint === "/courses" && method === "get") {
    return (await getMockCourses()) as unknown as T;
  }
  if (endpoint === "/public_courses" && method === "get") {
    if (IS_LIVE_API) {
      // In live mode, this will be handled by the real API
      throw new Error("Mock API: This endpoint should be handled by the real API in live mode");
    } else {
      // Return mock data for public courses with proper API response structure
      const courses = await getPublicMockCourses();
      return {
        success: true,
        data: courses,
        message: "Public courses fetched successfully"
      } as unknown as T;
    }
  }
  // ... more endpoint handlers ...
}
\`\`\`

### Replacement Strategy

1. Set `IS_LIVE_API` to always be `true`
2. Remove the `handleMockRequest` function
3. Remove all mock data imports
4. Ensure all API endpoints match the expected formats

## Feature-by-Feature Replacement

### 1. Public Courses

#### Current Mock Implementation

\`\`\`typescript
// In /data/public-mock-course-data.ts
export async function getPublicMockCourses(): Promise<PublicCourse[]> {
  // Return mock public courses
}

// In lib/api-client.ts
if (endpoint === "/public_courses" && method === "get") {
  if (IS_LIVE_API) {
    // In live mode, this will be handled by the real API
    throw new Error("Mock API: This endpoint should be handled by the real API in live mode");
  } else {
    // Return mock data for public courses with proper API response structure
    const courses = await getPublicMockCourses();
    return {
      success: true,
      data: courses,
      message: "Public courses fetched successfully"
    } as unknown as T;
  }
}
\`\`\`

#### Thunk Implementation

\`\`\`typescript
// In features/public-course/store/public-course-slice.ts
export const fetchCourses = createAsyncThunk<
  PublicCourse[],
  void,
  { rejectValue: string }
>("courses/fetchCourses", async (_, { rejectWithValue }) => {
  try {
    const response = await get<{
      success: boolean;
      data: PublicCourse[];
      message?: string;
    }>("/public_courses");

    if (!response || !response.success) {
      throw new Error(response?.message || "Failed to fetch courses");
    }

    return response.data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch courses";
    return rejectWithValue(message);
  }
});
\`\`\`

#### Backend Requirements

The backend should implement a `GET /public_courses` endpoint that returns:

\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "course_1",
      "slug": "introduction-to-programming",
      "title": "Introduction to Programming",
      "description": "Learn the basics of programming",
      "category": "Web Development",
      "image": "https://example.com/image.jpg",
      "instructor": {
        "name": "John Doe",
        "title": "Senior Developer"
      },
      "level": "Beginner",
      "priceUSD": 49.99,
      "lessonCount": 10,
      "moduleCount": 3
    },
    // More courses...
  ],
  "message": "Public courses fetched successfully"
}
\`\`\`

### 2. Payment Processing

#### Current Mock Implementation

\`\`\`typescript
// In lib/api-client.ts
if (endpoint === "/payments/initialize" && method === "post") {
  if (!body) {
    throw new Error("Mock API Error: Missing body for POST /payments/initialize");
  }

  const { invoiceId, amount, paymentMethod } = body;

  if (!invoiceId || amount === undefined || !paymentMethod) {
    throw new Error("Mock API Error: Missing required fields for payment initialization");
  }

  // Generate a mock payment response
  const mockPayment = {
    id: `pay_${Date.now()}`,
    userId: "student_123", // This would come from the authenticated user in a real API
    amount,
    currency: "NGN",
    status: "pending",
    provider: "paystack",
    providerReference: `mock_ref_${Date.now()}`,
    description: `Payment for invoice ${invoiceId}`,
    createdAt: new Date().toISOString(),
    paymentMethod,
  };

  // Generate a mock authorization URL
  const authorizationUrl = `https://checkout.paystack.com/mock_${Date.now()}`;

  return {
    success: true,
    message: "Payment initialized successfully",
    data: {
      payment: mockPayment,
      authorizationUrl
    }
  } as unknown as T;
}
\`\`\`

#### Thunk Implementation

\`\`\`typescript
// In features/payment/store/payment-slice.ts
export const initiatePayment = createAsyncThunk<
  PaymentResponse,
  InitiatePaymentPayload,
  { rejectValue: string }
>(
  "payment/initiate",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await post<{
        success: boolean;
        message: string;
        data: {
          payment: PaymentRecord;
          authorizationUrl: string;
        }
      }>('/payments/initialize', payload);

      if (!response.success) {
        throw new Error(response.message || 'Failed to initialize payment');
      }

      return response.data;
    } catch (e: any) {
      return rejectWithValue(e.message || "Failed to initialize payment");
    }
  }
);
\`\`\`

#### Backend Requirements

The backend should implement a `POST /payments/initialize` endpoint that:
1. Accepts a payload with `invoiceId`, `amount`, and `paymentMethod`
2. Integrates with Paystack to initialize a payment
3. Returns a response with the payment record and authorization URL

## Testing Strategy

### 1. Unit Tests

Update unit tests to mock API responses instead of using mock data:

\`\`\`typescript
// Before
jest.mock('@/data/mock-course-data', () => ({
  getPublicMockCourses: jest.fn().mockResolvedValue([mockCourse1, mockCourse2])
}));

// After
jest.mock('@/lib/api-client', () => ({
  get: jest.fn().mockResolvedValue({
    success: true,
    data: [mockCourse1, mockCourse2],
    message: "Courses fetched successfully"
  })
}));
\`\`\`

### 2. Integration Tests

Test each feature with the real API:

1. Set up a test environment with a real backend
2. Run integration tests against this environment
3. Verify all features work as expected

### 3. End-to-End Tests

Test complete user flows:

1. Registration and login
2. Course browsing and enrolment
3. Payment processing
4. Course completion

## Conclusion

This guide outlines how to replace the mock data in the SmartEdu frontend with real API calls. By following this guide, we can ensure a smooth transition from development to production while maintaining a high-quality user experience.
