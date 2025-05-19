# Standardized API Response Format

This document defines the standardized API response format that should be used for all API endpoints in the application. Following this format ensures consistency and makes it easier to handle responses on the frontend.

## Basic Response Format

All API responses should follow this basic structure:

```json
{
  "success": true,
  "data": {
    // The actual data being returned
  },
  "message": "Operation completed successfully"
}
```

- `success`: Boolean indicating if the request was successful
- `data`: The actual data being returned (object or array)
- `message`: A human-readable message describing the result

## Paginated Response Format

For endpoints that return paginated data, the response should include pagination information:

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "message": "Operation completed successfully"
}
```

- `pagination.total`: Total number of items available
- `pagination.page`: Current page number
- `pagination.limit`: Number of items per page
- `pagination.pages`: Total number of pages

## Error Response Format

Error responses should follow this structure:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

- `success`: Always `false` for error responses
- `message`: A human-readable error message
- `error.code`: A machine-readable error code
- `error.details`: Additional details about the error (optional)

## Examples

### Successful Single Item Response

```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Example Item",
    "description": "This is an example item"
  },
  "message": "Item fetched successfully"
}
```

### Successful Collection Response

```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "name": "Example Item 1",
      "description": "This is example item 1"
    },
    {
      "id": "456",
      "name": "Example Item 2",
      "description": "This is example item 2"
    }
  ],
  "message": "Items fetched successfully"
}
```

### Paginated Collection Response

```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "name": "Example Item 1",
      "description": "This is example item 1"
    },
    {
      "id": "456",
      "name": "Example Item 2",
      "description": "This is example item 2"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "message": "Items fetched successfully"
}
```

### Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "name": "Name is required",
      "email": "Invalid email format"
    }
  }
}
```

### Not Found Error Response

```json
{
  "success": false,
  "message": "Item not found",
  "error": {
    "code": "NOT_FOUND",
    "details": "The requested item with ID 123 does not exist"
  }
}
```

### Server Error Response

```json
{
  "success": false,
  "message": "Internal server error",
  "error": {
    "code": "SERVER_ERROR",
    "details": "An unexpected error occurred while processing your request"
  }
}
```

## HTTP Status Codes

The API should use appropriate HTTP status codes in addition to the standardized response format:

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `204 No Content`: Successful request with no response body
- `400 Bad Request`: Invalid request (e.g., validation error)
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Implementation Notes

### Frontend

The frontend API client has been updated to automatically handle this standardized response format. It extracts the `data` property from successful responses, so thunks and components can work with the actual data directly.

For paginated responses, the pagination information is preserved in the response.

### Backend

The backend team should ensure that all API endpoints follow this standardized format. This includes both successful responses and error responses.

## Benefits

Using a standardized API response format provides several benefits:

1. **Consistency**: All API endpoints behave in a predictable way
2. **Error Handling**: Consistent error format makes it easier to handle errors
3. **Pagination**: Standardized pagination format simplifies implementing pagination UI
4. **Maintainability**: Easier to maintain and extend the API
5. **Documentation**: Easier to document and understand the API

By following this standardized format, we can reduce the amount of defensive coding needed on the frontend and make the application more robust.
