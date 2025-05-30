// features/schedule/store/schedule-slice.ts
import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/store";
// Ensure these types are correctly defined in schedule-types.ts
// ScheduleEvent should primarily use snake_case to match backend responses.
// Payloads for create/update should also use snake_case.
import type {
	ScheduleEvent,
	ScheduleState,
	CreateScheduleEventPayload as CreateScheduleEventPayloadType, // Assuming this is snake_case
	UpdateScheduleEventPayload as UpdateScheduleEventPayloadType, // Assuming this is snake_case
} from "../types/schedule-types";
import { startOfWeek, formatISO } from "date-fns";
import { get, post, put, del } from "@/lib/api-client"; // Your API client

// --- CUSTOM IMPORTS (Keep if needed, ensure they are correct) ---
import { updateAuthCourse } from "@/features/auth-course/store/auth-course-slice";
import { updateClass } from "@/features/classes/store/classes-thunks";
import type { UpdateClassPayload } from "@/features/classes/store/classes-thunks";

// --- Async Thunks (Restored to your simpler version) ---
interface FetchScheduleParams {
	role: string;
	userId?: string;
	startDate: string;
	endDate: string;
}
interface FetchAllEventsParams {
	page?: number;
	limit?: number;
	dateFrom?: string; // For query params, ensure they match backend expectations
	dateTo?: string;
	type?: string;
	courseId?: string;
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
			const params = new URLSearchParams();
			params.append("role", role);
			if (userId) params.append("userId", userId);
			params.append("startDate", startDate);
			params.append("endDate", endDate);
			// This assumes get<ScheduleEvent[]> directly returns the array
			return await get<ScheduleEvent[]>(`/schedule?${params.toString()}`);
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message ||
				error.message ||
				"Failed to fetch schedule";
			return rejectWithValue(errorMessage);
		}
	}
);

// Fetch all events for the management table
export const fetchAllScheduleEvents = createAsyncThunk<
	FetchAllEventsResult, // This is what the thunk should resolve with
	FetchAllEventsParams | void,
	{ rejectValue: string }
>("schedule/fetchAllEvents", async (queryParamsObj, { rejectWithValue }) => {
	try {
		const page = queryParamsObj?.page ?? 1;
		const limit = queryParamsObj?.limit ?? 10;
		const queryParams = new URLSearchParams();
		queryParams.append("page", page.toString());
		queryParams.append("limit", limit.toString());

		if (queryParamsObj?.dateFrom)
			queryParams.append("date_from", queryParamsObj.dateFrom);
		if (queryParamsObj?.dateTo)
			queryParams.append("date_to", queryParamsObj.dateTo);
		if (queryParamsObj?.type) queryParams.append("type", queryParamsObj.type);
		if (queryParamsObj?.courseId)
			queryParams.append("course_id", queryParamsObj.courseId);

		// YOUR API RESPONSE FOR THIS ENDPOINT IS: { success: true, data: { events: [], pagination: {} } }
		// The get<Type> needs to reflect what it *actually* returns if you want to type it.
		// If get implicitly handles unwrapping, Type can be FetchAllEventsResult.
		// If get returns the raw response, Type needs to be the raw response structure.

		// Assuming get<T> returns T (the unwrapped data if your client handles it,
		// or the raw response if it doesn't).
		// If get returns the raw object like { success: true, data: { events: ..., pagination: ...} },
		// then the type for get should be that raw structure.

		// Let's assume for now your `get` client is smart and unwraps `response.data` for you,
		// OR you have a generic type for the API response that includes the `data` wrapper.
		// Based on your initial code, it seems you were expecting `get<any>` and then processing.
		// Let's stick to that for this "revert" and then refine.
		const response = await get<any>(
			`/schedule-events?${queryParams.toString()}`
		);

		// THIS IS THE CRITICAL PART TO MATCH YOUR API RESPONSE
		if (
			response &&
			response.data &&
			Array.isArray(response.data.events) &&
			response.data.pagination
		) {
			const apiEvents = response.data.events;
			const apiPagination = response.data.pagination;
			return {
				events: apiEvents, // Should be ScheduleEvent[]
				total: apiPagination.total,
				page: apiPagination.page, // or current_page
				limit: apiPagination.limit, // or per_page
				totalPages: apiPagination.pages, // or last_page
			};
		}
		// Add fallbacks if the structure is slightly different but still valid
		else if (
			response &&
			Array.isArray(response.events) &&
			response.pagination
		) {
			// If data isn't nested
			return {
				events: response.events,
				total: response.pagination.total,
				page: response.pagination.page,
				limit: response.pagination.limit,
				totalPages: response.pagination.pages,
			};
		}

		console.warn(
			"fetchAllScheduleEvents: Unexpected response structure. Response:",
			response
		);
		return { events: [], total: 0, page: 1, limit: 10, totalPages: 0 }; // Fallback
	} catch (error: any) {
		const errorMessage =
			error.response?.data?.message ||
			error.message ||
			"Failed to fetch all schedule events";
		return rejectWithValue(errorMessage);
	}
});

