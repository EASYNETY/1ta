## Change Password Feature

This document outlines the client-side implementation for the "Change Password" feature within the application's authentication system, managed via Redux Toolkit.

**Objective:** Allow authenticated users to securely change their account password by providing their current password and a new password.

---

### 1. Core Component: `changePasswordThunk`

This is an asynchronous Redux thunk responsible for orchestrating the password change process.

*   **File:** `features/auth/store/auth-thunks.ts`
*   **Purpose:**
    1.  Takes the user's current password and new password as input.
    2.  Verifies that a user is currently authenticated.
    3.  Makes an API request to the backend endpoint designated for password changes.
    4.  Handles success and failure responses from the API.
    5.  Dispatches actions to update the Redux store's state (e.g., loading status, error messages).

*   **Key Types:**
    *   **`ChangePasswordPayload`**: Defines the structure of the data sent *to* the thunk (and subsequently to the API).
        \`\`\`typescript
        export interface ChangePasswordPayload {
            currentPassword: string;
            newPassword: string;
        }
        \`\`\`
    *   **`ChangePasswordSuccessResponse`**: Defines the expected structure of the data received from the API upon a *successful* password change.
        \`\`\`typescript
        export interface ChangePasswordSuccessResponse {
            message: string; // e.g., "Password updated successfully."
            // Other properties if your API returns more on success.
        }
        \`\`\`
    *   **Thunk Definition Generic Types:**
        *   `createAsyncThunk<SuccessResponseType, ThunkArgType, ThunkApiConfig>`
        *   For `changePasswordThunk`:
            *   `SuccessResponseType`: `ChangePasswordSuccessResponse`
            *   `ThunkArgType`: `ChangePasswordPayload`
            *   `ThunkApiConfig`: `{ rejectValue: string; state: { auth: AuthState } }` (defines the type for rejection payload and `getState`)

---

### 2. Request Payload (Client to API)

When the `changePasswordThunk` is dispatched from the UI (e.g., `SettingsSecurity.tsx`), it sends a payload to the backend API.

*   **Structure:** Matches the `ChangePasswordPayload` interface.
    \`\`\`json
    {
        "currentPassword": "user-current-password-value",
        "newPassword": "user-new-password-value"
    }
    \`\`\`
*   **Note:** The `confirmPassword` field, often present in UI forms, is typically validated on the client-side and **not** sent to the backend. Only the `newPassword` is transmitted.

---

### 3. API Endpoint Handling

The `changePasswordThunk` interacts with a specific backend API endpoint.

*   **Method:** `PUT` (Commonly used for updating existing resources, including user attributes like passwords).
*   **Example Endpoint:** `/users/change-password`
    *   **Important:** This is a placeholder. You **must replace this** with the actual endpoint URL provided by your backend API documentation for changing a user's password.
    *   Common variations include:
        *   `/auth/change-password`
        *   `/users/me/password`
        *   `/profile/security/password`
*   **Authentication:** This endpoint **must** be protected and require user authentication. The API client (`put` function from `lib/live/auth-api-client`) should automatically include the user's authentication token (e.g., JWT Bearer token) in the request headers.

---

### 4. API Response Handling (API to Client)

The thunk anticipates specific responses from the backend API.

*   **On Success (e.g., HTTP Status 200 OK):**
    *   **Expected JSON Structure:**
        \`\`\`json
        {
            "success": true,
            "message": "Password updated successfully."
            // Potentially other data if your API provides it
        }
        \`\`\`
    *   The `changePasswordThunk` will resolve successfully, and its `fulfilled` action will carry a payload matching `ChangePasswordSuccessResponse` (primarily the `message`).
    *   The Redux state will reflect `isLoading: false` and `error: null`.

*   **On Failure (e.g., HTTP Status 400 Bad Request, 401 Unauthorized, 403 Forbidden, 500 Internal Server Error):**
    *   **Expected JSON Structure (for client-side errors like incorrect current password or validation issues):**
        \`\`\`json
        // Example for 400 Bad Request (e.g., current password incorrect)
        {
            "success": false,
            "message": "The current password you entered is incorrect.",
            "errors": [ // Optional: For more detailed validation errors
                { "path": "currentPassword", "msg": "Invalid current password." }
            ]
        }
        \`\`\`
    *   The `changePasswordThunk` will be rejected.
    *   Its `rejected` action will carry a `payload` of type `string` (the `rejectValue`), which will be the error message extracted from the API response or a generic fallback.
    *   The Redux state will reflect `isLoading: false` and `error` will be set to this error message.

---

### 5. Redux State Updates (`auth-slice.ts` & `auth-extra-reducers.ts`)

The `extraReducers` in `auth-slice.ts` listen for the actions dispatched by `changePasswordThunk`:

*   **`changePasswordThunk.pending`:**
    *   Sets `state.isLoading = true`.
    *   Sets `state.error = null`.
*   **`changePasswordThunk.fulfilled`:**
    *   Sets `state.isLoading = false`.
    *   The success `message` from `action.payload.message` can be used by the UI (e.g., in a toast notification).
    *   Typically, `state.user` is not modified directly by a password change success, as the user object itself usually doesn't change.
*   **`changePasswordThunk.rejected`:**
    *   Sets `state.isLoading = false`.
    *   Sets `state.error = action.payload` (the error message string).

---

### 6. UI Integration (`SettingsSecurity.tsx`)

The React component uses `react-hook-form` for form management and `zod` for validation.

*   It dispatches `changePasswordThunk` with the form data (`currentPassword`, `newPassword`).
*   It subscribes to `isLoading` and `error` from the Redux store to provide UI feedback (disable button, show error messages).
*   It uses a toast notification system to display success or specific error messages to the user based on the thunk's outcome.

---
