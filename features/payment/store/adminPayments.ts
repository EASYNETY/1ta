// features/payment/store/adminPayments.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { get, put, del } from "@/lib/api-client";
import type { 
  PaymentRecord, 
  PaginationMeta 
} from "../types/payment-types";
import type { 
  AdminPaymentStats,
  AdminPaymentState,
  UpdatePaymentPayload,
  AdminPaymentParams
} from "../types/admin-payment-types";

// --- Thunks ---

// Fetch all payments (admin)
export const fetchAdminPayments = createAsyncThunk<
  { payments: PaymentRecord[]; pagination: PaginationMeta },
  AdminPaymentParams,
  { rejectValue: string }
>(
  "adminPayments/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.status) queryParams.append("status", params.status);
      if (params.userId) queryParams.append("userId", params.userId);
      if (params.invoiceId) queryParams.append("invoiceId", params.invoiceId);
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.minAmount) queryParams.append("minAmount", params.minAmount.toString());
      if (params.maxAmount) queryParams.append("maxAmount", params.maxAmount.toString());
      if (params.provider) queryParams.append("provider", params.provider);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params.search) queryParams.append("search", params.search);

      const query = queryParams.toString();
      const url = `/admin/payments${query ? `?${query}` : ''}`;
      
      const response = await get(url);

      // Handle the new API response format
      if (!response || !response.success) {
        throw new Error("Invalid response format from API");
      }

      // Extract data and pagination from the response
      const data = response.data;
      const pagination = response.pagination;

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format from API: data is not an array");
      }

      if (!pagination) {
        throw new Error("Invalid response format from API: missing pagination");
      }

      // Transform pagination to match our frontend format
      const paginationMeta: PaginationMeta = {
        totalItems: pagination.total,
        currentPage: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages || Math.ceil(pagination.total / pagination.limit)
      };

      return {
        payments: data,
        pagination: paginationMeta
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "Failed to fetch admin payments"
      );
    }
  }
);

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
      const url = `/admin/payments/stats${query ? `?${query}` : ''}`;
      
      const response = await get(url);

      // Handle the new API response format
      if (!response || !response.success) {
        throw new Error("Invalid response format from API");
      }

      // Extract data from the response
      const data = response.data;

      if (!data) {
        throw new Error("Invalid response format from API: missing data");
      }

      // Ensure the data has the expected structure
      const statsData: AdminPaymentStats = {
        totalRevenue: data.totalRevenue || [],
        statusCounts: data.statusCounts || [],
        providerCounts: data.providerCounts || [],
        dailyRevenue: data.dailyRevenue || [],
        dateRange: data.dateRange || { start: startDate || '', end: endDate || '' }
      };

      return statsData;
    } catch (error: any) {
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
      const response = await put(
        `/admin/payments/${id}`,
        { status, description, metadata }
      );

      // Handle the new API response format
      if (!response || !response.success) {
        throw new Error("Invalid response format from API");
      }

      // Extract data from the response
      const payment = response.data;

      if (!payment) {
        throw new Error("Invalid response format from API: missing payment data");
      }

      return payment;
    } catch (error: any) {
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
>(
  "adminPayments/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await del(
        `/admin/payments/${id}`
      );

      // Handle the new API response format
      if (!response || response.success !== true) {
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
  }
);

// Generate receipt
export const generateReceipt = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>(
  "adminPayments/generateReceipt",
  async (id, { rejectWithValue }) => {
    try {
      // This will trigger a file download, so we don't expect a JSON response
      // Instead, we'll open a new window/tab with the receipt URL
      const receiptUrl = `/admin/payments/${id}/receipt`;
      window.open(receiptUrl, '_blank');
      
      return;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "Failed to generate receipt"
      );
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
        state.statsError = action.payload ?? "Failed to fetch payment statistics";
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
        const index = state.payments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        
        // Update selected payment if it's the same one
        if (state.selectedPayment && state.selectedPayment.id === action.payload.id) {
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
        state.payments = state.payments.filter(p => p.id !== action.payload.id);
        
        // Clear selected payment if it's the same one
        if (state.selectedPayment && state.selectedPayment.id === action.payload.id) {
          state.selectedPayment = null;
        }
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload ?? "Failed to delete payment";
      });

    // Generate Receipt (no state changes needed for success case)
    builder
      .addCase(generateReceipt.rejected, (state, action) => {
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

export default adminPaymentsSlice.reducer;