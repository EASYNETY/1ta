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
}

export interface PaymentDetails {
	planId: string;
	planName: string;
	amount: number;
	currency: string;
	status: "pending" | "processing" | "completed" | "failed";
	transactionId?: string;
	paymentMethod?: string;
	paymentDate?: string;
}

export interface PricingState {
	selectedPlan: PricingPlan | null;
	paymentDetails: PaymentDetails | null;
	skipPricing: boolean;
	isLoading: boolean;
	error: string | null;
}
