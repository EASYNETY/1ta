// features/pricing/store/pricing-slice.ts

import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type {
	PricingPlan,
	PaymentDetails, // Keep if still used directly in state/reducers
	PricingState,
	UserSubscription,
	// Import the new types
	AllPlansResponse,
	CreatePlanData,
	UpdatePlanData,
	UpdateSubscriptionData,
	DeletePlanResponse,
	CancelSubscriptionResponse,
} from "../types/pricing-types";
import type { RootState } from "@/store"; // Ensure this path is correct
import {
	getUserSubscription,
	createSubscription,
	updateSubscription,
	cancelSubscription,
	getAllPlans,
	createPlan,
	updatePlan,
	deletePlan,
	togglePlanActive,
} from "@/lib/api-client"; // Ensure this path is correct

// --- Define Thunks with Explicit Types ---

// <ReturnType, ArgumentType, ThunkApiConfig (optional)>
export const fetchPlans = createAsyncThunk<AllPlansResponse, void>( // Returns AllPlansResponse, takes no argument
	"pricing/fetchPlans",
	async () => {
		const response = await getAllPlans();
		return response;
	}
);

export const fetchUserSubscription = createAsyncThunk<
	UserSubscription | null, // Can return UserSubscription or null
	string // Takes userId (string) as argument
>("pricing/fetchUserSubscription", async (userId) => {
	const response = await getUserSubscription(userId);
	return response;
});

export const createUserSubscription = createAsyncThunk<
	UserSubscription, // Returns the new UserSubscription
	{ userId: string; planId: string } // Takes an object with userId and planId
>("pricing/createUserSubscription", async ({ userId, planId }) => {
	const response = await createSubscription(userId, planId);
	return response;
});

export const updateUserSubscription = createAsyncThunk<
	UserSubscription, // Returns the updated UserSubscription
	{ subscriptionId: string; data: UpdateSubscriptionData } // Takes id and update data
>("pricing/updateUserSubscription", async ({ subscriptionId, data }) => {
	const response = await updateSubscription(subscriptionId, data);
	return response;
});

export const cancelUserSubscription = createAsyncThunk<
	CancelSubscriptionResponse, // Returns confirmation/details of cancellation
	string // Takes subscriptionId (string)
>("pricing/cancelUserSubscription", async (subscriptionId) => {
	const response = await cancelSubscription(subscriptionId);
	return response;
});

export const createNewPlan = createAsyncThunk<
	PricingPlan, // Returns the new PricingPlan
	CreatePlanData // Takes the data for the new plan
>("pricing/createNewPlan", async (planData) => {
	const response = await createPlan(planData);
	return response;
});

export const updateExistingPlan = createAsyncThunk<
	PricingPlan, // Returns the updated PricingPlan
	{ planId: string; planData: UpdatePlanData } // Takes id and update data
>("pricing/updateExistingPlan", async ({ planId, planData }) => {
	const response = await updatePlan(planId, planData);
	return response;
});

export const deleteExistingPlan = createAsyncThunk<
	DeletePlanResponse, // Returns confirmation of deletion { success: boolean, id: string }
	string // Takes planId (string)
>("pricing/deleteExistingPlan", async (planId) => {
	const response = await deletePlan(planId);
	return response; // Make sure this response includes the ID for the reducer
});

export const togglePlanActiveStatus = createAsyncThunk<
	PricingPlan, // Returns the updated PricingPlan
	string // Takes planId (string)
>("pricing/togglePlanActiveStatus", async (planId) => {
	const response = await togglePlanActive(planId);
	return response;
});

// --- Initial State (check if PaymentDetails is still needed here) ---
const initialState: PricingState = {
	individualPlans: [],
	corporatePlans: [],
	allPlans: [],
	selectedPlan: null,
	paymentDetails: null, // Review: Is this redundant with userSubscription.paymentHistory?
	userSubscription: null,
	skipPricing: false,
	isLoading: false,
	error: null,
	showPaymentModal: false,
};