// Fetch single event by ID
export const fetchScheduleEventById = createAsyncThunk<
	ScheduleEvent,
	string,
	{ rejectValue: string }
>("schedule/fetchEventById", async (eventId, { rejectWithValue }) => {
	try {
		// This assumes get<ScheduleEvent> directly returns the ScheduleEvent object
		// If it's wrapped like { success: true, data: ScheduleEvent }, this needs adjustment
		// const response = await get<{ data: ScheduleEvent }>(`/schedule-events/${eventId}`);
		// if (response && response.data) return response.data;
		// throw new Error("Invalid response for single event");
		return await get<ScheduleEvent>(`/schedule-events/${eventId}`); // Original simpler version
	} catch (error: any) {
		const errorMessage =
			error.response?.data?.message ||
			error.message ||
			`Failed to fetch event ${eventId}`;
		return rejectWithValue(errorMessage);
	}
});

// Create schedule event
export const createScheduleEvent = createAsyncThunk<
	ScheduleEvent,
	CreateScheduleEventPayloadType,
	{ dispatch: any; rejectValue: string }
>("schedule/createEvent", async (eventData, { dispatch, rejectWithValue }) => {
	try {
		console.log(
			"SCHEDULE_SLICE: Attempting to create schedule event with payload:",
			eventData
		);
		// Assumes `post` returns the created ScheduleEvent directly
		const newScheduleEvent = await post<ScheduleEvent>(
			"/schedule-events",
			eventData
		);

		if (!newScheduleEvent || !newScheduleEvent.id) {
			// Basic validation
			console.error(
				"SCHEDULE_SLICE: Failed to create schedule event. Invalid event object received from API.",
				newScheduleEvent
			);
			throw new Error(
				"Failed to create event: Invalid event object received from API"
			);
		}
		console.log(
			"SCHEDULE_SLICE: Schedule event created successfully:",
			newScheduleEvent
		);

		// --- CUSTOM LOGIC ---
		if (eventData.course_slug && eventData.class_id) {
			try {
				await dispatch(
					updateAuthCourse({
						courseSlug: eventData.course_slug,
						courseData: { classId: eventData.class_id } as any,
					})
				).unwrap();
			} catch (error: any) {
				console.error(
					`SCHEDULE_SLICE: Failed updateAuthCourse for ${eventData.course_slug}:`,
					error.message || error
				);
			}
		}
		if (eventData.class_id && eventData.course_id) {
			try {
				await dispatch(
					updateClass({ id: eventData.class_id, courseId: eventData.course_id })
				).unwrap();
			} catch (error: any) {
				console.error(
					`SCHEDULE_SLICE: Failed updateClass for ${eventData.class_id}:`,
					error.message || error
				);
			}
		}
		// --- END CUSTOM LOGIC ---
		return newScheduleEvent;
	} catch (error: any) {
		const errorMessage =
			error.response?.data?.message ||
			error.message ||
			"Failed to create schedule event";
		return rejectWithValue(errorMessage);
	}
});

// Update schedule event
export const updateScheduleEvent = createAsyncThunk<
	ScheduleEvent,
	UpdateScheduleEventPayloadType,
	{ dispatch: any; rejectValue: string }
