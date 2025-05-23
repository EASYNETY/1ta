// features/payment/store/payment-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
	PaymentHistoryState,
	PaymentRecord,
	InitiatePaymentPayload,
	PaymentResponse,
	VerifyPaymentResponse
} from "../types/payment-types";
import { get, post } from "@/lib/api-client";

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
	async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
		try {
			const response = await get<{
				success: boolean;
				data: {
					payments: PaymentRecord[];
					pagination: {
						total: number;
						page: number;
						limit: number;
						totalPages: number;
					}
				}
			}>(`/payments/user/history?page=${page}&limit=${limit}`);

			if (!response.success) {
				throw new Error(response.data ? 'Server error' : 'Failed to fetch payment history');
			}

			return {
				payments: response.data.payments,
				total: response.data.pagination.total
			};
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
	async ({ status, page = 1, limit = 10, search }, { rejectWithValue }) => {
		try {
			let queryParams = `page=${page}&limit=${limit}`;
			if (status) queryParams += `&status=${status}`;
			if (search) queryParams += `&search=${search}`;

			const response = await get<{
				success: boolean;
				data: {
					payments: PaymentRecord[];
					pagination: {
						total: number;
						page: number;
						limit: number;
						totalPages: number;
					}
				}
			}>(`/payments?${queryParams}`);

			if (!response.success) {
				throw new Error(response.data ? 'Server error' : 'Failed to fetch payments');
			}

			return {
				payments: response.data.payments,
				total: response.data.pagination.total
			};
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to fetch all payments");
		}
	}
);

// Initialize payment with Paystack
export const initiatePayment = createAsyncThunk<
	PaymentResponse,
	InitiatePaymentPayload,
	{ rejectValue: string }
>(
	"payment/initiate",
	async (payload, { rejectWithValue }) => {
		try {
			const response = await post<{
				success: boolean;
				message: string;
				data: {
					payment: PaymentRecord;
					authorizationUrl: string;
				}
			}>('/payments/initialize', payload);

			if (!response.success) {
				throw new Error(response.message || 'Failed to initialize payment');
			}

			return response.data;
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to initialize payment");
		}
	}
);

// Verify payment with Paystack
export const verifyPayment = createAsyncThunk<
	VerifyPaymentResponse,
	{ reference: string },
	{ rejectValue: string }
>(
	"payment/verify",
	async ({ reference }, { rejectWithValue }) => {
		try {
			const response = await get<{
				success: boolean;
				message: string;
				data: {
					payment: PaymentRecord;
					verification: any;
				}
			}>(`/payments/verify/${reference}`);

			if (!response.success) {
				throw new Error(response.message || 'Failed to verify payment');
			}

			return response.data;
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to verify payment");
		}
	}
);

// Fetch a single payment by ID
export const fetchPaymentById = createAsyncThunk<
	PaymentRecord,
	string,
	{ rejectValue: string }
>(
	"payment/fetchById",
	async (paymentId, { rejectWithValue }) => {
		try {
			const response = await get<{
				success: boolean;
				message: string;
				data: PaymentRecord;
			}>(`/payments/${paymentId}`);

			if (!response.success) {
				throw new Error(response.message || 'Failed to fetch payment');
			}

			return response.data;
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to fetch payment details");
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
	myPaymentsPagination: null,
	currentPayment: null,
	paymentInitialization: null,
	verificationStatus: "idle",
	selectedPayment: null,
	selectedPaymentStatus: "idle"
};

// --- Slice ---
const paymentHistorySlice = createSlice({
	name: "paymentHistory",
	initialState,
	reducers: {
		clearPaymentHistoryError: (state) => {
			state.error = null;
		},
		resetPaymentState: (state) => {
			state.currentPayment = null;
			state.paymentInitialization = null;
			state.verificationStatus = "idle";
			state.error = null;
		}
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

		// Initialize Payment
		builder
			.addCase(initiatePayment.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(initiatePayment.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.currentPayment = action.payload.payment;
				state.paymentInitialization = {
					authorizationUrl: action.payload.authorizationUrl
				};
			})
			.addCase(initiatePayment.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Error initializing payment";
			});

		// Verify Payment
		builder
			.addCase(verifyPayment.pending, (state) => {
				state.verificationStatus = "loading";
				state.error = null;
			})
			.addCase(verifyPayment.fulfilled, (state, action) => {
				state.verificationStatus = "succeeded";
				state.currentPayment = action.payload.payment;
				// If payment was successful, add it to the user's payment history
				if (action.payload.payment.status === "succeeded") {
					state.myPayments = [action.payload.payment, ...state.myPayments];
				}
			})
			.addCase(verifyPayment.rejected, (state, action) => {
				state.verificationStatus = "failed";
				state.error = action.payload ?? "Error verifying payment";
			});

		// Fetch Payment by ID
		builder
			.addCase(fetchPaymentById.pending, (state) => {
				state.selectedPaymentStatus = "loading";
				state.error = null;
			})
			.addCase(fetchPaymentById.fulfilled, (state, action) => {
				state.selectedPaymentStatus = "succeeded";
				state.selectedPayment = action.payload;
			})
			.addCase(fetchPaymentById.rejected, (state, action) => {
				state.selectedPaymentStatus = "failed";
				state.error = action.payload ?? "Error fetching payment details";
			});
	},
});

// --- Actions & Selectors ---
export const { clearPaymentHistoryError, resetPaymentState } = paymentHistorySlice.actions;

// History selectors
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

// Payment processing selectors
export const selectCurrentPayment = (state: RootState) =>
	state.paymentHistory.currentPayment;
export const selectPaymentInitialization = (state: RootState) =>
	state.paymentHistory.paymentInitialization;
export const selectVerificationStatus = (state: RootState) =>
	state.paymentHistory.verificationStatus;

// Selected payment selectors
export const selectSelectedPayment = (state: RootState) =>
	state.paymentHistory.selectedPayment;
export const selectSelectedPaymentStatus = (state: RootState) =>
	state.paymentHistory.selectedPaymentStatus;

export default paymentHistorySlice.reducer;
