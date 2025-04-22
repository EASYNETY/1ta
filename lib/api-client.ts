import { store } from "@/store";
import * as mockData from "./mock-data";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
const IS_LIVE_API = process.env.NEXT_PUBLIC_API_IS_LIVE === "true";

interface FetchOptions extends RequestInit {
	requiresAuth?: boolean;
}

export async function apiClient<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<T> {
	// Check if we should use mock data
	if (!IS_LIVE_API) {
		console.log(`API Client: Using MOCK data for ${endpoint}`);
		return handleMockRequest<T>(endpoint, options);
	}

	const { requiresAuth = true, ...fetchOptions } = options;

	const headers = new Headers(fetchOptions.headers);
	headers.set("Content-Type", "application/json");

	if (requiresAuth) {
		const state = store.getState();
		const token = state.auth.token;

		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		}
	}

	const config: RequestInit = {
		...fetchOptions,
		headers,
	};

	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || `API error: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("API request failed:", error);
		throw error;
	}
}

// Mock data handler
async function handleMockRequest<T>(
	endpoint: string,
	options: FetchOptions
): Promise<T> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	const method = options.method?.toLowerCase() || "get";
	const body = options.body ? JSON.parse(options.body as string) : undefined;

	// Auth endpoints
	if (endpoint === "/auth/login" && method === "post") {
		return mockData.login(body) as unknown as T;
	}

	if (endpoint === "/auth/register" && method === "post") {
		return mockData.register(body) as unknown as T;
	}

	if (endpoint.startsWith("/users/") && method === "put") {
		const userId = endpoint.split("/")[2];
		return mockData.updateUser(userId, body) as unknown as T;
	}

	if (endpoint === "/courses" && method === "get") {
		return mockData.getCourses() as unknown as T;
	}

	if (endpoint === "/courses" && method === "post") {
		return mockData.createCourse(body) as unknown as T;
	}

	if (
		endpoint.startsWith("/courses/") &&
		endpoint.endsWith("/enroll") &&
		method === "post"
	) {
		const courseId = endpoint.split("/")[2];
		return mockData.enrollInCourse(courseId) as unknown as T;
	}

	// Default fallback
	throw new Error(
		`Mock API: Endpoint ${endpoint} with method ${method} not implemented`
	);
}

// Convenience methods - make sure these are properly exported
export const get = <T>(endpoint: string, options?: FetchOptions): Promise<T> =>
	apiClient<T>(endpoint, { ...options, method: "GET" });

export const post = <T>(
	endpoint: string,
	data: unknown,
	options?: FetchOptions
): Promise<T> =>
	apiClient<T>(endpoint, {
		...options,
		method: "POST",
		body: JSON.stringify(data),
	});

export const put = <T>(
	endpoint: string,
	data: unknown,
	options?: FetchOptions
): Promise<T> =>
	apiClient<T>(endpoint, {
		...options,
		method: "PUT",
		body: JSON.stringify(data),
	});

export const del = <T>(endpoint: string, options?: FetchOptions): Promise<T> =>
	apiClient<T>(endpoint, { ...options, method: "DELETE" });
