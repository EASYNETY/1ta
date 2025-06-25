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
import { get, post, put } from "@/lib/api-client";

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
	FetchAllTicketsThunkResponse,
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
			const apiClientResponse = await get<any>(
				`/admin/support-tickets?${params.toString()}`
			);
			const tickets: SupportTicket[] = [];
			let pagination: FetchAllTicketsThunkResponse["pagination"] = {
				total: 0,
				page: 1,
				limit: 10,
				pages: 1,
			};
			if (apiClientResponse && typeof apiClientResponse === "object") {
				if (apiClientResponse.pagination) {
					pagination = apiClientResponse.pagination;
				}
				Object.keys(apiClientResponse).forEach((key) => {
					if (!isNaN(parseInt(key, 10))) {
						tickets.push(apiClientResponse[key]);
					}
				});
			}
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
				senderRole === "admin" || senderRole === "super_admin"
					? `/admin/support-tickets/${ticketId}/responses`
					: `/support/my-tickets/${ticketId}/responses`;
			return await post<TicketResponse>(endpoint, { message });
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to add response");
		}
	}
);

interface UpdateTicketStatusPayload {
    ticketId: string;
    status: TicketStatus;
}
export const updateTicketStatus = createAsyncThunk<
    SupportTicket, 
    UpdateTicketStatusPayload,
    { rejectValue: string }
>(
    "support/updateTicketStatus",
    async ({ ticketId, status }, { rejectWithValue }) => {
        try {
            const updatedTicket = await put<SupportTicket>(
                `/admin/support-tickets/${ticketId}/status`, 
                { status }
            );
            return updatedTicket;
        } catch (e: any) {
            return rejectWithValue(e.message || "Failed to update ticket status");
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

		builder
			.addCase(fetchAllTickets.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchAllTickets.fulfilled, (state, action) => {
				state.status = "succeeded";
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
				const newResponse = action.payload;
				if (
					state.currentTicket &&
					state.currentTicket.id === newResponse.ticketId
				) {
					const updatedResponses = [
						...(state.currentTicket.responses || []),
						newResponse,
					];
					state.currentTicket = {
						...state.currentTicket,
						responses: updatedResponses,
						updatedAt: newResponse.createdAt,
					};
				}
				const updateTicketInList = (ticket: SupportTicket) => {
					if (ticket.id === newResponse.ticketId) {
						return {
							...ticket,
							updatedAt: newResponse.createdAt,
						};
					}
					return ticket;
				};
				if (Array.isArray(state.myTickets)) {
					state.myTickets = state.myTickets.map(updateTicketInList);
				}
				if (Array.isArray(state.allTickets)) {
					state.allTickets = state.allTickets.map(updateTicketInList);
				}
			})
			.addCase(addTicketResponse.rejected, (state, action) => {
				state.createStatus = "failed";
				state.error = action.payload ?? "Error";
			});

        builder
            .addCase(updateTicketStatus.pending, (state) => {
                state.ticketStatus = "loading";
                state.error = null;
            })
            .addCase(updateTicketStatus.fulfilled, (state, action) => {
                state.ticketStatus = "succeeded";
                const updatedTicket = action.payload;
                if (state.currentTicket && state.currentTicket.id === updatedTicket.id) {
                    state.currentTicket = updatedTicket;
                }
                if (Array.isArray(state.allTickets)) {
                    state.allTickets = state.allTickets.map(ticket => 
                        ticket.id === updatedTicket.id ? updatedTicket : ticket
                    );
                }
                if (Array.isArray(state.myTickets)) {
                    state.myTickets = state.myTickets.map(ticket => 
                        ticket.id === updatedTicket.id ? updatedTicket : ticket
                    );
                }
            })
            .addCase(updateTicketStatus.rejected, (state, action) => {
                state.ticketStatus = "failed";
                state.error = action.payload ?? "Failed to update status";
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