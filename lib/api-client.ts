// src/lib/api-client.ts

"use client";
// Import Mock Handlers
import {
	getMockCourses,
	getMockCourseBySlug,
	createMockCheckoutSession,
} from "@/data/mock-course-data";

import {
	login as mockLogin,
	register as mockRegister,
	forgotPassword as mockForgotPassword,
	resetPassword as mockResetPassword,
	mockGetMyProfile,
	mockUpdateMyProfile,
} from "@/data/mock-auth-data";
import { getPublicMockCourses } from "@/data/public-mock-course-data";
import {
	getAuthMockCourseBySlug,
	getAuthMockCourses,
	markLessonCompleteMock,
} from "@/data/mock-auth-course-data";
import {
	getUserSubscription as mockGetUserSubscription,
	createSubscription as mockCreateSubscription,
	updateSubscription as mockUpdateSubscription,
	cancelSubscription as mockCancelSubscription,
	getAllPlans as mockGetAllPlans,
	createPlan as mockCreatePlan,
	updatePlan as mockUpdatePlan,
	deletePlan as mockDeletePlan,
	togglePlanActive as mockTogglePlanActive,
} from "@/data/mock-pricing-data";
import {
	AllPlansResponse,
	CancelSubscriptionResponse,
	CreatePlanData,
	DeletePlanResponse,
	PricingPlan,
	UpdatePlanData,
	UpdateSubscriptionData,
	UserSubscription,
} from "@/features/pricing/types/pricing-types";
import {
	mockFetchPaymentMethods,
	mockAddPaymentMethod,
	mockSetDefaultPaymentMethod,
	mockDeletePaymentMethod,
} from "@/data/mock-payment-data";
import type { PaymentMethod } from "@/features/payment/types/payment-types";

// --- Config ---
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";
const IS_LIVE_API = process.env.NEXT_PUBLIC_API_IS_LIVE === "true";

console.log(
	`%cAPI Client Mode: ${IS_LIVE_API ? "LIVE" : "MOCK"}`,
	"color: cyan; font-weight: bold;"
);

// --- Types ---
interface FetchOptions extends RequestInit {
	requiresAuth?: boolean;
}

// --- Main API Client ---
async function apiClient<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<T> {
	const { requiresAuth = true, ...fetchOptions } = options;
	const headers = new Headers(fetchOptions.headers);

	if (!headers.has("Content-Type") && options.body)
		headers.set("Content-Type", "application/json");
	if (!headers.has("Accept")) headers.set("Accept", "application/json");

	const config: RequestInit = { ...fetchOptions, headers };

	// --- MOCK Handling ---
	if (!IS_LIVE_API) {
		console.log(
			`%cAPI Client: Using MOCK for ${options.method || "GET"} ${endpoint}`,
			"color: orange;"
		);
		return handleMockRequest<T>(endpoint, options);
	}

	// --- LIVE Handling ---
	try {
		console.log(
			`%cAPI Client: LIVE ${config.method || "GET"} ${API_BASE_URL}${endpoint}`,
			"color: lightblue;"
		);
		const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

		if (!response.ok) {
			let errorData: any = {
				message: `API Error: ${response.status} ${response.statusText}`,
			};
			try {
				errorData = await response.json();
			} catch (e) {
				/* non-json */
			}
			console.error("API Error Data:", errorData);
			const error = new Error(errorData.message || "Unknown API error");
			(error as any).status = response.status;
			throw error;
		}

		if (response.status === 204) return undefined as T;

		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			return await response.json();
		}

		console.warn(`API Client: Non-JSON response received for ${endpoint}`);
		return undefined as T;
	} catch (error) {
		console.error(`API request failed for ${endpoint}:`, error);
		throw error;
	}
}

