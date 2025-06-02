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
		return `${currency} ${majorAmount.toFixed(2)}`;
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
 * Generates a receipt number if one doesn't exist
 * @param payment Payment record
 * @returns Receipt number
 */
export const getReceiptNumber = (payment: PaymentRecord): string => {
	if (payment.receiptNumber) return payment.receiptNumber;

	// Generate a receipt number based on payment ID and date
	const date = new Date(payment.createdAt);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `RCPT-${payment.id.replace(/[^0-9]/g, "")}-${year}${month}${day}`;
};

