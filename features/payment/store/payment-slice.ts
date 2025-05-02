// features/payment/store/paymentHistorySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
	PaymentHistoryState,
	PaymentRecord,
} from "../types/payment-types"; // Use correct types

// Import mocks (Replace with API client later)
import {
	mockFetchMyPaymentHistory,
	mockFetchAllPaymentsAdmin,
} from "@/data/mock-payment-data"; // Adjust path

// --- Thunks ---
interface FetchMyHistoryParams {
	userId: string;
	page?: number;
	limit?: number;
}
export const fetchMyPaymentHistory = createAsyncThunk<
	{ payments: PaymentRecord[]; total: number },
	FetchMyHistoryParams,
	{ rejectValue: string }
>(
	"paymentHistory/fetchMy",
	async ({ userId, page, limit }, { rejectWithValue }) => {
		try {
			// TODO: Replace with real API call: await get(`/payments/history?userId=${userId}&page=${page}&limit=${limit}`)
			return await mockFetchMyPaymentHistory(userId, page, limit);
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to fetch payment history");
		}
	}
);

interface FetchAllHistoryParams {
	status?: PaymentRecord["status"];
	page?: number;
	limit?: number;
	search?: string;
}
export const fetchAllPaymentsAdmin = createAsyncThunk<
	{ payments: PaymentRecord[]; total: number },
	FetchAllHistoryParams,
	{ rejectValue: string }
>(
	"paymentHistory/fetchAllAdmin",
	async ({ status, page, limit, search }, { rejectWithValue }) => {
		try {
			// TODO: Replace with real API call: await get(`/admin/payments?status=${status}&page=${page}&limit=${limit}&search=${search}`)
			return await mockFetchAllPaymentsAdmin(status, page, limit, search);
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to fetch all payments");
		}
	}
);

// --- Initial State ---
const initialState: PaymentHistoryState = {
	myPayments: [],
	allPayments: [],
	status: "idle",
	error: null,
	adminPagination: null,
	myPaymentsPagination: null, // Initialize if using
};

// --- Slice ---
const paymentHistorySlice = createSlice({
	name: "paymentHistory",
	initialState,
	reducers: {
		clearPaymentHistoryError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// Fetch My History
		builder
			.addCase(fetchMyPaymentHistory.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchMyPaymentHistory.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.myPayments = action.payload.payments;
				// Update my pagination state
				const limit = action.meta.arg.limit || 10;
				state.myPaymentsPagination = {
					totalItems: action.payload.total,
					limit: limit,
					currentPage: action.meta.arg.page || 1,
					totalPages: Math.ceil(action.payload.total / limit),
				};
			})
			.addCase(fetchMyPaymentHistory.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Error fetching payments";
			});

		// Fetch All Admin History
		builder
			.addCase(fetchAllPaymentsAdmin.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchAllPaymentsAdmin.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.allPayments = action.payload.payments;
				// Update admin pagination state
				const limit = action.meta.arg.limit || 10;
				state.adminPagination = {
					totalItems: action.payload.total,
					limit: limit,
					currentPage: action.meta.arg.page || 1,
					totalPages: Math.ceil(action.payload.total / limit),
				};
			})
			.addCase(fetchAllPaymentsAdmin.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Error fetching all payments";
			});
	},
});

// --- Actions & Selectors ---
export const { clearPaymentHistoryError } = paymentHistorySlice.actions;

export const selectMyPayments = (state: RootState) =>
	state.paymentHistory.myPayments;
export const selectAllAdminPayments = (state: RootState) =>
	state.paymentHistory.allPayments;
export const selectPaymentHistoryStatus = (state: RootState) =>
	state.paymentHistory.status;
export const selectPaymentHistoryError = (state: RootState) =>
	state.paymentHistory.error;
export const selectAdminPaymentsPagination = (state: RootState) =>
	state.paymentHistory.adminPagination;
export const selectMyPaymentsPagination = (state: RootState) =>
	state.paymentHistory.myPaymentsPagination;

export default paymentHistorySlice.reducer;
