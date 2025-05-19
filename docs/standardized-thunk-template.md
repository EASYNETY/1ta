# Standardized Thunk Template

This document provides a standardized template for creating thunks that handle both direct and nested API response structures. Use this template when creating new thunks or updating existing ones.

## Basic Thunk Template

```typescript
export const fetchSomeData = createAsyncThunk<
  ResponseType,
  RequestParamsType,
  { state: RootState; rejectValue: string }
>("feature/fetchData", async (params, { rejectWithValue }) => {
  try {
    // Make the API request
    const response = await get<any>(`/endpoint/${params.id}`);
    console.log("API response:", response);
    
    // The API client now automatically handles nested structures,
    // so we can use the response directly
    return response;
  } catch (error: any) {
    // Handle errors consistently
    const message = error?.response?.data?.message || error?.message || "Failed to fetch data.";
    return rejectWithValue(message);
  }
});
```

## Thunk with Data Transformation

```typescript
export const fetchSomeData = createAsyncThunk<
  TransformedResponseType,
  RequestParamsType,
  { state: RootState; rejectValue: string }
>("feature/fetchData", async (params, { rejectWithValue }) => {
  try {
    // Make the API request
    const response = await get<any>(`/endpoint/${params.id}`);
    console.log("API response:", response);
    
    // Transform the data if needed
    const transformedData = {
      id: response.id,
      name: response.name,
      // Add any other transformations needed
    };
    
    return transformedData;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to fetch data.";
    return rejectWithValue(message);
  }
});
```

## Thunk with Pagination

```typescript
export const fetchPaginatedData = createAsyncThunk<
  PaginatedResponseType,
  PaginationParamsType,
  { state: RootState; rejectValue: string }
>("feature/fetchPaginatedData", async (params, { rejectWithValue }) => {
  try {
    // Build the query string
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    
    // Make the API request
    const endpoint = `/endpoint?${queryParams.toString()}`;
    const response = await get<any>(endpoint);
    console.log("API response:", response);
    
    // The API client now handles pagination info automatically
    return response;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to fetch data.";
    return rejectWithValue(message);
  }
});
```

## POST Thunk Template

```typescript
export const createSomeData = createAsyncThunk<
  ResponseType,
  RequestDataType,
  { state: RootState; rejectValue: string }
>("feature/createData", async (data, { rejectWithValue }) => {
  try {
    // Make the API request
    const response = await post<any>("/endpoint", data);
    console.log("API response:", response);
    
    return response;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to create data.";
    return rejectWithValue(message);
  }
});
```

## PUT Thunk Template

```typescript
export const updateSomeData = createAsyncThunk<
  ResponseType,
  { id: string; data: RequestDataType },
  { state: RootState; rejectValue: string }
>("feature/updateData", async ({ id, data }, { rejectWithValue }) => {
  try {
    // Make the API request
    const response = await put<any>(`/endpoint/${id}`, data);
    console.log("API response:", response);
    
    return response;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to update data.";
    return rejectWithValue(message);
  }
});
```

## DELETE Thunk Template

```typescript
export const deleteSomeData = createAsyncThunk<
  { success: boolean; id: string },
  string,
  { state: RootState; rejectValue: string }
>("feature/deleteData", async (id, { rejectWithValue }) => {
  try {
    // Make the API request
    const response = await del<any>(`/endpoint/${id}`);
    console.log("API response:", response);
    
    return { success: true, id };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to delete data.";
    return rejectWithValue(message);
  }
});
```

## Reducer Template

```typescript
// In your slice file
.addCase(fetchSomeData.fulfilled, (state, action) => {
  state.status = "succeeded";
  state.error = null;
  
  // Handle the data
  state.items = action.payload;
})
```

## Reducer Template for Paginated Data

```typescript
// In your slice file
.addCase(fetchPaginatedData.fulfilled, (state, action) => {
  state.status = "succeeded";
  state.error = null;
  
  // Handle the data and pagination
  state.items = action.payload.data || [];
  state.pagination = {
    currentPage: action.payload.pagination?.page || 1,
    limit: action.payload.pagination?.limit || 10,
    totalItems: action.payload.pagination?.total || 0,
    totalPages: action.payload.pagination?.pages || 1,
  };
})
```

By following these templates, we ensure consistent handling of API responses across the application, making the code more maintainable and reducing the risk of bugs.