// --- Handle MOCK Requests ---
async function handleMockRequest<T>(
	endpoint: string,
	options: FetchOptions
): Promise<T> {
	await new Promise((resolve) =>
		setTimeout(resolve, Math.random() * 300 + 100)
	); // simulate network delay

	const method = options.method?.toLowerCase() || "get";
	let body: any;

	if (options.body && typeof options.body === "string") {
		try {
			body = JSON.parse(options.body);
		} catch {}
	}

	// --- Courses
	if (endpoint === "/courses" && method === "get") {
		return (await getMockCourses()) as unknown as T;
	}
	if (endpoint === "/public_courses" && method === "get") {
		return (await getPublicMockCourses()) as unknown as T;
	}
	if (endpoint === "/auth_courses" && method === "get") {
		return (await getAuthMockCourses()) as unknown as T;
	}

	const courseSlugMatch = endpoint.match(/^\/courses\/slug\/([\w-]+)$/);
	if (courseSlugMatch && method === "get") {
		const slug = courseSlugMatch[1];
		const course = await getMockCourseBySlug(slug);
		if (course) return course as unknown as T;
		throw new Error(`Mock API: Course with slug "${slug}" not found`);
	}

	const authCourseSlugMatch = endpoint.match(
		/^\/auth_courses\/slug\/([\w-]+)$/
	);
	if (authCourseSlugMatch && method === "get") {
		const slug = authCourseSlugMatch[1];
		const course = await getAuthMockCourseBySlug(slug);
		if (course) return course as unknown as T;
		throw new Error(`Mock API: Auth course with slug "${slug}" not found`);
	}

	const markLessonCompleteMatch = endpoint.match(
		/^\/auth_courses\/([\w-]+)\/lessons\/([\w-]+)\/complete$/
	);
	if (markLessonCompleteMatch && method === "post") {
		const [, courseId, lessonId] = markLessonCompleteMatch;
		const { completed } = body as { completed: boolean };
		await markLessonCompleteMock(courseId, lessonId, completed);
		return { success: true } as unknown as T;
	}

	if (endpoint === "/payments/create-checkout-session" && method === "post") {
		return (await createMockCheckoutSession(body)) as unknown as T;
	}

	// --- Auth
	if (endpoint === "/auth/login" && method === "post") {
		return mockLogin(body) as unknown as T;
	}
	if (endpoint === "/auth/register" && method === "post") {
		return mockRegister(body) as unknown as T;
	}
	if (endpoint === "/auth/forgot-password" && method === "post") {
		if (!body?.email)
			throw new Error("Mock API Error: Missing email in forgot-password");
		return mockForgotPassword(body) as unknown as T;
	}
	if (endpoint === "/auth/reset-password" && method === "post") {
		if (!body?.token || !body?.password)
			throw new Error(
				"Mock API Error: Missing token or password in reset-password"
			);
		return mockResetPassword({
			token: body.token,
			password: body.password,
		}) as unknown as T;
	}

	// --- User Profile
	if (endpoint === "/users/me" && method === "get") {
		return mockGetMyProfile() as unknown as T;
	}
	if (endpoint === "/users/me" && method === "put") {
		return mockUpdateMyProfile(body) as unknown as T;
	}

	// --- Pricing and Subscriptions
	const userSubscriptionMatch = endpoint.match(/^\/users\/(.+)\/subscription$/);
	if (userSubscriptionMatch && method === "get") {
		const userId = userSubscriptionMatch[1];
		return mockGetUserSubscription(userId) as unknown as T;
	}

	if (endpoint === "/subscriptions" && method === "post") {
		if (!body?.userId || !body?.planId)
			throw new Error(
				"Mock API Error: Missing userId or planId in create subscription"
			);
		return mockCreateSubscription(body.userId, body.planId) as unknown as T;
	}

	const updateSubscriptionMatch = endpoint.match(/^\/subscriptions\/(.+)$/);
	if (updateSubscriptionMatch && method === "put") {
		const subscriptionId = updateSubscriptionMatch[1];
		return mockUpdateSubscription(subscriptionId, body) as unknown as T;
	}

	const cancelSubscriptionMatch = endpoint.match(
		/^\/subscriptions\/(.+)\/cancel$/
	);
	if (cancelSubscriptionMatch && method === "post") {
		const subscriptionId = cancelSubscriptionMatch[1];
		return mockCancelSubscription(subscriptionId) as unknown as T;
	}

	if (endpoint === "/plans" && method === "get") {
		return mockGetAllPlans() as unknown as T;
	}

	if (endpoint === "/plans" && method === "post") {
		return mockCreatePlan(body) as unknown as T;
	}

	const updatePlanMatch = endpoint.match(/^\/plans\/(.+)$/);
	if (updatePlanMatch && method === "put") {
		const planId = updatePlanMatch[1];
		return mockUpdatePlan(planId, body) as unknown as T;
	}

	const deletePlanMatch = endpoint.match(/^\/plans\/(.+)$/);
	if (deletePlanMatch && method === "delete") {
		const planId = deletePlanMatch[1];
		return mockDeletePlan(planId) as unknown as T;
	}

	const togglePlanActiveMatch = endpoint.match(
		/^\/plans\/(.+)\/toggle-active$/
	);
	if (togglePlanActiveMatch && method === "post") {
		const planId = togglePlanActiveMatch[1];
		return mockTogglePlanActive(planId) as unknown as T;
	}

	// --- Payment Method Mocks ---
	const paymentMethodsMatch = endpoint.match(/^\/users\/me\/payment-methods$/);
	if (paymentMethodsMatch && method === "get") {
		// Assume userId comes from auth context in real API, mock uses hardcoded for now
		// In real thunk, you'd get userId from state
		const userId = "user_123"; // Replace with dynamic user ID if needed for mock testing
		return mockFetchPaymentMethods(userId) as unknown as T;
	}
	if (paymentMethodsMatch && method === "post") {
		const userId = "user_123"; // Get dynamically if possible for mock
		// Body should contain { paystackReference: {...} } based on AddPaymentMethodPayload
		if (!body?.paystackReference)
			throw new Error(
				"Mock Error: Missing paystackReference in add payment method"
			);
		return mockAddPaymentMethod({
			userId,
			paystackReference: body.paystackReference,
		}) as unknown as T;
	}

	const setDefaultMatch = endpoint.match(
		/^\/users\/me\/payment-methods\/(.+)\/default$/
	);
	if (setDefaultMatch && method === "put") {
		const methodId = setDefaultMatch[1];
		const userId = "user_123"; // Get dynamically if possible for mock
		return mockSetDefaultPaymentMethod({ userId, methodId }) as unknown as T;
	}

	const deleteMethodMatch = endpoint.match(
		/^\/users\/me\/payment-methods\/(.+)$/
	);
	if (deleteMethodMatch && method === "delete") {
		const methodId = deleteMethodMatch[1];
		const userId = "user_123"; // Get dynamically if possible for mock
		return mockDeletePaymentMethod({ userId, methodId }) as unknown as T;
	}
	// --- Fallback ---
	console.error(
		`Mock API: Endpoint "${endpoint}" (Method: ${method}) not implemented`
	);
	throw new Error(
		`Mock API: Endpoint "${endpoint}" (Method: ${method}) not implemented`
	);
}

