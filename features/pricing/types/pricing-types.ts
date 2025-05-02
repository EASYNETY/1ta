// features/pricing/types/pricing-types.ts

export interface PricingPlan {
	id: string;
	name: string;
	price: string;
	priceValue: number | null;
	description: string;
	features: string[];
	notIncluded: string[];
	popular: boolean;
	type: "individual" | "corporate";
	active?: boolean;
}

export interface PaymentDetails {
	planId: string;
	planName: string;
	amount: number;
	currency: string;
	status: "pending" | "processing" | "completed" | "failed";
	transactionId?: string;
	paymentMethod?: "card" | "bank" | string; // Can be more specific than just string
	paymentDate?: string;
	// expiryDate?: string; // This usually relates to subscription, not payment record

	// --- New Optional Fields for Mocking Card ---
	cardType?: "visa" | "mastercard" | "verve" | string; // Examples
	last4?: string; // e.g., "4081"
	expiryMonth?: string; // e.g., "12"
	expiryYear?: string; // e.g., "25" (Just the last two digits usually)
	// --- End New Fields ---
}

export interface UserSubscription {
	id: string;
	userId: string;
	planId: string;
	planName: string;
	startDate: string;
	expiryDate: string;
	autoRenew: boolean;
	status: "active" | "expired" | "canceled";
	paymentHistory: PaymentDetails[];
}

// Type for the response of getAllPlans
export interface AllPlansResponse {
	individualPlans: PricingPlan[];
	corporatePlans: PricingPlan[];
	allPlans: PricingPlan[];
}

// Type for the data needed to create a plan (adjust based on required fields)
export type CreatePlanData = Omit<PricingPlan, "id">;

// Type for the data needed to update a plan (usually partial)
export type UpdatePlanData = Partial<Omit<PricingPlan, "id" | "type">>; // Often can't change type

// Type for the data needed to update a subscription (usually partial)
// Adjust based on what fields are actually updatable
export type UpdateSubscriptionData = Partial<
	Pick<UserSubscription, "planId" | "autoRenew">
>;

// Type for the response of deletePlan
export interface DeletePlanResponse {
	success: boolean; // Assuming your API confirms success
	id: string; // The ID of the deleted plan is useful for the reducer
}

// Type for the response of cancelSubscription (adjust based on actual API response)
export interface CancelSubscriptionResponse {
	id: string;
	status: "canceled";
	// Add other relevant fields if the API returns them, e.g., cancellation date
}

export interface PricingState {
	individualPlans: PricingPlan[];
	corporatePlans: PricingPlan[];
	allPlans: PricingPlan[];
	selectedPlan: PricingPlan | null;
	paymentDetails: PaymentDetails | null;
	userSubscription: UserSubscription | null;
	skipPricing: boolean;
	isLoading: boolean;
	error: string | null;
	showPaymentModal: boolean;
}
