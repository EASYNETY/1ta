### API Integration Guide

## Table of Contents

1. [API Architecture Overview](#api-architecture-overview)
2. [Environment Setup](#environment-setup)
3. [Direct API Client Usage](#direct-api-client-usage)
4. [Using the useApi Hook](#using-the-useapi-hook)
5. [Redux Thunks for API Calls](#redux-thunks-for-api-calls)
6. [Error Handling](#error-handling)
7. [Decision Guide: Which Approach to Use](#decision-guide-which-approach-to-use)
8. [Common Patterns and Examples](#common-patterns-and-examples)


## API Architecture Overview

Our application uses a layered approach to API integration:

```mermaid
API Architecture.download-icon {
            cursor: pointer;
            transform-origin: center;
        }
        .download-icon .arrow-part {
            transition: transform 0.35s cubic-bezier(0.35, 0.2, 0.14, 0.95);
             transform-origin: center;
        }
        button:has(.download-icon):hover .download-icon .arrow-part, button:has(.download-icon):focus-visible .download-icon .arrow-part {
          transform: translateY(-1.5px);
        }
        #mermaid-diagram-rn5a{font-family:var(--font-geist-sans);font-size:12px;fill:#000000;}#mermaid-diagram-rn5a .error-icon{fill:#552222;}#mermaid-diagram-rn5a .error-text{fill:#552222;stroke:#552222;}#mermaid-diagram-rn5a .edge-thickness-normal{stroke-width:1px;}#mermaid-diagram-rn5a .edge-thickness-thick{stroke-width:3.5px;}#mermaid-diagram-rn5a .edge-pattern-solid{stroke-dasharray:0;}#mermaid-diagram-rn5a .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-diagram-rn5a .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-diagram-rn5a .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-diagram-rn5a .marker{fill:#666;stroke:#666;}#mermaid-diagram-rn5a .marker.cross{stroke:#666;}#mermaid-diagram-rn5a svg{font-family:var(--font-geist-sans);font-size:12px;}#mermaid-diagram-rn5a p{margin:0;}#mermaid-diagram-rn5a .label{font-family:var(--font-geist-sans);color:#000000;}#mermaid-diagram-rn5a .cluster-label text{fill:#333;}#mermaid-diagram-rn5a .cluster-label span{color:#333;}#mermaid-diagram-rn5a .cluster-label span p{background-color:transparent;}#mermaid-diagram-rn5a .label text,#mermaid-diagram-rn5a span{fill:#000000;color:#000000;}#mermaid-diagram-rn5a .node rect,#mermaid-diagram-rn5a .node circle,#mermaid-diagram-rn5a .node ellipse,#mermaid-diagram-rn5a .node polygon,#mermaid-diagram-rn5a .node path{fill:#eee;stroke:#999;stroke-width:1px;}#mermaid-diagram-rn5a .rough-node .label text,#mermaid-diagram-rn5a .node .label text{text-anchor:middle;}#mermaid-diagram-rn5a .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-diagram-rn5a .node .label{text-align:center;}#mermaid-diagram-rn5a .node.clickable{cursor:pointer;}#mermaid-diagram-rn5a .arrowheadPath{fill:#333333;}#mermaid-diagram-rn5a .edgePath .path{stroke:#666;stroke-width:2.0px;}#mermaid-diagram-rn5a .flowchart-link{stroke:#666;fill:none;}#mermaid-diagram-rn5a .edgeLabel{background-color:white;text-align:center;}#mermaid-diagram-rn5a .edgeLabel p{background-color:white;}#mermaid-diagram-rn5a .edgeLabel rect{opacity:0.5;background-color:white;fill:white;}#mermaid-diagram-rn5a .labelBkg{background-color:rgba(255, 255, 255, 0.5);}#mermaid-diagram-rn5a .cluster rect{fill:hsl(0, 0%, 98.9215686275%);stroke:#707070;stroke-width:1px;}#mermaid-diagram-rn5a .cluster text{fill:#333;}#mermaid-diagram-rn5a .cluster span{color:#333;}#mermaid-diagram-rn5a div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:var(--font-geist-sans);font-size:12px;background:hsl(-160, 0%, 93.3333333333%);border:1px solid #707070;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-diagram-rn5a .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#000000;}#mermaid-diagram-rn5a .flowchart-link{stroke:hsl(var(--gray-400));stroke-width:1px;}#mermaid-diagram-rn5a .marker,#mermaid-diagram-rn5a marker,#mermaid-diagram-rn5a marker *{fill:hsl(var(--gray-400))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-rn5a .label,#mermaid-diagram-rn5a text,#mermaid-diagram-rn5a text>tspan{fill:hsl(var(--black))!important;color:hsl(var(--black))!important;}#mermaid-diagram-rn5a .background,#mermaid-diagram-rn5a rect.relationshipLabelBox{fill:hsl(var(--white))!important;}#mermaid-diagram-rn5a .entityBox,#mermaid-diagram-rn5a .attributeBoxEven{fill:hsl(var(--gray-150))!important;}#mermaid-diagram-rn5a .attributeBoxOdd{fill:hsl(var(--white))!important;}#mermaid-diagram-rn5a .label-container,#mermaid-diagram-rn5a rect.actor{fill:hsl(var(--white))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-rn5a line{stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-rn5a :root{--mermaid-font-family:var(--font-geist-sans);}React ComponentsuseApi HookRedux ThunksAPI ClientError HandlingServer Endpoints
```

- **API Client**: Base layer that handles requests, authentication, and error formatting
- **useApi Hook**: React hook for component-level API calls with loading/error states
- **Redux Thunks**: For API calls that update global state
- **Error Handling**: Consistent error processing across all approaches


## Environment Setup

Ensure these environment variables are set in your `.env.local` file:

```plaintext
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_IS_LIVE=false
```

- `NEXT_PUBLIC_API_BASE_URL`: Base URL for all API requests
- `NEXT_PUBLIC_API_IS_LIVE`: Set to `true` to use the live API, `false` to use mock data


## Direct API Client Usage

Import the API client functions directly for simple use cases:

```typescript
import { get, post, put, del } from "@/lib/api-client";

// GET request
const fetchData = async () => {
  try {
    const data = await get<User[]>("/users");
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

// POST request
const createItem = async (data: ItemData) => {
  try {
    const response = await post<Item>("/items", data);
    return response;
  } catch (error) {
    handleApiError(error);
  }
};

// PUT request
const updateItem = async (id: string, data: ItemData) => {
  try {
    const response = await put<Item>(`/items/${id}`, data);
    return response;
  } catch (error) {
    handleApiError(error);
  }
};

// DELETE request
const deleteItem = async (id: string) => {
  try {
    await del(`/items/${id}`);
  } catch (error) {
    handleApiError(error);
  }
};
```

## Using the useApi Hook

The `useApi` hook simplifies API calls in React components:

```typescript
import { useApi } from "@/hooks/use-api";
import { get, post } from "@/lib/api-client";

// Basic usage in a component
function UserList() {
  const { data, isLoading, error, execute } = useApi();

  useEffect(() => {
    execute(() => get("/users"));
  }, [execute]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// With callbacks
function CreateUserForm() {
  const { isLoading, error, execute } = useApi({
    onSuccess: (data) => {
      toast.success("User created successfully!");
      router.push(`/users/${data.id}`);
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
    }
  });

  const handleSubmit = async (formData) => {
    await execute(() => post("/users", formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
      <button disabled={isLoading}>
        {isLoading ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
```

## Redux Thunks for API Calls

For global state management, use Redux thunks:

```typescript
// In your slice file
import { createAsyncThunk } from "@reduxjs/toolkit";
import { get, post, ApiError } from "@/lib/api-client";

// Fetch thunk
export const fetchGradeItems = createAsyncThunk(
  "grades/fetchGradeItems",
  async (params: { courseId?: string }, { rejectWithValue }) => {
    try {
      return await get<GradeItem[]>(`/grade-items?courseId=${params.courseId || ""}`);
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch grade items");
    }
  }
);

// Create thunk
export const createGradeItem = createAsyncThunk(
  "grades/createGradeItem",
  async (gradeItem: GradeItemCreate, { rejectWithValue }) => {
    try {
      return await post<GradeItem>("/grade-items", gradeItem);
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create grade item");
    }
  }
);

// In your component
function GradesList() {
  const dispatch = useAppDispatch();
  const { gradeItems, status, error } = useAppSelector(state => state.grades);

  useEffect(() => {
    dispatch(fetchGradeItems({ courseId: "course-123" }));
  }, [dispatch]);

  // Component rendering...
}
```

## Error Handling

We have a consistent error handling approach:

```typescript
import { handleApiError, withErrorHandling } from "@/lib/error-utils";

// Direct usage
try {
  const data = await get("/users");
} catch (error) {
  const errorMessage = handleApiError(error, "Failed to fetch users");
  // Do something with errorMessage
}

// Wrapping a function with error handling
const fetchUsers = withErrorHandling(async () => {
  return await get("/users");
});

// Later use
const users = await fetchUsers();
```

The `ApiError` class provides structured error information:

```typescript
// Example of ApiError properties
if (error instanceof ApiError) {
  console.log(error.status);        // HTTP status code
  console.log(error.message);       // Error message
  console.log(error.data);          // Additional error data from API
  console.log(error.isNetworkError); // Whether it's a network error
}
```

## Decision Guide: Which Approach to Use

| Approach | When to Use | Example Scenarios
|-----|-----|-----
| **Direct API Client** | Simple scripts, utilities, or non-React code | Background tasks, Next.js Server Actions
| **useApi Hook** | Component-specific data, form submissions, one-time operations | Profile editor, comment form, file upload
| **Redux Thunks** | Shared data across components, complex state, persistent data | User authentication, product catalog, notifications


### Decision Tree

```mermaid
API Approach Decision Tree.download-icon {
            cursor: pointer;
            transform-origin: center;
        }
        .download-icon .arrow-part {
            transition: transform 0.35s cubic-bezier(0.35, 0.2, 0.14, 0.95);
             transform-origin: center;
        }
        button:has(.download-icon):hover .download-icon .arrow-part, button:has(.download-icon):focus-visible .download-icon .arrow-part {
          transform: translateY(-1.5px);
        }
        #mermaid-diagram-rnae{font-family:var(--font-geist-sans);font-size:12px;fill:#000000;}#mermaid-diagram-rnae .error-icon{fill:#552222;}#mermaid-diagram-rnae .error-text{fill:#552222;stroke:#552222;}#mermaid-diagram-rnae .edge-thickness-normal{stroke-width:1px;}#mermaid-diagram-rnae .edge-thickness-thick{stroke-width:3.5px;}#mermaid-diagram-rnae .edge-pattern-solid{stroke-dasharray:0;}#mermaid-diagram-rnae .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-diagram-rnae .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-diagram-rnae .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-diagram-rnae .marker{fill:#666;stroke:#666;}#mermaid-diagram-rnae .marker.cross{stroke:#666;}#mermaid-diagram-rnae svg{font-family:var(--font-geist-sans);font-size:12px;}#mermaid-diagram-rnae p{margin:0;}#mermaid-diagram-rnae .label{font-family:var(--font-geist-sans);color:#000000;}#mermaid-diagram-rnae .cluster-label text{fill:#333;}#mermaid-diagram-rnae .cluster-label span{color:#333;}#mermaid-diagram-rnae .cluster-label span p{background-color:transparent;}#mermaid-diagram-rnae .label text,#mermaid-diagram-rnae span{fill:#000000;color:#000000;}#mermaid-diagram-rnae .node rect,#mermaid-diagram-rnae .node circle,#mermaid-diagram-rnae .node ellipse,#mermaid-diagram-rnae .node polygon,#mermaid-diagram-rnae .node path{fill:#eee;stroke:#999;stroke-width:1px;}#mermaid-diagram-rnae .rough-node .label text,#mermaid-diagram-rnae .node .label text{text-anchor:middle;}#mermaid-diagram-rnae .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-diagram-rnae .node .label{text-align:center;}#mermaid-diagram-rnae .node.clickable{cursor:pointer;}#mermaid-diagram-rnae .arrowheadPath{fill:#333333;}#mermaid-diagram-rnae .edgePath .path{stroke:#666;stroke-width:2.0px;}#mermaid-diagram-rnae .flowchart-link{stroke:#666;fill:none;}#mermaid-diagram-rnae .edgeLabel{background-color:white;text-align:center;}#mermaid-diagram-rnae .edgeLabel p{background-color:white;}#mermaid-diagram-rnae .edgeLabel rect{opacity:0.5;background-color:white;fill:white;}#mermaid-diagram-rnae .labelBkg{background-color:rgba(255, 255, 255, 0.5);}#mermaid-diagram-rnae .cluster rect{fill:hsl(0, 0%, 98.9215686275%);stroke:#707070;stroke-width:1px;}#mermaid-diagram-rnae .cluster text{fill:#333;}#mermaid-diagram-rnae .cluster span{color:#333;}#mermaid-diagram-rnae div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:var(--font-geist-sans);font-size:12px;background:hsl(-160, 0%, 93.3333333333%);border:1px solid #707070;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-diagram-rnae .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#000000;}#mermaid-diagram-rnae .flowchart-link{stroke:hsl(var(--gray-400));stroke-width:1px;}#mermaid-diagram-rnae .marker,#mermaid-diagram-rnae marker,#mermaid-diagram-rnae marker *{fill:hsl(var(--gray-400))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-rnae .label,#mermaid-diagram-rnae text,#mermaid-diagram-rnae text>tspan{fill:hsl(var(--black))!important;color:hsl(var(--black))!important;}#mermaid-diagram-rnae .background,#mermaid-diagram-rnae rect.relationshipLabelBox{fill:hsl(var(--white))!important;}#mermaid-diagram-rnae .entityBox,#mermaid-diagram-rnae .attributeBoxEven{fill:hsl(var(--gray-150))!important;}#mermaid-diagram-rnae .attributeBoxOdd{fill:hsl(var(--white))!important;}#mermaid-diagram-rnae .label-container,#mermaid-diagram-rnae rect.actor{fill:hsl(var(--white))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-rnae line{stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-rnae :root{--mermaid-font-family:var(--font-geist-sans);}NoYesNoYesYesNoNeed to make an API callIs it in a React component?Use Direct API ClientDoes multiple components needthis data?Is it a simple operation?Use Redux ThunksUse useApi Hook
```

## Common Patterns and Examples

### Loading States

```typescriptreact
// With useApi
function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useApi();
  
  useEffect(() => {
    if (userId) {
      execute(() => get(`/users/${userId}`));
    }
  }, [userId, execute]);
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorDisplay message={error} />;
  if (!user) return <EmptyState />;
  
  return <UserProfileDisplay user={user} />;
}

// With Redux
function UserProfile({ userId }) {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector(selectUserById(userId));
  
  useEffect(() => {
    if (userId && status === 'idle') {
      dispatch(fetchUserById(userId));
    }
  }, [userId, status, dispatch]);
  
  if (status === 'loading') return <Skeleton />;
  if (status === 'failed') return <ErrorDisplay message={error} />;
  if (!user) return <EmptyState />;
  
  return <UserProfileDisplay user={user} />;
}
```

### Form Submission

```typescriptreact
// Form submission with useApi
function CreateCourseForm() {
  const [formData, setFormData] = useState(initialFormData);
  const { execute, isLoading, error } = useApi({
    onSuccess: (data) => {
      toast.success("Course created!");
      router.push(`/courses/${data.id}`);
    }
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(() => post('/courses', formData));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <FormError message={error} />}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Course"}
      </Button>
    </form>
  );
}
```

### Combining Approaches

```typescriptreact
// Using both Redux and useApi
function GradeEditor({ gradeId }) {
  const dispatch = useAppDispatch();
  const grade = useAppSelector(selectGradeById(gradeId));
  
  // Use Redux for fetching
  useEffect(() => {
    if (gradeId) {
      dispatch(fetchGradeById(gradeId));
    }
  }, [gradeId, dispatch]);
  
  // Use useApi for submission
  const { execute, isLoading, error } = useApi({
    onSuccess: () => {
      toast.success("Grade updated!");
      // Refresh Redux state
      dispatch(fetchGradeById(gradeId));
    }
  });
  
  const handleSubmit = async (formData) => {
    await execute(() => put(`/grades/${gradeId}`, formData));
  };
  
  // Component rendering...
}
```

---

Remember to always consider the scope and lifecycle of your data when choosing an approach. For component-specific, short-lived data, use the `useApi` hook. For application-wide, persistent data, use Redux thunks.