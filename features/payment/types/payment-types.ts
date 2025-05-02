// features/payment/types/payment-types.ts

// Represents a saved payment method (typically card authorization from Paystack)
export interface PaymentMethod {
	id: string; // Your internal ID for this saved method
	userId: string; // User this belongs to
	isDefault: boolean; // Is this the primary method for charges?
	provider: "paystack"; // Could be extended later
	paystackAuthorizationCode: string; // The crucial code from Paystack to charge later
	cardType: string; // e.g., 'visa', 'mastercard'
	last4: string; // Last 4 digits
	expiryMonth: string; // MM
	expiryYear: string; // YY
	bank?: string; // Issuing bank (optional)
	addedDate: string; // ISO date string when added
}

// State for the payment methods slice
export interface PaymentMethodsState {
	methods: PaymentMethod[];
	defaultMethodId: string | null; // ID of the default method
	isLoading: boolean; // For fetch, delete, set default
	isAdding: boolean; // Specific loading for adding a new method
	error: string | null;
	showAddModal: boolean; // Controls the "Add Payment Method" modal
}

// Payload for adding a new method (after Paystack success)
export interface AddPaymentMethodPayload {
	userId: string;
	paystackReference: any; // The full reference object from Paystack success callback
	// Backend will extract needed info (auth code, card details) from reference
}

// Payload for setting default
export interface SetDefaultPaymentMethodPayload {
	userId: string;
	methodId: string;
}

// Payload for deleting
export interface DeletePaymentMethodPayload {
	userId: string;
	methodId: string;
}
