# SmartEdu API Integration Plan

This document outlines our plan to replace all mock data with real API client calls in the SmartEdu frontend application.

## Current Architecture

### API Client
The application uses a centralized API client (`lib/api-client.ts`) that handles:
- HTTP requests (GET, POST, PUT, DELETE)
- Authentication headers
- Error handling
- Token refresh on 401 responses
- Mock data handling during development

### Mock Data Implementation
Currently, the application uses mock data for development:
- Mock data is defined in various files in the `/data` directory
- The API client has a `handleMockRequest` function that returns mock data based on the endpoint
- A flag `IS_LIVE_API` determines whether to use mock data or real API calls

### Redux Store Structure
The application uses Redux for state management with the following slices:
- `auth`: Authentication state
- `public_courses`: Public course catalog
- `auth_courses`: Authenticated user's courses
- `cart`: Shopping cart
- `pricing`: Pricing plans
- `checkout`: Checkout process
- `payment`: Payment processing
- And many more feature-specific slices

## Integration Plan

### 1. API Client Updates

#### Remove Mock Data Handling
- Remove the `handleMockRequest` function
- Remove all mock data imports
- Set `IS_LIVE_API` to always be `true`

#### Ensure Proper Error Handling
- Standardize error responses
- Add better logging for API errors
- Ensure token refresh works correctly

### 2. Feature-by-Feature Integration

#### Public Courses
- Update `fetchCourses` thunk in `features/public-course/store/public-course-slice.ts`
- Ensure the API response matches the expected format
- Test the integration with the profile page dropdown

\`\`\`typescript
// Current implementation
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

#### Payment Processing
- Update payment thunks in `features/payment/store/payment-slice.ts`
- Integrate with Paystack API through backend
- Test payment flow with real API

\`\`\`typescript
// Current implementation
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

#### Auth Courses
- Update auth course thunks
- Ensure proper loading states
- Handle zero naira values correctly

### 3. Testing Strategy

#### Unit Tests
- Update unit tests to mock API responses instead of using mock data
- Ensure all thunks handle errors correctly

#### Integration Tests
- Test each feature with the real API
- Verify loading states, error handling, and success states

#### End-to-End Tests
- Test complete user flows (registration, course enrolment, payment)
- Verify data persistence across sessions

### 4. Handling Zero Naira Values

Special attention needs to be paid to handling zero naira values in the application:

1. **Payment Processing**:
   - Skip payment gateway for zero-value transactions
   - Update UI to show "Get Free Item" instead of "Pay ₦0 Now"

\`\`\`typescript
// In PaystackCheckout component
{amount === 0 ? (
  <div className="pt-2">
    <DyraneButton
      onClick={handleInitiatePayment}
      className="w-full bg-green-600 hover:bg-green-700"
    >
      <CheckCircle className="mr-2 h-4 w-4" />
      Get Free Item
    </DyraneButton>
  </div>
) : (
  // Regular payment button
)}
\`\`\`

2. **Course Display**:
   - Show "Free" instead of "₦0" for zero-value courses
   - Update UI components to handle zero values gracefully

### 5. Loading States

Ensure proper loading states are displayed during API calls:

1. **Initial Loading**:
   - Show skeleton loaders for initial data fetching
   - Prevent UI flashes during data loading

2. **Action Loading**:
   - Show loading indicators for user actions (payment, enrolment)
   - Disable buttons during loading

3. **Error States**:
   - Show appropriate error messages
   - Provide retry options where applicable

## Implementation Checklist

### Phase 1: Core Features
- [ ] Authentication (login, register, profile)
- [ ] Public Courses
- [ ] Auth Courses
- [ ] Payment Processing

### Phase 2: Secondary Features
- [ ] Classes
- [ ] Attendance
- [ ] Schedule
- [ ] Chat
- [ ] Support

### Phase 3: Admin Features
- [ ] User Management
- [ ] Course Management
- [ ] Payment Management
- [ ] Reports

## API Response Format Requirements

To ensure smooth integration, all API responses should follow these formats:

### Success Response
\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
\`\`\`

### Error Response
\`\`\`json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // Optional detailed errors
  ]
}
\`\`\`

### Pagination Response
\`\`\`json
{
  "success": true,
  "data": {
    "items": [
      // Array of items
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
\`\`\`

## Conclusion

This integration plan provides a roadmap for replacing all mock data with real API client calls in the SmartEdu frontend application. By following this plan, we can ensure a smooth transition from development to production while maintaining a high-quality user experience.
