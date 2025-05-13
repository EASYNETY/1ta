// features/payment/types/payment-types.ts

// Represents a record of a completed (or attempted) payment transaction
export interface PaymentRecord {
	id: string; // Your internal DB ID for the payment record
	userId: string;
	userName?: string; // For Admin view
	amount: number; // Amount paid (in smallest unit like kobo/cents)
	currency: string;
	status: "pending" | "succeeded" | "failed" | "refunded";
	provider: "paystack" | "stripe" | "mock" | "corporate"; // Added corporate possibility
	providerReference: string; // Transaction ID/Reference from the provider
	description: string; // e.g., "Enrollment: Course Title(s)"
	createdAt: string; // ISO Date string
	// Optional: Link to items purchased
	relatedItemIds?: { type: "course" | "other"; id: string }[];
	// Optional: Basic card info for display (retrieved securely by backend from provider)
	cardType?: string;
	last4?: string;
}

// Payload for initializing a payment
export interface InitiatePaymentPayload {
	invoiceId: string;
	amount: number;
	paymentMethod: string;
}

// Response from payment initialization
export interface PaymentResponse {
	payment: PaymentRecord;
	authorizationUrl: string;
}

// Response from payment verification
export interface VerifyPaymentResponse {
	payment: PaymentRecord;
	verification: any; // The verification data from Paystack
}

// State for the payment slice
export interface PaymentHistoryState {
	myPayments: PaymentRecord[];
	allPayments: PaymentRecord[]; // For Admin view
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	// Pagination for Admin view
	adminPagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		limit: number;
	} | null;
	// Pagination for My Payments view
	myPaymentsPagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		limit: number;
	} | null;
	// Current payment being processed
	currentPayment: PaymentRecord | null;
	// Payment initialization data
	paymentInitialization: {
		authorizationUrl: string;
	} | null;
	// Status of payment verification
	verificationStatus: "idle" | "loading" | "succeeded" | "failed";
}
