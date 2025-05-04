// features/checkout/types/checkout-types.ts
import type { CartItem } from "@/features/cart/store/cart-slice"; // Or define simplified version here
import type { PublicCourse } from "@/features/public-course/types/public-course-interface"; // To get pricing info

// Represents an item ready for checkout, including the calculated price
export interface CheckoutItem extends CartItem {
	priceToPay: number; // The actual price after considering corporate/individual status
	originalPrice: number; // The base individual price for display comparison
	isCorporatePrice: boolean;
	courseDetails?: PublicCourse; // Include full course details if needed for display
	studentCount?: number; // Number of students for this item (for corporate managers)
}

// State for the checkout process
export interface CheckoutState {
	items: CheckoutItem[]; // Items prepared for checkout with correct prices
	totalAmount: number; // Total calculated amount to be charged
	paymentReference: string | null; // Reference from Paystack/Payment Provider
	status:
		| "idle"
		| "preparing"
		| "ready"
		| "processing_payment"
		| "processing_enrollment"
		| "succeeded"
		| "failed";
	error: string | null;
	showPaymentModal: boolean; // To control the PaystackCheckout display
	skipCheckout: boolean; // To skip checkout process
}

// Payload for the enrollment thunk after payment success
export interface EnrollCoursesPayload {
	userId: string;
	courseIds: string[];
	paymentReference: any; // The reference object from payment provider
	totalAmountPaid: number; // The amount confirmed paid
	isCorporatePurchase: boolean; // Flag if corporate pricing was applied
	corporateStudentCount?: number; // Number of students for corporate managers
}

// Response type from backend enrollment endpoint
export interface EnrollCoursesResponse {
	success: boolean;
	message?: string;
	enrolledCourseIds: string[]; // IDs of successfully enrolled courses
}
