// features/payment/store/payment-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
	PaymentHistoryState,
	PaymentRecord,
	InitiatePaymentPayload,
	PaymentResponse,
	VerifyPaymentResponse,
	CreateInvoiceResponse, // Assumed to be 'Invoice' type
	CreateInvoicePayload,
	Invoice,
	UnifiedReceiptData,
	PaginatedPaymentItemFromApi,
	PaginatedPaymentsApiResponse,
	FetchMyHistoryThunkResponse, // Assuming Invoice type is imported or defined
	// InvoiceItem, // If needed separately
} from "../types/payment-types"; // Make sure Invoice is exported from here
import { get, post } from "@/lib/api-client";

// --- Helper Interface for Paginated List Data (as returned by apiClient for these list endpoints) ---
interface PaginatedPaymentsData {
	payments: PaymentRecord[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

// --- Thunks ---
interface FetchMyHistoryParams {
	userId: string;
	page?: number;
	limit?: number;
}

// fetchMyPaymentHistory thunk now resolves with FetchMyHistoryThunkResponse (transformed data)
export const fetchMyPaymentHistory = createAsyncThunk<
	FetchMyHistoryThunkResponse, // << Resolves with transformed data
	FetchMyHistoryParams,
	{ rejectValue: string }
>(
	"paymentHistory/fetchMy",
	async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
		try {
			const query = `userId=${userId}&page=${page}&limit=${limit}`;
			// Expect the raw API structure from the 'get' call
			const responseData = await get<PaginatedPaymentsApiResponse>(
				`/payments/user/history?${query}`
			);
			console.log(
				"fetchMyPaymentHistory THUNK: Raw API response:",
				responseData
			);

			if (
				responseData &&
				Array.isArray(responseData.payments) &&
				responseData.pagination
			) {
				// Transform PaginatedPaymentItemFromApi to PaymentRecord[] HERE
				const transformedPayments: PaymentRecord[] = responseData.payments.map(
					(apiPayment: PaginatedPaymentItemFromApi): PaymentRecord => ({
						id: apiPayment.id,
						amount: apiPayment.amount,
						currency: apiPayment.currency || "NGN",
						status: apiPayment.status,
						provider: apiPayment.provider || "unknown",
						providerReference: apiPayment.providerReference || "",
						description: apiPayment.description || "",
						metadata: apiPayment.metadata || {},
						createdAt: apiPayment.createdAt,
						updatedAt: apiPayment.updatedAt,
						userId: apiPayment.userId,
						invoiceId: apiPayment.invoiceId,
						relatedItemIds: apiPayment.relatedItemIds || [],
						reconciliationStatus: apiPayment.reconciliationStatus || "pending",
						// Include the invoice if it exists
						invoice: apiPayment.invoice
							? {
									id: apiPayment.invoice.id,
									amount: apiPayment.invoice.amount,
									currency: apiPayment.invoice.currency || "NGN",
									status: apiPayment.invoice.status,
									description: apiPayment.invoice.description || "",
									dueDate: apiPayment.invoice.dueDate,
									items: apiPayment.invoice.items || [],
									metadata: apiPayment.invoice.metadata || {},
									createdAt: apiPayment.invoice.createdAt,
									updatedAt: apiPayment.invoice.updatedAt,
									userId: apiPayment.invoice.userId,
							  }
							: undefined,
					})
				);

				// Return the transformed data with pagination
				return {
					payments: transformedPayments,
					pagination: responseData.pagination,
				};
			}

			console.warn(
				"fetchMyPaymentHistory: Unexpected data structure from API client. Got:",
				responseData
			);
			throw new Error("Failed to fetch payment history or invalid data structure");
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
	status?: string;
	page?: number;
	limit?: number;
	search?: string;
}
export const fetchAllPaymentsAdmin = createAsyncThunk<
	PaginatedPaymentsData,
	FetchAllHistoryParams,
	{ rejectValue: string }
>(
	"paymentHistory/fetchAllAdmin",
	async ({ status, page = 1, limit = 10, search }, { rejectWithValue }) => {
		try {
			let queryParams = `page=${page}&limit=${limit}`;
			if (status) queryParams += `&status=${status}`;
			if (search) queryParams += `&search=${search}`;

			const response = await get<any>(
				`/admin/payments?${queryParams}`
			);
			
			console.log("Admin payments response:", response);
			
			// Handle different response formats
			let payments: PaymentRecord[] = [];
			let paginationData: any = null;
			
			// Case 1: New API format with success, data, and pagination fields
			if (response && response.success === true) {
				// Check if data is directly in the response or nested
				if (Array.isArray(response.data)) {
					payments = response.data;
				} else if (response.data && Array.isArray(response.data.payments)) {
					payments = response.data.payments;
				} else if (response.payments && Array.isArray(response.payments)) {
					payments = response.payments;
				}
				// Get pagination data
				paginationData = response.pagination || (response.data && response.data.pagination);
			} 
			// Case 2: Direct data array with pagination object
			else if (Array.isArray(response)) {
				payments = response;
				paginationData = {
					total: payments.length,
					page: page || 1,
					limit: limit || 10,
					totalPages: 1
				};
			}
			// Case 3: Object with data array and pagination
			else if (response && typeof response === 'object') {
				if (Array.isArray(response.payments)) {
					payments = response.payments;
				} else if (response.data && Array.isArray(response.data)) {
					payments = response.data;
				} else if (response.data && Array.isArray(response.data.payments)) {
					payments = response.data.payments;
				} else {
					const possibleDataFields = ['items', 'results', 'records', 'list'];
					for (const field of possibleDataFields) {
						if (Array.isArray(response[field])) {
							payments = response[field];
							break;
						} else if (response.data && Array.isArray(response.data[field])) {
							payments = response.data[field];
							break;
						}
					}
				}
				paginationData = response.pagination || response.meta || response.page || response.paging;
				if (!paginationData && response.data) {
					paginationData = response.data.pagination || response.data.meta || response.data.page || response.data.paging;
				}
				if (!paginationData && 'total' in response) {
					paginationData = {
						total: response.total,
						page: page || 1,
						limit: limit || 10,
						totalPages: Math.ceil((response.total || 0) / (limit || 10))
					};
				}
			}
			
			// If we couldn't extract payments data, throw an error
			if (!payments) {
				console.error("API Response:", response);
				throw new Error("Could not extract payments data from API response");
			}
			
			// Ensure payments is an array
			if (!Array.isArray(payments)) {
				console.warn("Payments is not an array, converting to array:", payments);
				payments = payments ? [payments] : [];
			}
			
			// If we couldn't extract pagination data, use defaults
			if (!paginationData) {
				paginationData = {
					total: payments.length,
					page: page || 1,
					limit: limit || 10,
					totalPages: 1
				};
			}
			
			// Transform pagination to match our frontend format
			let pagination = {
				totalItems: paginationData.total || paginationData.totalItems || payments.length,
				currentPage: paginationData.page || paginationData.currentPage || page || 1,
				limit: paginationData.limit || paginationData.perPage || limit || 10,
				totalPages: paginationData.totalPages || paginationData.pages || 
						Math.ceil((paginationData.total || payments.length) / (paginationData.limit || limit || 10))
			};
			
			return { payments, pagination };
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
	PaymentResponse,
	Omit<InitiatePaymentPayload, "callbackUrl">,
	{ rejectValue: string }
>("payment/initiate", async (callerPayload, { rejectWithValue }) => {
	try {
		const baseClientUrl = process.env.NEXT_PUBLIC_BASE_URL;
		const payloadForBackend: InitiatePaymentPayload = {
			...callerPayload,
			callbackUrl: baseClientUrl
				? `${baseClientUrl}/payments/callback`
				: "http://localhost:3000/payments/callback",
		};

		const responseData = await post<PaymentResponse>(
			"/payments/initialize",
			payloadForBackend
		);

		if (responseData && responseData.authorization_url) {
			return responseData;
		}

		throw new Error("Invalid response from payment initialization");
	} catch (e: any) {
		return rejectWithValue(
			e.response?.data?.message || e.message || "Failed to initiate payment"
		);
	}
});

export const verifyPayment = createAsyncThunk<
	VerifyPaymentResponse,
	string,
	{ rejectValue: string }
>("payment/verify", async (reference, { rejectWithValue }) => {
	try {
		const responseData = await get<any>(`/payments/verify/${reference}`);

		const hasPaymentData =
			responseData &&
			((responseData.payments && responseData.verification) ||
				(responseData.payment && responseData.verification) ||
				responseData.id);

		if (hasPaymentData) {
			const normalizedResponse: VerifyPaymentResponse = {
				payments: responseData.payments || responseData.payment || responseData,
				payment: responseData.payment || responseData.payments || responseData,
				verification: responseData.verification || {},
			};
			return normalizedResponse;
		}

		throw new Error("Invalid response from payment verification");
	} catch (e: any) {
		return rejectWithValue(
			e.response?.data?.message || e.message || "Failed to verify payment"
		);
	}
});

export const getPaymentById = createAsyncThunk<
	PaymentRecord,
	string,
	{ rejectValue: string }
>("payment/getById", async (paymentId, { rejectWithValue }) => {
	try {
		const paymentRecord = await get<PaymentRecord>(`/payments/${paymentId}`);
		return paymentRecord;
	} catch (e: any) {
		return rejectWithValue(
			e.response?.data?.message || e.message || "Failed to get payment details"
		);
	}
});

export const createInvoice = createAsyncThunk<
	CreateInvoiceResponse,
	CreateInvoicePayload,
	{ rejectValue: string }
>("invoice/create", async (invoiceData, { rejectWithValue }) => {
	try {
		const response = await post<CreateInvoiceResponse>(
			"/invoices",
			invoiceData
		);

		if (response && response.id) {
			return response;
		}

		throw new Error("Invalid response from invoice creation");
	} catch (e: any) {
		return rejectWithValue(
			e.response?.data?.message || e.message || "Failed to create invoice"
		);
	}
});

export const getInvoiceById = createAsyncThunk<
	Invoice,
	string,
	{ rejectValue: string }
>("invoice/getById", async (invoiceId, { rejectWithValue }) => {
	try {
		const invoice = await get<Invoice>(`/invoices/${invoiceId}`);
		return invoice;
	} catch (e: any) {
		return rejectWithValue(
			e.response?.data?.message || e.message || "Failed to get invoice details"
		);
	}
});

export const getReceiptData = createAsyncThunk<
	UnifiedReceiptData,
	string,
	{ rejectValue: string }
>("payment/getReceiptData", async (paymentId, { rejectWithValue }) => {
	try {
		const receiptData = await get<UnifiedReceiptData>(
			`/payments/${paymentId}/receipt-data`
		);
		return receiptData;
	} catch (e: any) {
		return rejectWithValue(
			e.response?.data?.message || e.message || "Failed to get receipt data"
		);
	}
});

// --- Initial State ---
const initialState: PaymentHistoryState = {
	myPayments: [],
	allPayments: [],
	pagination: {
		totalItems: 0,
		currentPage: 1,
		limit: 10,
		totalPages: 0,
	},
	selectedPayment: null,
	selectedInvoice: null,
	receiptData: null,
	paymentInitiation: {
		status: "idle",
		error: null,
		data: null,
	},
	paymentVerification: {
		status: "idle",
		error: null,
		data: null,
	},
	status: "idle",
	error: null,
};

// --- Slice ---
const paymentHistorySlice = createSlice({
	name: "paymentHistory",
	initialState,
	reducers: {
		clearPaymentHistory: (state) => {
			state.myPayments = [];
			state.status = "idle";
			state.error = null;
		},
		clearPaymentError: (state) => {
			state.error = null;
		},
		clearPaymentInitiation: (state) => {
			state.paymentInitiation = {
				status: "idle",
				error: null,
				data: null,
			};
		},
		clearPaymentVerification: (state) => {
			state.paymentVerification = {
				status: "idle",
				error: null,
				data: null,
			};
		},
		setSelectedPayment: (state, action: PayloadAction<PaymentRecord | null>) => {
			state.selectedPayment = action.payload;
		},
		setSelectedInvoice: (state, action: PayloadAction<Invoice | null>) => {
			state.selectedInvoice = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			// fetchMyPaymentHistory
			.addCase(fetchMyPaymentHistory.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchMyPaymentHistory.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.myPayments = action.payload.payments;
				state.pagination = action.payload.pagination;
			})
			.addCase(fetchMyPaymentHistory.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Unknown error fetching payment history";
			})

			// fetchAllPaymentsAdmin
			.addCase(fetchAllPaymentsAdmin.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(
				fetchAllPaymentsAdmin.fulfilled,
				(state, action: PayloadAction<PaginatedPaymentsData>) => {
					state.status = "succeeded";
					state.allPayments = action.payload.payments;
					state.pagination = action.payload.pagination;
				}
			)
			.addCase(fetchAllPaymentsAdmin.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Unknown error fetching all payments";
			})

			// initiatePayment
			.addCase(initiatePayment.pending, (state) => {
				state.paymentInitiation.status = "loading";
				state.paymentInitiation.error = null;
			})
			.addCase(initiatePayment.fulfilled, (state, action) => {
				state.paymentInitiation.status = "succeeded";
				state.paymentInitiation.data = action.payload;
			})
			.addCase(initiatePayment.rejected, (state, action) => {
				state.paymentInitiation.status = "failed";
				state.paymentInitiation.error =
					action.payload ?? "Unknown error initiating payment";
			})

			// verifyPayment
			.addCase(verifyPayment.pending, (state) => {
				state.paymentVerification.status = "loading";
				state.paymentVerification.error = null;
			})
			.addCase(verifyPayment.fulfilled, (state, action) => {
				state.paymentVerification.status = "succeeded";
				state.paymentVerification.data = action.payload;
			})
			.addCase(verifyPayment.rejected, (state, action) => {
				state.paymentVerification.status = "failed";
				state.paymentVerification.error =
					action.payload ?? "Unknown error verifying payment";
			})

			// getPaymentById
			.addCase(getPaymentById.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getPaymentById.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.selectedPayment = action.payload;
			})
			.addCase(getPaymentById.rejected, (state, action) => {
				state.status = "failed";
				state.error =
					action.payload ?? "Unknown error fetching payment details";
			})

			// createInvoice
			.addCase(createInvoice.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(createInvoice.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.selectedInvoice = action.payload;
			})
			.addCase(createInvoice.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Unknown error creating invoice";
			})

			// getInvoiceById
			.addCase(getInvoiceById.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getInvoiceById.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.selectedInvoice = action.payload;
			})
			.addCase(getInvoiceById.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Unknown error fetching invoice details";
			})

			// getReceiptData
			.addCase(getReceiptData.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(getReceiptData.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.receiptData = action.payload;
			})
			.addCase(getReceiptData.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Unknown error fetching receipt data";
			});
	},
});