export const pricingSlice = createSlice({
	name: "pricing",
	initialState,
	reducers: {
		// Keep PayloadAction types specific where possible
		selectPlan: (state, action: PayloadAction<PricingPlan>) => {
			state.selectedPlan = action.payload;
			state.skipPricing = false;
		},
		// Consider if setPaymentDetails is needed if info is in UserSubscription
		setPaymentDetails: (
			state,
			action: PayloadAction<PaymentDetails | null>
		) => {
			state.paymentDetails = action.payload;
		},
		skipPricingSelection: (state) => {
			state.skipPricing = true;
			state.selectedPlan = null;
		},
		resetPricingState: (state) => {
			// Reset all relevant fields
			Object.assign(state, { ...initialState });
			// Or reset manually if you don't want to reset *everything*
			// state.selectedPlan = null;
			// state.paymentDetails = null;
			// state.userSubscription = null; // Decide if resetting sub is desired
			// state.skipPricing = false;
			// state.isLoading = false;
			// state.error = null;
			// state.showPaymentModal = false;
			// state.individualPlans = []; // Decide if resetting plans is desired
			// state.corporatePlans = [];
			// state.allPlans = [];
		},
		setShowPaymentModal: (state, action: PayloadAction<boolean>) => {
			state.showPaymentModal = action.payload;
		},
		// This reducer might be redundant if fetchUserSubscription covers setting it
		setUserSubscription: (
			state,
			action: PayloadAction<UserSubscription | null> // Allow setting to null
		) => {
			state.userSubscription = action.payload;
		},
	},
	extraReducers: (builder) => {
		// Fetch plans
		builder
			.addCase(fetchPlans.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchPlans.fulfilled, (state, action) => {
				// action.payload is now AllPlansResponse
				state.isLoading = false;
				state.individualPlans = action.payload.individualPlans || [];
				state.corporatePlans = action.payload.corporatePlans || [];
				// Ensure allPlans are derived correctly if individual/corporate change
				state.allPlans = [
					...(action.payload.individualPlans || []),
					...(action.payload.corporatePlans || []),
				];
			})
			.addCase(fetchPlans.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Failed to fetch plans";
			});

		// Fetch user subscription
		builder
			.addCase(fetchUserSubscription.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchUserSubscription.fulfilled, (state, action) => {
				// action.payload is now UserSubscription | null
				state.isLoading = false;
				state.userSubscription = action.payload; // Correctly typed assignment
			})
			.addCase(fetchUserSubscription.rejected, (state, action) => {
				state.isLoading = false;
				state.error =
					action.error.message || "Failed to fetch user subscription";
				state.userSubscription = null; // Clear subscription on error
			});

		// Create user subscription
		builder
			.addCase(createUserSubscription.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(createUserSubscription.fulfilled, (state, action) => {
				// action.payload is now UserSubscription
				state.isLoading = false;
				state.userSubscription = action.payload; // Correctly typed assignment
				state.showPaymentModal = false; // Maybe close modal on success?
			})
			.addCase(createUserSubscription.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Failed to create subscription";
			});

		// Update user subscription
		builder
			.addCase(updateUserSubscription.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(updateUserSubscription.fulfilled, (state, action) => {
				// action.payload is now UserSubscription
				state.isLoading = false;
				// If the API returns the full updated object, just assign it
				if (
					state.userSubscription &&
					state.userSubscription.id === action.payload.id
				) {
					state.userSubscription = action.payload;
				}
				// If API only returns partial data (and thunk type was Partial<...>), you'd merge:
				// if (state.userSubscription) {
				// 	state.userSubscription = {
				// 		...state.userSubscription,
				// 		...action.payload, // action.payload would be Partial<UserSubscription>
				// 	};
				// }
			})
			.addCase(updateUserSubscription.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Failed to update subscription";
			});

		// Cancel user subscription
		builder
			.addCase(cancelUserSubscription.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(cancelUserSubscription.fulfilled, (state, action) => {
				// action.payload is CancelSubscriptionResponse
				state.isLoading = false;
				if (state.userSubscription?.id === action.payload.id) {
					// Check if it's the current sub being cancelled
					state.userSubscription.status = "canceled";
					state.userSubscription.autoRenew = false; // Explicitly turn off auto-renew
					// You might receive other updated fields in action.payload (like cancellation date)
					// state.userSubscription = { ...state.userSubscription, ...action.payload }; // If API returns more updated fields
				}
			})
			.addCase(cancelUserSubscription.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Failed to cancel subscription";
			});

		// Create new plan
		builder
			.addCase(createNewPlan.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(createNewPlan.fulfilled, (state, action) => {
				// action.payload is now PricingPlan
				state.isLoading = false;
				const newPlan = action.payload; // newPlan is correctly typed
				if (newPlan.type === "individual") {
					state.individualPlans.push(newPlan);
				} else if (newPlan.type === "corporate") {
					state.corporatePlans.push(newPlan);
				}
				// Rebuild allPlans array immutably
				state.allPlans = [...state.individualPlans, ...state.corporatePlans];
			})
			.addCase(createNewPlan.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Failed to create plan";
			});

		// Update existing plan
		builder
			.addCase(updateExistingPlan.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(updateExistingPlan.fulfilled, (state, action) => {
				// action.payload is now PricingPlan
				state.isLoading = false;
				const updatedPlan = action.payload; // updatedPlan is correctly typed

				const updateList = (list: PricingPlan[]) =>
					list.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan));

				if (updatedPlan.type === "individual") {
					state.individualPlans = updateList(state.individualPlans);
				} else if (updatedPlan.type === "corporate") {
					state.corporatePlans = updateList(state.corporatePlans);
				}
				// Rebuild allPlans array immutably
				state.allPlans = [...state.individualPlans, ...state.corporatePlans];
			})
			.addCase(updateExistingPlan.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Failed to update plan";
			});

		// Delete existing plan
		builder
			.addCase(deleteExistingPlan.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(deleteExistingPlan.fulfilled, (state, action) => {
				// action.payload is now DeletePlanResponse
				state.isLoading = false;
				// action.payload = { success: boolean, id: string }
				const planIdToDelete = action.payload.id; // Accessing .id is now safe

				const filterList = (list: PricingPlan[]) =>
					list.filter((plan) => plan.id !== planIdToDelete);

				state.individualPlans = filterList(state.individualPlans);
				state.corporatePlans = filterList(state.corporatePlans);
				// Rebuild allPlans array immutably
				state.allPlans = [...state.individualPlans, ...state.corporatePlans];
			})
			.addCase(deleteExistingPlan.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Failed to delete plan";
			});

		// Toggle plan active status
		builder
			.addCase(togglePlanActiveStatus.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(togglePlanActiveStatus.fulfilled, (state, action) => {
				// action.payload is now PricingPlan
				state.isLoading = false;
				const updatedPlan = action.payload; // updatedPlan is correctly typed

				const updateList = (list: PricingPlan[]) =>
					list.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan));

				if (updatedPlan.type === "individual") {
					state.individualPlans = updateList(state.individualPlans);
				} else if (updatedPlan.type === "corporate") {
					state.corporatePlans = updateList(state.corporatePlans);
				}
				// Rebuild allPlans array immutably
				state.allPlans = [...state.individualPlans, ...state.corporatePlans];
			})
			.addCase(togglePlanActiveStatus.rejected, (state, action) => {
				state.isLoading = false;
				state.error =
					action.error.message || "Failed to toggle plan active status";
			});
	},
});

// --- Exports ---
export const {
	selectPlan,
	setPaymentDetails,
	skipPricingSelection,
	resetPricingState,
	setShowPaymentModal,
	setUserSubscription,
} = pricingSlice.actions;

// Selectors (No changes needed here)
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
export const selectUserSubscription = (state: RootState) =>
	state.pricing.userSubscription;
export const selectShowPaymentModal = (state: RootState) =>
	state.pricing.showPaymentModal;

export default pricingSlice.reducer;
