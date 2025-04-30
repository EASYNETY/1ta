// src/lib/api-client.ts

"use client";
import { store } from "@/store";

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

	// 🧠 Only fetch token dynamically during runtime
	if (requiresAuth) {
		try {
			const token = store.getState().auth.token;
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
		} catch (e) {
			console.warn(
				"Warning: Unable to access token during SSR, skipping auth header."
			);
		}
	}

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

// --- Export ---
export { apiClient };
