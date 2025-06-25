// features/support/store/supportSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
	SupportState,
	SupportTicket,
	TicketResponse,
	FeedbackRecord,
	CreateTicketPayload,
	SubmitFeedbackPayload,
	AddTicketResponsePayload,
	FeedbackType,
	TicketStatus,
} from "../types/support-types";
import { get, post } from "@/lib/api-client";

// --- Async Thunks ---

// Fetch tickets (distinguish between user's and admin's all)
interface FetchTicketsParams {
	userId: string;
	page?: number;
	limit?: number;
}
export const fetchMyTickets = createAsyncThunk<
	{ tickets: SupportTicket[]; total: number },
	FetchTicketsParams,
	{ rejectValue: string }
>(
	"support/fetchMyTickets",
	async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page.toString());
			params.append("limit", limit.toString());
			return await get<{ tickets: SupportTicket[]; total: number }>(
				`/support/my-tickets?${params.toString()}`
			);
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to fetch tickets");
		}
	}
);

interface FetchAllTicketsParams {
	status?: TicketStatus;
	page?: number;
	limit?: number;
}

// VVVV --- THIS THUNK IS THE MAIN FIX --- VVVV
// The generic type for what the thunk itself returns to the reducer
interface FetchAllTicketsThunkResponse {
	tickets: SupportTicket[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		pages: number;
	};
}

export const fetchAllTickets = createAsyncThunk<
	FetchAllTicketsThunkResponse, // <--- This is what we return
	FetchAllTicketsParams,
	{ rejectValue: string }
>(
	"support/fetchAllTickets",
	async ({ status, page = 1, limit = 10 }, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			if (status) params.append("status", status);
			params.append("page", page.toString());
			params.append("limit", limit.toString());

			// The `get` function returns the quirky object from api-client
			const apiClientResponse = await get<any>(
				`/admin/support-tickets?${params.toString()}`
			);

			// --- DATA TRANSFORMATION LOGIC ---
			// This is where we fix the data shape.
			const tickets: SupportTicket[] = [];
			let pagination: FetchAllTicketsThunkResponse["pagination"] = {
				total: 0,
				page: 1,
				limit: 10,
				pages: 1,
			};

			if (apiClientResponse && typeof apiClientResponse === "object") {
				// Extract the pagination object first
				if (apiClientResponse.pagination) {
					pagination = apiClientResponse.pagination;
				}

				// Iterate over the keys of the response object to find the ticket items
				Object.keys(apiClientResponse).forEach((key) => {
					// Check if the key is a number (which is how arrays get spread into objects)
					if (!isNaN(parseInt(key, 10))) {
						tickets.push(apiClientResponse[key]);
					}
				});
			}

			// Return the correctly structured payload
			return { tickets, pagination };
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to fetch all tickets");
		}
	}
);

interface FetchTicketByIdParams {
	ticketId: string;
	userId: string;
	role: string;
}
export const fetchTicketById = createAsyncThunk<
	SupportTicket | null,
	FetchTicketByIdParams,
	{ rejectValue: string }
>(
	"support/fetchTicketById",
	async ({ ticketId, userId, role }, { rejectWithValue }) => {
		try {
			const endpoint =
				role !== "student"
					? `/admin/support-tickets/${ticketId}`
					: `/support/my-tickets/${ticketId}`;
			return await get<SupportTicket | null>(endpoint);
		} catch (e: any) {
			return rejectWithValue(e.message || `Failed to fetch ticket ${ticketId}`);
		}
	}
);

interface CreateTicketThunkPayload extends CreateTicketPayload {
	userId: string;
}
export const createTicket = createAsyncThunk<
	SupportTicket,
	CreateTicketThunkPayload,
	{ rejectValue: string }
>(
	"support/createTicket",
	async ({ userId, ...payload }, { rejectWithValue }) => {
		try {
			return await post<SupportTicket>("/support/ticket", payload);
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to create ticket");
		}
	}
);

interface AddResponseThunkPayload extends AddTicketResponsePayload {
	senderId: string;
	senderRole: string;
}
export const addTicketResponse = createAsyncThunk<
	TicketResponse,
	AddResponseThunkPayload,
	{ rejectValue: string }
>(
	"support/addResponse",
	async ({ senderId, senderRole, ticketId, message }, { rejectWithValue }) => {
		try {
			const endpoint =
				senderRole === "admin"
					? `/admin/support-tickets/${ticketId}/responses`
					: `/support/my-tickets/${ticketId}/responses`;
			return await post<TicketResponse>(endpoint, { message });
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to add response");
		}
	}
);

interface SubmitFeedbackThunkPayload extends SubmitFeedbackPayload {
	userId: string;
}
export const submitFeedback = createAsyncThunk<
	{ success: boolean },
	SubmitFeedbackThunkPayload,
	{ rejectValue: string }
>(
	"support/submitFeedback",
	async ({ userId, ...payload }, { rejectWithValue }) => {
		try {
			return await post<{ success: boolean }>("/support/feedback", payload);
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to submit feedback");
		}
	}
);

interface FetchAllFeedbackParams {
	type?: FeedbackType;
	page?: number;
	limit?: number;
}
export const fetchAllFeedback = createAsyncThunk<
	{ feedback: FeedbackRecord[]; total: number },
	FetchAllFeedbackParams,
	{ rejectValue: string }
