// features/payment/types/admin-payment-types.ts
import type { PaymentRecord, PaginationMeta } from "./payment-types";

// Parameters for fetching admin payments
export interface AdminPaymentParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  invoiceId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  provider?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}

// Payload for updating a payment
export interface UpdatePaymentPayload {
  id: string;
  status?: "pending" | "succeeded" | "failed" | "refunded" | "deleted";
  description?: string;
  metadata?: Record<string, any>;
}

// Payment statistics
export interface AdminPaymentStats {
  totalRevenue: { total: number; currency: string }[];
  statusCounts: { status: string; count: number }[];
  providerCounts: { provider: string; count: number }[];
  dailyRevenue: { date: string; total: number; currency: string }[];
  dateRange: { start: string; end: string };
}

// Admin payment state
export interface AdminPaymentState {
  payments: PaymentRecord[];
  pagination: PaginationMeta | null;
  stats: AdminPaymentStats | null;
  selectedPayment: PaymentRecord | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  statsStatus: "idle" | "loading" | "succeeded" | "failed";
  updateStatus: "idle" | "loading" | "succeeded" | "failed";
  deleteStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  statsError: string | null;
  updateError: string | null;
  deleteError: string | null;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  lastFetchTimestamp?: number | null;
  isDataStale?: boolean;
}

// Admin payment filter options
export interface AdminPaymentFilterOptions {
  statuses: { value: string; label: string }[];
  providers: { value: string; label: string }[];
  sortOptions: { value: string; label: string }[];
  sortOrders: { value: string; label: string }[];
}

// Admin payment dashboard stats
export interface AdminPaymentDashboardStats {
  totalRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  refundedTransactions: number;
  averageTransactionValue: number;
}