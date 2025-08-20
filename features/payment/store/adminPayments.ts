// features/payment/store/adminPayments.ts - Enhanced with data consistency fixes
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "@/store";
import { get, post, put, del, clearAllCaches } from "@/lib/api-client";
import type { PaymentRecord, PaginationMeta } from "../types/payment-types";
import type {
	AdminPaymentStats,
	AdminPaymentState,
	UpdatePaymentPayload,
	AdminPaymentParams,
} from "../types/admin-payment-types";

// --- Enhanced Unified Data Fetching ---
interface UnifiedPaymentData {
	payments: PaymentRecord[];
	stats: AdminPaymentStats;
	timestamp: number;
}

// This is the new unified thunk that ensures data consistency
export const fetchUnifiedPaymentData = createAsyncThunk<
	UnifiedPaymentData,
	{ startDate?: string; endDate?: string; forceRefresh?: boolean },
	{ state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
	"adminPayments/fetchUnifiedData",
	async ({ startDate, endDate, forceRefresh = false }, { dispatch, rejectWithValue }) => {
		try {
			console.log("🔄 Starting unified payment data fetch...");
			
			// Clear caches if force refresh
			if (forceRefresh) {
				clearAllCaches();
			}

			// Step 1: Fetch all raw payment data first
			console.log("📊 Fetching raw payment data...");
			const rawDataResult = await dispatch(
				fetchAllAdminPaymentsSequentially({ startDate, endDate })
			);

			if (fetchAllAdminPaymentsSequentially.rejected.match(rawDataResult)) {
				throw new Error(`Failed to fetch payments: ${rawDataResult.payload}`);
			}

			// Step 2: Fetch aggregated stats with the same date range
			console.log("📈 Fetching aggregated stats...");
			const statsParams = {
				startDate,
				endDate,
				_timestamp: Date.now(), // Cache buster
			};
			
			const statsResult = await dispatch(fetchPaymentStatsOnly(statsParams));

			let statsData: AdminPaymentStats;
			if (fetchPaymentStatsOnly.fulfilled.match(statsResult)) {
				statsData = statsResult.payload;
			} else {
				console.warn("Stats fetch failed, using empty stats");
				statsData = {
					totalRevenue: [],
					statusCounts: [],
					providerCounts: [],
					dailyRevenue: [],
					dateRange: {
						start: startDate || "",
						end: endDate || "",
					},
				};
			}

			// Normalize raw payments payload to a consistent array of PaymentRecord
			let rawPayments: any[] = [];

			// The dispatched thunk may return different shapes depending on which
			// underlying path fulfilled. Handle common variants explicitly.
			const rawPayload = (rawDataResult as any).payload;
			if (fetchAllAdminPaymentsSequentially.fulfilled.match(rawDataResult)) {
				rawPayments = rawPayload as any[];
			} else if (rawPayload && Array.isArray((rawPayload as any).payments)) {
				rawPayments = (rawPayload as any).payments;
			} else if (rawPayload && Array.isArray((rawPayload as any).data)) {
				rawPayments = (rawPayload as any).data;
			} else if (Array.isArray(rawPayload)) {
				rawPayments = rawPayload as any[];
			}

			// Ensure we always return a PaymentRecord[] with normalized fields
			const normalizedPayments: PaymentRecord[] = (rawPayments || []).map((p: any): PaymentRecord => {
				const amount = parseFloat(p.amount) || 0;
				return {
					...p,
					id: p.id || p.invoiceId || `missing-id-${Math.random()}`,
					userId: p.userId || p.user_id || "N/A",
					userName: p.userName || p.user_name || "N/A",
					amount: amount,
					currency: p.currency || "NGN",
					status: p.status || "unknown",
					provider: p.provider || "unknown",
					createdAt: p.createdAt || p.created_at || new Date().toISOString(),
					description: p.description || p.invoice?.description || "No description",
					invoiceId: p.invoiceId || p.invoice_id || p.invoice?.id || null,
					metadata: p.metadata || {},
					relatedItemIds: Array.isArray(p.relatedItemIds) ? p.relatedItemIds : [],
					reconciliationStatus: p.reconciliationStatus || "pending",
				} as PaymentRecord;
			});

			const unifiedData: UnifiedPaymentData = {
				payments: normalizedPayments,
				stats: statsData,
				timestamp: Date.now(),
			};

			console.log("✅ Unified data fetch completed:", {
				paymentsCount: unifiedData.payments.length,
				hasStats: !!unifiedData.stats,
				timestamp: unifiedData.timestamp,
			});

			return unifiedData;
		} catch (error: any) {
			console.error("❌ Unified data fetch failed:", error);
			return rejectWithValue(
				error.message || "Failed to fetch unified payment data"
			);
		}
	}
);