>(
	"support/fetchAllFeedback",
	async ({ type, page = 1, limit = 10 }, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			if (type) params.append("type", type);
			params.append("page", page.toString());
			params.append("limit", limit.toString());
			return await get<{ feedback: FeedbackRecord[]; total: number }>(
				`/admin/feedback?${params.toString()}`
			);
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to fetch feedback");
		}
	}
);

const initialState: SupportState = {
	myTickets: [],
	allTickets: [],
	currentTicket: null,
	allFeedback: [],
	status: "idle",
	ticketStatus: "idle",
	createStatus: "idle",
	error: null,
	adminTicketPagination: null,
	adminFeedbackPagination: null,
};

const supportSlice = createSlice({
	name: "support",
	initialState,
	reducers: {
		clearSupportError: (state) => {
			state.error = null;
		},
		clearCurrentTicket: (state) => {
			state.currentTicket = null;
			state.ticketStatus = "idle";
		},
		resetCreateStatus: (state) => {
			state.createStatus = "idle";
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchMyTickets.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchMyTickets.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.myTickets = action.payload.tickets;
			})
			.addCase(fetchMyTickets.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Error";
			});

		// VVVV --- THIS REDUCER IS THE OTHER MAIN FIX --- VVVV
		builder
			.addCase(fetchAllTickets.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchAllTickets.fulfilled, (state, action) => {
				state.status = "succeeded";
				// The payload from our thunk now has the correct shape
				state.allTickets = action.payload.tickets;
				state.adminTicketPagination = {
					totalItems: action.payload.pagination.total,
					currentPage: action.payload.pagination.page,
					totalPages: action.payload.pagination.pages,
					limit: action.payload.pagination.limit,
				};
			})
			.addCase(fetchAllTickets.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Error";
			});

		builder
			.addCase(fetchTicketById.pending, (state) => {
				state.ticketStatus = "loading";
				state.error = null;
			})
			.addCase(fetchTicketById.fulfilled, (state, action) => {
				state.ticketStatus = "succeeded";
				state.currentTicket = action.payload;
			})
			.addCase(fetchTicketById.rejected, (state, action) => {
				state.ticketStatus = "failed";
				state.error = action.payload ?? "Error";
			});

		builder
			.addCase(createTicket.pending, (state) => {
				state.createStatus = "loading";
				state.error = null;
			})
			.addCase(createTicket.fulfilled, (state, action) => {
				state.createStatus = "succeeded";
				state.myTickets.unshift(action.payload);
				if (state.allTickets.length > 0)
					state.allTickets.unshift(action.payload);
			})
			.addCase(createTicket.rejected, (state, action) => {
				state.createStatus = "failed";
				state.error = action.payload ?? "Error";
			});

		builder
			.addCase(addTicketResponse.pending, (state) => {
				state.createStatus = "loading";
				state.error = null;
			})
			.addCase(addTicketResponse.fulfilled, (state, action) => {
				state.createStatus = "succeeded";
				if (
					state.currentTicket &&
					state.currentTicket.id === action.payload.ticketId
				) {
					if (!state.currentTicket.responses)
						state.currentTicket.responses = [];
					state.currentTicket.responses.push(action.payload);
					state.currentTicket.status = "in_progress";
					state.currentTicket.updatedAt = action.payload.createdAt;
				}
				const updateTicketList = (list: SupportTicket[]) =>
					list.map((t) =>
						t.id === action.payload.ticketId
							? {
									...t,
									status: "in_progress" as TicketStatus,
									updatedAt: action.payload.createdAt,
								}
							: t
					);
				state.myTickets = updateTicketList(state.myTickets);
				state.allTickets = updateTicketList(state.allTickets);
			})
			.addCase(addTicketResponse.rejected, (state, action) => {
				state.createStatus = "failed";
				state.error = action.payload ?? "Error";
			});

		builder
			.addCase(submitFeedback.pending, (state) => {
				state.createStatus = "loading";
				state.error = null;
			})
			.addCase(submitFeedback.fulfilled, (state) => {
				state.createStatus = "succeeded";
			})
			.addCase(submitFeedback.rejected, (state, action) => {
				state.createStatus = "failed";
				state.error = action.payload ?? "Error submitting feedback";
			});

		builder
			.addCase(fetchAllFeedback.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchAllFeedback.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.allFeedback = action.payload.feedback;
			})
			.addCase(fetchAllFeedback.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Error";
			});
	},
});

export const { clearSupportError, clearCurrentTicket, resetCreateStatus } =
	supportSlice.actions;

export const selectMyTickets = (state: RootState) => state.support.myTickets;
export const selectAllTickets = (state: RootState) => state.support.allTickets;
export const selectCurrentTicket = (state: RootState) =>
	state.support.currentTicket;
export const selectAllFeedback = (state: RootState) =>
	state.support.allFeedback;
export const selectSupportStatus = (state: RootState) => state.support.status;
export const selectTicketStatus = (state: RootState) =>
	state.support.ticketStatus;
export const selectSupportCreateStatus = (state: RootState) =>
	state.support.createStatus;
export const selectSupportError = (state: RootState) => state.support.error;
export const selectAdminTicketPagination = (state: RootState) =>
	state.support.adminTicketPagination;
export const selectAdminFeedbackPagination = (state: RootState) =>
	state.support.adminFeedbackPagination;

export default supportSlice.reducer;
