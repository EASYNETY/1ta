// features/payment/store/adminPayments.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { get, put, del } from "@/lib/api-client";
import type { PaymentRecord, PaginationMeta } from "../types/payment-types";
import type {
	AdminPaymentStats,
	AdminPaymentState,
	UpdatePaymentPayload,
	AdminPaymentParams,
} from "../types/admin-payment-types";

// --- Thunks ---

// Fetch all payments (admin)
export const fetchAdminPayments = createAsyncThunk<
	{ payments: PaymentRecord[]; pagination: PaginationMeta },
	AdminPaymentParams,
	{ rejectValue: string }
>("adminPayments/fetchAll", async (params, { rejectWithValue }) => {
	try {
		// 1. Build the query string from parameters
		const queryParams = new URLSearchParams();
		// A more concise way to build the query string
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== "") {
				queryParams.append(key, String(value));
			}
		});
		const query = queryParams.toString();
		const url = `/admin/payments${query ? `?${query}` : ""}`;

		// 2. Fetch data from the API
		console.log("Fetching admin payments from:", url);
		const response = await get(url);
		console.log("Admin payments raw response:", response);

		let payments: PaymentRecord[] = [];
		let paginationData: any = null;

		// 3. Robustly extract payments and pagination data
		if (response && typeof response === "object") {
			// --- Find the payments array ---
			// The order of these checks is important, from most likely to least likely.
			const possiblePaymentKeys = [
				"data",
				"payments",
				"items",
				"results",
				"records",
			];
			for (const key of possiblePaymentKeys) {
				if (Array.isArray(response[key])) {
					payments = response[key];
					break;
				}
				if (response.data && Array.isArray(response.data[key])) {
					payments = response.data[key];
					break;
				}
			}

			// **Fallback for the malformed object-with-numeric-keys structure**
			if (payments.length === 0 && !Array.isArray(response)) {
				console.warn(
					"Standard payment array keys not found. Attempting to parse object values."
				);
				payments = Object.values(response).filter(
					(value): value is PaymentRecord =>
						typeof value === "object" &&
						value !== null &&
						"id" in value &&
						"userId" in value
				);
			}

			// --- Find the pagination object ---
			paginationData =
				response.pagination ||
				response.meta ||
				(response.data && response.data.pagination);
		}

		console.log(`Extracted ${payments.length} payment records.`);
		console.log("Extracted pagination data:", paginationData);

		// If we still have no payments after all checks, we can assume the response is empty/invalid.
		if (!Array.isArray(payments)) {
			console.error(
				"Failed to extract a valid payments array from the response.",
				response
			);
			payments = []; // Ensure it's an empty array to prevent downstream errors.
		}

		// 4. Create a standardized pagination object
		// If pagination data is missing, we create a default based on what we have.
		const fallbackPagination = {
			totalItems: payments.length,
			currentPage: params.page || 1,
			limit: params.limit || 10,
			totalPages:
				params.limit && params.limit > 0
					? Math.ceil(payments.length / params.limit)
					: 1,
		};

		const finalPagination: PaginationMeta = {
			totalItems:
				paginationData?.total ||
				paginationData?.totalItems ||
				fallbackPagination.totalItems,
			currentPage:
				paginationData?.page ||
				paginationData?.currentPage ||
				fallbackPagination.currentPage,
			limit:
				paginationData?.limit ||
				paginationData?.perPage ||
				fallbackPagination.limit,
			totalPages:
				paginationData?.totalPages ||
				paginationData?.pages ||
				fallbackPagination.totalPages,
		};

		// 5. Normalize each payment record for consistent use in the frontend
		const normalizedPayments = payments.map((p: any): PaymentRecord => {
			const amount = parseFloat(p.amount);
			return {
				...p,
				// Ensure required fields have safe fallbacks
				id: p.id || `missing-id-${Math.random()}`,
				userId: p.userId || "N/A",
				userName: p.userName || "N/A",
				amount: isNaN(amount) ? 0 : amount,
				currency: p.currency || "NGN",
				status: p.status || "unknown",
				provider: p.provider || "unknown",
				createdAt: p.createdAt || p.created_at || new Date().toISOString(),
				description:
					p.description || p.invoice?.description || "No description",
				invoiceId: p.invoiceId || p.invoice_id || p.invoice?.id || null,
				metadata: p.metadata || {},
				relatedItemIds: Array.isArray(p.relatedItemIds) ? p.relatedItemIds : [],
			};
		});

		console.log("Final normalized payments:", normalizedPayments);
		console.log("Final pagination meta:", finalPagination);

		return {
			payments: normalizedPayments,
			pagination: finalPagination,
		};
	} catch (error: any) {
		console.error("Critical error in fetchAdminPayments thunk:", error);
		const errorMessage =
			error.response?.data?.message ||
			error.message ||
			"An unknown error occurred while fetching payments.";
		return rejectWithValue(errorMessage);
	}
});
// Get payment statistics
export const fetchPaymentStats = createAsyncThunk<
	AdminPaymentStats,
	{ startDate?: string; endDate?: string },
	{ rejectValue: string }
