// data/mock-payment-data.ts
import type { PaymentRecord } from "@/features/payment/types/payment-types"; // Import correct type
import { formatISO, subDays, subHours, subMonths, parseISO } from "date-fns"; // Import date-fns functions
import { users } from "./mock-auth-data"; // Assuming user data is here for names

// In-memory store for mock payments
let mockPayments: PaymentRecord[] = [
	// Ensure data matches the PaymentRecord interface
	{
		id: "pay_1",
		userId: "student_1", // Corresponds to Student User in mock-auth-data
		userName: "Student User", // Optional, good for admin view
		amount: 4500000, // Example: In kobo (45,000 NGN)
		currency: "NGN",
		status: "succeeded",
		provider: "paystack",
		providerReference: "mock_trxref_abc1_success",
		description: "Enrolment: PMP® Certification Training",
		createdAt: formatISO(subDays(new Date(), 30)), // 30 days ago
		relatedItemIds: [{ type: "course", id: "1" }], // Link to course ID '1'
		cardType: "visa",
		last4: "4081",
		receiptNumber: "RCPT-1001-2023",
		receiptItems: [
			{
				id: "item_1",
				name: "PMP® Certification Training",
				description: "Complete course with certification exam",
				quantity: 1,
				unitPrice: 4500000,
				totalPrice: 4500000
			}
		],
		billingDetails: {
			name: "Student User",
			email: "student@example.com",
			address: "123 Learning Street, Lagos",
			phone: "+234 800 123 4567"
		}
	},
	{
		id: "pay_2",
		userId: "student_2", // Example: New Student in mock-auth-data
		userName: "New Student",
		amount: 3000000, // 30,000 NGN
		currency: "NGN",
		status: "failed", // Example: Failed payment
		provider: "mock", // Using mock provider
		providerReference: "mock_trxref_def2_fail",
		description: "Enrolment Attempt: Web Dev Bootcamp",
		createdAt: formatISO(subDays(new Date(), 45)),
		relatedItemIds: [{ type: "course", id: "webdev_101" }],
		cardType: "mastercard",
		last4: "5555",
	},
	{
		id: "pay_3",
		userId: "student_1", // Student User again
		userName: "Student User",
		amount: 2500000, // 25,000 NGN
		currency: "NGN",
		status: "succeeded",
		provider: "paystack",
		providerReference: "mock_trxref_ghi3_success",
		description: "Enrolment: Intro to Python", // Another course
		createdAt: formatISO(subMonths(new Date(), 4)), // Older payment
		relatedItemIds: [{ type: "course", id: "python_101" }], // Link to different course
		cardType: "visa",
		last4: "4081",
	},
	{
		id: "pay_4",
		userId: "corp_student_1", // Corporate Student
		userName: "Corporate Student",
		amount: 0, // Corporate payment might be 0 if covered
		currency: "NGN",
		status: "succeeded",
		provider: "corporate", // Specific provider type for corporate billing
		providerReference: "corp_acc_xyz", // Reference corporate account
		description: "Enrolment (Corporate): PMP® Certification Training",
		createdAt: formatISO(subDays(new Date(), 10)),
		relatedItemIds: [{ type: "course", id: "1" }], // Link to course ID '1'
		// No card details for corporate
	},
	{
		id: "pay_5",
		userId: "student_3", // Student Three
		userName: "Student Three",
		amount: 500000, // 5,000 NGN
		currency: "NGN",
		status: "refunded", // Example refunded payment
		provider: "paystack",
		providerReference: "mock_trxref_jkl5_refund",
		description: "Partial Refund: PMP Course Material",
		createdAt: formatISO(subDays(new Date(), 15)),
		relatedItemIds: [{ type: "other", id: "material_fee" }], // Example other item type
		cardType: "visa",
		last4: "4081",
	},
	// Add more mock payments as needed for different users/statuses/dates
];

// --- Mock API Functions ---

/**
 * Simulates fetching a single payment by ID.
 */
export const mockFetchPaymentById = async (
	paymentId: string
): Promise<PaymentRecord> => {
	console.log(`MOCK: Fetching payment with ID ${paymentId}`);
	await new Promise((res) => setTimeout(res, 200 + Math.random() * 200)); // Simulate delay

	const payment = mockPayments.find((p) => p.id === paymentId);

	if (!payment) {
		throw new Error(`Payment with ID ${paymentId} not found`);
	}

	// Return a deep copy to prevent mutation issues
	return JSON.parse(JSON.stringify(payment));
};

/**
 * Simulates fetching payment history for a specific user with pagination.
 */
export const mockFetchMyPaymentHistory = async (
	userId: string,
	page: number = 1,
	limit: number = 10
): Promise<{ payments: PaymentRecord[]; total: number }> => {
	console.log(
		`MOCK: Fetching payment history for user ${userId}, Page: ${page}, Limit: ${limit}`
	);
	await new Promise((res) => setTimeout(res, 300 + Math.random() * 200)); // Simulate delay

	const userPayments = mockPayments
		.filter((p) => p.userId === userId)
		.sort(
			(a, b) =>
				parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
		); // Sort newest first

	const total = userPayments.length;
	const paginated = userPayments.slice((page - 1) * limit, page * limit);

	// Return a deep copy to prevent mutation issues
	return { payments: JSON.parse(JSON.stringify(paginated)), total };
};

/**
 * Simulates fetching all payment records for an admin, with filtering and pagination.
 */
export const mockFetchAllPaymentsAdmin = async (
	status?: PaymentRecord["status"],
	page: number = 1,
	limit: number = 10,
	search?: string
): Promise<{ payments: PaymentRecord[]; total: number }> => {
	console.log(
		`MOCK: Fetching all payments (Admin). Status: ${status}, Page: ${page}, Limit: ${limit}, Search: ${search}`
	);

	await new Promise((res) => setTimeout(res, 500 + Math.random() * 300)); // Simulate longer delay for admin potentially

	let filtered = [...mockPayments]; // Start with a copy

	// Apply Status Filter
	if (status) {
		filtered = filtered.filter((p) => p.status === status);
	}

	// Apply Search Filter (searches description, user name, user id, provider reference)
	if (search) {
		const query = search.toLowerCase();
		filtered = filtered.filter(
			(p) =>
				(p.userName?.toLowerCase() || "").includes(query) ||
				p.userId.toLowerCase().includes(query) ||
				p.providerReference.toLowerCase().includes(query) ||
				p.description.toLowerCase().includes(query)
		);
	}

	// Sort newest first (common for admin views)
	filtered.sort(
		(a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
	);

	const total = filtered.length;
	const paginated = filtered.slice((page - 1) * limit, page * limit);

	// Simulate joining user name if missing (backend would do this)
	paginated.forEach((p) => {
		if (!p.userName) {
			const user = users.find(u => u.id === p.userId);
			p.userName = user?.name || p.userId;
		}
	});

	// Return a deep copy
	return { payments: JSON.parse(JSON.stringify(paginated)), total };
};