// Separate stats-only thunk for internal use
const fetchPaymentStatsOnly = createAsyncThunk<
	AdminPaymentStats,
	{ startDate?: string; endDate?: string; _timestamp?: number },
	{ rejectValue: string }
>(
	"adminPayments/fetchStatsOnly",
	async ({ startDate, endDate }, { rejectWithValue }) => {
		try {
			const queryParams = new URLSearchParams();
			if (startDate) queryParams.append("startDate", startDate);
			if (endDate) queryParams.append("endDate", endDate);

			const query = queryParams.toString();
			const url = `/admin/payments/stats${query ? `?${query}` : ""}`;
	const response = await get(url);
	const respAny: any = response;
			// Debug: log raw response from API client to diagnose empty results
			try {
				// Avoid noisy logs in prod; only log during development
				if (process.env.NODE_ENV !== 'production') {
					console.log(`[DEBUG fetchAdminPayments] raw response for ${url}:`, response);
				}
			} catch (e) {
				/* ignore logging errors */
			}

			let statsData: AdminPaymentStats;
			if (respAny && respAny.success === true && respAny.data) {
				const data = respAny.data;
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
				const respObj: any = response;
				statsData = {
					totalRevenue: respObj.totalRevenue || [],
					statusCounts: respObj.statusCounts || [],
					providerCounts: respObj.providerCounts || [],
					dailyRevenue: respObj.dailyRevenue || [],
					dateRange: respObj.dateRange || {
						start: startDate || "",
						end: endDate || "",
					},
				};
			} else {
				throw new Error("Invalid response format from API: missing stats data");
			}

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

// Updated fetchAdminPayments with better error handling
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

		// Enhanced response parsing with better error handling
	if (respAny && typeof respAny === "object") {
			// Try different possible data structures
			const possiblePaymentKeys = [
				"data",
				"payments",
				"items",
				"results",
				"records",
			];
			
			for (const key of possiblePaymentKeys) {
				if (Array.isArray((respAny as any)[key])) {
					payments = (respAny as any)[key];
					break;
				}
				if (respAny.data && Array.isArray((respAny.data as any)[key])) {
					payments = (respAny.data as any)[key];
					break;
				}
			}
			
			// If still no payments found, check if response itself is an array
			if (payments.length === 0 && Array.isArray(respAny)) {
				payments = respAny;
			}

			// Extract pagination data
			paginationData =
				respAny.pagination ||
				respAny.meta ||
				(respAny.data && respAny.data.pagination);
		}

		// Ensure payments is an array
		if (!Array.isArray(payments)) {
			payments = [];
		}

		// Create fallback pagination if none provided
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

		// Normalize payment records with consistent data types
	const normalizedPayments = payments.map((p: any): PaymentRecord => {
			const amount = parseFloat(p.amount) || 0;
			return {
				...p,
				id: p.id || `missing-id-${Math.random()}`,
				userId: p.userId || "N/A",
				userName: p.userName || "N/A",
				amount: amount,
				currency: p.currency || "NGN",
				status: p.status || "unknown",
				provider: p.provider || "unknown",
				createdAt: p.createdAt || p.created_at || new Date().toISOString(),
				description:
					p.description || p.invoice?.description || "No description",
				invoiceId: p.invoiceId || p.invoice_id || p.invoice?.id || null,
				metadata: p.metadata || {},
				relatedItemIds: Array.isArray(p.relatedItemIds) ? p.relatedItemIds : [],
				reconciliationStatus: p.reconciliationStatus || "pending",
			};
		});

		return {
			payments: normalizedPayments,
			pagination: finalPagination,
		};
	} catch (error: any) {
		console.error("fetchAdminPayments error:", error);
		const errorMessage =
			error.response?.data?.message ||
			error.message ||
			"An unknown error occurred while fetching payments.";
		return rejectWithValue(errorMessage);
	}
});

// Updated fetchAllAdminPaymentsSequentially with better performance
export const fetchAllAdminPaymentsSequentially = createAsyncThunk<
	PaymentRecord[],
	Omit<AdminPaymentParams, "page" | "limit">,
	{ state: RootState; rejectValue: string }
