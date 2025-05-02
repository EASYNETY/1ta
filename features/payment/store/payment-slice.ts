// features/payment/store/payment-slice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import {
	PaymentMethod,
	PaymentMethodsState,
	AddPaymentMethodPayload,
	SetDefaultPaymentMethodPayload,
	DeletePaymentMethodPayload,
} from "../types/payment-types";

// Import mock functions - conditionally or via api-client
// For simplicity here, we import directly. In api-client, you'd route based on IS_LIVE_API
import {
	mockFetchPaymentMethods,
	mockAddPaymentMethod,
	mockSetDefaultPaymentMethod,
	mockDeletePaymentMethod,
} from "@/data/mock-payment-data"; // Adjust path

// --- Async Thunks ---

export const fetchPaymentMethods = createAsyncThunk<
	PaymentMethod[], // Return type
	string, // Argument type: userId
	{ state: RootState; rejectValue: string }
>("paymentMethods/fetch", async (userId, { rejectWithValue }) => {
	try {
		// TODO: Replace with real API call via api-client when IS_LIVE_API is true
		const methods = await mockFetchPaymentMethods(userId);
		return methods;
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to fetch payment methods");
	}
});

export const addPaymentMethod = createAsyncThunk<
	PaymentMethod, // Return type: the newly added method
	AddPaymentMethodPayload,
	{ state: RootState; rejectValue: string }
>("paymentMethods/add", async (payload, { rejectWithValue }) => {
	try {
		// TODO: Replace with real API call via api-client
		const newMethod = await mockAddPaymentMethod(payload);
		return newMethod;
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to add payment method");
	}
});

export const setDefaultPaymentMethod = createAsyncThunk<
	{ success: boolean; defaultMethodId: string }, // Return type
	SetDefaultPaymentMethodPayload,
	{ state: RootState; rejectValue: string }
>("paymentMethods/setDefault", async (payload, { rejectWithValue }) => {
	try {
		// TODO: Replace with real API call via api-client
		const response = await mockSetDefaultPaymentMethod(payload);
		return response;
	} catch (error: any) {
		return rejectWithValue(
			error.message || "Failed to set default payment method"
		);
	}
});

export const deletePaymentMethod = createAsyncThunk<
	{ success: boolean; deletedMethodId: string }, // Return type
	DeletePaymentMethodPayload,
	{ state: RootState; rejectValue: string }
>("paymentMethods/delete", async (payload, { rejectWithValue }) => {
	try {
		// TODO: Replace with real API call via api-client
		const response = await mockDeletePaymentMethod(payload);
		return response;
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to delete payment method");
	}
});

// --- Initial State ---
const initialState: PaymentMethodsState = {
	methods: [],
	defaultMethodId: null,
	isLoading: false,
	isAdding: false,
	error: null,
	showAddModal: false,
};

// --- Slice Definition ---
const paymentMethodsSlice = createSlice({
	name: "paymentMethods",
	initialState,
	reducers: {
		setShowAddModal: (state, action: PayloadAction<boolean>) => {
			state.showAddModal = action.payload;
			if (action.payload) {
				// Clear errors when opening modal
				state.error = null;
			}
		},
		clearPaymentMethodsError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// Fetch
		builder
			.addCase(fetchPaymentMethods.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchPaymentMethods.fulfilled, (state, action) => {
				state.isLoading = false;
				state.methods = action.payload;
				state.defaultMethodId =
					action.payload.find((m) => m.isDefault)?.id || null;
			})
			.addCase(fetchPaymentMethods.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload ?? "Failed to load methods";
			});

		// Add
		builder
			.addCase(addPaymentMethod.pending, (state) => {
				state.isAdding = true;
				state.error = null; // Clear previous errors
			})
			.addCase(addPaymentMethod.fulfilled, (state, action) => {
				state.isAdding = false;
				state.showAddModal = false; // Close modal on success
				// If the new one is default, update others
				if (action.payload.isDefault) {
					state.methods = state.methods.map((m) => ({
						...m,
						isDefault: false,
					}));
					state.defaultMethodId = action.payload.id;
				}
				state.methods.push(action.payload); // Add the new method
				// Ensure default ID is set if it was the first card
				if (!state.defaultMethodId && action.payload.isDefault) {
					state.defaultMethodId = action.payload.id;
				}
			})
			.addCase(addPaymentMethod.rejected, (state, action) => {
				state.isAdding = false;
				state.error = action.payload ?? "Failed to add card";
				// Keep modal open on error? Or close? User decision.
				// state.showAddModal = false;
			});

		// Set Default
		builder
			.addCase(setDefaultPaymentMethod.pending, (state) => {
				state.isLoading = true; // Use general loading indicator
				state.error = null;
			})
			.addCase(setDefaultPaymentMethod.fulfilled, (state, action) => {
				state.isLoading = false;
				state.defaultMethodId = action.payload.defaultMethodId;
				state.methods = state.methods.map((m) => ({
					...m,
					isDefault: m.id === action.payload.defaultMethodId,
				}));
			})
			.addCase(setDefaultPaymentMethod.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload ?? "Failed to set default";
			});

		// Delete
		builder
			.addCase(deletePaymentMethod.pending, (state, action) => {
				// Optional: Mark the specific method as deleting? Or just use general isLoading
				state.isLoading = true;
				state.error = null;
			})
			.addCase(deletePaymentMethod.fulfilled, (state, action) => {
				state.isLoading = false;
				const deletedId = action.payload.deletedMethodId;
				state.methods = state.methods.filter((m) => m.id !== deletedId);
				// If the deleted one was default, update the default ID (mock logic handles setting new default)
				if (state.defaultMethodId === deletedId) {
					state.defaultMethodId =
						state.methods.find((m) => m.isDefault)?.id || null;
				}
			})
			.addCase(deletePaymentMethod.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload ?? "Failed to delete card";
			});
	},
});

// --- Actions and Selectors ---
export const { setShowAddModal, clearPaymentMethodsError } =
	paymentMethodsSlice.actions;

export const selectAllPaymentMethods = (state: RootState) =>
	state.paymentMethods.methods;
export const selectDefaultPaymentMethodId = (state: RootState) =>
	state.paymentMethods.defaultMethodId;
export const selectPaymentMethodsLoading = (state: RootState) =>
	state.paymentMethods.isLoading;
export const selectPaymentMethodsAdding = (state: RootState) =>
	state.paymentMethods.isAdding;
export const selectPaymentMethodsError = (state: RootState) =>
	state.paymentMethods.error;
export const selectShowAddPaymentModal = (state: RootState) =>
	state.paymentMethods.showAddModal;

export default paymentMethodsSlice.reducer;