>(
	"schedule/updateEvent",
	async (updatePayload, { dispatch, rejectWithValue }) => {
		try {
			const { id, ...payloadBody } = updatePayload;
			if (!id) {
				return rejectWithValue("Event ID is missing for update operation.");
			}
			console.log(
				`SCHEDULE_SLICE: Attempting to update schedule event ${id} with payload:`,
				payloadBody
			);
			// Assumes `put` returns the updated ScheduleEvent directly
			const updatedScheduleEvent = await put<ScheduleEvent>(
				`/schedule-events/${id}`,
				payloadBody
			);

			if (!updatedScheduleEvent || !updatedScheduleEvent.id) {
				// Basic validation
				console.error(
					`SCHEDULE_SLICE: Failed to update schedule event ${id}. Invalid event object received from API.`,
					updatedScheduleEvent
				);
				throw new Error(
					`Failed to update event ${id}: Invalid event object received from API`
				);
			}
			console.log(
				`SCHEDULE_SLICE: Schedule event ${id} updated successfully:`,
				updatedScheduleEvent
			);

			// --- CUSTOM LOGIC ---
			if (updatePayload.course_slug && updatePayload.class_id) {
				try {
					await dispatch(
						updateAuthCourse({
							courseSlug: updatePayload.course_slug,
							courseData: { classId: updatePayload.class_id } as any,
						})
					).unwrap();
				} catch (error: any) {
					console.error(
						`SCHEDULE_SLICE: Failed updateAuthCourse (event update) for ${updatePayload.course_slug}:`,
						error.message || error
					);
				}
			}
			if (updatePayload.class_id && updatePayload.course_id) {
				try {
					await dispatch(
						updateClass({
							id: updatePayload.class_id,
							courseId: updatePayload.course_id,
						})
					).unwrap();
				} catch (error: any) {
					console.error(
						`SCHEDULE_SLICE: Failed updateClass (event update) for ${updatePayload.class_id}:`,
						error.message || error
					);
				}
			}
			// --- END CUSTOM LOGIC ---
			return updatedScheduleEvent;
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message ||
				error.message ||
				`Failed to update event ${updatePayload.id}`;
			return rejectWithValue(errorMessage);
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
		// DELETE often returns 204 No Content or a simple success message
		await del(`/schedule-events/${eventId}`);
		return eventId;
	} catch (error: any) {
		const errorMessage =
			error.response?.data?.message ||
			error.message ||
			`Failed to delete event ${eventId}`;
		return rejectWithValue(errorMessage);
	}
});

// --- Initial State ---
const initialState: ScheduleState = {
	events: [],
	allEvents: [],
	currentScheduleEvent: null,
	status: "idle",
	operationStatus: "idle",
	operationError: null,
	error: null,
	viewStartDate: formatISO(startOfWeek(new Date(), { weekStartsOn: 1 }), {
		representation: "date",
	}),
	pagination: null,
};