>(
	"adminPayments/fetchAllSequentially",
	async (params, { dispatch, rejectWithValue }) => {
			try {
				console.log('[fetchAllAdminPaymentsSequentially] invoked with params:', params)
			const allPayments: PaymentRecord[] = [];
			const BATCH_SIZE = 100;
			
			// First batch
			const initialResultAction = await dispatch(
				fetchAdminPayments({ ...params, page: 1, limit: BATCH_SIZE })
			);

			if (fetchAdminPayments.rejected.match(initialResultAction)) {
				throw new Error(initialResultAction.payload);
			}

			const { payments: firstPagePayments, pagination: paginationMeta } =
				initialResultAction.payload;
			allPayments.push(...firstPagePayments);

			// Fetch remaining pages if needed
			const totalPages = paginationMeta.totalPages;
			if (totalPages > 1) {
				console.log(`📄 Fetching ${totalPages - 1} additional pages...`);
				
				// Batch requests in smaller groups to avoid overwhelming the server
				const CONCURRENT_REQUESTS = 3;
				const pageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
				
				for (let i = 0; i < pageNumbers.length; i += CONCURRENT_REQUESTS) {
					const batch = pageNumbers.slice(i, i + CONCURRENT_REQUESTS);
					const promises = batch.map((page) =>
						dispatch(fetchAdminPayments({ ...params, page, limit: BATCH_SIZE }))
					);
					
					const results = await Promise.all(promises);
					
					for (const resultAction of results) {
						if (fetchAdminPayments.fulfilled.match(resultAction)) {
							allPayments.push(...resultAction.payload.payments);
						} else {
							console.warn(`Failed to fetch page, continuing...`);
						}
					}
				}
			}
			
			console.log(`✅ Fetched ${allPayments.length} total payments`);
			return allPayments;
		} catch (error: any) {
			console.error("fetchAllAdminPaymentsSequentially error:", error);
			return rejectWithValue(error.message || "Failed to fetch all payments.");
		}
	}
);

// Legacy thunk for backward compatibility - now uses unified approach
export const fetchPaymentStats = createAsyncThunk<
	AdminPaymentStats,
	{ startDate?: string; endDate?: string },
	{ state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
	"adminPayments/fetchStats",
	async (params, { dispatch, rejectWithValue }) => {
		try {
			console.log("⚠️ Using legacy fetchPaymentStats - consider using fetchUnifiedPaymentData");
			
			const unifiedResult = await dispatch(fetchUnifiedPaymentData(params));
			
			if (fetchUnifiedPaymentData.fulfilled.match(unifiedResult)) {
				return unifiedResult.payload.stats;
			} else {
				throw new Error("Failed to fetch unified data");
			}
		} catch (error: any) {
			return rejectWithValue(error.message || "Failed to fetch payment statistics");
		}
	}
);

// Other thunks remain the same but with better error handling
export const updatePayment = createAsyncThunk<
	PaymentRecord,
	UpdatePaymentPayload,
	{ rejectValue: string }
>("adminPayments/update", async (payload, { rejectWithValue }) => {
	try {
		const { id, ...updateData } = payload;
	const response = await put(`/admin/payments/${id}`, updateData);
	return response as PaymentRecord;
	} catch (error: any) {
		return rejectWithValue(
			error.response?.data?.message || error.message || "Failed to update payment"
		);
	}
});

export const deletePayment = createAsyncThunk<
	{ id: string; success: boolean },
	string,
	{ rejectValue: string }
>("adminPayments/delete", async (id, { rejectWithValue }) => {
	try {
		await del(`/admin/payments/${id}`);
		return { id, success: true };
	} catch (error: any) {
		return rejectWithValue(
			error.response?.data?.message || error.message || "Failed to delete payment"
		);
	}
});

export const generateReceipt = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>("adminPayments/generateReceipt", async (id, { rejectWithValue }) => {
	try {
	await post(`/admin/payments/${id}/receipt`, {});
	} catch (error: any) {
		return rejectWithValue(
			error.response?.data?.message || error.message || "Failed to generate receipt"
		);
	}
});

// --- Enhanced Initial State ---
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
	lastFetchTimestamp: null, // Track when data was last fetched
	isDataStale: false, // Track if data might be stale
};

