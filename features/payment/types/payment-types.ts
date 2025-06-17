// features/payment/types/payment-types.ts

// --- Payment Breakdown Types for Enhanced Cart Display ---
export interface PaymentBreakdownItem {
	id: string;
	category:
		| "tuition"
		| "materials"
		| "refreshments"
		| "exam_fees"
		| "exam_materials";
	description: string;
	amount: number;
	quantity?: number;
	isIncluded: boolean;
	details?: string;
}

export interface BreakdownSection {
	title: string;
	items: PaymentBreakdownItem[];
	totalAmount: number;
	icon?: string;
}

export interface PaymentBreakdown {
	courseItems: any[]; // Consider typing this more specifically if possible
	additionalItems: PaymentBreakdownItem[];
	sections: BreakdownSection[];
	subtotal: number;
	tax: number;
	total: number;
	currency: string;
}

// --- Course Detail Display Types ---
export interface CourseDetailView {
	id: string;
	title: string;
	subtitle?: string;
	description: string;
	instructor: {
		name: string;
		title?: string;
		avatar?: string;
	};
	image: string;
	previewVideoUrl?: string;
	level: string;
	duration?: string;
	moduleCount?: number;
	lessonCount?: number;
	learningOutcomes?: string[];
	prerequisites?: string[];
	certificate?: boolean;
	priceNaira: number;
	discountPriceNaira?: number;
	tags?: string[];
}

// --- Payment Record & Related Types ---
export interface ReceiptItem {
	id: string;
	name: string;
	description?: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
}

export interface BillingDetails {
	name: string;
	email: string;
	address?: string;
	phone?: string;
}

export interface PaymentRecord {
	id: string;
	userId: string;
	userName?: string;
	amount: number;
	currency: string;
	status:
		| "pending"
		| "succeeded"
		| "failed"
		| "refunded"
		| "processing"
		| "requires_action"; // Added more statuses
	provider: "paystack" | "stripe" | "mock" | "corporate";
	providerReference: string;
	gatewayRef?: string;
	transactionId?: string;
	reconciliationStatus?: "pending" | "reconciled" | "disputed" | "failed";
	description: string;
	createdAt: string;
	// updatedAt: string;
	relatedItemIds?: { type: "course" | "other"; id: string }[];
	cardType?: string;
	last4?: string;
	receiptNumber?: string;
	receiptItems?: ReceiptItem[];
	billingDetails?: BillingDetails;
	metadata?: Record<string, any>;
	providerMetadata?: Record<string, any>;
	transactionMetadata?: Record<string, any>;
	invoiceId?: string | null;
	invoice_id?: string | null;
}

// --- API Response Structures for Payment History ---
// Represents a single payment item AS RETURNED BY THE /payments/user/history API
export interface PaginatedPaymentItemFromApi {
	id: string;
	userId: string;
	userName?: string; // Assuming API might send this for admin views, or it's added later
	amount: string; // STRING from API
	currency: string;
	status: PaymentRecord["status"];
	provider: PaymentRecord["provider"];
	provider_reference: string | null; // snake_case from API
	description: string | null; // Payment's own description, might be null
	created_at: string; // snake_case from API
	updated_at: string; // snake_case from API
	invoice_id: string | null; // snake_case from API
	invoice_amount?: string | null; // STRING from API
	invoice_description?: string | null;
	invoice_status?: Invoice["status"] | null;
	// Add any other fields directly on the payment object from this API endpoint
}

export interface PaginatedPaymentsApiResponse {
	payments: PaginatedPaymentItemFromApi[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number; // API response has totalPages
	};
	// };
}

// Just to be explicit for the thunk's fulfilled action:
export interface FetchMyHistoryThunkResponse {
	payments: PaymentRecord[]; // The thunk will resolve with already transformed payments
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}
// --- Payment Flow Types ---
export interface InitiatePaymentPayload {
	user_id: string; // Consider standardizing to userId or user_id
	userId: string; // Redundant with user_id, choose one
	invoiceId: string;
	amount: number; // This amount should be the total from the invoice
	callbackUrl?: string;
	paymentMethod: "paystack" | "stripe" | "corporate"; // Or other methods
}

export interface PaymentResponse {
	payment: PaymentRecord; // The payment record created/updated
	authorizationUrl: string; // URL to redirect user for payment
}

export interface VerifyPaymentResponse {
	payments?: PaymentRecord;
	payment?: PaymentRecord;
	verification: any; // Verification data from the payment provider
}

// --- Invoice Related Types (Updated based on Postman response) ---

// Information about the student associated with the invoice
export interface StudentInfo {
	id: string;
	name: string;
	email: string;
}

// An item within an invoice (matches API structure for items array)
export interface InvoiceItem {
	description: string;
	amount: number; // In the API items, amount is a number
	quantity: number;
	courseId: string; // Or number, ensure consistency
}

