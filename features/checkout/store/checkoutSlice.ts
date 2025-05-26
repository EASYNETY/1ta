// features/checkout/store/checkoutSlice.ts
import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
	CheckoutState,
	EnrollCoursesPayload,
	EnrollCoursesResponse,
} from "../types/checkout-types";
import type { User } from "@/types/user.types"; // Import user type
import { isStudent } from "@/types/user.types"; // Import type guard
import type { PublicCourse } from "@/features/public-course/types/public-course-interface";
// Assume an API client function exists or will be created for enrolment
import { post } from "@/lib/api-client";
import type { CartItem } from "@/features/cart/store/cart-slice";
// Import a way to get course details, maybe from another slice or direct fetch
// For simplicity, assume we pass course data when preparing checkout
// import { selectPublicCourseById } from '@/features/public-course/store/public-course-slice';

// --- Async Thunk for Enrolment ---
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
			{
				headers: { Authorization: `Bearer ${auth.token}` },
			}
		);
		if (!response.success) {
			throw new Error(response.message || "Enrolment failed on server.");
		}
		return response;
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to enrol in courses");
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
				corporateStudentCount?: number; // Add student count for corporate managers
			}>
		) => {
			state.status = "preparing";
			state.items = [];
			state.totalAmount = 0;
			state.error = null;
			state.paymentReference = null;
			state.skipCheckout = false;

			const {
				cartItems,
				coursesData,
				user,
				corporateStudentCount = 1,
			} = action.payload;

			// Check if user is a corporate student (should be redirected away from checkout)
			if (
				user &&
				isStudent(user) &&
				user.corporateId &&
				!user.isCorporateManager
			) {
				state.status = "failed";
				state.error = "Corporate students cannot make direct purchases.";
				return;
			}

			// Check if user is a corporate manager
			const isCorporateManager =
				user && isStudent(user) && !!user.isCorporateManager;

			cartItems.forEach((cartItem) => {
				const course = coursesData.find((c) => c.id === cartItem.courseId);
				if (course) {
					let priceToPay = course.priceIndividualUSD ?? 0; // Default to individual price
					const originalPrice = course.priceIndividualUSD ?? 0; // Original price for display
					let corporatePriceApplied = false;

					// Handle corporate pricing
					if (isCorporateManager) {
						// Use corporate price if available
						// if (course.priceCorporateUSD !== undefined) {
						// 	priceToPay = course.priceCorporateUSD;
						// 	corporatePriceApplied = true;
						// }
						if (course.priceUSD !== undefined) {
							priceToPay = course.priceUSD;
							corporatePriceApplied = true;
						}

						// For corporate managers, multiply by student count
						priceToPay = priceToPay * corporateStudentCount;
					} else if (user && isStudent(user) && user.corporateId) {
						// Use specific corporate price if available for this corporate ID
						const corporatePrice =
							course?.pricing?.corporate?.[user.corporateId];
						if (typeof corporatePrice === "number") {
							priceToPay = corporatePrice;
							corporatePriceApplied = true;
						}
					}

					// Handle discounts (apply AFTER selecting individual/corporate base)
					if (
						corporatePriceApplied &&
						course.discountPriceCorporateUSD !== undefined &&
						!isCorporateManager // Don't apply discount twice for managers
					) {
						priceToPay = course.discountPriceCorporateUSD;
					} else if (
						!corporatePriceApplied &&
						course.discountPriceIndividualUSD !== undefined
					) {
						priceToPay = course.discountPriceIndividualUSD;

						// For corporate managers, multiply discounted price by student count
						if (isCorporateManager) {
							priceToPay = priceToPay * corporateStudentCount;
						}
					}

					state.items.push({
						...cartItem, // Spread cart item details (id, title, image...)
						priceToPay: priceToPay as number, // Ensure it's a number
						originalPrice: originalPrice as number, // Original price for display
						isCorporatePrice: corporatePriceApplied,
						courseDetails: course, // Include full course details
						studentCount: isCorporateManager ? corporateStudentCount : 1, // Add student count
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
				console.log("Enrolment successful:", action.payload);
			})
			.addCase(enrollCoursesAfterPayment.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Enrolment processing failed.";
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
