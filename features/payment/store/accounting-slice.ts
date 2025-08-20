// features/accounting/store/accounting-slice.ts

import {
	createSlice,
	createSelector,
	createAsyncThunk,
} from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { fetchAllAdminPaymentsSequentially, fetchUnifiedPaymentData } from "@/features/payment/store/adminPayments";
import type { PaymentRecord } from "@/features/payment/types/payment-types";
import type {
	AccountingState,
	AccountingStats,
	CourseRevenue,
	MonthlyRevenue,
	PaymentMethodDistribution,
} from "../types/accounting-types";
import {
	calculateAccountingStats,
	calculateCourseRevenues,
	calculateMonthlyRevenueTrend,
	calculatePaymentMethodDistribution,
} from "../utils/accounting-calculations";

// Enhanced fetchAccountingData that ensures data synchronization
export const fetchAccountingData = createAsyncThunk<
	{ payments: PaymentRecord[]; timestamp: number },
	{ startDate?: string; endDate?: string } | void,
	{ state: RootState; rejectValue: string }
>(
	"accounting/fetchData",
	async (params, { dispatch, rejectWithValue }) => {
		try {
			console.log('[fetchAccountingData] Starting fetch with params:', params);
			const payload = params || {};

			// Use the unified fetch to get both payments and stats
			const unifiedResult = await dispatch(
				fetchUnifiedPaymentData({
					startDate: payload.startDate,
					endDate: payload.endDate,
					forceRefresh: true, // Force refresh to ensure fresh data
				})
			);

			if (fetchUnifiedPaymentData.rejected.match(unifiedResult)) {
				console.warn('[fetchAccountingData] Unified fetch rejected:', unifiedResult.payload);
				return rejectWithValue(unifiedResult.payload as string);
			}

			// Extract payments from the unified result
			const payments = unifiedResult.payload.payments || [];
			console.log('[fetchAccountingData] Successfully fetched payments:', payments.length);

			return {
				payments,
				timestamp: Date.now(),
			};
		} catch (error: any) {
			console.error('[fetchAccountingData] Error:', error);
			return rejectWithValue(
				error.message || "An unknown error occurred while fetching accounting data"
			);
		}
	}
);

const initialState: AccountingState = {
	dateRange: {
		startDate: null,
		endDate: null,
	},
	status: "idle",
	error: null,
	// Store the filtered payments directly in accounting slice for consistency
	filteredPayments: [],
	lastUpdateTimestamp: null,
};

const accountingSlice = createSlice({
	name: "accounting",
	initialState: {
		...initialState,
		filteredPayments: [] as PaymentRecord[],
		lastUpdateTimestamp: null as number | null,
	},
	reducers: {
		setDateRange: (
			state,
			action: { payload: { startDate: string | null; endDate: string | null } }
		) => {
			state.dateRange.startDate = action.payload.startDate;
			state.dateRange.endDate = action.payload.endDate;
		},
		clearAccountingError: (state) => {
			state.error = null;
		},
		resetAccountingState: (state) => {
			state.dateRange.startDate = null;
			state.dateRange.endDate = null;
			state.status = "idle";
			state.error = null;
			state.filteredPayments = [];
			state.lastUpdateTimestamp = null;
		},
		// Manual sync action for when adminPayments updates
		syncPaymentsFromAdmin: (state, action: { payload: PaymentRecord[] }) => {
			state.filteredPayments = action.payload;
			state.lastUpdateTimestamp = Date.now();
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAccountingData.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchAccountingData.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.filteredPayments = action.payload.payments;
				state.lastUpdateTimestamp = action.payload.timestamp;
				console.log('[accountingSlice] Updated with payments:', action.payload.payments.length);
			})
			.addCase(fetchAccountingData.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Unknown error fetching accounting data";
				console.error('[accountingSlice] Fetch rejected:', action.payload);
			});
	},
});

export const { setDateRange, clearAccountingError, resetAccountingState, syncPaymentsFromAdmin } =
	accountingSlice.actions;

// --- ENHANCED SELECTORS ---

export const selectAccountingStatus = (state: RootState) => state.accounting.status;
export const selectAccountingError = (state: RootState) => state.accounting.error;
export const selectDateRange = (state: RootState) => state.accounting.dateRange;
export const selectLastUpdateTimestamp = (state: RootState) => state.accounting.lastUpdateTimestamp;

