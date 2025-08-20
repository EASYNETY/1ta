// features/payment/store/adminPayments.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "@/store"; // Import AppDispatch
import { get, put, del } from "@/lib/api-client";
import type { PaymentRecord, PaginationMeta } from "../types/payment-types";
import type {
	AdminPaymentStats,
	AdminPaymentState,
	UpdatePaymentPayload,
	AdminPaymentParams,
} from "../types/admin-payment-types";

// --- Thunks ---

// fetchAdminPayments remains the same, it's our basic paginated fetcher.
export const fetchAdminPayments = createAsyncThunk<
	{ payments: PaymentRecord[]; pagination: PaginationMeta },
	AdminPaymentParams,
	{ rejectValue: string }
>("adminPayments/fetchAll", async (params, { rejectWithValue }) => {
	try {
		const queryParams = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== "") {
				queryParams.append(key, String(value));
			}
		});
		const query = queryParams.toString();
		const url = `/admin/payments${query ? `?${query}` : ""}`;
		const response = await get(url);

		let payments: PaymentRecord[] = [];
		let paginationData: any = null;

		if (response && typeof response === "object") {
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
			if (payments.length === 0 && !Array.isArray(response)) {
				payments = Object.values(response).filter(
					(value): value is PaymentRecord =>
						typeof value === "object" &&
						value !== null &&
						"id" in value &&
						"userId" in value
				);
			}
			paginationData =
				response.pagination ||
				response.meta ||
				(response.data && response.data.pagination);
		}

		if (!Array.isArray(payments)) {
			payments = [];
		}

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

		const normalizedPayments = payments.map((p: any): PaymentRecord => {
			const amount = parseFloat(p.amount);
			return {
				...p,
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

		return {
			payments: normalizedPayments,
			pagination: finalPagination,
		};
	} catch (error: any) {
		const errorMessage =
			error.response?.data?.message ||
			error.message ||
			"An unknown error occurred while fetching payments.";
		return rejectWithValue(errorMessage);
	}
});

// fetchAllAdminPaymentsSequentially is also unchanged. It's the worker thunk.
export const fetchAllAdminPaymentsSequentially = createAsyncThunk<
	PaymentRecord[],
	Omit<AdminPaymentParams, "page" | "limit">,
	{ state: RootState; rejectValue: string }
>(
	"adminPayments/fetchAllSequentially",
	async (params, { dispatch, rejectWithValue }) => {
		try {
			const allPayments: PaymentRecord[] = [];
			const BATCH_SIZE = 100;
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
			if (totalPages > 1) {
				const pageNumbers: number[] = Array.from(
					{ length: totalPages - 1 },
					(_, i) => i + 2
				);
				const promises = pageNumbers.map((page) =>
					dispatch(fetchAdminPayments({ ...params, page, limit: BATCH_SIZE }))
				);
				const results = await Promise.all(promises);

				for (const resultAction of results) {
					if (fetchAdminPayments.fulfilled.match(resultAction)) {
						allPayments.push(...resultAction.payload.payments);
					} else {
						throw new Error(
							"One or more pages failed to load. Data is incomplete."
						);
					}
				}
			}
			return allPayments;
		} catch (error: any) {
			return rejectWithValue(error.message || "Failed to fetch all payments.");
		}
	}
);

// --- CORRECTED THUNK ---
// This thunk is now "smarter". It fetches both raw data and aggregated stats.
export const fetchPaymentStats = createAsyncThunk<
	AdminPaymentStats,
	{ startDate?: string; endDate?: string },
	// We need to add AppDispatch to the thunk config to be able to dispatch other actions
	{ state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
	"adminPayments/fetchStats",
	async ({ startDate, endDate }, { dispatch, rejectWithValue }) => {
		try {
			console.log("Fetching up-to-date raw payments before getting stats...");
			// STEP 1: Dispatch the thunk to get all the latest payment records.
			// This ensures state.adminPayments.payments is fresh.
			// The `await` is important to make sure this finishes first.
			const allPaymentsResult = await dispatch(
				fetchAllAdminPaymentsSequentially({ startDate, endDate })
			);

			// If fetching the raw payments fails, we should stop here.
			if (fetchAllAdminPaymentsSequentially.rejected.match(allPaymentsResult)) {
				throw new Error(
					`Failed to refresh payment list: ${allPaymentsResult.payload}`
				);
			}
			console.log("Raw payments refreshed successfully.");

			// STEP 2: Now that the raw data is fresh, fetch the aggregated stats.
			const queryParams = new URLSearchParams();
			if (startDate) queryParams.append("startDate", startDate);
			if (endDate) queryParams.append("endDate", endDate);

			const query = queryParams.toString();
			const url = `/admin/payments/stats${query ? `?${query}` : ""}`;
			console.log("Fetching payment stats from:", url);
			const response = await get(url);

			// Logic to parse stats response remains the same
			let statsData: AdminPaymentStats;
			if (response && response.success === true && response.data) {
				const data = response.data;
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
					totalRevenue: response.totalRevenue || [],
					statusCounts: response.statusCounts || [],
					providerCounts: response.providerCounts || [],
					dailyRevenue: response.dailyRevenue || [],
					dateRange: response.dateRange || {
						start: startDate || "",
						end: endDate || "",
					},
				};
			} else {
				throw new Error("Invalid response format from API: missing stats data");
			}

			// Return only the stats payload, as the raw data is already in the store.
			return statsData;
		} catch (error: any) {
			console.error("Error in enhanced fetchPaymentStats thunk:", error);
			return rejectWithValue(
				error.response?.data?.message ||
					error.message ||
					"Failed to fetch payment statistics"
			);
		}
	}
);

