// src/lib/api-client.ts
import { store } from "@/store";
// Import specific mock functions needed
import {
	getMockCourses,
	getMockCourseBySlug,
	createMockCheckoutSession,
	// Import other mock functions as you create them
} from "@/data/mock-course-data";
import type { Course } from "@/data/mock-course-data";

// --- Config ---
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";
// Ensure variable exists in .env.local (e.g., NEXT_PUBLIC_API_IS_LIVE=false)
const IS_LIVE_API = process.env.NEXT_PUBLIC_API_IS_LIVE === "true";

console.log(`API Client Mode: ${IS_LIVE_API ? "LIVE" : "MOCK"}`); // Log mode on load

interface FetchOptions extends RequestInit {
	requiresAuth?: boolean;
}

// --- Main API Client Function ---
async function apiClient<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<T> {
	// --- MOCK DATA Handling ---
	if (!IS_LIVE_API) {
		console.log(
			`%cAPI Client: Using MOCK for ${options.method || "GET"} ${endpoint}`,
			"color: orange; font-weight: bold;"
		);
		return handleMockRequest<T>(endpoint, options); // Delegate to mock handler
	}

	// --- LIVE API Handling ---
	const { requiresAuth = true, ...fetchOptions } = options;
	const headers = new Headers(fetchOptions.headers);
	if (!headers.has("Content-Type") && options.body)
		headers.set("Content-Type", "application/json");
	if (!headers.has("Accept")) headers.set("Accept", "application/json");
	if (requiresAuth) {
		const token = store.getState().auth.token; // Ensure auth slice exists and is configured
		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		} else {
			console.warn(
				`API Client: Auth required for ${endpoint}, but no token found.`
			);
			// Consider throwing a specific error or triggering logout action
			// throw new Error("Authentication token not found");
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
		if (response.status === 204) return undefined as T; // Handle No Content
		// Check for JSON content type before parsing
		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			return await response.json();
		}
		// Handle non-JSON responses if necessary, or return as is if expected
		console.warn(`API Client: Non-JSON response received for ${endpoint}`);
		return undefined as T; // Or handle as text: await response.text()
	} catch (error) {
		console.error(`API request failed for ${endpoint}:`, error);
		throw error; // Re-throw for upstream handling (e.g., in thunks)
	}
}

// --- Mock Request Handler ---
async function handleMockRequest<T>(
	endpoint: string,
	options: FetchOptions
): Promise<T> {
	await new Promise((resolve) =>
		setTimeout(resolve, Math.random() * 300 + 100)
	); // Delay
	const method = options.method?.toLowerCase() || "get";
	let body: any;
	if (options.body && typeof options.body === "string") {
		try {
			body = JSON.parse(options.body);
		} catch (e) {}
	}

	// --- Route to Specific Mock Functions ---
	if (endpoint === "/courses" && method === "get") {
		return (await getMockCourses()) as unknown as T;
	}

	const courseSlugMatch = endpoint.match(/^\/courses\/slug\/([\w-]+)$/);
	if (courseSlugMatch && method === "get") {
		const slug = courseSlugMatch[1];
		const course = await getMockCourseBySlug(slug);
		if (course) return course as unknown as T;
		else throw new Error(`Mock API: Course with slug ${slug} not found`);
	}

	if (endpoint === "/payments/create-checkout-session" && method === "post") {
		return (await createMockCheckoutSession(body)) as unknown as T;
	}

	// Add other mock routes...
	// if (endpoint === '/auth/login' && method === 'post') { return handleMockLogin(body) as T; }

	// Fallback for Unimplemented Mocks
	console.error(
		`Mock API: Endpoint ${endpoint} (Method: ${method}) not implemented.`
	);
	throw new Error(
		`Mock API: Endpoint ${endpoint} (Method: ${method}) not implemented`
	);
}

// --- Convenience Methods ---
export const get = <T>(
	endpoint: string,
	options?: Omit<FetchOptions, "method" | "body">
): Promise<T> => apiClient<T>(endpoint, { ...options, method: "GET" });
export const post = <T>(
	endpoint: string,
	data: any,
	options?: Omit<FetchOptions, "method" | "body">
): Promise<T> =>
	apiClient<T>(endpoint, {
		...options,
		method: "POST",
		body: JSON.stringify(data),
	});
export const put = <T>(
	endpoint: string,
	data: any,
	options?: Omit<FetchOptions, "method" | "body">
): Promise<T> =>
	apiClient<T>(endpoint, {
		...options,
		method: "PUT",
		body: JSON.stringify(data),
	});
export const del = <T>(
	endpoint: string,
	options?: Omit<FetchOptions, "method" | "body">
): Promise<T> => apiClient<T>(endpoint, { ...options, method: "DELETE" });

// Export the main function if needed directly elsewhere, though usually use helpers
export { apiClient };
