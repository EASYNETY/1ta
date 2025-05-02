// data/mock-payment-data.ts
import type {
	PaymentMethod,
	AddPaymentMethodPayload,
	SetDefaultPaymentMethodPayload,
	DeletePaymentMethodPayload,
} from "@/features/payment/types/payment-types";

// In-memory store for mock payment methods
let mockUserPaymentMethods: PaymentMethod[] = [
	{
		id: "pm_1",
		userId: "user_123", // Match a mock user ID
		isDefault: true,
		provider: "paystack",
		paystackAuthorizationCode: "AUTH_mock1abcdef",
		cardType: "visa",
		last4: "4081",
		expiryMonth: "12",
		expiryYear: "25",
		bank: "Mock Bank Plc",
		addedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
	},
	{
		id: "pm_2",
		userId: "user_123",
		isDefault: false,
		provider: "paystack",
		paystackAuthorizationCode: "AUTH_mock2ghijkl",
		cardType: "mastercard",
		last4: "5555",
		expiryMonth: "06",
		expiryYear: "24", // Example expired card
		bank: "Test Bank Nigeria",
		addedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days ago
	},
];

// --- Mock API Functions ---

export const mockFetchPaymentMethods = async (
	userId: string
): Promise<PaymentMethod[]> => {
	console.log(`MOCK: Fetching payment methods for user ${userId}`);
	await new Promise((res) => setTimeout(res, 400)); // Simulate delay
	return mockUserPaymentMethods.filter((m) => m.userId === userId);
};

export const mockAddPaymentMethod = async (
	payload: AddPaymentMethodPayload
): Promise<PaymentMethod> => {
	console.log(
		`MOCK: Adding payment method for user ${payload.userId} with ref:`,
		payload.paystackReference
	);
	await new Promise((res) => setTimeout(res, 800));

	// Simulate extracting details from Paystack ref and saving
	// In a real scenario, your backend does this securely
	const newMethod: PaymentMethod = {
		id: `pm_${Date.now()}`,
		userId: payload.userId,
		// Make the newly added card the default *if* it's the first one, otherwise not
		isDefault:
			mockUserPaymentMethods.filter((m) => m.userId === payload.userId)
				.length === 0,
		provider: "paystack",
		paystackAuthorizationCode:
			payload.paystackReference?.reference || `AUTH_mock_${Date.now()}`, // Use ref or generate mock
		cardType: "visa", // Simulate based on bin, default to visa
		last4: Math.floor(1000 + Math.random() * 9000).toString(), // Random last4 for mock
		expiryMonth: "01",
		expiryYear: (new Date().getFullYear() + 3).toString().slice(-2), // 3 years from now
		bank: "New Mock Bank",
		addedDate: new Date().toISOString(),
	};

	if (newMethod.isDefault) {
		mockUserPaymentMethods = mockUserPaymentMethods.map((m) =>
			m.userId === payload.userId ? { ...m, isDefault: false } : m
		);
	}

	mockUserPaymentMethods.push(newMethod);
	return newMethod; // Return the newly created method object
};

export const mockSetDefaultPaymentMethod = async (
	payload: SetDefaultPaymentMethodPayload
): Promise<{ success: boolean; defaultMethodId: string }> => {
	console.log(
		`MOCK: Setting default payment method ${payload.methodId} for user ${payload.userId}`
	);
	await new Promise((res) => setTimeout(res, 300));

	let found = false;
	mockUserPaymentMethods = mockUserPaymentMethods.map((m) => {
		if (m.userId === payload.userId) {
			const isNowDefault = m.id === payload.methodId;
			if (isNowDefault) found = true;
			return { ...m, isDefault: isNowDefault };
		}
		return m;
	});

	if (!found) {
		throw new Error("Payment method not found for user.");
	}

	return { success: true, defaultMethodId: payload.methodId };
};

export const mockDeletePaymentMethod = async (
	payload: DeletePaymentMethodPayload
): Promise<{ success: boolean; deletedMethodId: string }> => {
	console.log(
		`MOCK: Deleting payment method ${payload.methodId} for user ${payload.userId}`
	);
	await new Promise((res) => setTimeout(res, 500));

	const initialLength = mockUserPaymentMethods.length;
	mockUserPaymentMethods = mockUserPaymentMethods.filter(
		(m) => !(m.userId === payload.userId && m.id === payload.methodId)
	);

	if (mockUserPaymentMethods.length === initialLength) {
		throw new Error("Payment method not found or doesn't belong to user.");
	}

	// If the deleted one was default, make another one default (e.g., the first remaining one)
	const remainingMethods = mockUserPaymentMethods.filter(
		(m) => m.userId === payload.userId
	);
	if (
		remainingMethods.length > 0 &&
		!remainingMethods.some((m) => m.isDefault)
	) {
		const newDefaultId = remainingMethods[0].id;
		mockUserPaymentMethods = mockUserPaymentMethods.map((m) =>
			m.id === newDefaultId ? { ...m, isDefault: true } : m
		);
	}

	return { success: true, deletedMethodId: payload.methodId };
};
