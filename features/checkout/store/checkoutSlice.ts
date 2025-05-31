// features/checkout/store/checkoutSlice.ts
import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
	CheckoutState, // This should now include invoiceId
	CheckoutItem, // Type from checkout-types.ts
	EnrolCoursesPayload,
	EnrolCoursesResponse,
} from "../types/checkout-types"; // Ensure CheckoutState here matches the one in checkout-types.ts
import type { User } from "@/types/user.types";
import { isStudent } from "@/types/user.types";
import type { PublicCourse } from "@/features/public-course/types/public-course-interface";
import { post } from "@/lib/api-client"; // Your API client
import type { CartItem } from "@/features/cart/store/cart-slice";

// --- Async Thunk for Enrolment ---
export const enrolCoursesAfterPayment = createAsyncThunk<
	EnrolCoursesResponse,
	EnrolCoursesPayload,
	{ state: RootState; rejectValue: string }
>("checkout/enrolCourses", async (payload, { getState, rejectWithValue }) => {
	const { auth } = getState();
	if (!auth.token) return rejectWithValue("Not authenticated");

	try {
		console.log("Thunk: Enroling courses after payment with payload:", payload);
		const response = await post<EnrolCoursesResponse>(
			"/enrolments/purchase",
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
		const message =
			typeof error.message === "string"
				? error.message
				: "Failed to enrol in courses";
		console.error("Enrolment thunk error:", error);
		return rejectWithValue(message);
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
	invoiceId: null, // Correctly initialized
	skipCheckout: false,
};

// --- Payload Interface for prepareCheckout Action ---
// This should be consistent with what CartPage dispatches
interface PrepareCheckoutActionPayload {
	cartItems: CartItem[];
	coursesData: PublicCourse[]; // Used for detailed info if not in cartItem
	user: User | null;
	corporateStudentCount?: number;
	totalAmountFromCart: number; // The total amount that the invoice was created for
	invoiceId: string; // The ID of the created invoice
}

// --- Slice Definition ---
const checkoutSlice = createSlice({
	name: "checkout",
	initialState,
	reducers: {
		prepareCheckout: (
			state,
			action: PayloadAction<PrepareCheckoutActionPayload> // Use the defined payload type
		) => {
			state.status = "preparing";
			state.items = []; // Reset items
			state.totalAmount = 0; // Reset total
			state.error = null;
			state.paymentReference = null;
			state.skipCheckout = false; // Reset skip flag

			const {
				cartItems,
				coursesData, // This data might be used if cart items lack full details
				user,
				corporateStudentCount = 1, // Default to 1 if not provided
				totalAmountFromCart, // This is the invoiced amount
				invoiceId,
			} = action.payload;

			state.invoiceId = invoiceId; // Store the invoice ID

			// The totalAmount is now primarily driven by totalAmountFromCart (the invoiced amount)
			state.totalAmount = totalAmountFromCart;

			state.items = cartItems.map((cartItem) => {
				const courseDetail = coursesData.find(
					(c) => c.id === cartItem.courseId
				);

				let priceToPay: number;
				const originalPrice = cartItem.priceNaira; // Original price is always priceNaira

				// Determine the priceToPay based on discountPriceNaira
				if (
					typeof cartItem.discountPriceNaira === "number" &&
					cartItem.discountPriceNaira > 0
				) {
					// This includes the case where discountPriceNaira is 0 (free item)
					priceToPay = cartItem.discountPriceNaira;
				} else {
					// No discount (discountPriceNaira is null or undefined)
					priceToPay = cartItem.priceNaira;
				}

				// This needs to be determined by your corporate logic if applicable during invoice creation.
				// If corporate logic modifies priceToPay, it should happen here or before.
				const isCorporatePriceApplied = false; // Placeholder for your corporate logic

				return {
					...cartItem, // Spreads id, title, image, instructor etc. from cartItem
					priceToPay: priceToPay,
					originalPrice: originalPrice, // Always show the original price for comparison display
					isCorporatePrice: isCorporatePriceApplied,
					courseDetails: courseDetail, // Full course details if available and needed
					studentCount:
						user && isStudent(user) && user.isCorporateManager
							? corporateStudentCount
							: 1,
				};
			});

			// If user is a corporate student (not manager), they shouldn't reach here usually
			// But as a safeguard:
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

			state.status = "ready";
		},
		setPaymentReference: (state, action: PayloadAction<string | null>) => {
			state.paymentReference = action.payload;
		},
		setShowPaymentModal: (state, action: PayloadAction<boolean>) => {
			state.showPaymentModal = action.payload;
			if (action.payload) {
				// When opening modal
				state.error = null; // Clear previous errors
				// Ensure status is 'ready' if we are showing payment modal
				if (state.status !== "ready" && state.status !== "processing_payment") {
					// This might indicate an issue, but for now, let modal open
					console.warn(
						`Payment modal opened with checkout status: ${state.status}`
					);
				}
			}
		},
		resetCheckout: (state) => {
			// Return a new state object that is a copy of the initial state
			// This is a robust way to reset.
			Object.assign(state, initialState);
		},
		setCheckoutError: (state, action: PayloadAction<string>) => {
			state.status = "failed";
			state.error = action.payload;
			state.showPaymentModal = false; // Close payment modal on error
		},
		setSkipCheckout: (state, action: PayloadAction<boolean>) => {
			state.skipCheckout = action.payload;
			if (action.payload) {
				state.showPaymentModal = false;
			}
		},
		// Potentially add a new action if payment processing needs its own status
		setPaymentProcessingStatus: (state) => {
			state.status = "processing_payment";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(enrolCoursesAfterPayment.pending, (state) => {
				state.status = "processing_enrolment";
				state.error = null;
			})
			.addCase(enrolCoursesAfterPayment.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.error = null;
				console.log("Enrolment successful:", action.payload);
			})
			.addCase(enrolCoursesAfterPayment.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Enrolment processing failed.";
				state.showPaymentModal = false; // Ensure modal is closed if enrolment fails after payment attempt
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
	setPaymentProcessingStatus, // Export if added
} = checkoutSlice.actions;

// --- Selectors ---
export const selectCheckoutInvoiceId = (state: RootState): string | null =>
	state.checkout.invoiceId;
export const selectCheckoutItems = (state: RootState): CheckoutItem[] =>
	state.checkout.items;
export const selectCheckoutTotalAmount = (state: RootState): number =>
	state.checkout.totalAmount;
export const selectCheckoutStatus = (
	state: RootState
): CheckoutState["status"] => state.checkout.status;
export const selectCheckoutError = (state: RootState): string | null =>
	state.checkout.error;
export const selectCheckoutShowPaymentModal = (state: RootState): boolean =>
	state.checkout.showPaymentModal;
export const selectCheckoutPaymentReference = (
	state: RootState
): string | null => state.checkout.paymentReference;
export const selectSkipCheckout = (state: RootState): boolean =>
	state.checkout.skipCheckout;

export default checkoutSlice.reducer;