>(
	"adminPayments/fetchStats",
	async ({ startDate, endDate }, { rejectWithValue }) => {
		try {
			const queryParams = new URLSearchParams();
			if (startDate) queryParams.append("startDate", startDate);
			if (endDate) queryParams.append("endDate", endDate);

			const query = queryParams.toString();
			const url = `/admin/payments/stats${query ? `?${query}` : ""}`;

			console.log("Fetching payment stats from:", url);
			const response = await get(url);
			console.log("Payment stats response:", response);

			let statsData: AdminPaymentStats;
			if (
				(response as any) &&
				(response as any).success === true &&
				(response as any).data
			) {
				const data = (response as any).data;
				statsData = {
					totalRevenue: data.totalRevenue || [],
					statusCounts: data.statusCounts || [],
					providerCounts: data.providerCounts || [],
					dailyRevenue: data.dailyRevenue || [],
					dateRange: data.dateRange || {
						start: startDate || "",
						end: endDate || "",
					},
				};
			} else if (response && typeof response === "object") {
				statsData = {
					totalRevenue: (response as any).totalRevenue || [],
					statusCounts: (response as any).statusCounts || [],
					providerCounts: (response as any).providerCounts || [],
					dailyRevenue: (response as any).dailyRevenue || [],
					dateRange: (response as any).dateRange || {
						start: startDate || "",
						end: endDate || "",
					},
				};
			} else {
				console.error("Invalid payment stats response:", response);
				throw new Error("Invalid response format from API: missing stats data");
			}
			statsData.totalRevenue = statsData.totalRevenue || [];
			statsData.statusCounts = statsData.statusCounts || [];
			statsData.providerCounts = statsData.providerCounts || [];
			statsData.dailyRevenue = statsData.dailyRevenue || [];
			statsData.dateRange = statsData.dateRange || {
				start: startDate || "",
				end: endDate || "",
			};
			return statsData;
		} catch (error: any) {
			console.error("Error fetching payment stats:", error);
			return rejectWithValue(
				error.response?.data?.message ||
					error.message ||
					"Failed to fetch payment statistics"
			);
		}
	}
);

// Update payment
export const updatePayment = createAsyncThunk<
	PaymentRecord,
	UpdatePaymentPayload,
	{ rejectValue: string }
>(
	"adminPayments/update",
	async ({ id, status, description, metadata }, { rejectWithValue }) => {
		try {
			console.log(
				`Updating payment ${id} with status: ${status}, description: ${description}`
			);
			const response = await put(`/admin/payments/${id}`, {
				status,
				description,
				metadata,
			});
			console.log("Update payment response:", response);
			let updatedPayment: PaymentRecord;
			if (
				(response as any) &&
				(response as any).success === true &&
				(response as any).data
			) {
				updatedPayment = (response as any).data;
			} else if (
				response &&
				typeof response === "object" &&
				"id" in (response as any)
			) {
				updatedPayment = response as PaymentRecord;
			} else if (
				response &&
				typeof response === "object" &&
				(response as any).payment
			) {
				updatedPayment = (response as any).payment;
			} else {
				console.error("Invalid update payment response:", response);
				throw new Error(
					"Invalid response format from API: missing payment data"
				);
			}
			return updatedPayment;
		} catch (error: any) {
			console.error("Error updating payment:", error);
			return rejectWithValue(
				error.response?.data?.message ||
					error.message ||
					"Failed to update payment"
			);
		}
	}
);

// Delete payment
export const deletePayment = createAsyncThunk<
	{ id: string; success: boolean },
	string,
	{ rejectValue: string }
>("adminPayments/delete", async (id, { rejectWithValue }) => {
	try {
		const response = await del(`/admin/payments/${id}`);
		if (!response || (response as any).success !== true) {
			throw new Error("Failed to delete payment");
		}
		return { id, success: true };
	} catch (error: any) {
		return rejectWithValue(
			error.response?.data?.message ||
				error.message ||
				"Failed to delete payment"
		);
	}
});

