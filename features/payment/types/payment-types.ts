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
	gatewayRef?: string; // Gateway reference number for reconciliation
	transactionId?: string; // Internal transaction ID for tracking
	reconciliationStatus?: "pending" | "reconciled" | "disputed" | "failed"; // Reconciliation status
	description: string; // e.g., "Enrolment: Course Title(s)"
	createdAt: string; // ISO Date string
	// Optional: Link to items purchased
	relatedItemIds?: { type: "course" | "other"; id: string }[];
	// Optional: Basic card info for display (retrieved securely by backend from provider)
	cardType?: string;
	last4?: string;
	// Optional: Receipt information
	receiptNumber?: string;
	receiptItems?: ReceiptItem[];
	billingDetails?: BillingDetails;
}

// Represents an item in a receipt
export interface ReceiptItem {
	id: string;
	name: string;
	description?: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
}

// Represents billing details for a receipt
export interface BillingDetails {
	name: string;
	email: string;
	address?: string;
	phone?: string;
}

// Payload for initializing a payment
export interface InitiatePaymentPayload {
	invoiceId: string;
	amount: number;
	callbackUrl?: string;
	paymentMethod: string;
}

// Response from payment initialization
export interface PaymentResponse {
	payment: PaymentRecord;
	authorizationUrl: string;
}

// Response from payment verification
export interface VerifyPaymentResponse {
	payments: PaymentRecord;
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
	// Selected payment for receipt
	selectedPayment: PaymentRecord | null;
	// Status of fetching a single payment
	selectedPaymentStatus: "idle" | "loading" | "succeeded" | "failed";
	currentInvoice: Invoice | null;
	invoiceCreationStatus: "idle" | "loading" | "succeeded" | "failed";
	invoiceError: string | null;
}

export interface InvoiceItem {
	description: string; // e.g., course name
	amount: number; // Amount for this item
	quantity: number; // Quantity (usually 1 for a course, or student count for corporate)
	courseId?: string; // Optional: Store the original course ID for reference
}

export interface Invoice {
	id: string; // UUID returned by the backend
	studentId: string;
	amount: number;
	description: string;
	dueDate: string; // ISO8601 format (YYYY-MM-DD)
	items: InvoiceItem[];
	status: "pending" | "paid" | "cancelled" | "overdue"; // Example statuses
	createdAt: string;
	updatedAt: string;
	paymentId?: string | null; // Link to a PaymentRecord if paid
}

// Payload for creating an invoice
export interface CreateInvoicePayload {
	studentId: string;
	amount: number;
	description: string;
	dueDate: string; // Optional on client, backend might default
	items: InvoiceItem[];
}

// API Response when creating an invoice
export interface CreateInvoiceResponse {
	id: string; // UUID returned by the backend
	studentId: string;
	amount: number;
	description: string;
	dueDate: string; // ISO8601 format (YYYY-MM-DD)
	items: InvoiceItem[];
	status: "pending" | "paid" | "cancelled" | "overdue"; // Example statuses
	createdAt: string;
	updatedAt: string;
	paymentId?: string | null; // Link to a PaymentRecord if paid
}
