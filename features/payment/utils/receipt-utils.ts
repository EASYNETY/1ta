// features/payment/utils/receipt-utils.ts

import type { PaymentRecord } from "../types/payment-types";

/**
 * Formats a currency amount for display
 * @param amount Amount in smallest unit (e.g., kobo/cents)
 * @param currency Currency code (e.g., NGN, USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string): string => {
	// Convert from smallest unit to major unit
	const majorAmount = amount;

	try {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: currency,
		}).format(majorAmount);
	} catch {
		// Fallback for unknown currency
		return `${currency} ${majorAmount?.toFixed(2)}`;
	}
};

/**
 * Formats a date for display
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
	try {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-NG", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	} catch {
		return dateString || "N/A";
	}
};

/**
 * Generates a receipt number if one doesn't exist, or provides a fallback.
 * @param payment Payment record (can be null or undefined)
 * @param fallbackId A fallback ID to use if payment is not available (e.g., paymentId from UnifiedReceiptData)
 * @returns Receipt number string or a fallback
 */
export const getReceiptNumber = (
	payment: PaymentRecord | null | undefined,
	fallbackId?: string
): string => {
	if (payment && payment.receiptNumber) {
		return payment.receiptNumber;
	}

	if (payment && payment.id && payment.createdAt) {
		// Generate a receipt number based on payment ID and date
		try {
			const date = new Date(payment.createdAt);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			// Ensure payment.id is a string before calling replace
			const paymentIdDigits =
				typeof payment.id === "string" ? payment.id.replace(/[^0-9]/g, "") : "";
			return `RCPT-${paymentIdDigits}-${year}${month}${day}`;
		} catch (e) {
			// Fallback if date parsing or other operations fail
			return fallbackId
				? `RCPT-${fallbackId.substring(0, 8).toUpperCase()}`
				: "RCPT-N/A";
		}
	}

	// If payment is null/undefined or lacks necessary fields, use fallbackId or a generic N/A
	if (fallbackId) {
		return `RCPT-${fallbackId.substring(0, 8).toUpperCase()}`;
	}

	return "RCPT-N/A"; // Ultimate fallback
};

// Fix for .toFixed on possibly undefined value at line 22
export function formatAmount(amount: any, digits = 2): string {
  if (typeof amount === 'number' && !isNaN(amount)) return amount.toFixed(digits);
  const num = Number(amount);
  return !isNaN(num) ? num.toFixed(digits) : '0.00';
}