// Primary selector for filtered payments - uses local state first, falls back to adminPayments
const selectFilteredPaymentsForAccounting = createSelector(
	[
		(state: RootState) => state.accounting.filteredPayments,
		(state: RootState) => state.adminPayments.payments,
		selectDateRange,
		selectLastUpdateTimestamp,
	],
	(localPayments, adminPayments, dateRange, lastUpdate) => {
		console.log('[selectFilteredPaymentsForAccounting] Called with:', {
			localPaymentsCount: localPayments?.length || 0,
			adminPaymentsCount: adminPayments?.length || 0,
			hasDateRange: !!(dateRange.startDate || dateRange.endDate),
			lastUpdate,
		});

		// If we have local filtered payments and they're recent, use them
		if (localPayments && localPayments.length > 0 && lastUpdate) {
			const isRecent = Date.now() - lastUpdate < 60000; // 1 minute
			if (isRecent) {
				console.log('[selectFilteredPaymentsForAccounting] Using local payments:', localPayments.length);
				return localPayments;
			}
		}

		// Otherwise, filter admin payments by date range
		const paymentsToFilter = adminPayments || [];
		
		if (!dateRange.startDate && !dateRange.endDate) {
			console.log('[selectFilteredPaymentsForAccounting] No date range, returning all admin payments:', paymentsToFilter.length);
			return paymentsToFilter;
		}

		const filtered = paymentsToFilter.filter((payment) => {
			try {
				const paymentDate = new Date(payment.createdAt);
				const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
				if (start) start.setHours(0, 0, 0, 0);
				const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
				if (end) end.setHours(23, 59, 59, 999);

				if (start && paymentDate < start) return false;
				if (end && paymentDate > end) return false;
				return true;
			} catch (e) {
				console.warn(`Could not parse date for payment ${payment.id}: ${payment.createdAt}`);
				return false;
			}
		});

		console.log('[selectFilteredPaymentsForAccounting] Filtered payments:', filtered.length);
		return filtered;
	}
);

// Derived selectors with better error handling
export const selectAccountingStats = createSelector(
	[selectFilteredPaymentsForAccounting],
	(filteredPayments): AccountingStats => {
		console.log('[selectAccountingStats] Calculating stats for payments:', filteredPayments?.length || 0);
		if (!filteredPayments || filteredPayments.length === 0) {
			return {
				totalRevenue: 0,
				pendingPaymentsAmount: 0,
				reconciledTransactionCount: 0,
				totalTransactionCount: 0,
				failedTransactionCount: 0,
				totalRevenueLastPeriod: 0,
			};
		}
		return calculateAccountingStats(filteredPayments);
	}
);

export const selectCourseRevenues = createSelector(
	[selectFilteredPaymentsForAccounting],
	(filteredPayments): CourseRevenue[] => {
		console.log('[selectCourseRevenues] Calculating course revenues for payments:', filteredPayments?.length || 0);
		if (!filteredPayments || filteredPayments.length === 0) {
			return [];
		}
		return calculateCourseRevenues(filteredPayments);
	}
);

export const selectMonthlyRevenueTrend = createSelector(
	[selectFilteredPaymentsForAccounting],
	(filteredPayments): MonthlyRevenue[] => {
		console.log('[selectMonthlyRevenueTrend] Calculating monthly trends for payments:', filteredPayments?.length || 0);
		if (!filteredPayments || filteredPayments.length === 0) {
			return [];
		}
		return calculateMonthlyRevenueTrend(filteredPayments);
	}
);

export const selectPaymentMethodDistribution = createSelector(
	[selectFilteredPaymentsForAccounting],
	(filteredPayments): PaymentMethodDistribution[] => {
		console.log('[selectPaymentMethodDistribution] Calculating payment method distribution for payments:', filteredPayments?.length || 0);
		if (!filteredPayments || filteredPayments.length === 0) {
			return [];
		}
		return calculatePaymentMethodDistribution(filteredPayments);
	}
);

// Debug selector to help with troubleshooting
export const selectAccountingDebugInfo = createSelector(
	[
		selectFilteredPaymentsForAccounting,
		selectAccountingStats,
		selectCourseRevenues,
		selectAccountingStatus,
		selectDateRange,
	],
	(payments, stats, courses, status, dateRange) => ({
		paymentsCount: payments?.length || 0,
		statsCalculated: !!stats,
		totalRevenue: stats?.totalRevenue || 0,
		coursesCount: courses?.length || 0,
		status,
		dateRange,
		timestamp: Date.now(),
	})
);

export default accountingSlice.reducer;