// --- Convenience Methods ---
export const get = <T>(
	endpoint: string,
	options?: Omit<FetchOptions, "method" | "body">
) => apiClient<T>(endpoint, { ...options, method: "GET" });

export const post = <T>(
	endpoint: string,
	data: any,
	options?: Omit<FetchOptions, "method" | "body">
) =>
	apiClient<T>(endpoint, {
		...options,
		method: "POST",
		body: JSON.stringify(data),
	});

export const put = <T>(
	endpoint: string,
	data: any,
	options?: Omit<FetchOptions, "method" | "body">
) =>
	apiClient<T>(endpoint, {
		...options,
		method: "PUT",
		body: JSON.stringify(data),
	});

export const del = <T>(
	endpoint: string,
	options?: Omit<FetchOptions, "method" | "body">
) => apiClient<T>(endpoint, { ...options, method: "DELETE" });

// --- Pricing API Methods ---
export const getUserSubscription = async (
	userId: string
): Promise<UserSubscription | null> => {
	// Add error handling or ensure your mock/API *can* return null gracefully
	try {
		return await get<UserSubscription>(`/users/${userId}/subscription`);
	} catch (error: any) {
		if (error?.status === 404) {
			// Example: Handle not found
			return null;
		}
		console.error("Failed to get user subscription:", error);
		throw error; // Re-throw other errors
	}
};

export const createSubscription = async (
	userId: string,
	planId: string
): Promise<UserSubscription> => {
	return post<UserSubscription>(`/subscriptions`, { userId, planId });
};

export const updateSubscription = async (
	subscriptionId: string,
	data: UpdateSubscriptionData
): Promise<UserSubscription> => {
	// Assuming the API returns the *full* updated subscription object
	return put<UserSubscription>(`/subscriptions/${subscriptionId}`, data);
};

export const cancelSubscription = async (
	subscriptionId: string
): Promise<CancelSubscriptionResponse> => {
	// Adjust the expected return type <...> based on your actual API response
	return post<CancelSubscriptionResponse>(
		`/subscriptions/${subscriptionId}/cancel`,
		{}
	);
};

export const getAllPlans = async (): Promise<AllPlansResponse> => {
	return get<AllPlansResponse>(`/plans`);
};

export const createPlan = async (
	planData: CreatePlanData
): Promise<PricingPlan> => {
	// Assuming the API returns the newly created plan object
	return post<PricingPlan>(`/plans`, planData);
};

export const updatePlan = async (
	planId: string,
	planData: UpdatePlanData
): Promise<PricingPlan> => {
	// Assuming the API returns the full updated plan object
	return put<PricingPlan>(`/plans/${planId}`, planData);
};

export const deletePlan = async (
	planId: string
): Promise<DeletePlanResponse> => {
	// Assuming the API returns { success: boolean, id: string }
	return del<DeletePlanResponse>(`/plans/${planId}`);
};

export const togglePlanActive = async (
	planId: string
): Promise<PricingPlan> => {
	// Assuming the API returns the full updated plan object
	return post<PricingPlan>(`/plans/${planId}/toggle-active`, {});
};

export const getMyPaymentMethods = async (
	options?: FetchOptions
): Promise<PaymentMethod[]> => {
	return get<PaymentMethod[]>("/users/me/payment-methods", options);
};

// --- Export ---
export { apiClient, IS_LIVE_API };
