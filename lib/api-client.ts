// src/lib/api-client.ts

"use client";
// Import Mock Handlers
import {
	getMockCourses,
	getMockCourseBySlug,
	createMockCheckoutSession,
} from "@/data/mock-course-data";

import {
	StudentAttendanceResponse,
	TeacherAttendanceResponse,
	TeacherAttendanceRecord,
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
	getMockEnrolledClasses,
	getMockTaughtClasses,
	updateMockClass,
} from "@/data/mock-classes-data";

import { MarkAttendancePayload } from "@/features/attendance/store/attendance-slice";
import {
	mockGetNotificationPreferences,
	mockUpdateNotificationPreferences,
} from "@/data/mock-settings-data";
import {
	mockAddTicketResponse,
	mockCreateTicket,
	mockFetchAllFeedback,
	mockFetchAllTickets,
	mockFetchMyTickets,
	mockFetchTicketById,
	mockSubmitFeedback,
} from "@/data/mock-support-data";
import {
	FeedbackType,
	TicketStatus,
} from "@/features/support/types/support-types";
import {
	mockFetchAllPaymentsAdmin,
	mockFetchMyPaymentHistory,
} from "@/data/mock-payment-data";
import {
	createMockChatMessage,
	getMockChatMessages,
	getMockChatRooms,
} from "@/data/mock-chat-data";
import {
	deleteMockManagedStudent,
	getMockManagedStudents,
} from "@/data/mock-corporate-data";

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
	url?: string;
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

	// --- NEW: Mock Handler for DELETE Course ---
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
	if (endpoint === "/users/me" && method === "put") {
		return mockUpdateMyProfile(body) as unknown as T;
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
		const page = parseInt(urlParams.get("page") || "1", 10);
		const limit = parseInt(urlParams.get("limit") || "10", 10);
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

	// --- Payment History Mocks ---
	if (endpoint === "/payments/history" && method === "get") {
		const userId = "student_123"; // Simulate logged-in user
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const page = parseInt(urlParams.get("page") || "1", 10);
		const limit = parseInt(urlParams.get("limit") || "10", 10);
		return mockFetchMyPaymentHistory(userId, page, limit) as unknown as T;
	}

	if (endpoint === "/admin/payments" && method === "get") {
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const status = urlParams.get("status") as
			| PaymentRecord["status"]
			| undefined;
		const page = parseInt(urlParams.get("page") || "1", 10);
		const limit = parseInt(urlParams.get("limit") || "10", 10);
		const search = urlParams.get("search") || undefined;
		// Ensure you return the object { payments: [], total: X } from the mock
		return mockFetchAllPaymentsAdmin(
			status,
			page,
			limit,
			search
		) as unknown as T;
	}

	// --- Schedule Mock ---
	if (endpoint === "/schedule" && method === "get") {
		// Note: In real API, role/userId would come from token/query params
		// We might need to simulate getting the user ID here if the thunk doesn't pass it
		const mockRole = "student"; // Or teacher/admin based on test case
		const mockUserId = "student_123"; // Or teacher ID
		return getMockSchedule(mockRole, mockUserId) as unknown as T;
	}

	// --- START: Schedule Event CRUD Mock Handlers ---

	// GET /schedule-events - Fetch All Events (for management table)
	if (endpoint === "/schedule-events" && method === "get") {
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const page = parseInt(urlParams.get("page") || "1", 10);
		const limit = parseInt(urlParams.get("limit") || "10", 10);
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
	// Example: Student getting their courses
	if (endpoint === "/users/me/courses" && method === "get") {
		const mockUserId = "student_123"; // Simulate logged-in user
		return getMockEnrolledClasses(mockUserId) as unknown as T;
	}
	// Example: Teacher getting their courses
	if (endpoint === "/teachers/me/courses" && method === "get") {
		const mockTeacherId = "teacher_1"; // Simulate logged-in user
		return getMockTaughtClasses(mockTeacherId) as unknown as T;
	}
	// Example: Admin getting all classes
	if (endpoint === "/admin/classes" && method === "get") {
		// Extract pagination/search from options.url query params if passed
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const page = parseInt(urlParams.get("page") || "1", 10);
		const limit = parseInt(urlParams.get("limit") || "10", 10);
		const search = urlParams.get("search") || undefined;
		return getMockAllClassesAdmin(page, limit, search) as unknown as T;
	}

	// --- START: Class CRUD Mock Handlers ---

	// GET /classes/:id - Fetch Single Class
	const getClassByIdMatch = endpoint.match(/^\/classes\/([\w-]+)$/);
	if (getClassByIdMatch && method === "get") {
		const classId = getClassByIdMatch[1];
		console.log(`%cAPI Client MOCK: GET /classes/${classId}`, "color: orange;");
		try {
			const classData = await getMockClassById(classId); // Call mock function
			return classData as unknown as T;
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
			return newClass as unknown as T;
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
			return updatedClass as unknown as T;
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
			return { success: true, id: classId } as unknown as T; // Or just return undefined for 204 No Content simulation
		} catch (error: any) {
			console.error(
				`Mock API Error for DELETE /classes/${classId}:`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 404 } }; // Simulate 404
		}
	}

	// --- Attendance Mock Data ---
	const studentAttendanceMatch = endpoint.match(
		/^\/students\/(.+)\/attendance$/
	);
	if (studentAttendanceMatch && method === "get") {
		const studentId = studentAttendanceMatch[1];
		const studentAttendance = mockStudentAttendance[studentId];
		if (studentAttendance) {
			return {
				studentId,
				attendances: studentAttendance,
			} as StudentAttendanceResponse as unknown as T;
		}
		throw new Error(
			`Mock API: No attendance found for student with ID "${studentId}"`
		);
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
			return classAttendance as TeacherAttendanceResponse as unknown as T;
		}
		throw new Error(
			`Mock API: No attendance found for course with ID "${courseClassId}"`
		);
	}

	// --- Mock for Marking Attendance ---
	if (endpoint === "/attendance/mark" && method === "post") {
		const payload = body as MarkAttendancePayload;
		console.log("Mock API: Marking attendance for:", payload);
		// Simulate success or failure
		const succeed = Math.random() > 0.1; // 90% success rate
		if (succeed) {
			// In a real mock, you might update the mock data store here
			// For now, just return success
			return { success: true, studentId: payload.studentId } as unknown as T;
		} else {
			console.error("Mock API: Simulated failure marking attendance");
			// Simulate returning an error structure your thunk expects
			throw {
				response: {
					data: { message: "Mock Error: Failed to save attendance on server." },
					status: 500,
				},
			};
			// Or return rejectValue structure if preferred:
			// return { success: false, message: "Mock Error: Failed to save attendance." } as unknown as T;
		}
	}

	// --- Chat Mocks ---
	const chatRoomsForUserMatch = endpoint.match(/^\/chat\/rooms\/user\/(.+)$/);
	if (chatRoomsForUserMatch && method === "get") {
		const userId = chatRoomsForUserMatch[1];
		console.log(
			`%cAPI Client MOCK: GET /chat/rooms/user/${userId}`,
			"color: orange;"
		);
		try {
			const response = await getMockChatRooms(userId); // Calls updated mock
			return response as unknown as T; // Returns { rooms: [], total: N }
		} catch (error: any) {
			console.error("Mock API Error for GET /chat/rooms:", error.message);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	if (endpoint === "/chat/messages" && method === "get") {
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const roomId = urlParams.get("roomId");
		const page = parseInt(urlParams.get("page") || "1", 10);
		const limit = parseInt(urlParams.get("limit") || "30", 10);
		if (!roomId) throw new Error("Mock Error: roomId required");
		console.log(
			`%cAPI Client MOCK: GET /chat/messages?roomId=${roomId}&page=${page}&limit=${limit}`,
			"color: orange;"
		);
		try {
			const response = await getMockChatMessages(roomId, page, limit); // Calls updated mock
			return response as unknown as T; // Returns { messages: [], total: N, hasMore: bool }
		} catch (error: any) {
			console.error(
				`Mock API Error for GET /chat/messages (Room ${roomId}):`,
				error.message
			);
			throw { response: { data: { message: error.message }, status: 500 } };
		}
	}

	if (endpoint === "/chat/messages" && method === "post") {
		if (!body?.roomId || !body?.content)
			throw new Error("Mock Error: roomId and content required");
		const senderId = body.senderId || "unknown_mock_sender"; // Get senderId passed from thunk
		console.log(
			`%cAPI Client MOCK: POST /chat/messages (Room: ${body.roomId}, Sender: ${senderId})`,
			"color: orange;"
		);
		try {
			const response = await createMockChatMessage(
				body.roomId,
				senderId,
				body.content
			); // Calls updated mock
			return response as unknown as T; // Returns { message: {...}, success: true }
		} catch (error: any) {
			console.error("Mock API Error for POST /chat/messages:", error.message);
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

	// --- Support Mocks ---
	if (endpoint === "/support/my-tickets" && method === "get") {
		const userId = "student_123"; // Simulate logged-in user
		// Extract pagination from options.url query params
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const page = parseInt(urlParams.get("page") || "1", 10);
		const limit = parseInt(urlParams.get("limit") || "10", 10);
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
	if (endpoint === "/admin/support-tickets" && method === "get") {
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const status = urlParams.get("status") as TicketStatus | undefined; // Add type cast if needed
		const page = parseInt(urlParams.get("page") || "1", 10);
		const limit = parseInt(urlParams.get("limit") || "10", 10);
		return mockFetchAllTickets(status, page, limit) as unknown as T;
	}
	if (endpoint === "/admin/feedback" && method === "get") {
		const urlParams = new URLSearchParams(options.url?.split("?")[1] || "");
		const type = urlParams.get("type") as FeedbackType | undefined; // Add type cast if needed
		const page = parseInt(urlParams.get("page") || "1", 10);
		const limit = parseInt(urlParams.get("limit") || "10", 10);
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
