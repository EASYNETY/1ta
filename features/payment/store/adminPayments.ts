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
      
      console.log("Fetching admin payments from:", url);
      const response = await get(url);
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
      else if (response && Array.isArray(response)) {
        payments = response;
        // Look for pagination in a different property or use defaults
        paginationData = {
          total: payments.length,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 1
        };
      }
      // Case 3: Object with data array and pagination
      else if (response && typeof response === 'object') {
        // Try to find an array property that might contain the payments
        if (Array.isArray(response.payments)) {
          payments = response.payments;
        } else if (response.data && Array.isArray(response.data)) {
          payments = response.data;
        } else if (response.data && Array.isArray(response.data.payments)) {
          payments = response.data.payments;
        } else {
          // Try other common field names
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

        // Try to find pagination information
        paginationData = response.pagination || response.meta || response.page || response.paging;
        
        // If pagination is nested in data
        if (!paginationData && response.data) {
          paginationData = response.data.pagination || response.data.meta || response.data.page || response.data.paging;
        }

        // If we still don't have pagination data but have a total property
        if (!paginationData && 'total' in response) {
          paginationData = {
            total: response.total,
            page: params.page || 1,
            limit: params.limit || 10,
            totalPages: Math.ceil(response.total / (params.limit || 10))
          };
        }
      }

      // Log what we found
      console.log("Extracted payments:", payments);
      console.log("Extracted pagination:", paginationData);

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
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 1
        };
      }

      // Transform pagination to match our frontend format
      const paginationMeta: PaginationMeta = {
        totalItems: paginationData.total || paginationData.totalItems || payments.length,
        currentPage: paginationData.page || paginationData.currentPage || params.page || 1,
        limit: paginationData.limit || paginationData.perPage || params.limit || 10,
        totalPages: paginationData.totalPages || paginationData.pages || 
                   Math.ceil((paginationData.total || payments.length) / (paginationData.limit || params.limit || 10))
      };

      // If we have payments data but no pagination, create a simple pagination object
      if (payments && !paginationMeta) {
        paginationMeta = {
          totalItems: payments.length,
          currentPage: params.page || 1,
          limit: params.limit || 10,
          totalPages: Math.ceil(payments.length / (params.limit || 10))
        };
      }

      console.log("Final payments data:", payments);
      console.log("Final pagination data:", paginationMeta);

      return {
        payments,
        pagination: paginationMeta
      };
    } catch (error: any) {
      console.error("Error fetching admin payments:", error);
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
      
      console.log("Fetching payment stats from:", url);
      const response = await get(url);
      console.log("Payment stats response:", response);

      // Handle different response formats
      let statsData: AdminPaymentStats;

      // Case 1: New API format with success and data fields
      if (response && response.success === true && response.data) {
        const data = response.data;
        statsData = {
          totalRevenue: data.totalRevenue || [],
          statusCounts: data.statusCounts || [],
          providerCounts: data.providerCounts || [],
          dailyRevenue: data.dailyRevenue || [],
          dateRange: data.dateRange || { start: startDate || '', end: endDate || '' }
        };
      }
      // Case 2: Direct stats object
      else if (response && typeof response === 'object') {
        // Try to extract stats data from the response
        statsData = {
          totalRevenue: response.totalRevenue || [],
          statusCounts: response.statusCounts || [],
          providerCounts: response.providerCounts || [],
          dailyRevenue: response.dailyRevenue || [],
          dateRange: response.dateRange || { start: startDate || '', end: endDate || '' }
        };
      }
      else {
        console.error("Invalid payment stats response:", response);
        throw new Error("Invalid response format from API: missing stats data");
      }

      // Ensure all properties have default values if missing
      statsData.totalRevenue = statsData.totalRevenue || [];
      statsData.statusCounts = statsData.statusCounts || [];
      statsData.providerCounts = statsData.providerCounts || [];
      statsData.dailyRevenue = statsData.dailyRevenue || [];
      statsData.dateRange = statsData.dateRange || { start: startDate || '', end: endDate || '' };

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
      console.log(`Updating payment ${id} with status: ${status}, description: ${description}`);
      
      // Make sure we're using the correct API endpoint format
      const response = await put(
        `/admin/payments/${id}`,
        { status, description, metadata }
      );

      console.log("Update payment response:", response);

      // Handle different response formats
      let updatedPayment: PaymentRecord;

      // Case 1: New API format with success and data fields
      if (response && response.success === true && response.data) {
        updatedPayment = response.data;
      }
      // Case 2: Direct payment object
      else if (response && typeof response === 'object' && 'id' in response) {
        updatedPayment = response as PaymentRecord;
      }
      // Case 3: Object with payment property
      else if (response && typeof response === 'object' && response.payment) {
        updatedPayment = response.payment;
      }
      else {
        console.error("Invalid update payment response:", response);
        throw new Error("Invalid response format from API: missing payment data");
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
        // Handle both array and object formats
        state.payments = Array.isArray(action.payload.payments) 
          ? action.payload.payments 
          : (Array.isArray(action.payload) ? action.payload : []);
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