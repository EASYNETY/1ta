// features/accounting/store/accounting-slice.ts

import {
	createSlice,
	createSelector,
	createAsyncThunk,
} from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { fetchAllAdminPaymentsSequentially } from "@/features/payment/store/adminPayments";
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

// This is the restored "wrapper" thunk. Components call this single action.
export const fetchAccountingData = createAsyncThunk<
	void,
	{ startDate?: string; endDate?: string } | void,
	{ state: RootState; rejectValue: string }
>(
	"accounting/fetchData",
	async (params, { dispatch, rejectWithValue }) => {
		try {
			console.log('[fetchAccountingData] invoked with params:', params)
			// Use provided params or fall back to empty
			const payload = params || {};

			// Dispatch the REAL data-fetching thunk from the adminPayments slice with date filters.
			const resultAction = await dispatch(
				fetchAllAdminPaymentsSequentially({
					startDate: payload.startDate,
					endDate: payload.endDate,
				})
			);

			if (fetchAllAdminPaymentsSequentially.rejected.match(resultAction)) {
				console.warn('[fetchAccountingData] underlying fetchAllAdminPaymentsSequentially rejected', resultAction.payload)
				return rejectWithValue(resultAction.payload as string);
			}

			console.log('[fetchAccountingData] underlying fetchAllAdminPaymentsSequentially fulfilled')

			return;
		} catch (error: any) {
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
};

const accountingSlice = createSlice({
	name: "accounting",
	initialState,
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
		},
	},
	// The extraReducers listen to our local fetchAccountingData thunk.
	// This correctly mirrors the status of the underlying fetch operation.
	extraReducers: (builder) => {
		builder
			.addCase(fetchAccountingData.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchAccountingData.fulfilled, (state) => {
				state.status = "succeeded";
			})
			.addCase(fetchAccountingData.rejected, (state, action) => {
				state.status = "failed";
				state.error =
					action.payload ?? "Unknown error fetching accounting data";
			});
	},
});

export const { setDateRange, clearAccountingError, resetAccountingState } =
	accountingSlice.actions;

// --- SELECTORS ---
// These selectors are unchanged and will work correctly with this fix.

export const selectAccountingStatus = (state: RootState) =>
	state.accounting.status;
export const selectAccountingError = (state: RootState) =>
	state.accounting.error;
export const selectDateRange = (state: RootState) => state.accounting.dateRange;

// Selects the raw payment data from its true source in the adminPayments slice.
const selectAllAdminPayments = (state: RootState) =>
	state.adminPayments.payments;

// This selector correctly filters the raw payments based on the local dateRange.
const selectFilteredPaymentsForAccounting = createSelector(
	[selectAllAdminPayments, selectDateRange],
	(allPayments, dateRange) => {
		// If no date range is set, return all payments
		if (!dateRange.startDate && !dateRange.endDate) {
			return allPayments;
		}

		// Otherwise, filter the payments by the date range
		return allPayments.filter((payment) => {
			try {
				const paymentDate = new Date(payment.createdAt);
				const start = dateRange.startDate
					? new Date(dateRange.startDate)
					: null;
				if (start) start.setHours(0, 0, 0, 0); // Set to start of the day
				const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
				if (end) end.setHours(23, 59, 59, 999); // Set to end of the day

				if (start && paymentDate < start) return false;
				if (end && paymentDate > end) return false;
				return true;
			} catch (e) {
				// Safely ignore payments with invalid date strings
				console.warn(
					`Could not parse date for payment ${payment.id}: ${payment.createdAt}`
				);
				return false;
			}
		});
	}
);

// The rest of the selectors derive data from the filtered list. No changes needed.
export const selectAccountingStats = createSelector(
	[selectFilteredPaymentsForAccounting],
	(filteredPayments): AccountingStats =>
		calculateAccountingStats(filteredPayments)
);

export const selectCourseRevenues = createSelector(
	[selectFilteredPaymentsForAccounting],
	(filteredPayments): CourseRevenue[] =>
		calculateCourseRevenues(filteredPayments)
);

export const selectMonthlyRevenueTrend = createSelector(
	[selectFilteredPaymentsForAccounting],
	(filteredPayments): MonthlyRevenue[] =>
		calculateMonthlyRevenueTrend(filteredPayments)
);

export const selectPaymentMethodDistribution = createSelector(
	[selectFilteredPaymentsForAccounting],
	(filteredPayments): PaymentMethodDistribution[] =>
		calculatePaymentMethodDistribution(filteredPayments)
);

export default accountingSlice.reducer;
