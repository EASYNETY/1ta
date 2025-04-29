// features/pricing/store/pricing-slice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
	PricingPlan,
	PaymentDetails,
	PricingState,
} from "../types/pricing-types";
import type { RootState } from "@/store";

// Define individual plans
export const individualPlans: PricingPlan[] = [
	{
		id: "basic-individual",
		name: "Basic",
		price: "₦25,000",
		priceValue: 25000,
		description: "Perfect for beginners",
		features: [
			"Access to core courses",
			"Basic project support",
			"Community forum access",
			"Email support",
		],
		notIncluded: [
			"Advanced courses",
			"1-on-1 mentorship",
			"Career placement",
			"Certificate of completion",
		],
		popular: false,
		type: "individual",
	},
	{
		id: "pro-individual",
		name: "Pro",
		price: "₦45,000",
		priceValue: 45000,
		description: "Most popular choice",
		features: [
			"Access to all courses",
			"Advanced project support",
			"Community forum access",
			"Priority email support",
			"1-on-1 mentorship (2 sessions)",
			"Certificate of completion",
		],
		notIncluded: ["Career placement"],
		popular: true,
		type: "individual",
	},
	{
		id: "premium-individual",
		name: "Premium",
		price: "₦75,000",
		priceValue: 75000,
		description: "Complete learning experience",
		features: [
			"Access to all courses",
			"Premium project support",
			"Community forum access",
			"24/7 priority support",
			"Unlimited 1-on-1 mentorship",
			"Certificate of completion",
			"Career placement assistance",
			"Exclusive industry events",
		],
		notIncluded: [],
		popular: false,
		type: "individual",
	},
];

// Define corporate plans
export const corporatePlans: PricingPlan[] = [
	{
		id: "team-corporate",
		name: "Team",
		price: "₦200,000",
		priceValue: 200000,
		description: "For small teams (up to 5)",
		features: [
			"Access to all courses for 5 users",
			"Team progress dashboard",
			"Dedicated account manager",
			"Custom learning paths",
			"Certificates for all team members",
		],
		notIncluded: ["Custom course development", "On-site training"],
		popular: false,
		type: "corporate",
	},
	{
		id: "business-corporate",
		name: "Business",
		price: "₦500,000",
		priceValue: 500000,
		description: "For medium businesses (up to 15)",
		features: [
			"Access to all courses for 15 users",
			"Advanced team analytics",
			"Dedicated account manager",
			"Custom learning paths",
			"Certificates for all team members",
			"Quarterly strategy sessions",
			"Basic custom course development",
		],
		notIncluded: ["On-site training"],
		popular: true,
		type: "corporate",
	},
	{
		id: "enterprise-corporate",
		name: "Enterprise",
		price: "Custom",
		priceValue: null,
		description: "For large organizations",
		features: [
			"Unlimited user access",
			"Advanced team analytics",
			"Dedicated account executive",
			"Custom learning paths",
			"Certificates for all team members",
			"Monthly strategy sessions",
			"Full custom course development",
			"On-site training options",
			"API access for LMS integration",
		],
		notIncluded: [],
		popular: false,
		type: "corporate",
	},
];

// Combine all plans
export const allPlans = [...individualPlans, ...corporatePlans];

const initialState: PricingState = {
	selectedPlan: null,
	paymentDetails: null,
	skipPricing: false,
	isLoading: false,
	error: null,
};

export const pricingSlice = createSlice({
	name: "pricing",
	initialState,
	reducers: {
		selectPlan: (state, action: PayloadAction<PricingPlan>) => {
			state.selectedPlan = action.payload;
			state.skipPricing = false;
		},
		setPaymentDetails: (state, action: PayloadAction<PaymentDetails>) => {
			state.paymentDetails = action.payload;
		},
		skipPricingSelection: (state) => {
			state.skipPricing = true;
			state.selectedPlan = null;
		},
		resetPricingState: (state) => {
			state.selectedPlan = null;
			state.paymentDetails = null;
			state.skipPricing = false;
			state.isLoading = false;
			state.error = null;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
	},
});

export const {
	selectPlan,
	setPaymentDetails,
	skipPricingSelection,
	resetPricingState,
	setLoading,
	setError,
} = pricingSlice.actions;

// Selectors
export const selectPricingState = (state: RootState) => state.pricing;
export const selectSelectedPlan = (state: RootState) =>
	state.pricing.selectedPlan;
export const selectPaymentDetails = (state: RootState) =>
	state.pricing.paymentDetails;
export const selectSkipPricing = (state: RootState) =>
	state.pricing.skipPricing;
export const selectPricingLoading = (state: RootState) =>
	state.pricing.isLoading;
export const selectPricingError = (state: RootState) => state.pricing.error;

export default pricingSlice.reducer;