// Generate receipt
export const generateReceipt = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>("adminPayments/generateReceipt", async (id, { rejectWithValue }) => {
	try {
		// This will trigger a file download, so we don't expect a JSON response
		// Instead, we'll open a new window/tab with the receipt URL
		const API_BASE_URL =
			process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.onetechacademy.com";
		const receiptUrl = `${API_BASE_URL}/admin/payments/${id}/receipt`;
		window.open(receiptUrl, "_blank");

		return;
	} catch (error: any) {
		return rejectWithValue(
			error.response?.data?.message ||
				error.message ||
				"Failed to generate receipt"
		);
	}
});

export const fetchAllAdminPaymentsSequentially = createAsyncThunk<
	PaymentRecord[], // This thunk will return a single flat array of all payments
	Omit<AdminPaymentParams, "page" | "limit">, // Pass any filters (like status, userId) but not page/limit
	{ state: RootState; rejectValue: string }
>(
	"adminPayments/fetchAllSequentially",
	async (params, { dispatch, rejectWithValue, getState }) => {
		try {
			console.log("Starting sequential fetch for all admin payments...");
			const allPayments: PaymentRecord[] = [];
			const BATCH_SIZE = 100; // Fetch 100 items per page

			// 1. Fetch the first page to get pagination details
			const initialResultAction = await dispatch(
				fetchAdminPayments({ ...params, page: 1, limit: BATCH_SIZE })
			);

			if (fetchAdminPayments.rejected.match(initialResultAction)) {
				throw new Error(initialResultAction.payload);
			}

			const { payments: firstPagePayments, pagination: paginationMeta } =
				initialResultAction.payload;
			allPayments.push(...firstPagePayments);

			const totalPages = paginationMeta.totalPages;
			console.log(`Total pages to fetch: ${totalPages}`);

			// 2. If there are more pages, fetch them concurrently
			if (totalPages > 1) {
				const pageNumbers: number[] = [];
				for (let i = 2; i <= totalPages; i++) {
					pageNumbers.push(i);
				}

				// Create an array of dispatch promises
				const promises = pageNumbers.map((page) =>
					dispatch(fetchAdminPayments({ ...params, page, limit: BATCH_SIZE }))
				);

				// Await all promises
				const results = await Promise.all(promises);

				// Process the results
				for (const resultAction of results) {
					if (fetchAdminPayments.fulfilled.match(resultAction)) {
						allPayments.push(...resultAction.payload.payments);
					} else {
						console.warn(
							"A page fetch failed during sequential fetch:",
							resultAction.payload
						);
						// Decide if you want to continue or fail. For accounting, it's often better to fail.
						throw new Error(
							"One or more pages failed to load. Data is incomplete."
						);
					}
				}
			}

			console.log(
				`Successfully fetched a total of ${allPayments.length} payments.`
			);
			return allPayments;
		} catch (error: any) {
			console.error(
				"Critical error in fetchAllAdminPaymentsSequentially:",
				error
			);
			return rejectWithValue(error.message || "Failed to fetch all payments.");
		}
	}
);

// --- Initial State ---
const initialState: AdminPaymentState = {
	payments: [],
	pagination: null,
	stats: null,
	selectedPayment: null,
	status: "idle",
	statsStatus: "idle",
	updateStatus: "idle",
	deleteStatus: "idle",
	error: null,
	statsError: null,
	updateError: null,
	deleteError: null,
	dateRange: {
		startDate: null,
		endDate: null,
	},
};

