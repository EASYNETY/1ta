// src/lib/api-client.ts

"use client";
// Import Mock Handlers
import {
	getMockCourses,
	getMockCourseBySlug,
	createMockCheckoutSession,
} from "@/data/mock-course-data";

import {
	type StudentAttendanceResponse,
	type TeacherAttendanceResponse,
	mockStudentAttendance,
	mockClassAttendance,
} from "@/data/mock-attendance-data";

import {
	login as mockLogin,
	register as mockRegister,
	forgotPassword as mockForgotPassword,
	resetPassword as mockResetPassword,
	mockGetMyProfile,
	mockUpdateMyProfile,
	createCorporateStudentSlots,
} from "@/data/mock-auth-data";
import { getPublicMockCourses } from "@/data/public-mock-course-data";
import {
	getAuthMockCourseBySlug,
	getAuthMockCourses,
	markLessonCompleteMock,
	deleteAuthMockCourse,
	createAuthMockCourse,
	updateAuthMockCourse,
} from "@/data/mock-auth-course-data";
import {
	getUserSubscription as mockGetUserSubscription,
	createSubscription as mockCreateSubscription,
	updateSubscription as mockUpdateSubscription,
	cancelSubscription as mockCancelSubscription,
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
import type { PaymentRecord } from "@/features/payment/types/payment-types";
import {
	createMockScheduleEvent,
	deleteMockScheduleEvent,
	getAllMockScheduleEvents,
	getMockSchedule,
	getMockScheduleEventById,
	updateMockScheduleEvent,
} from "@/data/mock-schedule-data";
import {
	createMockClass,
	deleteMockClass,
	getMockAllClassesAdmin,
	getMockClassById,
	getMockCourseClassOptions,
	getMockEnrolledClasses,
	getMockTaughtClasses,
	updateMockClass,
} from "@/data/mock-classes-data";

import type { MarkAttendancePayload } from "@/features/attendance/store/attendance-slice";
import {
	mockGetNotificationPreferences,
	mockUpdateNotificationPreferences,
} from "@/data/mock-settings-data";
import {
	mockFetchNotifications,
	mockMarkNotificationAsRead,
	mockMarkAllNotificationsAsRead,
} from "@/data/mock-notification-data";
import {
	mockAddTicketResponse,
	mockCreateTicket,
	mockFetchAllFeedback,
	mockFetchAllTickets,
	mockFetchMyTickets,
	mockFetchTicketById,
	mockSubmitFeedback,
} from "@/data/mock-support-data";
import type {
	FeedbackType,
	TicketStatus,
} from "@/features/support/types/support-types";
import {
	mockFetchAllPaymentsAdmin,
	mockFetchMyPaymentHistory,
	mockFetchPaymentById,
} from "@/data/mock-payment-data";
import {
	createMockChatMessage,
	createMockChatRoom,
	getMockChatMessages,
	getMockChatRooms,
	markMockRoomAsRead,
} from "@/data/mock-chat-data";
import {
	deleteMockManagedStudent,
	getMockManagedStudents,
} from "@/data/mock-corporate-data";
import {
	createMockAssignment,
	deleteMockAssignment,
	getMockAssignmentById,
	getMockAssignmentsForCourse,
	getMockAssignmentsForStudent,
	getMockSubmissionsForAssignment,
	gradeMockSubmission,
	submitMockAssignment,
	updateMockAssignment,
} from "@/data/mock-assignment-data";
import {
	assignMockGrade,
	calculateMockCourseGrades,
	createMockGradeItem,
	deleteMockGradeItem,
	getMockCourseGrades,
	getMockGradeItemById,
	getMockGradeItemsForCourse,
	getMockGradeItemsForStudent,
	getMockStudentGradeById,
	getMockStudentGradesForGradeItem,
	updateMockGrade,
	updateMockGradeItem,
} from "@/data/mock-grade-data";
import { getAuthToken, handleUnauthorized } from "./auth-service";
import type { UserData } from "@/components/users/UserTableRow";

// --- Config ---
// Base URL for the API
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

// Determine if the API is in live mode or mock mode
const IS_LIVE_API = process.env.NEXT_PUBLIC_API_IS_LIVE === "true";

// Import the API cache
import { apiCache } from "./api-cache";

// Import rate limiter
import { apiRateLimiter, isRateLimitError } from "./rate-limiter";

// Configure the API cache
apiCache.configure({
	ttl: process.env.NODE_ENV === 'development' ? 5000 : 60000, // 5 seconds in dev, 1 minute in prod
	maxEntries: 100,
	cacheErrors: false, // Don't cache errors in development
	debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
});

// --- Types ---
interface FetchOptions extends RequestInit {
	requiresAuth?: boolean;
	url?: string;
	skipAuthRefresh?: boolean; // Add this to prevent infinite loops during token refresh
}

// Custom error class for API errors
export class ApiError extends Error {
	status: number;
	data: any;
	isNetworkError: boolean;

	constructor(
		message: string,
		status = 0,
		data: any = null,
		isNetworkError = false
	) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.data = data;
		this.isNetworkError = isNetworkError;
	}
}

