// features/payment/store/payment-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
	PaymentHistoryState,
	PaymentRecord,
	InitiatePaymentPayload,
	PaymentResponse, // This is { payment: PaymentRecord; authorizationUrl: string; }
	VerifyPaymentResponse,
	CreateInvoiceResponse,
	CreateInvoicePayload, // This is { payments: PaymentRecord; verification: any; }
} from "../types/payment-types";
import { get, post } from "@/lib/api-client";

// --- Helper Interface for Paginated List Data (as returned by apiClient for these list endpoints) ---
interface PaginatedPaymentsData {
	payments: PaymentRecord[];
	pagination: {
		total: number;
		page: number; // Or current_page, ensure this matches what apiClient returns
		limit: number; // Or per_page
		totalPages: number; // Or last_page or pages
	};
}

// --- Thunks ---
interface FetchMyHistoryParams {
	userId: string; // Assuming backend needs userId in query; if implicit from auth, remove.
	page?: number;
	limit?: number;
}
export const fetchMyPaymentHistory = createAsyncThunk<
	PaginatedPaymentsData, // The thunk will resolve with this object
	FetchMyHistoryParams,
	{ rejectValue: string }
>(
	"paymentHistory/fetchMy",
	async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
		try {
			// Construct query. Adjust if userId is implicit.
			const query = `userId=${userId}&page=${page}&limit=${limit}`;
			// apiClient.get<T> is expected to return T (the unwrapped data)
			const responseData = await get<PaginatedPaymentsData>(
				`/payments/user/history?${query}`
			);

			if (
				responseData &&
				Array.isArray(responseData.payments) &&
				responseData.pagination
			) {
				return responseData; // Return the whole { payments, pagination } object
			}
			console.warn(
				"fetchMyPaymentHistory: Unexpected data structure from API client. Got:",
				responseData
			);
			throw new Error(
				"Failed to fetch payment history or invalid data structure"
			);
		} catch (e: any) {
			const errorMessage =
				e.response?.data?.message ||
				e.message ||
				"Failed to fetch payment history";
			return rejectWithValue(errorMessage);
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
	PaginatedPaymentsData, // The thunk will resolve with this object
	FetchAllHistoryParams,
	{ rejectValue: string }
>(
	"paymentHistory/fetchAllAdmin",
	async ({ status, page = 1, limit = 10, search }, { rejectWithValue }) => {
		try {
			let queryParams = `page=${page}&limit=${limit}`;
			if (status) queryParams += `&status=${status}`;
			if (search) queryParams += `&search=${search}`;

			// apiClient.get<T> is expected to return T
			const responseData = await get<PaginatedPaymentsData>(
				`/payments?${queryParams}`
			);

			if (
				responseData &&
				Array.isArray(responseData.payments) &&
				responseData.pagination
			) {
				return responseData; // Return the whole { payments, pagination } object
			}
			console.warn(
				"fetchAllPaymentsAdmin: Unexpected data structure from API client. Got:",
				responseData
			);
			throw new Error("Failed to fetch all payments or invalid data structure");
		} catch (e: any) {
			const errorMessage =
				e.response?.data?.message ||
				e.message ||
				"Failed to fetch all payments";
			return rejectWithValue(errorMessage);
		}
	}
);

export const initiatePayment = createAsyncThunk<
	PaymentResponse, // This is { payment: PaymentRecord; authorizationUrl: string; }
	Omit<InitiatePaymentPayload, "callbackUrl">,
	{ rejectValue: string }
>("payment/initiate", async (callerPayload, { rejectWithValue }) => {
	try {
		const baseClientUrl = process.env.NEXT_PUBLIC_BASE_URL;
		const payloadForBackend: InitiatePaymentPayload = {
			...callerPayload,
			callbackUrl: baseClientUrl
				? `${baseClientUrl}/payments/callback`
				: undefined,
		};

		// apiClient.post<T> is expected to return T (PaymentResponse in this case)
		const responseData = await post<PaymentResponse>(
			"/payments/initialize",
			payloadForBackend
		);

		if (responseData && responseData.payment && responseData.authorizationUrl) {
			return responseData;
		}
		console.warn(
			"initiatePayment: Unexpected data structure from API client. Got:",
			responseData
		);
		throw new Error(
			"Failed to initialize payment or missing authorization URL"
		);
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message || e.message || "Failed to initialize payment";
		return rejectWithValue(errorMessage);
	}
});

export const verifyPayment = createAsyncThunk<
	VerifyPaymentResponse, // This is { payments: PaymentRecord; verification: any; }
	{ reference: string },
	{ rejectValue: string }
>("payment/verify", async ({ reference }, { rejectWithValue }) => {
	try {
		// apiClient.get<T> is expected to return T (VerifyPaymentResponse)
		const responseData = await get<VerifyPaymentResponse>(
			`/payments/verify/${reference}`
		);

		if (responseData && responseData.payments && responseData.verification) {
			// Check for key properties
			return responseData;
		}
		console.warn(
			"verifyPayment: Unexpected data structure from API client. Got:",
			responseData
		);
		throw new Error("Failed to verify payment or invalid data structure");
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message || e.message || "Failed to verify payment";
		return rejectWithValue(errorMessage);
	}
});

export const fetchPaymentById = createAsyncThunk<
	PaymentRecord, // apiClient.get<T> is expected to return T (PaymentRecord)
	string,
	{ rejectValue: string }
>("payment/fetchById", async (paymentId, { rejectWithValue }) => {
	try {
		const paymentRecord = await get<PaymentRecord>(`/payments/${paymentId}`);

		if (paymentRecord && paymentRecord.id) {
			// Basic validation for a PaymentRecord
			return paymentRecord;
		}
		console.warn(
			"fetchPaymentById: Unexpected data structure from API client. Got:",
			paymentRecord
		);
		throw new Error("Failed to fetch payment or invalid data structure");
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message ||
			e.message ||
			"Failed to fetch payment details";
		return rejectWithValue(errorMessage);
	}
});

// --- NEW: Create Invoice Thunk ---
export const createInvoiceThunk = createAsyncThunk<
	CreateInvoiceResponse, // Type for fulfilled action's payload
	CreateInvoicePayload, // Type for the thunk argument
	{ rejectValue: string }
>("payment/createInvoice", async (payload, { rejectWithValue }) => {
	try {
		// apiClient.post<T> is expected to return T (CreateInvoiceResponse in this case)
		const responseData = await post<CreateInvoiceResponse>(
			"/invoices", // Your endpoint from the spec /api/invoices
			payload
		);

		if (
			responseData &&
			responseData.success &&
			responseData.data &&
			responseData.data.id
		) {
			return responseData;
		}
		console.warn(
			"createInvoiceThunk: Unexpected data structure from API client. Got:",
			responseData
		);
		throw new Error(
			"Failed to create invoice or invalid data structure returned by server."
		);
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message || e.message || "Failed to create invoice";
		return rejectWithValue(errorMessage);
	}
});

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
	selectedPaymentStatus: "idle",
	currentInvoice: null,
	invoiceCreationStatus: "idle",
	invoiceError: null,
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
			state.currentInvoice = null; // Reset invoice
			state.invoiceCreationStatus = "idle"; // Reset invoice status
			state.invoiceError = null; // Reset invoice error
		},
	},
	extraReducers: (builder) => {
		// --- NEW: Create Invoice Thunk ---
		builder
			.addCase(createInvoiceThunk.pending, (state) => {
				state.invoiceCreationStatus = "loading";
				state.invoiceError = null;
				state.currentInvoice = null; // Clear previous invoice on new attempt
			})
			.addCase(
				createInvoiceThunk.fulfilled,
				(state, action: PayloadAction<CreateInvoiceResponse>) => {
					state.invoiceCreationStatus = "succeeded";
					state.currentInvoice = action.payload.data; // Store the created invoice
					state.invoiceError = null;
				}
			)
			.addCase(createInvoiceThunk.rejected, (state, action) => {
				state.invoiceCreationStatus = "failed";
				state.invoiceError = action.payload ?? "Error creating invoice";
				state.currentInvoice = null;
			});
		// Fetch My History
		builder
			.addCase(fetchMyPaymentHistory.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(
				fetchMyPaymentHistory.fulfilled,
				(state, action: PayloadAction<PaginatedPaymentsData>) => {
					state.status = "succeeded";
					state.myPayments = action.payload.payments;
					state.myPaymentsPagination = {
						// Use the pagination object from payload
						totalItems: action.payload.pagination.total,
						limit: action.payload.pagination.limit,
						currentPage: action.payload.pagination.page,
						totalPages: action.payload.pagination.totalPages,
					};
				}
			)
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
			.addCase(
				fetchAllPaymentsAdmin.fulfilled,
				(state, action: PayloadAction<PaginatedPaymentsData>) => {
					state.status = "succeeded";
					const validPayments = Array.isArray(action.payload.payments)
						? action.payload.payments.filter(
								(payment) => payment !== null && payment !== undefined
							)
						: [];
					state.allPayments = validPayments;
					state.adminPagination = {
						// Use the pagination object from payload
						totalItems: action.payload.pagination.total,
						limit: action.payload.pagination.limit,
						currentPage: action.payload.pagination.page,
						totalPages: action.payload.pagination.totalPages,
					};
				}
			)
			.addCase(fetchAllPaymentsAdmin.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Error fetching all payments";
			});

		// Initialize Payment
		builder
			.addCase(initiatePayment.pending, (state) => {
				state.status = "loading"; // Or a specific 'initiationStatus'
				state.error = null;
				state.paymentInitialization = null; // Reset on new attempt
			})
			.addCase(
				initiatePayment.fulfilled,
				(state, action: PayloadAction<PaymentResponse>) => {
					state.status = "succeeded";
					state.currentPayment = action.payload.payment;
					state.paymentInitialization = {
						authorizationUrl: action.payload.authorizationUrl,
					};
				}
			)
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
			.addCase(
				verifyPayment.fulfilled,
				(state, action: PayloadAction<VerifyPaymentResponse>) => {
					state.verificationStatus = "succeeded";
					state.currentPayment = action.payload.payments; // Note: API returns 'payments' (plural) for a single payment in VerifyPaymentResponse
					// If payment was successful, add/update it in the user's payment history
					if (
						action.payload.payments &&
						action.payload.payments.status === "succeeded"
					) {
						const existingIndex = state.myPayments.findIndex(
							(p) => p.id === action.payload.payments.id
						);
						if (existingIndex !== -1) {
							state.myPayments[existingIndex] = action.payload.payments;
						} else {
							state.myPayments = [action.payload.payments, ...state.myPayments];
						}
					}
				}
			)
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
			.addCase(
				fetchPaymentById.fulfilled,
				(state, action: PayloadAction<PaymentRecord>) => {
					state.selectedPaymentStatus = "succeeded";
					state.selectedPayment = action.payload;
				}
			)
			.addCase(fetchPaymentById.rejected, (state, action) => {
				state.selectedPaymentStatus = "failed";
				state.error = action.payload ?? "Error fetching payment details";
			});
	},
});

// --- Actions & Selectors ---
export const { clearPaymentHistoryError, resetPaymentState } =
	paymentHistorySlice.actions;

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
export const selectCurrentPayment = (state: RootState) =>
	state.paymentHistory.currentPayment;
export const selectPaymentInitialization = (state: RootState) =>
	state.paymentHistory.paymentInitialization;
export const selectVerificationStatus = (state: RootState) =>
	state.paymentHistory.verificationStatus;
export const selectSelectedPayment = (state: RootState) =>
	state.paymentHistory.selectedPayment;
export const selectSelectedPaymentStatus = (state: RootState) =>
	state.paymentHistory.selectedPaymentStatus;

// New selectors for invoice
export const selectCurrentInvoice = (state: RootState) =>
	state.paymentHistory.currentInvoice;
export const selectInvoiceCreationStatus = (state: RootState) =>
	state.paymentHistory.invoiceCreationStatus;
export const selectInvoiceError = (state: RootState) =>
	state.paymentHistory.invoiceError;
export default paymentHistorySlice.reducer;