// Structure of the 'data' object received from GET /api/invoices/:id
export interface InvoiceDataFromApi {
	id: string;
	studentId: string;
	amount: string; // API sends total invoice amount as a STRING
	description: string;
	dueDate: string; // ISO YYYY-MM-DD
	status: "pending" | "paid" | "cancelled" | "overdue";
	items: InvoiceItem[]; // Array of invoice items from API
	metadata: any | null; // Can be more specific if structure is known
	createdAt: string; // ISO datetime string
	updatedAt: string; // ISO datetime string
	student: StudentInfo; // Nested student information
	paymentId?: string | null; // Link to a PaymentRecord if paid
}

// The overall API response structure for fetching a single invoice (GET /api/invoices/:id)
export interface GetInvoiceApiResponse {
	success: boolean;
	data: InvoiceDataFromApi; // The actual invoice data is nested here
}

// Your desired frontend Invoice type (after transformation)
// This is what will be stored in Redux state and used in components
export interface Invoice {
	id: string;
	studentId: string;
	amount: number; // Frontend desires amount as a NUMBER
	description: string;
	dueDate: string; // ISO YYYY-MM-DD
	items: InvoiceItem[]; // Items structure matches API, but amounts might be adjusted post-fetch
	status: "pending" | "paid" | "cancelled" | "overdue";
	metadata: any | null;
	createdAt: string; // ISO datetime string
	updatedAt: string; // ISO datetime string
	student: StudentInfo; // Includes student details
	paymentId?: string | null;
}

// Payload for creating an invoice (POST /api/invoices)
// This should match what your backend endpoint for creating invoices expects.
// It might be different from the `Invoice` type used for display.
export interface CreateInvoicePayload {
	studentId: string;
	amount: number; // Usually, the backend calculates the total amount from items.
	// If you send 'amount', ensure backend logic handles it (e.g., as an override or for validation).
	description: string;
	dueDate?: string; // Optional on client, backend might default (e.g., YYYY-MM-DD)
	items: Array<{
		// Define item structure for creation payload
		description: string;
		amount: number; // Amount for this specific item
		quantity: number;
		courseId?: string; // If applicable
	}>;
	// Add any other fields required by your POST /api/invoices endpoint
}

// API Response when creating an invoice (POST /api/invoices)
// This should ideally return the created invoice in the frontend-friendly 'Invoice' format,
// or in the 'InvoiceDataFromApi' format if it needs transformation.
// For simplicity, let's assume it returns the transformed 'Invoice' type.
export type CreateInvoiceResponse = Invoice;
// If it returns the API structure that needs transformation:
// export type CreateInvoiceResponse = InvoiceDataFromApi; // Then transform in thunk

// --- Redux State Types ---
export interface PaginationMeta {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	limit: number;
}

export interface PaymentHistoryState {
    myPayments: PaymentRecord[];
    allPayments: PaymentRecord[];
    pagination?: PaginationMeta | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;

    // Payment initiation (for starting a payment)
    paymentInitiation: {
        status: "idle" | "loading" | "succeeded" | "failed";
        error: string | null;
        data: PaymentResponse | null;
    };

    // Payment verification (for verifying a payment)
    paymentVerification: {
        status: "idle" | "loading" | "succeeded" | "failed";
        error: string | null;
        data: VerifyPaymentResponse | null;
    };

    // Selected/active payment (for details, verification, etc.)
    selectedPayment: PaymentRecord | null;

    // Invoice-related state
    selectedInvoice: Invoice | null;
    receiptData: UnifiedReceiptData | null;

    // For admin/my payments pagination
    adminPagination?: PaginationMeta | null;
    myPaymentsPagination?: PaginationMeta | null;

    // Invoice creation/fetch status
    invoiceCreationStatus?: "idle" | "loading" | "succeeded" | "failed";
    invoiceCreationError?: string | null;
    invoiceFetchStatus?: "idle" | "loading" | "succeeded" | "failed";
    invoiceFetchError?: string | null;
}

export interface UnifiedReceiptData {
	paymentId: string;
	paymentDate: string;
	paymentStatus: PaymentRecord["status"]; // Use PaymentRecord's status type
	paymentAmount: number;
	paymentCurrency: string;
	paymentMethod?: string;
	paymentProviderReference?: string; // Renamed for clarity from paymentReference

	invoiceId?: string | null;
	invoiceDescription?: string;
	invoiceDueDate?: string;
	invoiceStatus?: Invoice["status"]; // Use Invoice's status type

	studentName?: string;
	studentEmail?: string;
	// Add billing details if you want to pull them from PaymentRecord and display
	billingDetails?: BillingDetails | null; // From PaymentRecord

	// This should come from the invoice's items
	items: InvoiceItem[]; // Or your defined InvoiceItem type

	// Original PaymentRecord fields if needed for specific fallbacks or direct access
	originalPaymentRecord?: PaymentRecord | null;
	originalInvoice?: Invoice | null; // If you want to pass the raw invoice too
}