// --- Slice ---
const adminPaymentsSlice = createSlice({
	name: "adminPayments",
	initialState,
	reducers: {
		clearAdminPaymentsError: (state) => {
			state.error = null;
			state.statsError = null;
			state.updateError = null;
			state.deleteError = null;
		},
		setDateRange: (state, action) => {
			state.dateRange.startDate = action.payload.startDate;
			state.dateRange.endDate = action.payload.endDate;
		},
		resetAdminPaymentsState: (state) => {
			return initialState;
		},
		setSelectedPayment: (state, action) => {
			state.selectedPayment = action.payload;
		},
	},
	extraReducers: (builder) => {
		// Fetch Admin Payments
		builder
			.addCase(fetchAdminPayments.pending, (state) => {
				state.status = "loading";
				state.error = null;
				// Do NOT reset state.payments here! This prevents flicker/disappearance.
			})
			.addCase(fetchAdminPayments.fulfilled, (state, action) => {
				state.status = "succeeded";
				// Defensive: always set payments to a valid array, fallback to previous if new is empty
				let newPayments = Array.isArray(action.payload.payments)
					? action.payload.payments
					: Array.isArray(action.payload)
						? action.payload
						: [];
				if (
					(!newPayments || newPayments.length === 0) &&
					state.payments &&
					state.payments.length > 0
				) {
					// Do not update payments, keep previous
				} else {
					state.payments = newPayments;
				}
				state.pagination = action.payload.pagination;
			})
			.addCase(fetchAdminPayments.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch admin payments";
			});

		// Fetch Payment Stats
		builder
			.addCase(fetchPaymentStats.pending, (state) => {
				state.statsStatus = "loading";
				state.statsError = null;
			})
			.addCase(fetchPaymentStats.fulfilled, (state, action) => {
				state.statsStatus = "succeeded";
				state.stats = action.payload;
			})
			.addCase(fetchPaymentStats.rejected, (state, action) => {
				state.statsStatus = "failed";
				state.statsError =
					action.payload ?? "Failed to fetch payment statistics";
			});

		// Update Payment
		builder
			.addCase(updatePayment.pending, (state) => {
				state.updateStatus = "loading";
				state.updateError = null;
			})
			.addCase(updatePayment.fulfilled, (state, action) => {
				state.updateStatus = "succeeded";

				// Update the payment in the list
				const index = state.payments.findIndex(
					(p) => p.id === action.payload.id
				);
				if (index !== -1) {
					state.payments[index] = action.payload;
				}

				// Update selected payment if it's the same one
				if (
					state.selectedPayment &&
					state.selectedPayment.id === action.payload.id
				) {
					state.selectedPayment = action.payload;
				}
			})
			.addCase(updatePayment.rejected, (state, action) => {
				state.updateStatus = "failed";
				state.updateError = action.payload ?? "Failed to update payment";
			});

		// Delete Payment
		builder
			.addCase(deletePayment.pending, (state) => {
				state.deleteStatus = "loading";
				state.deleteError = null;
			})
			.addCase(deletePayment.fulfilled, (state, action) => {
				state.deleteStatus = "succeeded";

				// Remove the payment from the list
				state.payments = state.payments.filter(
					(p) => p.id !== action.payload.id
				);

				// Clear selected payment if it's the same one
				if (
					state.selectedPayment &&
					state.selectedPayment.id === action.payload.id
				) {
					state.selectedPayment = null;
				}
			})
			.addCase(deletePayment.rejected, (state, action) => {
				state.deleteStatus = "failed";
				state.deleteError = action.payload ?? "Failed to delete payment";
			});

		// Fetch All Admin Payments Sequentially (for accounting)
		builder
			.addCase(fetchAllAdminPaymentsSequentially.pending, (state) => {
				state.status = "loading"; // Use the main status for this heavy operation
				state.error = null;
				state.payments = []; // Clear previous results before fetching all
				state.pagination = null;
			})
			.addCase(fetchAllAdminPaymentsSequentially.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.payments = action.payload; // Replace state with the full list of all payments
				// We set pagination to reflect that we have all the data
				state.pagination = {
					totalItems: action.payload.length,
					currentPage: 1,
					limit: action.payload.length,
					totalPages: 1,
				};
			})
			.addCase(fetchAllAdminPaymentsSequentially.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch all payments";
			});

		// Generate Receipt (no state changes needed for success case)
		builder.addCase(generateReceipt.rejected, (state, action) => {
			state.error = action.payload ?? "Failed to generate receipt";
		});
	},
});

// --- Actions ---
export const {
	clearAdminPaymentsError,
	setDateRange,
	resetAdminPaymentsState,
	setSelectedPayment,
} = adminPaymentsSlice.actions;

// --- Selectors ---
export const selectAdminPayments = (state: RootState) =>
	state.adminPayments.payments;
export const selectAdminPaymentsPagination = (state: RootState) =>
	state.adminPayments.pagination;
export const selectAdminPaymentsStatus = (state: RootState) =>
	state.adminPayments.status;
export const selectAdminPaymentsError = (state: RootState) =>
	state.adminPayments.error;

export const selectPaymentStats = (state: RootState) =>
	state.adminPayments.stats;
export const selectPaymentStatsStatus = (state: RootState) =>
	state.adminPayments.statsStatus;
export const selectPaymentStatsError = (state: RootState) =>
	state.adminPayments.statsError;

export const selectSelectedPayment = (state: RootState) =>
	state.adminPayments.selectedPayment;
export const selectUpdatePaymentStatus = (state: RootState) =>
	state.adminPayments.updateStatus;
export const selectUpdatePaymentError = (state: RootState) =>
	state.adminPayments.updateError;

export const selectDeletePaymentStatus = (state: RootState) =>
	state.adminPayments.deleteStatus;
export const selectDeletePaymentError = (state: RootState) =>
	state.adminPayments.deleteError;

export const selectDateRange = (state: RootState) =>
	state.adminPayments.dateRange;

export default adminPaymentsSlice.reducer;