// --- Main API Client ---
async function apiClient<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<T> {
	const {
		requiresAuth = true,
		skipAuthRefresh = false,
		...fetchOptions
	} = options;
	const method = (options.method || "GET").toUpperCase();

	// Check cache for GET requests
	if (method === "GET") {
		const cachedResponse = apiCache.get<T>(method, endpoint);
		if (cachedResponse !== undefined) {
			return cachedResponse;
		}
	}

	// Check rate limiting before making the request
	if (IS_LIVE_API && !apiRateLimiter.isAllowed(endpoint)) {
		console.warn(`Rate limit check failed for ${endpoint}, waiting...`);
		await apiRateLimiter.waitUntilAllowed(endpoint);
	}

	const headers = new Headers(fetchOptions.headers);

	if (!headers.has("Content-Type") && options.body)
		headers.set("Content-Type", "application/json");
	if (!headers.has("Accept")) headers.set("Accept", "application/json");

	// Add auth token if required and available
	if (requiresAuth && !skipAuthRefresh) {
		const token = getAuthToken();

		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		} else if (requiresAuth) {
			console.warn("Auth required but no token available");
		}
	}

	const config: RequestInit = { ...fetchOptions, headers };

	// --- MOCK Handling ---
	if (!IS_LIVE_API) {
		console.log(
			`%cAPI Client: Using MOCK for ${method} ${endpoint}`,
			"color: orange;"
		);

		try {
			const result = await handleMockRequest<T>(endpoint, options);

			// Cache successful GET responses
			if (method === "GET") {
				apiCache.set(method, endpoint, result);
			}

			return result;
		} catch (error: any) {
			// For 404 errors, cache an empty response to prevent repeated calls
			if (error?.response?.status === 404 && method === "GET") {
				const emptyResponse = { success: false, data: [], message: "Resource not found" } as unknown as T;
				apiCache.set(method, endpoint, emptyResponse, 404);
				return emptyResponse;
			}
			throw error;
		}
	}

	// --- LIVE Handling ---
	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

		if (!response.ok) {
			let errorData: any = {
				message: `API Error: ${response.status} ${response.statusText}`,
			};

			try {
				errorData = await response.json();
			} catch (e) {
				/* non-json response */
			}

			console.error("API Error Data:", errorData);

			// Handle 429 Too Many Requests (Rate Limiting)
			if (response.status === 429) {
				console.warn("Rate limit exceeded, implementing backoff strategy");

				// Extract retry-after header if available
				const retryAfter = response.headers.get('retry-after');
				const retryAfterSeconds = retryAfter ? parseInt(retryAfter) : 30; // Default 30 seconds

				// Update rate limiter with the rate limit info
				apiRateLimiter.handleRateLimit(endpoint, retryAfterSeconds);

				// Implement exponential backoff with jitter
				const backoffDelay = Math.min(retryAfterSeconds * 1000 + Math.random() * 1000, 60000); // Max 60 seconds

				console.log(`Rate limited. Retrying after ${backoffDelay}ms`);

				// Wait for the backoff period
				await new Promise(resolve => setTimeout(resolve, backoffDelay));

				// Retry the request once
				try {
					const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);

					if (retryResponse.ok) {
						console.log("Retry successful after rate limit backoff");

						if (retryResponse.status === 204) return undefined as T;

						const contentType = retryResponse.headers.get("content-type");
						if (contentType && contentType.includes("application/json")) {
							const responseData = await retryResponse.json();

							// Handle the same response structure logic as below
							let data: T;
							if (responseData && typeof responseData === 'object' && 'success' in responseData) {
								if (responseData.data !== undefined) {
									if (Array.isArray(responseData.data) && responseData.pagination) {
										data = {
											...responseData.data,
											pagination: responseData.pagination
										} as T;
									} else {
										data = responseData.data;
									}
								} else {
									data = responseData;
								}
							} else {
								data = responseData;
							}

							// Cache successful GET responses
							if (method === "GET") {
								apiCache.set(method, endpoint, data, retryResponse.status);
							}

							return data;
						}

						return undefined as T;
					} else {
						// If retry also fails, throw the original rate limit error
						throw new ApiError(
							`Rate limit exceeded. Please try again later. (Retry also failed: ${retryResponse.status})`,
							429,
							errorData
						);
					}
				} catch (retryError) {
					console.error("Retry after rate limit failed:", retryError);
					// Throw the original rate limit error
					throw new ApiError(
						"Rate limit exceeded. Please try again later.",
						429,
						errorData
					);
				}
			}

			// Handle 401 Unauthorized errors (expired token, etc.)
			if (response.status === 401 && !skipAuthRefresh) {
				console.warn("Received 401 Unauthorized, attempting token refresh");

				// Try to refresh the token using the direct function from auth-service
				try {
					// Import the refreshAuthToken function from auth-service
					const { refreshAuthToken } = await import("@/lib/auth-service");

					// Call the function directly without using Redux
					const { token } = await refreshAuthToken();

					// If refresh successful, retry the original request with the new token
					if (token) {
						console.log("Token refresh successful, retrying original request");
						headers.set("Authorization", `Bearer ${token}`);
						const retryConfig = { ...config, headers };

						// Add a small delay before retrying to ensure token is properly stored
						await new Promise(resolve => setTimeout(resolve, 100));

						const retryResponse = await fetch(
							`${API_BASE_URL}${endpoint}`,
							retryConfig
						);

						if (retryResponse.ok) {
							console.log("Retry successful after token refresh");
							if (retryResponse.status === 204) return undefined as T;

							const contentType = retryResponse.headers.get("content-type");
							if (contentType && contentType.includes("application/json")) {
								return await retryResponse.json();
							}

							return undefined as T;
						} else {
							// If retry fails, check if it's another 401
							if (retryResponse.status === 401) {
								console.error("Still getting 401 after token refresh, session may be invalid");
								// Only logout if we're still getting 401 after refresh
								handleUnauthorized();
							}

							// For other errors, throw normal error
							let retryErrorData: any = {
								message: `API Error after token refresh: ${retryResponse.status} ${retryResponse.statusText}`,
							};

							try {
								retryErrorData = await retryResponse.json();
							} catch (e) {
								/* non-json response */
							}

							throw new ApiError(
								retryErrorData.message || `Error ${retryResponse.status} after token refresh`,
								retryResponse.status,
								retryErrorData
							);
						}
					}
				} catch (refreshError) {
					console.error("Token refresh failed:", refreshError);
					// Only logout if refresh explicitly failed, not for network errors
					if (!(refreshError instanceof Error && refreshError.message.includes("network"))) {
						handleUnauthorized();
					}
				}

				// Throw a specific error for 401
				throw new ApiError(
					errorData.message || "Your session has expired. Please log in again.",
					401,
					errorData
				);
			}

			// Handle other error status codes
			throw new ApiError(
				errorData.message || `Error ${response.status}: ${response.statusText}`,
				response.status,
				errorData
			);
		}

		if (response.status === 204) return undefined as T;

		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			const responseData = await response.json();

			// Handle nested response structure (success, data, pagination)
			// If the response has a 'data' property, return just the data
			// This makes the API client compatible with both direct and nested responses
			let data;

			// Check if this is a nested response with success and data fields
			if (responseData.success !== undefined && responseData.data !== undefined) {
				// For endpoints with pagination, preserve the pagination info
				if (responseData.pagination ||
					(responseData.data && responseData.data.pagination) ||
					endpoint.includes('?page=') ||
					endpoint.includes('&page=')) {

					// If pagination is directly in the response
					if (responseData.pagination) {
						data = {
							...responseData.data,
							pagination: responseData.pagination
						};
					}
					// If pagination is nested inside data
					else if (responseData.data && responseData.data.pagination) {
						data = responseData.data;
					}
					// Otherwise, just return the data
					else {
						data = responseData.data;
					}
				} else {
					// For non-paginated endpoints, just return the data
					data = responseData.data;
				}
			} else {
				// Direct response structure (no success/data nesting)
				data = responseData;
			}

			// Cache successful GET responses
			if (method === "GET") {
				apiCache.set(method, endpoint, data, response.status);
			}

			// Record successful request for rate limiting
			if (IS_LIVE_API) {
				apiRateLimiter.recordRequest(endpoint);
			}

			return data;
		}

		console.warn(`API Client: Non-JSON response received for ${endpoint}`);
		return undefined as T;
	} catch (error: any) {
		console.error(`API request failed for ${endpoint}:`, error);

		// If it's already an ApiError, just rethrow it
		if (error instanceof ApiError) {
			throw error;
		}

		// Handle network errors (offline, DNS failure, etc.)
		if (error.name === "TypeError" && error.message.includes("fetch")) {
			throw new ApiError(
				"Network error. Please check your internet connection.",
				0,
				null,
				true
			);
		}

		// For any other errors
		throw new ApiError(
			error.message || "An unexpected error occurred",
			error.status || 0,
			error.data || null
		);
	}
}

