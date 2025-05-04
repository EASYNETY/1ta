// features/schedule/store/schedule-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
// Import ScheduleState which now includes the new fields
import {
	ScheduleEvent,
	ScheduleState,
	ScheduleEventType,
} from "../types/schedule-types";
import { startOfWeek, formatISO, parseISO, isValid } from "date-fns";
import { get, post, put, del } from "@/lib/api-client"; // Import CRUD methods

// Import mock functions
import {
	getMockSchedule, // Keep for week view
	createMockScheduleEvent, // NEW MOCK
	getMockScheduleEventById, // NEW MOCK
	updateMockScheduleEvent, // NEW MOCK
	deleteMockScheduleEvent, // NEW MOCK
	getAllMockScheduleEvents, // NEW MOCK (for list view)
} from "@/data/mock-schedule-data"; // Adjust path

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
	limit?: number /* Add filters: dateFrom?, dateTo?, type?, courseId? */;
}
interface FetchAllEventsResult {
	events: ScheduleEvent[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// Keep fetchSchedule for the week/calendar view
export const fetchSchedule = createAsyncThunk<
	ScheduleEvent[],
	FetchScheduleParams,
	{ state: RootState; rejectValue: string }
>(
	"schedule/fetchSchedule" /* ... implementation as before ... */,
	async ({ role, userId, startDate, endDate }, { rejectWithValue }) => {
		try {
			console.log(`Fetching schedule from ${startDate} to ${endDate}`);
			// API: return await get<ScheduleEvent[]>(`/schedule?role=${role}&userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
			const allMockEvents = await getMockSchedule(role, userId);
			const start = parseISO(startDate);
			const end = parseISO(endDate);
			const filteredEvents = allMockEvents.filter((event) => {
				try {
					const eventDate = parseISO(event.startTime);
					return isValid(eventDate) && eventDate >= start && eventDate <= end;
				} catch {
					return false;
				}
			});
			return filteredEvents;
		} catch (error: any) {
			return rejectWithValue(error.message || "Failed to fetch schedule");
		}
	}
);

// NEW: Fetch *all* events for the management table
export const fetchAllScheduleEvents = createAsyncThunk<
	FetchAllEventsResult,
	FetchAllEventsParams | void,
	{ rejectValue: string } // Params are optional
>("schedule/fetchAllEvents", async (params, { rejectWithValue }) => {
	try {
		const page = params?.page ?? 1;
		const limit = params?.limit ?? 10;
		// API Call: const result = await get<FetchAllEventsResult>(`/schedule-events?page=${page}&limit=${limit}`); return result;
		const { events, total } = await getAllMockScheduleEvents(
			page,
			limit /* pass filters */
		);
		const totalPages = Math.ceil(total / limit);
		return { events, total, page, limit, totalPages };
	} catch (error: any) {
		return rejectWithValue(
			error.message || "Failed to fetch all schedule events"
		);
	}
});

// NEW: Fetch Single Event by ID
export const fetchScheduleEventById = createAsyncThunk<
	ScheduleEvent,
	string,
	{ rejectValue: string }
>("schedule/fetchEventById", async (eventId, { rejectWithValue }) => {
	try {
		// API Call: return await get<ScheduleEvent>(`/schedule-events/${eventId}`);
		return await getMockScheduleEventById(eventId);
	} catch (error: any) {
		return rejectWithValue(error.message || `Failed to fetch event ${eventId}`);
	}
});

// NEW: Create Schedule Event
export const createScheduleEvent = createAsyncThunk<
	ScheduleEvent,
	CreateScheduleEventPayload,
	{ rejectValue: string }
>("schedule/createEvent", async (eventData, { rejectWithValue }) => {
	try {
		// API Call: return await post<ScheduleEvent>('/schedule-events', eventData);
		return await createMockScheduleEvent(eventData);
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to create schedule event");
	}
});

// NEW: Update Schedule Event
export const updateScheduleEvent = createAsyncThunk<
	ScheduleEvent,
	UpdateScheduleEventPayload,
	{ rejectValue: string }
>(
	"schedule/updateEvent",
	async ({ id, ...updateData }, { rejectWithValue }) => {
		try {
			// API Call: return await put<ScheduleEvent>(`/schedule-events/${id}`, updateData);
			return await updateMockScheduleEvent(id, updateData);
		} catch (error: any) {
			return rejectWithValue(error.message || `Failed to update event ${id}`);
		}
	}
);

// NEW: Delete Schedule Event
export const deleteScheduleEvent = createAsyncThunk<
	string,
	string,
	{ rejectValue: string }
>("schedule/deleteEvent", async (eventId, { rejectWithValue }) => {
	try {
		// API Call: await del<void>(`/schedule-events/${eventId}`);
		await deleteMockScheduleEvent(eventId);
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