// --- Slice Definition ---
const scheduleSlice = createSlice({
	name: "schedule",
	initialState,
	reducers: {
		setViewStartDate: (state, action: PayloadAction<string>) => {
			state.viewStartDate = action.payload.split("T")[0];
			state.status = "idle";
		},
		clearScheduleError: (state) => {
			state.error = null;
			state.operationError = null;
		},
		clearCurrentScheduleEvent: (state) => {
			state.currentScheduleEvent = null;
		},
		resetOperationStatus: (state) => {
			state.operationStatus = "idle";
			state.operationError = null;
		},
	},
	extraReducers: (builder) => {
		// (extraReducers remain the same as your "final fix" version,
		// they correctly handle the action.payload which should be the direct data type)
		const handlePending = (
			state: ScheduleState,
			forOperation: boolean = false
		) => {
			if (forOperation) {
				state.operationStatus = "loading";
				state.operationError = null;
			} else {
				state.status = "loading";
				state.error = null;
			}
		};
		const handleRejected = (
			state: ScheduleState,
			action: any,
			forOperation: boolean = false
		) => {
			const errorMsg = action.payload || "An unknown error occurred";
			if (forOperation) {
				state.operationStatus = "failed";
				state.operationError = errorMsg;
			} else {
				state.status = "failed";
				state.error = errorMsg;
			}
		};
		builder
			.addCase(fetchSchedule.pending, (state) => handlePending(state))
			.addCase(
				fetchSchedule.fulfilled,
				(state, action: PayloadAction<ScheduleEvent[]>) => {
					state.status = "succeeded";
					state.events = action.payload;
				}
			)
			.addCase(fetchSchedule.rejected, (state, action) =>
				handleRejected(state, action)
			);
		builder
			.addCase(fetchAllScheduleEvents.pending, (state) => handlePending(state))
			.addCase(
				fetchAllScheduleEvents.fulfilled,
				(state, action: PayloadAction<FetchAllEventsResult>) => {
					state.status = "succeeded";
					state.allEvents = action.payload.events;
					state.pagination = {
						currentPage: action.payload.page,
						limit: action.payload.limit,
						totalEvents: action.payload.total,
						totalPages: action.payload.totalPages,
					};
				}
			)
			.addCase(fetchAllScheduleEvents.rejected, (state, action) =>
				handleRejected(state, action)
			);
		builder
			.addCase(fetchScheduleEventById.pending, (state) => {
				handlePending(state);
				state.currentScheduleEvent = null;
			})
			.addCase(
				fetchScheduleEventById.fulfilled,
				(state, action: PayloadAction<ScheduleEvent>) => {
					state.status = "succeeded";
					state.currentScheduleEvent = action.payload;
				}
			)
			.addCase(fetchScheduleEventById.rejected, (state, action) =>
				handleRejected(state, action)
			);
		builder
			.addCase(createScheduleEvent.pending, (state) =>
				handlePending(state, true)
			)
			.addCase(
				createScheduleEvent.fulfilled,
				(state, action: PayloadAction<ScheduleEvent>) => {
					state.operationStatus = "succeeded";
					state.allEvents.unshift(action.payload);
					state.currentScheduleEvent = action.payload;
				}
			)
			.addCase(createScheduleEvent.rejected, (state, action) =>
				handleRejected(state, action, true)
			);
		builder
			.addCase(updateScheduleEvent.pending, (state) =>
				handlePending(state, true)
			)
			.addCase(
				updateScheduleEvent.fulfilled,
				(state, action: PayloadAction<ScheduleEvent>) => {
					state.operationStatus = "succeeded";
					const updatedEvent = action.payload;
					const findAndUpdate = (list: ScheduleEvent[]) => {
						const index = list.findIndex((e) => e.id === updatedEvent.id);
						if (index !== -1) list[index] = updatedEvent;
					};
					findAndUpdate(state.allEvents);
					findAndUpdate(state.events);
					if (state.currentScheduleEvent?.id === updatedEvent.id) {
						state.currentScheduleEvent = updatedEvent;
					}
				}
			)
			.addCase(updateScheduleEvent.rejected, (state, action) =>
				handleRejected(state, action, true)
			);
		builder
			.addCase(deleteScheduleEvent.pending, (state) =>
				handlePending(state, true)
			)
			.addCase(
				deleteScheduleEvent.fulfilled,
				(state, action: PayloadAction<string>) => {
					state.operationStatus = "succeeded";
					const deletedId = action.payload;
					const filterOut = (list: ScheduleEvent[]) =>
						list.filter((e) => e.id !== deletedId);
					state.allEvents = filterOut(state.allEvents);
					state.events = filterOut(state.events);
					if (state.currentScheduleEvent?.id === deletedId) {
						state.currentScheduleEvent = null;
					}
				}
			)
			.addCase(deleteScheduleEvent.rejected, (state, action) =>
				handleRejected(state, action, true)
			);
	},
});

// --- Actions and Selectors ---
export const {
	setViewStartDate,
	clearScheduleError,
	clearCurrentScheduleEvent,
	resetOperationStatus,
} = scheduleSlice.actions;

export const selectScheduleEvents = (state: RootState) => state.schedule.events;
export const selectScheduleViewStartDate = (state: RootState) =>
	state.schedule.viewStartDate;
export const selectAllScheduleEvents = (state: RootState) =>
	state.schedule.allEvents;
export const selectCurrentScheduleEvent = (state: RootState) =>
	state.schedule.currentScheduleEvent;
export const selectSchedulePagination = (state: RootState) =>
	state.schedule.pagination;
export const selectScheduleStatus = (state: RootState) => state.schedule.status;
export const selectScheduleError = (state: RootState) => state.schedule.error;
export const selectScheduleOperationStatus = (state: RootState) =>
	state.schedule.operationStatus;
export const selectScheduleOperationError = (state: RootState) =>
	state.schedule.operationError;

export default scheduleSlice.reducer;
