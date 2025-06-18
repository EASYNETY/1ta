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

export const fetchAccountingData = createAsyncThunk<
	PaymentRecord[], // It can still return the payments array on success
	void, // It no longer needs to accept any arguments
	{ state: RootState; rejectValue: string }
>(
	"accounting/fetchData", // Use the original thunk name
	async (_, { dispatch, rejectWithValue }) => {
		try {
			// Dispatch the REAL data-fetching thunk
			const resultAction = await dispatch(
				fetchAllAdminPaymentsSequentially({})
			);

			// Check if the underlying thunk failed and pass the error up
			if (fetchAllAdminPaymentsSequentially.rejected.match(resultAction)) {
				return rejectWithValue(resultAction.payload as string);
			}

			// If it succeeded, return the payload. The adminPayments slice will store it,
			// and this slice will just react to the status.
			return resultAction.payload as PaymentRecord[];
		} catch (error: any) {
			return rejectWithValue(error.message || "An unknown error occurred");
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
	// The extraReducers now listen to our local, restored fetchAccountingData thunk.
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

// --- SELECTORS (All original names are preserved) ---

export const selectAccountingStatus = (state: RootState) =>
	state.accounting.status;
export const selectAccountingError = (state: RootState) =>
	state.accounting.error;
export const selectDateRange = (state: RootState) => state.accounting.dateRange;

const selectAllAdminPayments = (state: RootState) =>
	state.adminPayments.payments;

const selectFilteredPaymentsForAccounting = createSelector(
	[selectAllAdminPayments, selectDateRange],
	(allPayments, dateRange) => {
		if (!dateRange.startDate && !dateRange.endDate) {
			return allPayments;
		}
		return allPayments.filter((payment) => {
			const paymentDate = new Date(payment.createdAt);
			const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
			if (start) start.setHours(0, 0, 0, 0);
			const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
			if (end) end.setHours(23, 59, 59, 999);
			if (start && paymentDate < start) return false;
			if (end && paymentDate > end) return false;
			return true;
		});
	}
);

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
