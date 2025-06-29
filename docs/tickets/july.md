
# Fixing Frontend Data Flow

## Overview

This document summarizes a series of fixes implemented to resolve UI bugs related to data display in the Chat and Support features. The root cause was identified as a consistent mismatch between the data structure returned by our custom `api-client.ts` and the data structure expected by the Redux thunks and reducers.

The core issue stemmed from the `api-client`'s "early unwrapping" of API responses, which required the feature-specific thunks to be more robust in handling the data they receive.

## Core Problem: The `api-client`'s Behavior

Our `lib/api-client.ts` was designed to simplify API calls by automatically unwrapping the JSON response. However, it had two distinct behaviors that caused issues downstream:

1.  **Standard Unwrapping:** For responses like `{ success: true, data: { ... } }`, the client correctly returned only the contents of the `data` property.
2.  **Paginated Unwrapping (The Source of Bugs):** For paginated list responses like `{ success: true, data: [...], pagination: {...} }`, the client had custom logic that attempted to merge the two:

    ```typescript
    // Inside api-client.ts
    data = {
        ...responseData.data, // Spreads an array into an object
        pagination: responseData.pagination
    };
    ```

    This resulted in a quirky object `{"0": item1, "1": item2, ..., "pagination": ...}` instead of a standard object like `{ items: [...], pagination: {...} }`.

Our Redux thunks were written as if they were receiving the latter, causing them to fail when trying to access properties like `.tickets` or `.messages` on an object that didn't have them.

## Solutions Implemented

We addressed these issues on a case-by-case basis by adding a **transformation layer** inside each affected thunk, ensuring the data is correctly shaped before it reaches the Redux reducer.

---

### Ticket 1: Admin Not Seeing Support Tickets

*   **Symptom:** The admin support ticket page was blank or crashing.
*   **Diagnosis:** The `fetchAllTickets` thunk was receiving the malformed paginated object from the `api-client` but was expecting an object with a `.tickets` array. This resulted in `action.payload.tickets` being `undefined` in the reducer, causing a crash.
*   **Solution:** We modified the `fetchAllTickets` thunk to manually reconstruct the `tickets` array from the API client's response.

#### Code Fix: `features/support/store/supportSlice.ts`

```typescript
// The fetchAllTickets thunk was updated

export const fetchAllTickets = createAsyncThunk<
	FetchAllTicketsThunkResponse,
	FetchAllTicketsParams,
	{ rejectValue: string }
>(
	"support/fetchAllTickets",
	async ({ status, page = 1, limit = 10 }, { rejectWithValue }) => {
		try {
			// ... params setup ...
			const apiClientResponse = await get<any>(/* ... */);

            // --- TRANSFORMATION LOGIC ---
            const tickets: SupportTicket[] = [];
            let pagination = { ... }; // default pagination

            if (apiClientResponse && typeof apiClientResponse === 'object') {
                if (apiClientResponse.pagination) {
                    pagination = apiClientResponse.pagination;
                }
                // Re-assemble the array from the numeric keys
                Object.keys(apiClientResponse).forEach(key => {
                    if (!isNaN(parseInt(key, 10))) {
                        tickets.push(apiClientResponse[key]);
                    }
                });
            }

            // Return the correctly structured payload
            return { tickets, pagination };

		} catch (e: any) { /* ... */ }
	}
);
```

---

### Ticket 2: Chat Feature Data Integrity

The same pattern of issues was present throughout the chat feature.

#### A. Fetching Chat Rooms & Messages

*   **Symptom:** Chat rooms and messages lists failed to load due to the same paginated data issue.
*   **Diagnosis:** Both `fetchChatRooms` and `fetchChatMessages` were receiving the malformed paginated object from the `api-client`.
*   **Solution:** We applied the exact same transformation logic as in `fetchAllTickets` to both of these thunks, ensuring they reconstruct a clean array (`roomsArray` and `messagesArray`) before returning.

#### B. Sending a Chat Message

*   **Symptom:** After sending a message, the app would crash with a `Cannot read properties of undefined (reading 'roomId')` error.
*   **Diagnosis:** The `api-client` correctly unwrapped the `data` property from the `POST /chat/messages` response. This `data` object *was* the `ChatMessage`. The thunk, however, was not returning it correctly, leading to an `undefined` payload in the reducer.
*   **Solution:** We corrected the `sendChatMessage` thunk to return the `ChatMessage` object directly, as it receives it from the `api-client`.

```typescript
// In sendChatMessage thunk in chat-thunks.ts
// The `post` call returns the ChatMessage object directly.
const newChatMessage = await post<ChatMessage>("/chat/messages", payload);

// We return the object directly.
return newChatMessage;
```

#### C. Marking a Room as Read

*   **Symptom:** A TypeScript error `Property 'updatedRoom' does not exist...` was identified.
*   **Diagnosis:** The `markRoomAsRead` thunk was structured to receive an `updatedRoom` object from the API, but the API only returned a simple `{ success: true }` message. Since this response has no `data` property, the `api-client` returns the full object.
*   **Solution:** We simplified the thunk to only check for `response.success` and return just the `{ roomId }`. We then updated the corresponding reducer in `chatSlice.ts` to expect this simpler payload and set the room's `unreadCount` to 0.

---

### Ticket 3: Timestamps Not Displaying

*   **Symptom:** The UI was not showing any timestamps for chat messages.
*   **Diagnosis:** The frontend `ChatMessage` type expected a `timestamp` property, but the API was returning `createdAt`. This property was not being mapped, so `message.timestamp` was `undefined`.
*   **Solution:** We created a `mapApiMessageToChatMessage` helper function inside `chat-thunks.ts` that explicitly maps `apiMessage.createdAt` to `timestamp`. This mapper is now used in both `fetchChatMessages` and `sendChatMessage` to ensure all message objects in the application have a consistent shape.

```typescript
// Helper function added to chat-thunks.ts
const mapApiMessageToChatMessage = (apiMessage: any): ChatMessage => {
    return {
        ...apiMessage,
        timestamp: apiMessage.createdAt, // The crucial mapping
        sender: apiMessage.user ? { ... } : undefined
    };
};
```