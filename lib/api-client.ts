// src/lib/api-client.ts

import { store } from "@/store";

// --- Import Mock Data Functions ---
import {
	getMockCourses,
	getMockCourseBySlug,
	createMockCheckoutSession,
} from "@/data/mock-course-data";

import {
	login as mockLogin,
	register as mockRegister,
	forgotPassword as mockForgotPassword,
} from "@/data/mock-auth-data";

import type { Course } from "@/data/mock-course-data";

// --- Config ---
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";
const IS_LIVE_API = process.env.NEXT_PUBLIC_API_IS_LIVE === "true";

console.log(`API Client Mode: ${IS_LIVE_API ? "LIVE" : "MOCK"}`);

// --- Types ---
interface FetchOptions extends RequestInit {
	requiresAuth?: boolean;
}

// --- Main API Client Function ---
async function apiClient<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<T> {
	// --- MOCK Handling ---
	if (!IS_LIVE_API) {
		console.log(
			`%cAPI Client: Using MOCK for ${options.method || "GET"} ${endpoint}`,
			"color: orange; font-weight: bold;"
		);
		return handleMockRequest<T>(endpoint, options);
	}

	// --- LIVE API Handling ---
	const { requiresAuth = true, ...fetchOptions } = options;
	const headers = new Headers(fetchOptions.headers);

	if (!headers.has("Content-Type") && options.body)
		headers.set("Content-Type", "application/json");
	if (!headers.has("Accept")) headers.set("Accept", "application/json");

	if (requiresAuth) {
		const token = store.getState().auth.token;
		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		} else {
			console.warn(
				`API Client: Auth required for ${endpoint}, but no token found.`
			);
		}
	}

	const config: RequestInit = { ...fetchOptions, headers };

	try {
		console.log(
			`%cAPI Client: LIVE request ${config.method || "GET"} ${API_BASE_URL}${endpoint}`,
			"color: lightblue"
		);
		const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

		if (!response.ok) {
			let errorData: any = {
				message: `API Error: ${response.status} ${response.statusText}`,
			};
			try {
				errorData = await response.json();
			} catch (e) {}
			console.error("API Error Data:", errorData);
			const error = new Error(
				errorData.message || `API Error: ${response.status}`
			);
			(error as any).status = response.status;
			(error as any).data = errorData;
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

// --- Mock Request Handler ---
async function handleMockRequest<T>(
	endpoint: string,
	options: FetchOptions
): Promise<T> {
	await new Promise((resolve) =>
		setTimeout(resolve, Math.random() * 300 + 100)
	); // Fake network delay
	const method = options.method?.toLowerCase() || "get";
	let body: any;

	if (options.body && typeof options.body === "string") {
		try {
			body = JSON.parse(options.body);
		} catch (e) {}
	}

	// --- Course Routes ---
	if (endpoint === "/courses" && method === "get") {
		return (await getMockCourses()) as unknown as T;
	}

	const courseSlugMatch = endpoint.match(/^\/courses\/slug\/([\w-]+)$/);
	if (courseSlugMatch && method === "get") {
		const slug = courseSlugMatch[1];
		const course = await getMockCourseBySlug(slug);
		if (course) return course as unknown as T;
		throw new Error(`Mock API: Course with slug ${slug} not found`);
	}

	if (endpoint === "/payments/create-checkout-session" && method === "post") {
		return (await createMockCheckoutSession(body)) as unknown as T;
	}

	// --- Auth Routes ---
	if (endpoint === "/auth/login" && method === "post") {
		return mockLogin(body) as unknown as T;
	}

	if (endpoint === "/auth/register" && method === "post") {
		return mockRegister(body) as unknown as T;
	}

	if (endpoint === "/auth/forgot-password" && method === "post") {
		if (!body || typeof body.email !== "string") {
			throw new Error("Mock API Error: Invalid forgot password payload");
		}
		return mockForgotPassword(body) as unknown as T;
	}

	// --- Fallback ---
	console.error(
		`Mock API: Endpoint ${endpoint} (Method: ${method}) not implemented.`
	);
	throw new Error(
		`Mock API: Endpoint ${endpoint} (Method: ${method}) not implemented.`
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

// --- Export Main API Client (Optional if needed elsewhere) ---
export { apiClient };