// --- Handle MOCK Requests ---
export async function handleMockRequest<T>(
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

	// Handle FormData
	if (options.body instanceof FormData) {
		body = {};
		options.body.forEach((value, key) => {
			// For files, extract basic info
			if (value instanceof File) {
				body[key] = {
					name: value.name,
					type: value.type,
					size: value.size,
				};
			} else {
				body[key] = value;
			}
		});
	}

	// --- Primary Debug Log ---
	console.log(
		`%c[DEBUG] handleMockRequest: Entry\n  Endpoint: "${endpoint}"\n  Method: "${method}"\n  options.url: "${options.url}"`,
		"color: blue; font-weight: bold;"
	);

	// Helper function to standardize response format
	const standardizeResponse = (data: any, message: string = "Operation successful") => {
		// If the data is already in the standard format, return it as is
		if (data && data.success !== undefined && data.data !== undefined) {
			return data;
		}

		// Otherwise, wrap it in the standard format
		return {
			success: true,
			data: data,
			message: message
		};
	};

	// --- Courses
	if (endpoint === "/courses" && method === "get") {
		const courses = await getMockCourses();
		return standardizeResponse(courses, "Courses fetched successfully") as unknown as T;
	}
	if (endpoint === "/public_courses" && method === "get") {
		if (IS_LIVE_API) {
			// In live mode, this will be handled by the real API
			throw new Error("Mock API: This endpoint should be handled by the real API in live mode");
		} else {
			// Return mock data for public courses with proper API response structure
			const courses = await getPublicMockCourses();
			return {
				success: true,
				data: courses,
				message: "Public courses fetched successfully"
			} as unknown as T;
		}
	}
	if (endpoint === "/auth_courses" && method === "get") {
		if (IS_LIVE_API) {
			// In live mode, this will be handled by the real API
			throw new Error("Mock API: This endpoint should be handled by the real API in live mode");
		} else {
			// Return mock data for auth courses with proper API response structure
			const courses = await getAuthMockCourses();
			return {
				success: true,
				data: courses,
				message: "Auth courses fetched successfully"
			} as unknown as T;
		}
	}

	const courseSlugMatch = endpoint.match(/^\/courses\/slug\/([\w-]+)$/);
	if (courseSlugMatch && method === "get") {
		const slug = courseSlugMatch[1];
		const course = await getMockCourseBySlug(slug);
		if (course) {
			return standardizeResponse(course, `Course with slug "${slug}" fetched successfully`) as unknown as T;
		}
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

	// --- Mock Handler for CREATE Course ---
	if (endpoint === "/auth_courses" && method === "post") {
		console.log(
			`%cAPI Client MOCK: Creating new course`,
			"color: orange;"
		);
		try {
			const newCourse = await createAuthMockCourse(body);
			return {
				success: true,
				data: newCourse,
				message: "Course created successfully"
			} as unknown as T;
		} catch (error) {
			console.error("Mock API Error: Failed to create course", error);
			throw {
				response: {
					data: { message: "Mock Error: Failed to create course" },
					status: 500,
				},
			};
		}
	}

	// --- Mock Handler for UPDATE Course ---
	const updateAuthCourseMatch = endpoint.match(/^\/auth_courses\/([\w-]+)$/);
	if (updateAuthCourseMatch && method === "put") {
		const courseId = updateAuthCourseMatch[1];
		console.log(
			`%cAPI Client MOCK: Updating course ${courseId}`,
			"color: orange;"
		);
		try {
			const updatedCourse = await updateAuthMockCourse(courseId, body);
			if (updatedCourse) {
				return {
					success: true,
					data: updatedCourse,
					message: "Course updated successfully"
				} as unknown as T;
			} else {
				throw new Error(`Course with ID ${courseId} not found`);
			}
		} catch (error) {
			console.error(`Mock API Error: Failed to update course ${courseId}`, error);
			throw {
				response: {
					data: { message: `Mock Error: Failed to update course ${courseId}` },
					status: 404,
				},
			};
		}
	}

	// --- Mock Handler for DELETE Course ---
	const deleteAuthCourseMatch = endpoint.match(/^\/auth_courses\/([\w-]+)$/);
	if (deleteAuthCourseMatch && method === "delete") {
		const courseId = deleteAuthCourseMatch[1];
		console.log(
			`%cAPI Client MOCK: Deleting course ${courseId}`,
			"color: orange;"
		);
		const success = await deleteAuthMockCourse(courseId); // Call helper to modify mock data
		if (success) {
			return { success: true, id: courseId } as unknown as T; // Return success indicator
		} else {
			console.error(
				`Mock API Error: Course with ID ${courseId} not found for deletion.`
			);
			// Simulate a 404 or other error
			throw {
				response: {
					data: { message: `Mock Error: Course ${courseId} not found.` },
					status: 404,
				},
			};
		}
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

	// Handle both /users/me and /users/:id for updating user profile
	if (endpoint === "/users/me" && method === "put") {
		console.log(`%cAPI Client MOCK: PUT /users/me with data:`, "color: orange;", body);
		return mockUpdateMyProfile(body, "me") as unknown as T;
	}

	const updateUserMatch = endpoint.match(/^\/users\/([\w-]+)$/);
	if (updateUserMatch && method === "put") {
		const userId = updateUserMatch[1];
		console.log(`%cAPI Client MOCK: PUT /users/${userId} with data:`, "color: orange;", body);
		return mockUpdateMyProfile(body, userId) as unknown as T;
	}

	// --- START: Corporate Slot Creation Mock Handler ---
	if (endpoint === "/corporate/create-slots" && method === "post") {
		console.log(
			`%cAPI Client MOCK: POST /corporate/create-slots`,
			"color: orange;"
		);
		if (
			!body ||
			!body.corporateId ||
			body.studentCount === undefined ||
			!body.courses
		) {
			throw new Error(
				"Mock API Error: Missing required fields for creating corporate slots."
			);
		}
		try {
			const result = await createCorporateStudentSlots({
				corporateId: body.corporateId,
				studentCount: body.studentCount,
				courses: body.courses,
			});
			return result as unknown as T;
		} catch (error: any) {
			console.error(
				"Mock API Error for POST /corporate/create-slots:",
				error.message
			);
			throw { response: { data: { message: error.message }, status: 400 } }; // Bad Request
		}
	}
	// --- END: Corporate Slot Creation Mock Handler ---

	// --- START: Corporate Student Management Mock Handlers ---

	// GET /corporate/:corporateId/students - Fetch Managed Students List
	const getManagedStudentsMatch = endpoint.match(
		/^\/corporate\/([\w-]+)\/students$/
	);
	if (getManagedStudentsMatch && method === "get") {
		const corporateId = getManagedStudentsMatch[1];
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const page = Number.parseInt(urlParams.get("page") || "1", 10);
		const limit = Number.parseInt(urlParams.get("limit") || "10", 10);
		const search = urlParams.get("search") || undefined;
		console.log(
			`%cAPI Client MOCK: GET /corporate/${corporateId}/students?page=${page}&limit=${limit}&search=${search}`,
			"color: purple;"
		);
		try {
			const result = await getMockManagedStudents(
				corporateId,
				page,
				limit,
				search
			);
			return result as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /corporate/${corporateId}/students:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	// GET /corporate/:corporateId/students/:studentId - Fetch Single Managed Student
	const getManagedStudentByIdMatch = endpoint.match(
		/^\/corporate\/([\w-]+)\/students\/([\w-]+)$/
	);
	if (getManagedStudentByIdMatch && method === "get") {
		const corporateId = getManagedStudentByIdMatch[1];
		const studentId = getManagedStudentByIdMatch[2];
		console.log(
			`%cAPI Client MOCK: GET /corporate/${corporateId}/students/${studentId}`,
			"color: purple;"
		);
		try {
			// This endpoint isn't implemented in the mock data yet
			// For now, we'll simulate finding the student in the managed students list
			const result = await getMockManagedStudents(corporateId, 1, 100);
			const student = result.students.find((s) => s.id === studentId);
			if (!student) {
				throw new Error(`Student with ID ${studentId} not found`);
			}
			return student as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /corporate/${corporateId}/students/${studentId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 404 } };
		}
	}

	// Note: We assume POST /users, PUT /users/:id, DELETE /users/:id are handled by existing
	// mockLogin, mockUpdateMyProfile, and a generic delete handler (if needed).
	// The *backend* differentiates based on the authenticated user's role/corporateId.
	// If you used DELETE /corporate/students/:studentId instead:
	const deleteManagedStudentMatch = endpoint.match(
		/^\/corporate\/students\/([\w-]+)$/
	);
	if (deleteManagedStudentMatch && method === "delete") {
		const studentId = deleteManagedStudentMatch[1];
		console.log(
			`%cAPI Client MOCK: DELETE /corporate/students/${studentId}`,
			"color: purple;"
		);
		try {
			await deleteMockManagedStudent(studentId);
			return { success: true, id: studentId } as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for DELETE /corporate/students/${studentId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 404 } };
		}
	}

	// --- END: Corporate Student Management Mock Handlers ---

	// --- Media Upload Mock Handler ---
	if (endpoint === "/media/upload" && method === "post") {
		console.log(
			`%cAPI Client MOCK: POST /media/upload`,
			"color: orange;"
		);

		// Check if we have file data in the body
		if (!body || !body.file) {
			throw new Error("Mock API Error: Missing file in upload request");
		}

		// Generate a mock URL
		// In a real implementation, this would be a URL to the uploaded file
		const fileInfo = body.file;
		const mediaType = body.mediaType || (fileInfo.type.startsWith('image/') ? 'image' :
			fileInfo.type.startsWith('video/') ? 'video' : 'document');

		// Create a mock response
		const mockResponse = {
			success: true,
			data: {
				url: `https://storage.example.com/${mediaType}s/${Date.now()}-${fileInfo.name}`,
				mediaId: `media_${Date.now()}`,
				mediaType: mediaType,
				filename: fileInfo.name,
				size: fileInfo.size,
				mimeType: fileInfo.type,
			},
			message: "File uploaded successfully",
		};

		return mockResponse as unknown as T;
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

	// --- Payment Endpoints ---
	// GET /payments/user/history - Get user payment history
	if (method === "get" && /^\/payments\/user\/history(\?.*)?$/.test(endpoint)) {
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const page = Number.parseInt(urlParams.get("page") || "1", 10);
		const limit = Number.parseInt(urlParams.get("limit") || "10", 10);
		const userId = urlParams.get("userId") || "student_123"; // Get userId from query params or default

		console.log(`%cAPI Client MOCK: GET /payments/user/history for user ${userId}`, "color: orange;");

		try {
			// Always use mock function regardless of IS_LIVE_API to ensure it works in development
			const result = await mockFetchMyPaymentHistory(userId, page, limit);
			return {
				success: true,
				data: {
					payments: result.payments,
					pagination: {
						total: result.total,
						page: page,
						limit: limit,
						totalPages: Math.ceil(result.total / limit)
					}
				},
				message: "Payment history fetched successfully"
			} as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for GET /payments/user/history:", error.message);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	// GET /payments - Get all payments (admin)
	if (method === "get" && /^\/payments(\?.*)?$/.test(endpoint)) {
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const status = urlParams.get("status") as PaymentRecord["status"] | undefined;
		const page = Number.parseInt(urlParams.get("page") || "1", 10);
		const limit = Number.parseInt(urlParams.get("limit") || "10", 10);
		const search = urlParams.get("search") || undefined;

		console.log(`%cAPI Client MOCK: GET /payments (admin) with status=${status}, page=${page}, limit=${limit}, search=${search}`, "color: orange;");

		try {
			// Always use mock function regardless of IS_LIVE_API to ensure it works in development
			const result = await mockFetchAllPaymentsAdmin(status, page, limit, search);
			return {
				success: true,
				data: {
					payments: result.payments,
					pagination: {
						total: result.total,
						page: page,
						limit: limit,
						totalPages: Math.ceil(result.total / limit)
					}
				},
				message: "All payments fetched successfully"
			} as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for GET /payments:", error.message);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	// POST /payments/initialize - Initialize payment
	if (endpoint === "/payments/initialize" && method === "post") {
		if (!body) {
			throw new Error("Mock API Error: Missing body for POST /payments/initialize");
		}

		const { invoiceId, amount, paymentMethod } = body;

		if (!invoiceId || amount === undefined || !paymentMethod) {
			throw new Error("Mock API Error: Missing required fields for payment initialization");
		}

		// Generate a mock payment response
		const mockPayment = {
			id: `pay_${Date.now()}`,
			userId: "student_123", // This would come from the authenticated user in a real API
			amount,
			currency: "NGN",
			status: "pending",
			provider: "paystack",
			providerReference: `mock_ref_${Date.now()}`,
			description: `Payment for invoice ${invoiceId}`,
			createdAt: new Date().toISOString(),
			paymentMethod,
		};

		// Generate a mock authorization URL
		const authorizationUrl = `https://checkout.paystack.com/mock_${Date.now()}`;

		return {
			success: true,
			message: "Payment initialized successfully",
			data: {
				payment: mockPayment,
				authorizationUrl
			}
		} as unknown as T;
	}

	// GET /payments/verify/:reference - Verify payment
	const verifyPaymentMatch = endpoint.match(/^\/payments\/verify\/([\w-]+)$/);
	if (verifyPaymentMatch && method === "get") {
		const reference = verifyPaymentMatch[1];

		// Generate a mock verification response
		const mockPayment = {
			id: `pay_${Date.now()}`,
			userId: "student_123", // This would come from the authenticated user in a real API
			amount: 5000, // This would be the actual amount in a real API
			currency: "NGN",
			status: "succeeded",
			provider: "paystack",
			providerReference: reference,
			description: "Payment verification",
			createdAt: new Date().toISOString(),
			paymentMethod: "card",
		};

		return {
			success: true,
			message: "Payment verified successfully",
			data: {
				payment: mockPayment,
				verification: {
					status: "success",
					reference,
					amount: 5000,
					gateway_response: "Successful",
					channel: "card",
					currency: "NGN",
					customer: {
						email: "user@example.com",
					}
				}
			}
		} as unknown as T;
	}

	// GET /payments/:id - Get a single payment by ID
	const paymentByIdMatch = endpoint.match(/^\/payments\/([\w-]+)$/);
	if (paymentByIdMatch && method === "get") {
		const paymentId = paymentByIdMatch[1];

		console.log(`%cAPI Client MOCK: GET /payments/${paymentId}`, "color: orange;");

		try {
			// Use the mock function to fetch a payment by ID
			const payment = await mockFetchPaymentById(paymentId);

			return {
				success: true,
				message: "Payment fetched successfully",
				data: payment
			} as unknown as T;
		} catch (error: any) {
			console.error(`Mock API Error for GET /payments/${paymentId}:`, error.message);
			throw {
				response: {
					data: { message: error.message },
					status: error.message.includes("not found") ? 404 : 500
				}
			};
		}
	}

	// --- Schedule Mock ---
	if (method === "get" && /^\/schedule(\?.*)?$/.test(endpoint)) {
		// Note: In real API, role/userId would come from token/query params
		// We might need to simulate getting the user ID here if the thunk doesn't pass it
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const role = urlParams.get("role") || "student";
		const userId = urlParams.get("userId") || "student_123";
		const startDate = urlParams.get("startDate");
		const endDate = urlParams.get("endDate");

		console.log(
			`MOCK: Fetching schedule for Role: ${role}, UserID: ${userId}, Date Range: ${startDate} to ${endDate}`
		);

		return getMockSchedule(role, userId) as unknown as T;
	}

	// --- START: Schedule Event CRUD Mock Handlers ---

	// GET /schedule-events - Fetch All Events (for management table)
	if (
		endpoint.startsWith("/schedule-events") &&
		!endpoint.match(/^\/schedule-events\/([\w-]+)$/) &&
		method === "get"
	) {
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const page = Number.parseInt(urlParams.get("page") || "1", 10);
		const limit = Number.parseInt(urlParams.get("limit") || "10", 10);
		// Add parsing for filter params here if needed
		console.log(
			`%cAPI Client MOCK: GET /schedule-events?page=${page}&limit=${limit}`,
			"color: orange;"
		);
		try {
			// Pass params to mock function
			const result = await getAllMockScheduleEvents(
				page,
				limit /* Pass filters */
			);
			return result as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for GET /schedule-events:", error.message);
			throw { response: { data: { message: error.message }, status: 500 } }; // Simulate server error
		}
	}

	// GET /schedule-events/:id - Fetch Single Event
	const getEventByIdMatch = endpoint.match(/^\/schedule-events\/([\w-]+)$/);
	if (getEventByIdMatch && method === "get") {
		const eventId = getEventByIdMatch[1];
		console.log(
			`%cAPI Client MOCK: GET /schedule-events/${eventId}`,
			"color: orange;"
		);
		try {
			const eventData = await getMockScheduleEventById(eventId);
			return eventData as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /schedule-events/${eventId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 404 } };
		}
	}

	// POST /schedule-events - Create Event
	if (endpoint === "/schedule-events" && method === "post") {
		console.log("%cAPI Client MOCK: POST /schedule-events", "color: orange;");
		if (!body)
			throw new Error(
				"Mock API Error: Missing request body for POST /schedule-events"
			);
		try {
			const newEvent = await createMockScheduleEvent(body);
			return newEvent as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for POST /schedule-events:", error.message);
			throw { response: { data: { message: error.message }, status: 400 } };
		}
	}

	// PUT /schedule-events/:id - Update Event
	const updateEventMatch = endpoint.match(/^\/schedule-events\/([\w-]+)$/);
	if (updateEventMatch && method === "put") {
		const eventId = updateEventMatch[1];
		console.log(
			`%cAPI Client MOCK: PUT /schedule-events/${eventId}`,
			"color: orange;"
		);
		if (!body)
			throw new Error(
				`Mock API Error: Missing request body for PUT /schedule-events/${eventId}`
			);
		try {
			const updatedEvent = await updateMockScheduleEvent(eventId, body);
			return updatedEvent as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for PUT /schedule-events/${eventId}:`,
				error.message
			);
			const status = error.message.includes("not found") ? 404 : 400;
			throw { response: { data: { message: error.message }, status } };
		}
	}

	// DELETE /schedule-events/:id - Delete Event
	const deleteEventMatch = endpoint.match(/^\/schedule-events\/([\w-]+)$/);
	if (deleteEventMatch && method === "delete") {
		const eventId = deleteEventMatch[1];
		console.log(
			`%cAPI Client MOCK: DELETE /schedule-events/${eventId}`,
			"color: orange;"
		);
		try {
			await deleteMockScheduleEvent(eventId);
			return { success: true, id: eventId } as unknown as T; // Simulate success
		} catch (error: any) {
			console.error(
				`Mock API Error for DELETE /schedule-events/${eventId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 404 } };
		}
	}

	// --- END: Schedule Event CRUD Mock Handlers ---

	// --- Classes Mocks ---
	console.log(
		"%c[DEBUG] handleMockRequest: Checking Classes Mocks...",
		"color: magenta;"
	);

	// VVVV UPDATED STUDENT ENROLLED CLASSES HANDLER VVVV
	const enrolledClassesMatch = endpoint.match(
		/^\/users\/([\w-]+)\/enrolled-classes$/
	);
	if (enrolledClassesMatch && method === "get") {
		const userId = enrolledClassesMatch[1];
		console.log(
			`%cAPI Client MOCK: GET /users/${userId}/enrolled-classes`,
			"color: orange;"
		);
		try {
			const response = await getMockEnrolledClasses(userId);
			return response as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /users/${userId}/enrolled-classes:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	// VVVV UPDATED TEACHER TAUGHT CLASSES HANDLER VVVV
	const taughtClassesMatch = endpoint.match(
		/^\/teachers\/([\w-]+)\/taught-classes$/
	);
	if (taughtClassesMatch && method === "get") {
		const teacherId = taughtClassesMatch[1];
		console.log(
			`%cAPI Client MOCK: GET /teachers/${teacherId}/taught-classes`,
			"color: orange;"
		);
		try {
			const response = await getMockTaughtClasses(teacherId);
			return response as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /teachers/${teacherId}/taught-classes:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	// Example: Admin getting all classes with regex URL match
	if (method === "get" && /^\/admin\/classes(\?.*)?$/.test(endpoint)) {
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const page = Number.parseInt(urlParams.get("page") || "1", 10);
		const limit = Number.parseInt(urlParams.get("limit") || "10", 10);
		const search = urlParams.get("search") || undefined;

		console.log(
			`%cAPI Client MOCK: GET /admin/classes?page=${page}&limit=${limit}&search=${search}`,
			"color: orange;"
		);

		try {
			const result = await getMockAllClassesAdmin(page, limit, search);

			// Transform the result to match the expected format from the backend
			const transformedResult = {
				success: true,
				data: result.classes,
				pagination: {
					total: result.total,
					page: page,
					limit: limit,
					pages: Math.ceil(result.total / limit)
				},
				message: "Classes fetched successfully"
			};

			console.log("Transformed admin classes result:", transformedResult);

			return transformedResult as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for GET /admin/classes:", error.message);
			throw {
				response: { data: { message: error.message }, status: 500 },
			};
		}
	}

	// --- START: Class CRUD Mock Handlers ---

	// GET /classes/:id - Fetch Single Class
	const getClassByIdMatch = endpoint.match(/^\/classes\/([\w-]+)$/);
	if (getClassByIdMatch && method === "get") {
		const classId = getClassByIdMatch[1];
		console.log(`%cAPI Client MOCK: GET /classes/${classId}`, "color: orange;");
		try {
			const classData = await getMockClassById(classId); // Call mock function

			// Transform the result to match the expected format from the backend
			const transformedResult = {
				success: true,
				data: classData,
				message: "Class fetched successfully"
			};

			console.log("Transformed class result:", transformedResult);

			return transformedResult as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /classes/${classId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 404 } }; // Simulate 404
		}
	}

	// POST /classes - Create Class
	if (endpoint === "/classes" && method === "post") {
		console.log("%cAPI Client MOCK: POST /classes", "color: orange;");
		if (!body)
			throw new Error("Mock API Error: Missing request body for POST /classes");
		try {
			const newClass = await createMockClass(body); // Call mock function

			// Transform the result to match the expected format from the backend
			const transformedResult = {
				success: true,
				data: newClass,
				message: "Class created successfully"
			};

			console.log("Transformed create class result:", transformedResult);

			return transformedResult as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for POST /classes:", error.message);
			throw { response: { data: { message: error.message }, status: 400 } }; // Simulate 400 Bad Request
		}
	}

	// PUT /classes/:id - Update Class
	const updateClassMatch = endpoint.match(/^\/classes\/([\w-]+)$/);
	if (updateClassMatch && method === "put") {
		const classId = updateClassMatch[1];
		console.log(`%cAPI Client MOCK: PUT /classes/${classId}`, "color: orange;");
		if (!body)
			throw new Error(
				`Mock API Error: Missing request body for PUT /classes/${classId}`
			);
		try {
			const updatedClass = await updateMockClass(classId, body); // Call mock function

			// Transform the result to match the expected format from the backend
			const transformedResult = {
				success: true,
				data: updatedClass,
				message: "Class updated successfully"
			};

			console.log("Transformed update class result:", transformedResult);

			return transformedResult as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for PUT /classes/${classId}:`,
				error.message
			);
			// Simulate 404 if not found, 400 otherwise
			const status = error.message.includes("not found") ? 404 : 400;
			throw { response: { data: { message: error.message }, status } };
		}
	}

	// DELETE /classes/:id - Delete Class
	const deleteClassMatch = endpoint.match(/^\/classes\/([\w-]+)$/);
	if (deleteClassMatch && method === "delete") {
		const classId = deleteClassMatch[1];
		console.log(
			`%cAPI Client MOCK: DELETE /classes/${classId}`,
			"color: orange;"
		);
		try {
			await deleteMockClass(classId); // Call mock function

			// Transform the result to match the expected format from the backend
			const transformedResult = {
				success: true,
				data: { id: classId },
				message: "Class deleted successfully"
			};

			console.log("Transformed delete class result:", transformedResult);

			return transformedResult as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for DELETE /classes/${classId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 404 } }; // Simulate 404
		}
	}

	if (method === "get" && /^\/class-sessions\/options(\?.*)?$/.test(endpoint)) {
		console.log(
			`%c[DEBUG] handleMockRequest: MATCHED Get Course Class Options (GET /class-sessions/options)`,
			"color: green; font-weight: bold;"
		);

		// Check if we have a cached response from the global cache
		const cachedResponse = apiCache.get<T>("GET", endpoint);
		if (cachedResponse !== undefined) {
			console.log("Using cached response for /class-sessions/options");
			return cachedResponse;
		}

		try {
			// Get the mock response which now returns ClassOptionsResponse
			const response = await getMockCourseClassOptions();
			console.log(
				"MOCK API: Successfully fetched class options response:",
				response
			);

			// Cache the successful response in the global cache
			apiCache.set("GET", endpoint, response);

			// Return the response directly without any transformation
			// Our API client will handle the nested structure
			return response as unknown as T;
		} catch (error: any) {
			console.error(
				"Mock API Error for GET /class-sessions/options:",
				error.message
			);

			// For 404 errors, cache an empty response to prevent repeated calls
			if (error.status === 404 || error.message?.includes("not found")) {
				const emptyResponse = {
					success: false,
					data: {
						classTypes: [],
						locations: [],
						instructors: [],
						courses: [],
						timeSlots: []
					},
					message: "Resource not found"
				};
				apiCache.set("GET", endpoint, emptyResponse, 404);
				return emptyResponse as unknown as T;
			}

			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}
	// ^^^^ END OF NEW HANDLER ^^^^

	// --- Attendance Mock Data ---
	const studentAttendanceMatch = endpoint.match(
		/^\/students\/(.+)\/attendance$/
	);
	if (studentAttendanceMatch && method === "get") {
		const studentId = studentAttendanceMatch[1];
		const studentAttendance = mockStudentAttendance[studentId];
		if (studentAttendance) {
			// Transform the result to match the expected format from the backend
			const transformedResult = {
				success: true,
				data: {
					studentId,
					attendances: studentAttendance,
				},
				message: "Student attendance records retrieved successfully"
			};

			console.log("Transformed student attendance result:", transformedResult);

			return transformedResult as unknown as T;
		}

		// If no attendance found, return an empty result with the expected format
		console.log(`Mock API: No attendance found for student with ID "${studentId}". Returning empty result.`);
		return {
			success: true,
			data: {
				studentId,
				attendances: []
			},
			message: "No attendance records found for this student"
		} as unknown as T;
	}

	const teacherAttendanceMatch = endpoint.match(
		/^\/courses\/(.+)\/attendance$/
	);
	if (teacherAttendanceMatch && method === "get") {
		const courseClassId = teacherAttendanceMatch[1];
		const classAttendance = mockClassAttendance.find(
			(attendance: any) => attendance.courseClassId === courseClassId
		);
		if (classAttendance) {
			// Transform the result to match the expected format from the backend
			const transformedResult = {
				success: true,
				data: classAttendance,
				message: "Attendance records retrieved successfully"
			};

			console.log("Transformed attendance result:", transformedResult);

			return transformedResult as unknown as T;
		}

		// If no attendance found, return an empty result with the expected format
		console.log(`Mock API: No attendance found for course with ID "${courseClassId}". Returning empty result.`);
		return {
			success: true,
			data: {
				courseClassId,
				courseTitle: "Unknown Course",
				totalStudents: 0,
				dailyAttendances: []
			},
			message: "No attendance records found for this course"
		} as unknown as T;
	}

	// --- Mock for Marking Attendance ---
	if (endpoint === "/attendance/mark" && method === "post") {
		const payload = body as MarkAttendancePayload;
		console.log("Mock API: Marking attendance for:", payload);
		// Simulate success or failure
		const succeed = Math.random() > 0.1; // 90% success rate
		if (succeed) {
			// In a real mock, you might update the mock data store here
			// For now, just return success with the expected format
			return {
				success: true,
				data: {
					id: `attendance-${Date.now()}`,
					studentId: payload.studentId,
					classId: payload.classInstanceId,
					date: new Date().toISOString().split('T')[0],
					status: "present",
					notes: `Marked via API at ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`,
					markedBy: payload.markedByUserId
				},
				message: "Attendance marked successfully"
			} as unknown as T;
		} else {
			console.error("Mock API: Simulated failure marking attendance");
			// Simulate returning an error structure your thunk expects
			throw {
				response: {
					data: {
						success: false,
						message: "Mock Error: Failed to save attendance on server.",
						error: "Internal server error"
					},
					status: 500,
				},
			};
		}
	}

	// --- Chat Mocks ---
	console.log(
		"%c[DEBUG] handleMockRequest: Checking Chat Mocks...",
		"color: blue;"
	);

	// Handler for GET /chat/rooms/user/:userId
	const chatRoomsForUserMatch = endpoint.match(/^\/chat\/rooms\/user\/(.+)$/);
	if (chatRoomsForUserMatch && method === "get") {
		console.log(
			`%c[DEBUG] handleMockRequest: MATCHED Chat Rooms (GET /chat/rooms/user/:userId)`,
			"color: green; font-weight: bold;"
		);
		const userId = chatRoomsForUserMatch[1];
		console.log(
			`%cAPI Client MOCK: GET /chat/rooms/user/${userId}`,
			"color: orange;"
		);
		try {
			const response = await getMockChatRooms(userId);
			return response as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for GET /chat/rooms:", error.message);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	} else {
		console.log(
			"%c[DEBUG] handleMockRequest: NO MATCH for Chat Rooms",
			"color: gray;"
		);
	}

	// Handler for GET /chat/messages
	// Let's test both exact match and startsWith for the endpoint
	const cleanEndpoint = endpoint.split("?")[0]; // Get path without query string

	console.log(
		`%c[DEBUG] handleMockRequest: Testing for GET /chat/messages. Cleaned endpoint: "${cleanEndpoint}"`,
		"color: blue;"
	);

	if (cleanEndpoint === "/chat/messages" && method === "get") {
		console.log(
			`%c[DEBUG] handleMockRequest: MATCHED Chat Messages (GET /chat/messages)`,
			"color: green; font-weight: bold;"
		);

		// Use options.url for query params as it's generally more reliable if passed
		const queryString = options.url?.includes("?")
			? options.url.split("?")[1]
			: endpoint.split("?")[1];
		const urlParams = new URLSearchParams(queryString || "");

		const roomId = urlParams.get("roomId");
		const page = Number.parseInt(urlParams.get("page") || "1", 10);
		const limit = Number.parseInt(urlParams.get("limit") || "30", 10);

		console.log(
			`%c[DEBUG] Parsed Params: roomId=${roomId}, page=${page}, limit=${limit} from queryString: "${queryString}"`,
			"color: purple;"
		);

		if (!roomId) {
			console.error(
				"Mock API Error: roomId parameter is required for /chat/messages"
			);
			throw new Error("Mock Error: roomId required for fetching messages");
		}

		console.log(
			`%cAPI Client MOCK: Calling getMockChatMessages for roomId=${roomId}, page=${page}, limit=${limit}`,
			"color: orange;"
		);
		try {
			const response = await getMockChatMessages(roomId, page, limit);
			return response as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /chat/messages (Room ${roomId}):`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	} else {
		console.log(
			`%c[DEBUG] handleMockRequest: NO MATCH for GET /chat/messages. (endpoint: "${endpoint}", cleanEndpoint: "${cleanEndpoint}", method: "${method}")`,
			"color: gray;"
		);
	}

	if (endpoint === "/chat/rooms" && method === "post") {
		console.log(
			`%c[DEBUG] handleMockRequest: MATCHED Create Chat Room (POST /chat/rooms)`,
			"color: green; font-weight: bold;"
		);
		if (!body) {
			console.error("Mock API Error: Missing body for POST /chat/rooms");
			throw new Error(
				"Mock API Error: Missing request body for creating chat room."
			);
		}
		try {
			// body should be CreateRoomPayload
			const response = await createMockChatRoom(body);
			return response as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for POST /chat/rooms:", error.message);
			throw { response: { data: { message: error.message }, status: 400 } };
		}
	}

	// Handler for POST /chat/messages
	if (endpoint === "/chat/messages" && method === "post") {
		console.log(
			`%c[DEBUG] handleMockRequest: MATCHED Chat Messages (POST /chat/messages)`,
			"color: green; font-weight: bold;"
		);
		if (!body?.roomId || !body?.content)
			throw new Error("Mock Error: roomId and content required");
		const senderId = body.senderId || "unknown_mock_sender";
		console.log(
			`%cAPI Client MOCK: POST /chat/messages (Room: ${body.roomId}, Sender: ${senderId})`,
			"color: orange;"
		);
		try {
			const response = await createMockChatMessage(
				body.roomId,
				senderId,
				body.content
			);
			return response as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for POST /chat/messages:", error.message);
			throw { response: { data: { message: error.message }, status: 400 } };
		}
	} else {
		// Only log NO MATCH if it wasn't a GET request for /chat/messages either
		if (!(cleanEndpoint === "/chat/messages" && method === "get")) {
			console.log(
				"%c[DEBUG] handleMockRequest: NO MATCH for POST /chat/messages",
				"color: gray;"
			);
		}
	}

	// VVVV ADD THIS BLOCK FOR MARKING ROOM AS READ VVVV
	if (endpoint === "/chat/rooms/mark-read" && method === "post") {
		console.log(
			`%c[DEBUG] handleMockRequest: MATCHED Mark Room Read (POST /chat/rooms/mark-read)`,
			"color: green; font-weight: bold;"
		);
		if (!body) {
			console.error(
				"Mock API Error: Missing body for POST /chat/rooms/mark-read"
			);
			throw new Error(
				"Mock API Error: Missing request body for marking room read."
			);
		}
		try {
			// body should be MarkRoomReadPayload
			const response = await markMockRoomAsRead(body);
			return response as unknown as T;
		} catch (error: any) {
			console.error(
				"Mock API Error for POST /chat/rooms/mark-read:",
				error.message
			);
			throw { response: { data: { message: error.message }, status: 400 } };
		}
	}
	// --- End Chat Mocks ---

	// --- Settings Mocks ---
	const notificationPrefsMatch = endpoint.match(/^\/users\/me\/notifications$/);
	if (notificationPrefsMatch && method === "get") {
		const userId = "user_123"; // Simulate logged-in user ID
		return mockGetNotificationPreferences(userId) as unknown as T;
	}
	if (notificationPrefsMatch && method === "put") {
		const userId = "user_123";
		if (!body) throw new Error("Mock Error: Missing preferences data in body");
		return mockUpdateNotificationPreferences(userId, body) as unknown as T;
	}

	// --- Notifications Mocks ---
	if (method === "get" && /^\/notifications(\?.*)?$/.test(endpoint)) {
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const page = Number.parseInt(urlParams.get("page") || "1", 10);
		const limit = Number.parseInt(urlParams.get("limit") || "10", 10);

		console.log(`%cAPI Client MOCK: GET /notifications?page=${page}&limit=${limit}`, "color: orange;");

		try {
			const userId = "student_123"; // Simulate logged-in user ID
			const response = await mockFetchNotifications(userId, page, limit);

			return {
				success: true,
				data: {
					notifications: response.notifications,
					pagination: response.pagination
				},
				message: "Notifications fetched successfully"
			} as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for GET /notifications:", error.message);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	// Mark notification as read
	const markNotificationAsReadMatch = endpoint.match(/^\/notifications\/([\w-]+)\/read$/);
	if (markNotificationAsReadMatch && method === "post") {
		const notificationId = markNotificationAsReadMatch[1];
		console.log(`%cAPI Client MOCK: POST /notifications/${notificationId}/read`, "color: orange;");

		try {
			const response = await mockMarkNotificationAsRead(notificationId);
			return response as unknown as T;
		} catch (error: any) {
			console.error(`Mock API Error for POST /notifications/${notificationId}/read:`, error.message);
			throw { response: { data: { message: error.message }, status: 404 } };
		}
	}

	// Mark all notifications as read
	if (endpoint === "/notifications/mark-all-read" && method === "post") {
		console.log(`%cAPI Client MOCK: POST /notifications/mark-all-read`, "color: orange;");

		try {
			const userId = body?.userId || "student_123"; // Use provided userId or default
			const response = await mockMarkAllNotificationsAsRead(userId);
			return response as unknown as T;
		} catch (error: any) {
			console.error(`Mock API Error for POST /notifications/mark-all-read:`, error.message);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	// --- Support Mocks ---
	if (
		endpoint.startsWith("/support/my-tickets") &&
		!endpoint.match(/^\/support\/my-tickets\/(.+)$/) &&
		method === "get"
	) {
		const userId = "student_123"; // Simulate logged-in user
		// Extract pagination from options.url query params
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const page = Number.parseInt(urlParams.get("page") || "1", 10);
		const limit = Number.parseInt(urlParams.get("limit") || "10", 10);
		return mockFetchMyTickets(userId, page, limit) as unknown as T;
	}
	if (endpoint === "/support/ticket" && method === "post") {
		const userId = "student_123";
		if (!body?.subject || !body?.description || !body?.priority)
			throw new Error("Mock Error: Missing required ticket fields");
		return mockCreateTicket(userId, body) as unknown as T;
	}
	if (endpoint === "/support/feedback" && method === "post") {
		const userId = "student_123";
		if (body?.rating === undefined || !body?.comment || !body?.type)
			throw new Error("Mock Error: Missing required feedback fields");
		return mockSubmitFeedback(userId, body) as unknown as T;
	}

	// Mock for getting single ticket (example path)
	const ticketDetailMatch = endpoint.match(/^\/support\/my-tickets\/(.+)$/);
	if (ticketDetailMatch && method === "get") {
		const ticketId = ticketDetailMatch[1];
		const userId = "student_123"; // Simulate user context
		const role = "student";
		return mockFetchTicketById(ticketId, userId, role) as unknown as T;
	}

	// Mock for adding response (example path)
	const addResponseMatch = endpoint.match(
		/^\/support\/my-tickets\/(.+)\/responses$/
	);
	if (addResponseMatch && method === "post") {
		const ticketId = addResponseMatch[1];
		if (!body?.message)
			throw new Error("Mock Error: Missing message for response");
		const senderId = "student_123"; // Simulate sender
		const senderRole = "student";
		return mockAddTicketResponse(
			{ ticketId, message: body.message },
			senderId,
			senderRole
		) as unknown as T;
	}

	// --- Admin Support Mocks ---
	if (method === "get" && /^\/admin\/support-tickets(\?.*)?$/.test(endpoint)) {
		console.log(
			`%cAPI Client MOCK: GET /admin/support-tickets matched with regex`,
			"color: orange;"
		);
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const status = urlParams.get("status") as TicketStatus | undefined; // Add type cast if needed
		const page = Number.parseInt(urlParams.get("page") || "1", 10);
		const limit = Number.parseInt(urlParams.get("limit") || "10", 10);
		return mockFetchAllTickets(status, page, limit) as unknown as T;
	}

	// Mock for getting single admin ticket
	const adminTicketDetailMatch = endpoint.match(
		/^\/admin\/support-tickets\/(.+)$/
	);
	if (
		adminTicketDetailMatch &&
		method === "get" &&
		!endpoint.includes("/responses")
	) {
		const ticketId = adminTicketDetailMatch[1];
		const userId = "admin_001"; // Simulate admin user
		const role = "admin";
		return mockFetchTicketById(ticketId, userId, role) as unknown as T;
	}

	if (method === "get" && /^\/admin\/feedback(\?.*)?$/.test(endpoint)) {
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const type = urlParams.get("type") as FeedbackType | undefined; // Add type cast if needed
		const page = Number.parseInt(urlParams.get("page") || "1", 10);
		const limit = Number.parseInt(urlParams.get("limit") || "10", 10);
		return mockFetchAllFeedback(type, page, limit) as unknown as T;
	}
	// Mock for admin adding response (example path)
	const adminAddResponseMatch = endpoint.match(
		/^\/admin\/support-tickets\/(.+)\/responses$/
	);
	if (adminAddResponseMatch && method === "post") {
		const ticketId = adminAddResponseMatch[1];
		if (!body?.message)
			throw new Error("Mock Error: Missing message for response");
		const senderId = "admin_001"; // Simulate admin sender
		const senderRole = "admin";
		return mockAddTicketResponse(
			{ ticketId, message: body.message },
			senderId,
			senderRole
		) as unknown as T;
	}

	// --- START: Assignment CRUD Mock Handlers ---

	// GET /assignments (list - needs query params for role/context)
	if (
		method === "get" &&
		/^\/assignments(?!\/([\w-]+))(\?.*)?$/.test(endpoint) &&
		!endpoint.includes("/submissions")
	) {
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const role = urlParams.get("role") || "student"; // Assume role passed
		const userId = urlParams.get("userId") || undefined;
		const courseId = urlParams.get("courseId") || undefined;
		const classId = urlParams.get("classId") || undefined;
		console.log(
			`%cAPI Client MOCK: GET /assignments (Role: ${role})`,
			"color: green;"
		);
		try {
			let result;
			if (role === "student") {
				result = await getMockAssignmentsForStudent(userId!, courseId); // Need userId
			} else {
				result = await getMockAssignmentsForCourse(courseId, classId);
			}
			return result as unknown as T; // Returns array
		} catch (error: any) {
			console.error(`Mock API Error for GET /assignments:`, error.message);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	// GET /assignments/:id - Fetch Single Assignment
	const getAssignmentByIdMatch = endpoint.match(/^\/assignments\/([\w-]+)$/);
	if (
		getAssignmentByIdMatch &&
		method === "get" &&
		!endpoint.includes("/submissions")
	) {
		const assignmentId = getAssignmentByIdMatch[1];
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const role = urlParams.get("role") || "student"; // Assume role passed
		const userId = urlParams.get("userId") || undefined;
		console.log(
			`%cAPI Client MOCK: GET /assignments/${assignmentId}`,
			"color: green;"
		);
		try {
			const data = await getMockAssignmentById(assignmentId, role, userId);
			return data as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /assignments/${assignmentId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 404 } };
		}
	}

	// GET /assignments/:id/submissions - Fetch Submissions for Assignment
	const getSubmissionsMatch = endpoint.match(
		/^\/assignments\/([\w-]+)\/submissions$/
	);
	if (getSubmissionsMatch && method === "get") {
		const assignmentId = getSubmissionsMatch[1];
		console.log(
			`%cAPI Client MOCK: GET /assignments/${assignmentId}/submissions`,
			"color: green;"
		);
		try {
			const data = await getMockSubmissionsForAssignment(assignmentId);
			return data as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /assignments/${assignmentId}/submissions:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	// POST /assignments - Create Assignment
	if (endpoint === "/assignments" && method === "post") {
		console.log("%cAPI Client MOCK: POST /assignments", "color: green;");
		if (!body)
			throw new Error("Mock API Error: Missing body for POST /assignments");
		try {
			const result = await createMockAssignment(body);
			return result as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for POST /assignments:", error.message);
			throw { response: { data: { message: error.message }, status: 400 } };
		}
	}

	// PUT /assignments/:id - Update Assignment
	const updateAssignmentMatch = endpoint.match(/^\/assignments\/([\w-]+)$/);
	if (updateAssignmentMatch && method === "put") {
		const assignmentId = updateAssignmentMatch[1];
		console.log(
			`%cAPI Client MOCK: PUT /assignments/${assignmentId}`,
			"color: green;"
		);
		if (!body)
			throw new Error(
				`Mock API Error: Missing body for PUT /assignments/${assignmentId}`
			);
		try {
			const result = await updateMockAssignment(assignmentId, body);
			return result as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for PUT /assignments/${assignmentId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 400 } };
		}
	}

	// DELETE /assignments/:id - Delete Assignment
	const deleteAssignmentMatch = endpoint.match(/^\/assignments\/([\w-]+)$/);
	if (deleteAssignmentMatch && method === "delete") {
		const assignmentId = deleteAssignmentMatch[1];
		console.log(
			`%cAPI Client MOCK: DELETE /assignments/${assignmentId}`,
			"color: green;"
		);
		try {
			await deleteMockAssignment(assignmentId);
			return { success: true, id: assignmentId } as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for DELETE /assignments/${assignmentId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 404 } };
		}
	}

	// POST /assignments/:id/submissions - Student Submit Assignment
	const submitAssignmentMatch = endpoint.match(
		/^\/assignments\/([\w-]+)\/submissions$/
	);
	if (submitAssignmentMatch && method === "post") {
		const assignmentId = submitAssignmentMatch[1];
		console.log(
			`%cAPI Client MOCK: POST /assignments/${assignmentId}/submissions`,
			"color: green;"
		);
		if (!body) throw new Error(`Mock API Error: Missing body for submission`);
		// Assume body includes studentId (or backend gets it from auth) and submission details
		try {
			const result = await submitMockAssignment({ assignmentId, ...body });
			return result as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for POST /assignments/${assignmentId}/submissions:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 400 } };
		}
	}

	// PUT /submissions/:id/grade - Teacher Grade Submission
	const gradeSubmissionMatch = endpoint.match(
		/^\/submissions\/([\w-]+)\/grade$/
	);
	if (gradeSubmissionMatch && method === "put") {
		const submissionId = gradeSubmissionMatch[1];
		console.log(
			`%cAPI Client MOCK: PUT /submissions/${submissionId}/grade`,
			"color: green;"
		);
		if (!body) throw new Error(`Mock API Error: Missing body for grading`);
		// Assume body includes grade, feedback, graderId
		try {
			const result = await gradeMockSubmission({ submissionId, ...body });
			return result as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for PUT /submissions/${submissionId}/grade:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 400 } };
		}
	}

	// --- END: Assignment CRUD Mock Handlers ---

	// --- START: Grade Item CRUD Mock Handlers ---

	// GET /grade-items (list - needs query params for role/context)
	if (
		method === "get" &&
		/^\/grade-items(?!\/([\w-]+)|\/student)(\?.*)?$/.test(endpoint)
	) {
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const courseId = urlParams.get("courseId") || undefined;
		const classId = urlParams.get("classId") || undefined;
		console.log(`%cAPI Client MOCK: GET /grade-items`, "color: purple;");
		try {
			const result = await getMockGradeItemsForCourse(courseId, classId);
			return result as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for GET /grade-items:", error.message);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	// GET /grade-items/student/:userId - Fetch Grade Items for Student
	const getGradeItemsForStudentMatch = endpoint.match(
		/^\/grade-items\/student\/([\w-]+)$/
	);
	if (getGradeItemsForStudentMatch && method === "get") {
		const userId = getGradeItemsForStudentMatch[1];
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const courseId = urlParams.get("courseId") || undefined;
		console.log(
			`%cAPI Client MOCK: GET /grade-items/student/${userId}`,
			"color: purple;"
		);
		try {
			const result = await getMockGradeItemsForStudent(userId, courseId);
			return result as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /grade-items/student/${userId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	// GET /grade-items/:id - Fetch Single Grade Item
	const getGradeItemByIdMatch = endpoint.match(/^\/grade-items\/([\w-]+)$/);
	if (
		getGradeItemByIdMatch &&
		method === "get" &&
		!endpoint.includes("/grades")
	) {
		const gradeItemId = getGradeItemByIdMatch[1];
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const role = urlParams.get("role") || "student";
		const userId = urlParams.get("userId") || undefined;
		console.log(
			`%cAPI Client MOCK: GET /grade-items/${gradeItemId}`,
			"color: purple;"
		);
		try {
			const data = await getMockGradeItemById(gradeItemId, role, userId);
			return data as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /grade-items/${gradeItemId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 404 } };
		}
	}

	// GET /grade-items/:id/grades - Fetch Student Grades for Grade Item
	const getStudentGradesMatch = endpoint.match(
		/^\/grade-items\/([\w-]+)\/grades$/
	);
	if (getStudentGradesMatch && method === "get") {
		const gradeItemId = getStudentGradesMatch[1];
		console.log(
			`%cAPI Client MOCK: GET /grade-items/${gradeItemId}/grades`,
			"color: purple;"
		);
		try {
			const data = await getMockStudentGradesForGradeItem(gradeItemId);
			return data as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /grade-items/${gradeItemId}/grades:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	// POST /grade-items - Create Grade Item
	if (endpoint === "/grade-items" && method === "post") {
		console.log("%cAPI Client MOCK: POST /grade-items", "color: purple;");
		if (!body)
			throw new Error("Mock API Error: Missing body for POST /grade-items");
		try {
			const result = await createMockGradeItem(body);
			return result as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for POST /grade-items:", error.message);
			throw { response: { data: { message: error.message }, status: 400 } };
		}
	}

	// PUT /grade-items/:id - Update Grade Item
	const updateGradeItemMatch = endpoint.match(/^\/grade-items\/([\w-]+)$/);
	if (updateGradeItemMatch && method === "put") {
		const gradeItemId = updateGradeItemMatch[1];
		console.log(
			`%cAPI Client MOCK: PUT /grade-items/${gradeItemId}`,
			"color: purple;"
		);
		if (!body)
			throw new Error(
				`Mock API Error: Missing body for PUT /grade-items/${gradeItemId}`
			);
		try {
			const result = await updateMockGradeItem(gradeItemId, body);
			return result as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for PUT /grade-items/${gradeItemId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 400 } };
		}
	}

	// DELETE /grade-items/:id - Delete Grade Item
	const deleteGradeItemMatch = endpoint.match(/^\/grade-items\/([\w-]+)$/);
	if (deleteGradeItemMatch && method === "delete") {
		const gradeItemId = deleteGradeItemMatch[1];
		console.log(
			`%cAPI Client MOCK: DELETE /grade-items/${gradeItemId}`,
			"color: purple;"
		);
		try {
			await deleteMockGradeItem(gradeItemId);
			return { success: true, id: gradeItemId } as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for DELETE /grade-items/${gradeItemId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 404 } };
		}
	}

	// GET /grades/:id - Fetch Student Grade By ID
	const getStudentGradeByIdMatch = endpoint.match(/^\/grades\/([\w-]+)$/);
	if (getStudentGradeByIdMatch && method === "get") {
		const gradeId = getStudentGradeByIdMatch[1];
		console.log(`%cAPI Client MOCK: GET /grades/${gradeId}`, "color: purple;");
		try {
			const data = await getMockStudentGradeById(gradeId);
			return data as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /grades/${gradeId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 404 } };
		}
	}

	// POST /grades - Assign Grade
	if (endpoint === "/grades" && method === "post") {
		console.log("%cAPI Client MOCK: POST /grades", "color: purple;");
		if (!body) throw new Error("Mock API Error: Missing body for POST /grades");
		try {
			const result = await assignMockGrade(body);
			return result as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for POST /grades:", error.message);
			throw { response: { data: { message: error.message }, status: 400 } };
		}
	}

	// PUT /grades/:id - Update Grade
	const updateGradeMatch = endpoint.match(/^\/grades\/([\w-]+)$/);
	if (updateGradeMatch && method === "put") {
		const gradeId = updateGradeMatch[1];
		console.log(`%cAPI Client MOCK: PUT /grades/${gradeId}`, "color: purple;");
		if (!body)
			throw new Error(
				`Mock API Error: Missing body for PUT /grades/${gradeId}`
			);
		try {
			const result = await updateMockGrade(gradeId, body);
			return result as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for PUT /grades/${gradeId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 400 } };
		}
	}

	// GET /courses/:id/grades - Fetch Course Grades
	const getCourseGradesMatch = endpoint.match(/^\/courses\/([\w-]+)\/grades$/);
	if (getCourseGradesMatch && method === "get") {
		const courseId = getCourseGradesMatch[1];
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const classId = urlParams.get("classId") || undefined;
		const studentId = urlParams.get("studentId") || undefined;
		console.log(
			`%cAPI Client MOCK: GET /courses/${courseId}/grades`,
			"color: purple;"
		);
		try {
			const data = await getMockCourseGrades(courseId, classId, studentId);
			return data as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /courses/${courseId}/grades:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	// POST /courses/:id/calculate-grades - Calculate Course Grades
	const calculateCourseGradesMatch = endpoint.match(
		/^\/courses\/([\w-]+)\/calculate-grades$/
	);
	if (calculateCourseGradesMatch && method === "post") {
		const courseId = calculateCourseGradesMatch[1];
		console.log(
			`%cAPI Client MOCK: POST /courses/${courseId}/calculate-grades`,
			"color: purple;"
		);
		if (!body)
			throw new Error(
				`Mock API Error: Missing body for POST /courses/${courseId}/calculate-grades`
			);
		try {
			const result = await calculateMockCourseGrades(body);
			return result as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for POST /courses/${courseId}/calculate-grades:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 400 } };
		}
	}

	// --- END: Grade Item CRUD Mock Handlers ---

	// --- Admin Users Management Mock Handlers ---
	// Use a regex to match "/admin/users" optionally followed by a query string
	if (method === "get" && /^\/admin\/users(\?.*)?$/.test(endpoint)) {
		// The 'endpoint' variable here might be just "/admin/users" if no query params were appended
		// directly to it by the calling function.
		// It's safer to parse query params from 'options.url' if available,
		// or fall back to 'endpoint' if 'options.url' is not provided in FetchOptions.

		const urlToParse = options.url || endpoint; // Prefer options.url for query params
		const queryString = urlToParse.includes("?")
			? urlToParse.split("?")[1]
			: "";
		const urlParams = new URLSearchParams(queryString);

		const search = urlParams.get("search") || undefined;
		const role = urlParams.get("role") || undefined;
		const page = Number.parseInt(urlParams.get("page") || "1", 10);
		const limit = Number.parseInt(urlParams.get("limit") || "10", 10);

		console.log(
			`%cAPI Client MOCK: GET /admin/users with params: search=${search}, role=${role}, page=${page}, limit=${limit}`,
			"color: orange;"
		);
		console.log(
			`%cAPI Client MOCK: Original endpoint string was: "${endpoint}"`,
			"color: gray;"
		);
		console.log(
			`%cAPI Client MOCK: URL used for parsing params: "${urlToParse}"`,
			"color: gray;"
		);

		try {
			// Import the users array and the converter from mock-auth-data
			const { users, convertToUserType } = await import(
				"@/data/mock-auth-data"
			);

			// Filter users based on role and search
			let filteredUsers = [...users]; // Start with a copy

			if (role) {
				console.log(
					`%cAPI Client MOCK: Filtering by role: ${role}`,
					"color: lightgreen;"
				);
				filteredUsers = filteredUsers.filter((user) => user.role === role);
			}

			if (search) {
				const searchLower = search.toLowerCase();
				console.log(
					`%cAPI Client MOCK: Filtering by search: ${searchLower}`,
					"color: lightgreen;"
				);
				filteredUsers = filteredUsers.filter(
					(user) =>
						user.name.toLowerCase().includes(searchLower) ||
						user.email.toLowerCase().includes(searchLower)
				);
			}

			const total = filteredUsers.length;
			console.log(
				`%cAPI Client MOCK: Total filtered users before pagination: ${total}`,
				"color: lightgreen;"
			);

			// Apply pagination
			const paginatedUsers = filteredUsers.slice(
				(page - 1) * limit,
				page * limit
			);
			console.log(
				`%cAPI Client MOCK: Paginated users count: ${paginatedUsers.length}`,
				"color: lightgreen;"
			);

			// Convert MockUser to User type for the paginated results
			const formattedUsers = paginatedUsers.map((user) =>
				convertToUserType(user)
			);

			return {
				users: formattedUsers,
				totalUsers: total,
				currentPage: page,
				totalPages: Math.ceil(total / limit),
			} as unknown as T;
		} catch (error: any) {
			console.error("Mock API Error for GET /admin/users:", error.message);
			throw new ApiError(error.message || "Failed to fetch admin users", 500, {
				message: error.message || "Server error fetching admin users",
			});
		}
	}

	// GET /admin/users/:id - Get a single user by ID
	const getUserByIdMatch = endpoint.match(/^\/admin\/users\/([\w-]+)$/);
	if (getUserByIdMatch && method === "get") {
		const userId = getUserByIdMatch[1];

		console.log(
			`%cAPI Client MOCK: GET /admin/users/${userId}`,
			"color: orange;"
		);

		try {
			// Import the users array and the converter from mock-auth-data
			const { users, convertToUserType } = await import(
				"@/data/mock-auth-data"
			);

			// Find the user by ID
			const user = users.find(u => u.id === userId);

			if (!user) {
				throw new Error(`User with ID ${userId} not found`);
			}

			// Convert to User type and return
			return convertToUserType(user) as unknown as T;
		} catch (error: any) {
			console.error(`Mock API Error for GET /admin/users/${userId}:`, error.message);
			throw new ApiError(error.message || `Failed to fetch user with ID ${userId}`, 404);
		}
	}

	// NEW: PUT /admin/users/:id - Update User (Admin)
	const updateUserAdminMatch = endpoint.match(/^\/admin\/users\/([\w-]+)$/);
	if (updateUserAdminMatch && method === "put") {
		const userId = updateUserAdminMatch[1];
		const updateData = body as Partial<UserData>; // Data sent in the request body

		console.log(
			`%cAPI Client MOCK: PUT /admin/users/${userId} with data:`,
			"color: orange;",
			updateData
		);

		try {
			// Import 'users' as 'let' and 'convertToUserType' from mock-auth-data
			// Also import a way to update the mock user if you have one, or do it here.
			// For this example, we'll re-import to get the latest 'users' array.
			const {
				users: currentMockUsers,
				convertToUserType,
				updateUserInMock,
			} = await import("@/data/mock-auth-data"); // Assuming updateUserInMock exists

			const userIndex = currentMockUsers.findIndex((u) => u.id === userId);

			if (userIndex === -1) {
				console.error(
					`Mock API Error: User with ID ${userId} not found for update.`
				);
				throw new ApiError(`User with ID ${userId} not found`, 404);
			}

			// Perform the update on the mock user object
			// This is a simplified update; a real mock might need more sophisticated merging.
			const updatedMockUser = {
				...currentMockUsers[userIndex],
				...updateData, // Apply partial updates
				updatedAt: new Date().toISOString(), // Update timestamp
			};

			// If you have an updateUserInMock function in mock-auth-data.ts:
			updateUserInMock(userId, updateData as any);

			console.log(
				`%cAPI Client MOCK: User ${userId} updated in mock.`,
				"color: lightgreen;"
			);

			// Return the updated user, converted to the canonical User type
			return updatedMockUser as any;
		} catch (error: any) {
			console.error(
				`Mock API Error for PUT /admin/users/${userId}:`,
				error.message
			);
			if (error instanceof ApiError) throw error;
			throw new ApiError(
				error.message || "Failed to update user in mock",
				error.status || 500
			);
		}
	}

	// Handle user deletion
	const deleteUserMatch = endpoint.match(/^\/admin\/users\/([\w-]+)$/);
	if (deleteUserMatch && method === "delete") {
		const userId = deleteUserMatch[1];
		console.log(
			`%cAPI Client MOCK: DELETE /admin/users/${userId}`,
			"color: orange;"
		);

		try {
			// Import the users array from mock-auth-data
			const { users } = await import("@/data/mock-auth-data");

			// Find the user index
			const userIndex = users.findIndex((user) => user.id === userId);

			if (userIndex === -1) {
				throw new Error(`User with ID ${userId} not found`);
			}

			// In a real implementation, we would remove the user from the array
			// For mock purposes, we'll just simulate success

			return { success: true, id: userId } as unknown as T;
		} catch (error: any) {
			console.error(
				`Mock API Error for DELETE /admin/users/${userId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 404 } };
		}
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

// --- Export ---
export { apiClient, IS_LIVE_API };
