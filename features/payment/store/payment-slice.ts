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
	UnifiedReceiptData, // Assuming Invoice type is imported or defined
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
export const fetchMyPaymentHistory = createAsyncThunk<
	PaginatedPaymentsData,
	FetchMyHistoryParams,
	{ rejectValue: string }
>(
	"paymentHistory/fetchMy",
	async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
		try {
			const query = `userId=${userId}&page=${page}&limit=${limit}`;
			const responseData = await get<PaginatedPaymentsData>(
				`/payments/user/history?${query}`
			);

			if (
				responseData &&
				Array.isArray(responseData.payments) &&
				responseData.pagination
			) {
				return responseData;
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

			const responseData = await get<PaginatedPaymentsData>(
				`/payments?${queryParams}`
			);

			if (
				responseData &&
				Array.isArray(responseData.payments) &&
				responseData.pagination
			) {
				return responseData;
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
				: undefined,
		};

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
	VerifyPaymentResponse,
	{ reference: string },
	{ rejectValue: string }
>("payment/verify", async ({ reference }, { rejectWithValue }) => {
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
	PaymentRecord,
	string,
	{ rejectValue: string }
>("payment/fetchById", async (paymentId, { rejectWithValue }) => {
	try {
		const paymentRecord = await get<PaymentRecord>(`/payments/${paymentId}`);

		if (paymentRecord && paymentRecord.id) {
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

export const createInvoiceThunk = createAsyncThunk<
	CreateInvoiceResponse, // This is expected to be an Invoice object
	CreateInvoicePayload,
	{ rejectValue: string }
>("payment/createInvoice", async (payload, { rejectWithValue }) => {
	try {
		const responseData = await post<CreateInvoiceResponse>( // Expects Invoice
			"/invoices",
			payload
		);
		// Assuming CreateInvoiceResponse is directly the Invoice object
		if (responseData && (responseData as Invoice).id) {
			return responseData;
		}
		console.warn(
			"createInvoiceThunk: Unexpected data structure from API client for invoice creation. Got:",
			responseData
		);
		throw new Error(
			"Failed to create invoice or invalid data structure returned"
		);
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message || e.message || "Failed to create invoice";
		return rejectWithValue(errorMessage);
	}
});

// features/payment/store/payment-slice.ts

// Ensure GetInvoiceApiResponse and InvoiceDataFromApi are defined in your payment-types.ts
// and that InvoiceDataFromApi has 'amount' as string.

export const getInvoiceById = createAsyncThunk<
	Invoice, // The thunk will resolve with the transformed frontend Invoice object
	string, // Argument is the invoiceId (string)
	{ rejectValue: string }
>(
	"payment/getInvoiceById",
	async (invoiceId, { rejectWithValue, getState }) => {
		// Added getState
		try {
			// Assuming your apiClient.get already unwraps any top-level 'data' or 'success' field
			// and returns what was previously InvoiceDataFromApi
			const responseDataFromApi = await get<Invoice>( // Expect the direct API data structure for an invoice
				`/invoices/${invoiceId}`
			);
			console.log(
				"getInvoiceById: Raw response from API client for invoice:",
				responseDataFromApi
			);

			if (responseDataFromApi && responseDataFromApi.id) {
				// Transform InvoiceDataFromApi to your frontend Invoice type
				const transformedInvoice: Invoice = {
					...responseDataFromApi,
				};
				console.log("getInvoiceById: Transformed invoice:", transformedInvoice);
				return transformedInvoice;
			}

			console.warn(
				"getInvoiceById: Unexpected data structure from API client or missing ID. Expected direct invoice object. Got:",
				responseDataFromApi
			);
			// Check if the response was accidentally nested, e.g. { data: InvoiceDataFromApi } or { invoice: InvoiceDataFromApi }
			if (
				(responseDataFromApi as any).data &&
				(responseDataFromApi as any).data.id
			) {
				console.warn(
					"getInvoiceById: It seems the data was nested under 'data'. Attempting to use that."
				);
				const nestedData = (responseDataFromApi as any).data as Invoice;
				const transformedInvoice: Invoice = { ...nestedData };
				return transformedInvoice;
			}
			if (
				(responseDataFromApi as any).invoice &&
				(responseDataFromApi as any).invoice.id
			) {
				console.warn(
					"getInvoiceById: It seems the data was nested under 'invoice'. Attempting to use that."
				);
				const nestedData = (responseDataFromApi as any).invoice as Invoice;
				const transformedInvoice: Invoice = { ...nestedData };
				return transformedInvoice;
			}

			throw new Error(
				"Failed to fetch invoice or invalid data structure from API"
			);
		} catch (e: any) {
			const errorMessage =
				e.response?.data?.message || e.message || "Failed to fetch invoice";
			console.error("getInvoiceById: Error caught:", errorMessage, e);
			return rejectWithValue(errorMessage);
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
	selectedPaymentStatus: "idle",
	// Invoice states
	currentInvoice: null,
	invoiceCreationStatus: "idle",
	invoiceCreationError: null, // Renamed from invoiceError
	invoiceFetchStatus: "idle", // New
	invoiceFetchError: null, // New
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
			// Reset all invoice related states
			state.currentInvoice = null;
			state.invoiceCreationStatus = "idle";
			state.invoiceCreationError = null;
			state.invoiceFetchStatus = "idle";
			state.invoiceFetchError = null;
		},
		// You might want a specific reducer to clear just invoice errors or reset invoice state
		clearInvoiceErrors: (state) => {
			state.invoiceCreationError = null;
			state.invoiceFetchError = null;
		},
	},
	extraReducers: (builder) => {
		// Create Invoice Thunk
		builder
			.addCase(createInvoiceThunk.pending, (state) => {
				state.invoiceCreationStatus = "loading";
				state.invoiceCreationError = null;
				state.currentInvoice = null; // Clear previous invoice on new attempt
			})
			.addCase(
				createInvoiceThunk.fulfilled,
				(state, action: PayloadAction<CreateInvoiceResponse>) => {
					// CreateInvoiceResponse is Invoice
					state.invoiceCreationStatus = "succeeded";
					state.currentInvoice = action.payload; // Assumes payload is the Invoice object
					state.invoiceCreationError = null;
				}
			)
			.addCase(createInvoiceThunk.rejected, (state, action) => {
				state.invoiceCreationStatus = "failed";
				state.invoiceCreationError = action.payload ?? "Error creating invoice";
				state.currentInvoice = null;
			});

		// --- NEW: Get Invoice By ID Thunk ---
		builder
			.addCase(getInvoiceById.pending, (state) => {
				state.invoiceFetchStatus = "loading";
				state.invoiceFetchError = null;
				state.currentInvoice = null; // Clear previous/current invoice before fetching new one
			})
			.addCase(
				getInvoiceById.fulfilled,
				(state, action: PayloadAction<Invoice>) => {
					state.invoiceFetchStatus = "succeeded";
					state.currentInvoice = action.payload; // Store the fetched invoice
					state.invoiceFetchError = null;
				}
			)
			.addCase(getInvoiceById.rejected, (state, action) => {
				state.invoiceFetchStatus = "failed";
				state.invoiceFetchError = action.payload ?? "Error fetching invoice";
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
				state.status = "loading";
				state.error = null;
				state.paymentInitialization = null;
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
					const paymentRecord =
						action.payload.payments || (action.payload as any).payment || null;
					state.currentPayment = paymentRecord;
					if (paymentRecord && paymentRecord.status === "succeeded") {
						const existingIndex = state.myPayments.findIndex(
							(p) => p.id === paymentRecord.id
						);
						if (existingIndex !== -1) {
							state.myPayments[existingIndex] = paymentRecord;
						} else {
							state.myPayments = [paymentRecord, ...state.myPayments];
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
export const {
	clearPaymentHistoryError,
	resetPaymentState,
	clearInvoiceErrors,
} = paymentHistorySlice.actions;

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

export const selectCourseIdsFromCurrentInvoice = (
	state: RootState
): string[] => {
	const currentInvoice = state.paymentHistory.currentInvoice;
	if (currentInvoice && Array.isArray(currentInvoice.items)) {
		console.log("fetch courseid", currentInvoice);
		return currentInvoice.items
			.map((item) => item.courseId) // Assumes InvoiceItemFromApi has 'courseId'
			.filter(
				(courseId): courseId is string =>
					typeof courseId === "string" && courseId.trim() !== ""
			); // Filter out undefined/empty
	}
	return [];
};

// features/payment/store/payment-slice.ts
// ... (imports, other types, ensure InvoiceItem is defined correctly for UnifiedReceiptData.items)

export const selectUnifiedReceiptData = (
	state: RootState
): UnifiedReceiptData | null => {
	const payment = state.paymentHistory.selectedPayment;
	const invoice = state.paymentHistory.currentInvoice;

	if (!payment) {
		return null; // Essential payment data is missing
	}

	// Initialize with payment data
	const receiptData: UnifiedReceiptData = {
		paymentId: payment.id,
		paymentDate: payment.createdAt,
		paymentStatus: payment.status,
		paymentAmount: payment.amount,
		paymentCurrency: payment.currency,
		paymentMethod: payment.provider,
		paymentProviderReference: payment.providerReference || undefined,
		studentName: payment.userName, // Fallback from payment
		studentEmail: undefined,
		billingDetails: payment.billingDetails || null,
		items: [], // Default empty, will be populated below
		originalPaymentRecord: payment,
		originalInvoice: null,
		invoiceId: undefined,
		invoiceDescription: undefined,
		invoiceDueDate: undefined,
		invoiceStatus: undefined,
	};

	let itemsFound = false;

	// Priority 1: Use items from a matched and valid Invoice
	if (
		invoice &&
		payment.invoiceId &&
		invoice.id === payment.invoiceId &&
		invoice.items &&
		invoice.items.length > 0
	) {
		receiptData.invoiceId = invoice.id;
		receiptData.invoiceDescription = invoice.description;
		receiptData.invoiceDueDate = invoice.dueDate;
		receiptData.invoiceStatus = invoice.status;
		receiptData.items = invoice.items.map((item) => ({
			description: item.description,
			amount: item.amount,
			quantity: item.quantity,
			courseId: item.courseId,
		}));
		if (invoice.student) {
			receiptData.studentName = invoice.student.name;
			receiptData.studentEmail = invoice.student.email;
		}
		receiptData.originalInvoice = invoice;
		itemsFound = true;
	}

	// Priority 2: If no invoice items, check PaymentRecord.receiptItems
	if (!itemsFound && payment.receiptItems && payment.receiptItems.length > 0) {
		receiptData.items = payment.receiptItems.map((pItem) => ({
			description: pItem.name,
			amount: pItem.unitPrice,
			quantity: pItem.quantity,
			courseId: pItem.id, // Or map differently if pItem.id is not a courseId equivalent
		}));
		if (!receiptData.invoiceDescription) {
			// Only set if not already set by a matched invoice
			receiptData.invoiceDescription =
				payment.description || "Payment for items listed";
		}
		itemsFound = true;
	}

	// Priority 3: Fallback to a single summary item based on payment.description
	if (!itemsFound && payment.description && payment.amount > 0) {
		receiptData.items.push({
			description: payment.description,
			amount: payment.amount,
			quantity: 1,
			courseId: payment.relatedItemIds?.[0]?.id || "SUMMARY_PAYMENT_DESC",
		});
		if (!receiptData.invoiceDescription) {
			// Only set if not already set
			receiptData.invoiceDescription = payment.description;
		}
		itemsFound = true;
	}

	// Priority 4: ENSURE AT LEAST ONE ITEM - The "Catch-All" Item
	// This runs if itemsFound is still false (meaning no items from invoice, payment.receiptItems, or payment.description)
	if (!itemsFound) {
		receiptData.items.push({
			description:
				receiptData.invoiceDescription || // Use invoice desc if it was set (e.g. from a matched invoice that had 0 items)
				"Payment for services/products", // Generic fallback description
			amount: payment.amount, // The total payment amount becomes the single item's amount
			quantity: 1,
			courseId: "GENERIC_SUMMARY_ITEM", // Placeholder courseId
		});
		// Ensure invoiceDescription has a value if it's still undefined
		if (!receiptData.invoiceDescription) {
			receiptData.invoiceDescription = "Payment for services/products";
		}
	}

	// If invoiceDescription is still not set (e.g. invoice was matched but had no description)
	// and items were populated from payment.receiptItems or payment.description,
	// ensure invoiceDescription reflects the most relevant summary.
	// This is slightly redundant with the above but ensures invoiceDescription is sensible.
	if (!receiptData.invoiceDescription && receiptData.items.length > 0) {
		receiptData.invoiceDescription = receiptData.items[0].description;
	}

	return receiptData;
};
// Invoice selectors
export const selectCurrentInvoice = (
	state: RootState // This now serves for created or fetched invoice
) => state.paymentHistory.currentInvoice;

export const selectInvoiceCreationStatus = (state: RootState) =>
	state.paymentHistory.invoiceCreationStatus;
export const selectInvoiceCreationError = (
	state: RootState // Renamed
) => state.paymentHistory.invoiceCreationError;

// New selectors for invoice fetching
export const selectInvoiceFetchStatus = (state: RootState) =>
	state.paymentHistory.invoiceFetchStatus;
export const selectInvoiceFetchError = (state: RootState) =>
	state.paymentHistory.invoiceFetchError;

export default paymentHistorySlice.reducer;
