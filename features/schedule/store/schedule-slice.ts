// features/schedule/store/schedule-slice.ts
import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/store";
// Import ScheduleState which now includes the new fields
import type { ScheduleEvent, ScheduleState } from "../types/schedule-types";
import { startOfWeek, formatISO } from "date-fns";
import { get, post, put, del } from "@/lib/api-client"; // Import CRUD methods

// --- Define Payload Types ---
export type CreateScheduleEventPayload = Omit<ScheduleEvent, "id">;
export type UpdateScheduleEventPayload = Partial<Omit<ScheduleEvent, "id">> & {
	id: string;
};

// --- Async Thunks ---
interface FetchScheduleParams {
	role: string;
	userId?: string;
	startDate: string;
	endDate: string;
}
interface FetchAllEventsParams {
	page?: number;
	limit?: number;
	/* Add filters: dateFrom?, dateTo?, type?, courseId? */
}
interface FetchAllEventsResult {
	events: ScheduleEvent[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// Fetch schedule for the week/calendar view
export const fetchSchedule = createAsyncThunk<
	ScheduleEvent[],
	FetchScheduleParams,
	{ state: RootState; rejectValue: string }
>(
	"schedule/fetchSchedule",
	async ({ role, userId, startDate, endDate }, { rejectWithValue }) => {
		try {
			console.log(`Fetching schedule from ${startDate} to ${endDate}`);

			// Construct query parameters
			const params = new URLSearchParams();
			params.append("role", role);
			if (userId) params.append("userId", userId);
			params.append("startDate", startDate);
			params.append("endDate", endDate);

			// API call using the API client
			return await get<ScheduleEvent[]>(`/schedule?${params.toString()}`);
		} catch (error: any) {
			return rejectWithValue(error.message || "Failed to fetch schedule");
		}
	}
);

// Fetch all events for the management table
export const fetchAllScheduleEvents = createAsyncThunk<
	FetchAllEventsResult,
	FetchAllEventsParams | void,
	{ rejectValue: string }
>("schedule/fetchAllEvents", async (params, { rejectWithValue }) => {
	try {
		const page = params?.page ?? 1;
		const limit = params?.limit ?? 10;

		// Construct query parameters
		const queryParams = new URLSearchParams();
		queryParams.append("page", page.toString());
		queryParams.append("limit", limit.toString());

		// Add optional filters if provided
		if (params) {
			// Example: if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom)
			// Example: if (params.type) queryParams.append("type", params.type)
		}

		// API call using the API client
		const response = await get<any>(`/schedule-events?${queryParams.toString()}`);

		// Handle API response format which might be wrapped in data object
		if (response.data && response.data.events) {
			// API returns { success: true, data: { events: [], pagination: {} } }
			return {
				events: response.data.events,
				total: response.data.pagination?.total || 0,
				page: response.data.pagination?.page || 1,
				limit: response.data.pagination?.limit || 10,
				totalPages: response.data.pagination?.pages || 1
			};
		} else if (Array.isArray(response.events)) {
			// API returns { events: [], total: 0, page: 1, ... }
			return response;
		} else if (Array.isArray(response)) {
			// API returns direct array of events
			return {
				events: response,
				total: response.length,
				page: 1,
				limit: response.length,
				totalPages: 1
			};
		}

		// Fallback for unexpected response format
		return {
			events: [],
			total: 0,
			page: 1,
			limit: 10,
			totalPages: 0
		};
	} catch (error: any) {
		return rejectWithValue(
			error.message || "Failed to fetch all schedule events"
		);
	}
});

// Fetch single event by ID
export const fetchScheduleEventById = createAsyncThunk<
	ScheduleEvent,
	string,
	{ rejectValue: string }
>("schedule/fetchEventById", async (eventId, { rejectWithValue }) => {
	try {
		// API call using the API client
		return await get<ScheduleEvent>(`/schedule-events/${eventId}`);
	} catch (error: any) {
		return rejectWithValue(error.message || `Failed to fetch event ${eventId}`);
	}
});

// Create schedule event
export const createScheduleEvent = createAsyncThunk<
	ScheduleEvent,
	CreateScheduleEventPayload,
	{ rejectValue: string }
>("schedule/createEvent", async (eventData, { rejectWithValue }) => {
	try {
		// API call using the API client
		return await post<ScheduleEvent>("/schedule-events", eventData);
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to create schedule event");
	}
});

// Update schedule event
export const updateScheduleEvent = createAsyncThunk<
	ScheduleEvent,
	UpdateScheduleEventPayload,
	{ rejectValue: string }
>(
	"schedule/updateEvent",
	async ({ id, ...updateData }, { rejectWithValue }) => {
		try {
			// API call using the API client
			return await put<ScheduleEvent>(`/schedule-events/${id}`, updateData);
		} catch (error: any) {
			return rejectWithValue(error.message || `Failed to update event ${id}`);
		}
	}
);

// Delete schedule event
export const deleteScheduleEvent = createAsyncThunk<
	string,
	string,
	{ rejectValue: string }
>("schedule/deleteEvent", async (eventId, { rejectWithValue }) => {
	try {
		// API call using the API client
		await del(`/schedule-events/${eventId}`);
		return eventId; // Return ID for removal from state
	} catch (error: any) {
		return rejectWithValue(
			error.message || `Failed to delete event ${eventId}`
		);
	}
});

// --- Initial State ---
const initialState: ScheduleState = {
	events: [],
	allEvents: [], // Initialize new state field
	currentScheduleEvent: null, // Initialize new state field
	status: "idle",
	operationStatus: "idle", // Initialize new state field
	operationError: null, // Initialize new state field
	error: null,
	viewStartDate: formatISO(startOfWeek(new Date(), { weekStartsOn: 1 }), {
		representation: "date",
	}),
	pagination: null, // Initialize new state field
};

// --- Slice Definition ---
const scheduleSlice = createSlice({
	name: "schedule",
	initialState,
	reducers: {
		setViewStartDate: (state, action: PayloadAction<string>) => {
			state.viewStartDate = action.payload.split("T")[0];
			state.status = "idle"; // Trigger refetch for week view
		},
		clearScheduleError: (state) => {
			state.error = null;
			state.operationError = null;
		}, // Clear both errors
		clearCurrentScheduleEvent: (state) => {
			state.currentScheduleEvent = null;
		},
		resetOperationStatus: (state) => {
			state.operationStatus = "idle";
			state.operationError = null;
		},
	},
	extraReducers: (builder) => {
		// Fetch Schedule (Week View)
		builder
			.addCase(fetchSchedule.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchSchedule.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.events = action.payload;
			})
			.addCase(fetchSchedule.rejected, (state, action) => {
				state.status = "failed";
				if (action.payload) {
					state.error = action.payload;
				}
				state.events = [];
			});

		// Fetch All Schedule Events (Manage View)
		builder
			.addCase(fetchAllScheduleEvents.pending, (state) => {
				state.status = "loading";
			}) // Reuse main status
			.addCase(fetchAllScheduleEvents.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.allEvents = action.payload.events;
				state.pagination = {
					// Store pagination info
					currentPage: action.payload.page,
					limit: action.payload.limit,
					totalEvents: action.payload.total,
					totalPages: action.payload.totalPages,
				};
			})
			.addCase(fetchAllScheduleEvents.rejected, (state, action) => {
				state.status = "failed";
				if (action.payload) {
					state.error = action.payload;
				}
				state.allEvents = [];
				state.pagination = null;
			});

		// Fetch Event By ID
		builder
			.addCase(fetchScheduleEventById.pending, (state) => {
				state.status = "loading";
				state.currentScheduleEvent = null;
			}) // Reuse main status
			.addCase(fetchScheduleEventById.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.currentScheduleEvent = action.payload;
			})
			.addCase(fetchScheduleEventById.rejected, (state, action) => {
				state.status = "failed";
				if (action.payload) {
					state.error = action.payload;
				}
			});

		// Create Event
		builder
			.addCase(createScheduleEvent.pending, (state) => {
				state.operationStatus = "loading";
				state.operationError = null;
			})
			.addCase(createScheduleEvent.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				state.allEvents.unshift(action.payload); // Add to manage list
				// TODO: Add to week view 'events' if applicable based on date range
			})
			.addCase(createScheduleEvent.rejected, (state, action) => {
				state.operationStatus = "failed";
				if (action.payload) {
					state.operationError = action.payload;
				}
			});