// --- Enhanced Slice ---
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
			// Mark data as potentially stale when date range changes
			state.isDataStale = true;
		},
		resetAdminPaymentsState: () => initialState,
		setSelectedPayment: (state, action) => {
			state.selectedPayment = action.payload;
		},
		markDataAsStale: (state) => {
			state.isDataStale = true;
		},
		markDataAsFresh: (state) => {
			state.isDataStale = false;
			state.lastFetchTimestamp = Date.now();
		},
	},
	extraReducers: (builder) => {
		// Unified data fetching
		builder
			.addCase(fetchUnifiedPaymentData.pending, (state) => {
				state.status = "loading";
				state.statsStatus = "loading";
				state.error = null;
				state.statsError = null;
			})
			.addCase(fetchUnifiedPaymentData.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.statsStatus = "succeeded";
				state.payments = action.payload.payments;
				state.stats = action.payload.stats;
				state.lastFetchTimestamp = action.payload.timestamp;
				state.isDataStale = false;
				// Update pagination for unified data (all data in one request)
				state.pagination = {
					totalItems: action.payload.payments.length,
					currentPage: 1,
					limit: action.payload.payments.length,
					totalPages: 1,
				};
			})
			.addCase(fetchUnifiedPaymentData.rejected, (state, action) => {
				state.status = "failed";
				state.statsStatus = "failed";
				state.error = action.payload ?? "Failed to fetch unified payment data";
				state.statsError = action.payload ?? "Failed to fetch payment statistics";
			});

		// Individual payment fetching (for paginated views)
		builder
			.addCase(fetchAdminPayments.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchAdminPayments.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.payments = action.payload.payments;
				state.pagination = action.payload.pagination;
				state.lastFetchTimestamp = Date.now();
			})
			.addCase(fetchAdminPayments.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch admin payments";
			});

		// Sequential payment fetching
		builder
			.addCase(fetchAllAdminPaymentsSequentially.pending, (state) => {
				state.status = "loading";
				state.error = null;
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
				state.lastFetchTimestamp = Date.now();
			})
			.addCase(fetchAllAdminPaymentsSequentially.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch all payments";
			});

		// Legacy stats fetching
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
				state.statsError = action.payload ?? "Failed to fetch payment statistics";
			});

		// Update/Delete operations
		builder
			.addCase(updatePayment.pending, (state) => {
				state.updateStatus = "loading";
				state.updateError = null;
			})
			.addCase(updatePayment.fulfilled, (state, action) => {
				state.updateStatus = "succeeded";
				const index = state.payments.findIndex((p) => p.id === action.payload.id);
				if (index !== -1) {
					state.payments[index] = action.payload;
				}
				if (state.selectedPayment?.id === action.payload.id) {
					state.selectedPayment = action.payload;
				}
				// Mark data as potentially stale after update
				state.isDataStale = true;
			})
			.addCase(updatePayment.rejected, (state, action) => {
				state.updateStatus = "failed";
				state.updateError = action.payload ?? "Failed to update payment";
			});

		builder
			.addCase(deletePayment.pending, (state) => {
				state.deleteStatus = "loading";
				state.deleteError = null;
			})
			.addCase(deletePayment.fulfilled, (state, action) => {
				state.deleteStatus = "succeeded";
				state.payments = state.payments.filter((p) => p.id !== action.payload.id);
				if (state.selectedPayment?.id === action.payload.id) {
					state.selectedPayment = null;
				}
				// Update pagination after deletion
				if (state.pagination) {
					state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
				}
				// Mark data as potentially stale after deletion
				state.isDataStale = true;
			})
			.addCase(deletePayment.rejected, (state, action) => {
				state.deleteStatus = "failed";
				state.deleteError = action.payload ?? "Failed to delete payment";
			});

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
	markDataAsStale,
	markDataAsFresh,
} = adminPaymentsSlice.actions;

// --- Enhanced Selectors ---
export const selectAdminPayments = (state: RootState) => state.adminPayments.payments;
export const selectAdminPaymentsPagination = (state: RootState) => state.adminPayments.pagination;
export const selectAdminPaymentsStatus = (state: RootState) => state.adminPayments.status;
export const selectAdminPaymentsError = (state: RootState) => state.adminPayments.error;
export const selectPaymentStats = (state: RootState) => state.adminPayments.stats;
export const selectPaymentStatsStatus = (state: RootState) => state.adminPayments.statsStatus;
export const selectPaymentStatsError = (state: RootState) => state.adminPayments.statsError;
export const selectSelectedPayment = (state: RootState) => state.adminPayments.selectedPayment;
export const selectUpdatePaymentStatus = (state: RootState) => state.adminPayments.updateStatus;
export const selectUpdatePaymentError = (state: RootState) => state.adminPayments.updateError;
export const selectDeletePaymentStatus = (state: RootState) => state.adminPayments.deleteStatus;
export const selectDeletePaymentError = (state: RootState) => state.adminPayments.deleteError;
export const selectDateRange = (state: RootState) => state.adminPayments.dateRange;
export const selectLastFetchTimestamp = (state: RootState) => state.adminPayments.lastFetchTimestamp;
export const selectIsDataStale = (state: RootState) => state.adminPayments.isDataStale;

// New enhanced selectors
export const selectIsDataFresh = (state: RootState, maxAgeMs: number = 300000) => { // 5 minutes default
	const timestamp = selectLastFetchTimestamp(state);
	if (!timestamp) return false;
	return Date.now() - timestamp < maxAgeMs;
};

export const selectShouldRefreshData = (state: RootState) => {
	return selectIsDataStale(state) || !selectIsDataFresh(state);
};

export default adminPaymentsSlice.reducer;