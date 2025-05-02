// features/checkout/store/checkoutSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
	CheckoutState,
	CheckoutItem,
	EnrollCoursesPayload,
	EnrollCoursesResponse,
} from "../types/checkout-types";
import type { User } from "@/types/user.types"; // Import user type
import type { PublicCourse } from "@/features/public-course/types/public-course-interface";
// Assume an API client function exists or will be created for enrollment
import { post } from "@/lib/api-client";
import { CartItem } from "@/features/cart/store/cart-slice";
// Import a way to get course details, maybe from another slice or direct fetch
// For simplicity, assume we pass course data when preparing checkout
// import { selectPublicCourseById } from '@/features/public-course/store/public-course-slice';

// --- Async Thunk for Enrollment ---
export const enrollCoursesAfterPayment = createAsyncThunk<
	EnrollCoursesResponse, // Return type
	EnrollCoursesPayload, // Argument type
	{ state: RootState; rejectValue: string }
>("checkout/enrollCourses", async (payload, { getState, rejectWithValue }) => {
	const { auth } = getState();
	if (!auth.token) return rejectWithValue("Not authenticated");

	try {
		console.log("Thunk: Enrolling courses after payment...");
		// Replace '/enrollments/purchase' with your actual backend endpoint
		const response = await post<EnrollCoursesResponse>(
			"/enrollments/purchase",
			payload,
			{ headers: { Authorization: `Bearer ${auth.token}` } }
		);
		if (!response.success) {
			throw new Error(response.message || "Enrollment failed on server.");
		}
		return response;
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to enroll in courses");
	}
});

// --- Initial State ---
const initialState: CheckoutState = {
	items: [],
	totalAmount: 0,
	paymentReference: null,
	status: "idle",
	error: null,
	showPaymentModal: false,
	skipCheckout: false, // New property to skip checkout
};

// --- Slice Definition ---
const checkoutSlice = createSlice({
	name: "checkout",
	initialState,
	reducers: {
		// Action to prepare checkout items and calculate total
		prepareCheckout: (
			state,
			action: PayloadAction<{
				cartItems: CartItem[];
				coursesData: PublicCourse[];
				user: User | null;
			}>
		) => {
			state.status = "preparing";
			state.items = [];
			state.totalAmount = 0;
			state.error = null;
			state.paymentReference = null;
			state.skipCheckout = false;

			const { cartItems, coursesData, user } = action.payload;
			const isCorporate = user?.role === "student" && !!user.corporateId;

			cartItems.forEach((cartItem) => {
				const course = coursesData.find((c) => c.id === cartItem.courseId);
				if (course) {
					let priceToPay = course.priceIndividualUSD ?? 0; // Default to individual price if not corporate
					let originalPrice = course.priceIndividualUSD ?? 0; // Original price for display
					let corporatePriceApplied = false;

					if (isCorporate) {
						// Use specific corporate price if available, otherwise maybe individual? Or error?
						// For now, assume corporate users get the corporate price if defined, else individual.
						const corporatePrice =
							course?.pricing?.corporate?.[user.corporateId as string];
						if (typeof corporatePrice === "number") {
							priceToPay = corporatePrice;
							corporatePriceApplied = true;
						}
						// Decide fallback: use individual or throw error if specific corp price missing?
						// else { priceToPay = course.priceIndividualUSD; }
					}

					// Handle discounts (apply AFTER selecting individual/corporate base)
					if (
						corporatePriceApplied &&
						course.discountPriceCorporateUSD !== undefined
					) {
						priceToPay = course.discountPriceCorporateUSD;
					} else if (
						!corporatePriceApplied &&
						course.discountPriceIndividualUSD !== undefined
					) {
						priceToPay = course.discountPriceIndividualUSD;
					}

					state.items.push({
						...cartItem, // Spread cart item details (id, title, image...)
						priceToPay: priceToPay as number, // Ensure it's a number
						originalPrice: originalPrice as number, // Original price for display
						isCorporatePrice: corporatePriceApplied,
						courseDetails: course, // Include full course details
					});
					state.totalAmount += priceToPay as number; // Add to total amount
				} else {
					console.warn(
						`Course data not found for cart item ID: ${cartItem.courseId}`
					);
				}
			});
			state.status = "ready"; // Ready for payment initiation
		},
		setPaymentReference: (state, action: PayloadAction<string | null>) => {
			state.paymentReference = action.payload;
		},
		setShowPaymentModal: (state, action: PayloadAction<boolean>) => {
			state.showPaymentModal = action.payload;
			if (action.payload) state.error = null; // Clear error when opening modal
		},
		resetCheckout: () => {
			return initialState; // Reset to initial state
		},
		setCheckoutError: (state, action: PayloadAction<string>) => {
			state.status = "failed";
			state.error = action.payload;
		},
		setSkipCheckout: (state, action: PayloadAction<boolean>) => {
			state.skipCheckout = action.payload;
			// If skipping, ensure payment modal is closed
			if (action.payload) {
				state.showPaymentModal = false;
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(enrollCoursesAfterPayment.pending, (state) => {
				state.status = "processing_enrollment";
				state.error = null;
			})
			.addCase(enrollCoursesAfterPayment.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.error = null;
				// Optionally clear items here or rely on clearCart dispatch from component
				// state.items = [];
				// state.totalAmount = 0;
				console.log("Enrollment successful:", action.payload);
			})
			.addCase(enrollCoursesAfterPayment.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Enrollment processing failed.";
			});
	},
});

// --- Actions ---
export const {
	prepareCheckout,
	setPaymentReference,
	setShowPaymentModal,
	resetCheckout,
	setCheckoutError,
	setSkipCheckout,
} = checkoutSlice.actions;

// --- Selectors ---
export const selectCheckoutItems = (state: RootState) => state.checkout.items;
export const selectCheckoutTotalAmount = (state: RootState) =>
	state.checkout.totalAmount;
export const selectCheckoutStatus = (state: RootState) => state.checkout.status;
export const selectCheckoutError = (state: RootState) => state.checkout.error;
export const selectCheckoutShowPaymentModal = (state: RootState) =>
	state.checkout.showPaymentModal;
export const selectCheckoutPaymentReference = (state: RootState) =>
	state.checkout.paymentReference;
export const selectSkipCheckout = (state: RootState): boolean =>
	state.checkout.skipCheckout;

export default checkoutSlice.reducer;