		// Update Event
		builder
			.addCase(updateScheduleEvent.pending, (state) => {
				state.operationStatus = "loading";
				state.operationError = null;
			})
			.addCase(updateScheduleEvent.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				const updatedEvent = action.payload;
				// Update in allEvents list
				const indexAll = state.allEvents.findIndex(
					(e) => e.id === updatedEvent.id
				);
				if (indexAll !== -1) state.allEvents[indexAll] = updatedEvent;
				// Update in week view events list
				const indexWeek = state.events.findIndex(
					(e) => e.id === updatedEvent.id
				);
				if (indexWeek !== -1) state.events[indexWeek] = updatedEvent;
				// Update current event if it's the one being edited
				if (state.currentScheduleEvent?.id === updatedEvent.id)
					state.currentScheduleEvent = updatedEvent;
			})
			.addCase(updateScheduleEvent.rejected, (state, action) => {
				state.operationStatus = "failed";
				if (action.payload) {
					state.operationError = action.payload;
				}
			});

		// Delete Event
		builder
			.addCase(deleteScheduleEvent.pending, (state) => {
				state.operationStatus = "loading";
				state.operationError = null;
			})
			.addCase(deleteScheduleEvent.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				const deletedId = action.payload;
				state.allEvents = state.allEvents.filter((e) => e.id !== deletedId);
				state.events = state.events.filter((e) => e.id !== deletedId);
				// Clear current event if it was the one deleted
				if (state.currentScheduleEvent?.id === deletedId)
					state.currentScheduleEvent = null;
			})
			.addCase(deleteScheduleEvent.rejected, (state, action) => {
				state.operationStatus = "failed";
				if (action.payload) {
					state.operationError = action.payload;
				}
			});
	},
});

// --- Actions and Selectors ---
export const {
	setViewStartDate,
	clearScheduleError,
	clearCurrentScheduleEvent,
	resetOperationStatus,
} = scheduleSlice.actions;

// Existing Selectors
export const selectScheduleEvents = (state: RootState) => state.schedule.events;
export const selectScheduleStatus = (state: RootState) => state.schedule.status;
export const selectScheduleError = (state: RootState) => state.schedule.error;
export const selectScheduleViewStartDate = (state: RootState) =>
	state.schedule.viewStartDate;

// New Selectors
export const selectAllScheduleEvents = (state: RootState) =>
	state.schedule.allEvents;
export const selectCurrentScheduleEvent = (state: RootState) =>
	state.schedule.currentScheduleEvent;
export const selectScheduleOperationStatus = (state: RootState) =>
	state.schedule.operationStatus;
export const selectScheduleOperationError = (state: RootState) =>
	state.schedule.operationError;
export const selectSchedulePagination = (state: RootState) =>
	state.schedule.pagination;

export default scheduleSlice.reducer;
