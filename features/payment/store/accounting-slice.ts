import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { fetchAllPaymentsAdmin } from "@/features/payment/store/payment-slice";
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

// Thunk to fetch all payment data for accounting
export const fetchAccountingData = createAsyncThunk<
	PaymentRecord[],
	{ startDate?: string; endDate?: string },
	{ state: RootState; rejectValue: string }
>(
	"accounting/fetchData",
	async ({ startDate, endDate }, { dispatch, rejectWithValue }) => {
		try {
			// Use the existing fetchAllPaymentsAdmin thunk to get payment data
			// We'll fetch a large number of payments to ensure we have enough data for calculations
			const result = await dispatch(
				fetchAllPaymentsAdmin({ limit: 10000, page: 1 })
			).unwrap();

			// Ensure we have payments data
			if (!result || !result.payments || !Array.isArray(result.payments)) {
				console.warn("No payments data returned from API:", result);
				return []; // Return empty array instead of throwing error
			}

			// Filter out any null or undefined payments
			const validPayments = result.payments.filter(payment => payment !== null && payment !== undefined);
			
			console.log(`Fetched ${validPayments.length} valid payments for accounting calculations`);
			
			return validPayments;
		} catch (error: any) {
			console.error("Error fetching accounting data:", error);
			// Return empty array instead of rejecting
			return [];
		}
	}
);

// Initial state
const initialState: AccountingState = {
	dateRange: {
		startDate: null,
		endDate: null,
	},
	status: "idle",
	error: null,
};

// Create the slice
const accountingSlice = createSlice({
	name: "accounting",
	initialState,
	reducers: {
		setDateRange: (state, action) => {
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

// Export actions
export const { setDateRange, clearAccountingError, resetAccountingState } =
	accountingSlice.actions;

// Selectors that derive data from the payment slice
export const selectAccountingStatus = (state: RootState) =>
	state.accounting.status;
export const selectAccountingError = (state: RootState) =>
	state.accounting.error;
export const selectDateRange = (state: RootState) => state.accounting.dateRange;

// Derived selectors that calculate accounting data from payment records
export const selectAccountingStats = (state: RootState): AccountingStats => {
	const payments = state.paymentHistory.allPayments;
	const dateRange = state.accounting.dateRange;

	let startDate = null;
	let endDate = null;

	if (dateRange.startDate) {
		startDate = new Date(dateRange.startDate);
	}

	if (dateRange.endDate) {
		endDate = new Date(dateRange.endDate);
	}

	return calculateAccountingStats(payments, { startDate, endDate });
};

export const selectCourseRevenues = (state: RootState): CourseRevenue[] => {
	const payments = state.paymentHistory.allPayments;
	const dateRange = state.accounting.dateRange;

	let startDate = null;
	let endDate = null;

	if (dateRange.startDate) {
		startDate = new Date(dateRange.startDate);
	}

	if (dateRange.endDate) {
		endDate = new Date(dateRange.endDate);
	}

	return calculateCourseRevenues(payments, { startDate, endDate });
};

export const selectMonthlyRevenueTrend = (
	state: RootState
): MonthlyRevenue[] => {
	const payments = state.paymentHistory.allPayments;
	const dateRange = state.accounting.dateRange;

	let startDate = null;
	let endDate = null;

	if (dateRange.startDate) {
		startDate = new Date(dateRange.startDate);
	}

	if (dateRange.endDate) {
		endDate = new Date(dateRange.endDate);
	}

	return calculateMonthlyRevenueTrend(payments, { startDate, endDate });
};

export const selectPaymentMethodDistribution = (
	state: RootState
): PaymentMethodDistribution[] => {
	const payments = state.paymentHistory.allPayments;
	const dateRange = state.accounting.dateRange;

	let startDate = null;
	let endDate = null;

	if (dateRange.startDate) {
		startDate = new Date(dateRange.startDate);
	}

	if (dateRange.endDate) {
		endDate = new Date(dateRange.endDate);
	}

	return calculatePaymentMethodDistribution(payments, { startDate, endDate });
};

export default accountingSlice.reducer;
