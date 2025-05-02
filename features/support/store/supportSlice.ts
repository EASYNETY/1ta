// features/support/store/supportSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
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

// Import mocks (replace with API client later)
import {
	mockFetchMyTickets,
	mockFetchAllTickets,
	mockFetchTicketById,
	mockCreateTicket,
	mockAddTicketResponse,
	mockSubmitFeedback,
	mockFetchAllFeedback,
} from "@/data/mock-support-data";

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
	async ({ userId, page, limit }, { rejectWithValue }) => {
		try {
			return await mockFetchMyTickets(userId, page, limit);
		} catch (e: any) {
			return rejectWithValue(e.message);
		}
	}
);

interface FetchAllTicketsParams {
	status?: TicketStatus;
	page?: number;
	limit?: number;
}
export const fetchAllTickets = createAsyncThunk<
	{ tickets: SupportTicket[]; total: number },
	FetchAllTicketsParams,
	{ rejectValue: string }
>(
	"support/fetchAllTickets",
	async ({ status, page, limit }, { rejectWithValue }) => {
		try {
			return await mockFetchAllTickets(status, page, limit);
		} catch (e: any) {
			return rejectWithValue(e.message);
		}
	}
);

// Fetch single ticket detail (including responses)
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
			return await mockFetchTicketById(ticketId, userId, role);
		} catch (e: any) {
			return rejectWithValue(e.message);
		}
	}
);

// Create a new ticket
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
			return await mockCreateTicket(userId, payload);
		} catch (e: any) {
			return rejectWithValue(e.message);
		}
	}
);

// Add a response to a ticket
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
	async ({ senderId, senderRole, ...payload }, { rejectWithValue }) => {
		try {
			return await mockAddTicketResponse(payload, senderId, senderRole);
		} catch (e: any) {
			return rejectWithValue(e.message);
		}
	}
);

// Submit Feedback
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
			return await mockSubmitFeedback(userId, payload);
		} catch (e: any) {
			return rejectWithValue(e.message);
		}
	}
);

// Fetch All Feedback (Admin)
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
	async ({ type, page, limit }, { rejectWithValue }) => {
		try {
			return await mockFetchAllFeedback(type, page, limit);
		} catch (e: any) {
			return rejectWithValue(e.message);
		}
	}
);

// --- Initial State ---
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

// --- Slice ---
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
		// Fetch My Tickets
		builder
			.addCase(fetchMyTickets.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchMyTickets.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.myTickets =
					action.payload.tickets; /* TODO: Handle pagination if needed */
			})
			.addCase(fetchMyTickets.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Error";
			});

		// Fetch All Tickets (Admin)
		builder
			.addCase(fetchAllTickets.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchAllTickets.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.allTickets = action.payload.tickets;
				// state.adminTicketPagination = { ... }; // Update pagination
			})
			.addCase(fetchAllTickets.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Error";
			});

		// Fetch Ticket By ID
		builder
			.addCase(fetchTicketById.pending, (state) => {
				state.ticketStatus = "loading";
				state.error = null;
			}) // Use ticketStatus
			.addCase(fetchTicketById.fulfilled, (state, action) => {
				state.ticketStatus = "succeeded";
				state.currentTicket = action.payload;
			})
			.addCase(fetchTicketById.rejected, (state, action) => {
				state.ticketStatus = "failed";
				state.error = action.payload ?? "Error";
			});

		// Create Ticket
		builder
			.addCase(createTicket.pending, (state) => {
				state.createStatus = "loading";
				state.error = null;
			})
			.addCase(createTicket.fulfilled, (state, action) => {
				state.createStatus = "succeeded";
				state.myTickets.unshift(action.payload); // Add to start of user's list
				// Also add to admin list if already fetched?
				if (state.allTickets.length > 0)
					state.allTickets.unshift(action.payload);
			})
			.addCase(createTicket.rejected, (state, action) => {
				state.createStatus = "failed";
				state.error = action.payload ?? "Error";
			});

		// Add Ticket Response
		builder
			.addCase(addTicketResponse.pending, (state) => {
				state.createStatus = "loading";
				state.error = null;
			}) // Use createStatus
			.addCase(addTicketResponse.fulfilled, (state, action) => {
				state.createStatus = "succeeded";
				// Add response to the currentTicket if loaded
				if (
					state.currentTicket &&
					state.currentTicket.id === action.payload.ticketId
				) {
					if (!state.currentTicket.responses)
						state.currentTicket.responses = [];
					state.currentTicket.responses.push(action.payload);
					state.currentTicket.status = "in_progress"; // Example status update
					state.currentTicket.updatedAt = action.payload.createdAt;
				}
				// Also update the list views potentially
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

		// Submit Feedback
		builder
			.addCase(submitFeedback.pending, (state) => {
				state.createStatus = "loading";
				state.error = null;
			})
			.addCase(submitFeedback.fulfilled, (state) => {
				state.createStatus = "succeeded"; /* Maybe clear form? */
			})
			.addCase(submitFeedback.rejected, (state, action) => {
				state.createStatus = "failed";
				state.error = action.payload ?? "Error submitting feedback";
			});

		// Fetch All Feedback (Admin)
		builder
			.addCase(fetchAllFeedback.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchAllFeedback.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.allFeedback = action.payload.feedback;
				// state.adminFeedbackPagination = { ... }; // Update pagination
			})
			.addCase(fetchAllFeedback.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Error";
			});
	},
});

// --- Actions & Selectors ---
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