// --- Actions ---
export const {
	clearPaymentHistory,
	clearPaymentError,
	clearPaymentInitiation,
	clearPaymentVerification,
	setSelectedPayment,
	setSelectedInvoice,
} = paymentHistorySlice.actions;

// --- Selectors ---
export const selectMyPayments = (state: RootState) =>
	state.paymentHistory.myPayments;
export const selectAllPayments = (state: RootState) =>
	state.paymentHistory.allPayments;
export const selectPaymentHistoryStatus = (state: RootState) =>
	state.paymentHistory.status;
export const selectPaymentHistoryError = (state: RootState) =>
	state.paymentHistory.error;
export const selectPaymentHistoryPagination = (state: RootState) =>
	state.paymentHistory.pagination;
export const selectSelectedPayment = (state: RootState) =>
	state.paymentHistory.selectedPayment;
export const selectSelectedInvoice = (state: RootState) =>
	state.paymentHistory.selectedInvoice;
export const selectReceiptData = (state: RootState) =>
	state.paymentHistory.receiptData;
export const selectPaymentInitiationStatus = (state: RootState) =>
	state.paymentHistory.paymentInitiation.status;
export const selectPaymentInitiationError = (state: RootState) =>
	state.paymentHistory.paymentInitiation.error;
export const selectPaymentInitiationData = (state: RootState) =>
	state.paymentHistory.paymentInitiation.data;
export const selectPaymentVerificationStatus = (state: RootState) =>
	state.paymentHistory.paymentVerification.status;
export const selectPaymentVerificationError = (state: RootState) =>
	state.paymentHistory.paymentVerification.error;
export const selectPaymentVerificationData = (state: RootState) =>
	state.paymentHistory.paymentVerification.data;

// --- Reducer ---
export default paymentHistorySlice.reducer;