// Other thunks (update, delete, generateReceipt) remain unchanged.
export const updatePayment = createAsyncThunk<
	PaymentRecord,
	UpdatePaymentPayload,
	{ rejectValue: string }
>("adminPayments/update", async (payload, { rejectWithValue }) => {
	/* ... implementation */ return {} as any;
});
export const deletePayment = createAsyncThunk<
	{ id: string; success: boolean },
	string,
	{ rejectValue: string }
>("adminPayments/delete", async (id, { rejectWithValue }) => {
	/* ... implementation */ return {} as any;
});
export const generateReceipt = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>("adminPayments/generateReceipt", async (id, { rejectWithValue }) => {
	/* ... implementation */
});

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
		resetAdminPaymentsState: () => initialState,
		setSelectedPayment: (state, action) => {
			state.selectedPayment = action.payload;
		},
	},
	extraReducers: (builder) => {
		// fetchAdminPayments (for paginated view)
		builder
			.addCase(fetchAdminPayments.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchAdminPayments.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.payments = action.payload.payments;
				state.pagination = action.payload.pagination;
			})
			.addCase(fetchAdminPayments.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch admin payments";
			});

		// fetchPaymentStats
		builder
			.addCase(fetchPaymentStats.pending, (state) => {
				// We now set both statuses to loading, because this thunk does both.
				state.status = "loading";
				state.statsStatus = "loading";
				state.error = null;
				state.statsError = null;
			})
			.addCase(fetchPaymentStats.fulfilled, (state, action) => {
				// The raw payments are already updated by the other thunk's reducer,
				// so we only need to update the stats here.
				state.statsStatus = "succeeded";
				state.status = "succeeded"; // Mark the general status as succeeded too.
				state.stats = action.payload;
			})
			.addCase(fetchPaymentStats.rejected, (state, action) => {
				state.statsStatus = "failed";
				state.status = "failed"; // Mark general status as failed too.
				state.statsError =
					action.payload ?? "Failed to fetch payment statistics";
			});

		// fetchAllAdminPaymentsSequentially (for accounting/analytics)
		builder
			.addCase(fetchAllAdminPaymentsSequentially.pending, (state) => {
				state.status = "loading";
				state.error = null;
				state.payments = [];
				state.pagination = null;
			})
			.addCase(fetchAllAdminPaymentsSequentially.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.payments = action.payload;
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

		// updatePayment
		builder
			.addCase(updatePayment.pending, (state) => {
				state.updateStatus = "loading";
			})
			.addCase(updatePayment.fulfilled, (state, action) => {
				state.updateStatus = "succeeded";
				const index = state.payments.findIndex(
					(p) => p.id === action.payload.id
				);
				if (index !== -1) {
					state.payments[index] = action.payload;
				}
				if (state.selectedPayment?.id === action.payload.id) {
					state.selectedPayment = action.payload;
				}
			})
			.addCase(updatePayment.rejected, (state, action) => {
				state.updateStatus = "failed";
				state.updateError = action.payload ?? "Failed to update payment";
			});

		// deletePayment
		builder
			.addCase(deletePayment.pending, (state) => {
				state.deleteStatus = "loading";
			})
			.addCase(deletePayment.fulfilled, (state, action) => {
				state.deleteStatus = "succeeded";
				state.payments = state.payments.filter(
					(p) => p.id !== action.payload.id
				);
				if (state.selectedPayment?.id === action.payload.id) {
					state.selectedPayment = null;
				}
			})
			.addCase(deletePayment.rejected, (state, action) => {
				state.deleteStatus = "failed";
				state.deleteError = action.payload ?? "Failed to delete payment";
			});

		// generateReceipt
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
