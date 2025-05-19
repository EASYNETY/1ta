// features/classes/store/classes-thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import type {
	AdminClassView,
	ClassOptionsResponse,
	CourseClassOption,
	// Assuming you'll define these payload types here or import them
	// from a shared location if they are also used by the backend/mock-data directly.
	// For now, let's define them locally for clarity if not already shared.
} from "../types/classes-types"; // Make sure all necessary types are here
import { get, post, put, del } from "@/lib/api-client";

// Define payload types for create/update if not already in classes-types.ts
// It's good practice to have these well-defined.
export type CreateClassPayload = Omit<
	AdminClassView,
	"id" | "studentCount" | "teacherName"
> & { teacherId?: string };
export type UpdateClassPayload = Partial<
	Omit<AdminClassView, "id" | "studentCount" | "teacherName">
> & { id: string; teacherId?: string };

// --- Fetching Thunks ---

export const fetchMyEnrolledClasses = createAsyncThunk<
	AuthCourse[], // Return type
	string, // Argument type: userId
	{ rejectValue: string }
>("classes/fetchMyEnrolled", async (userId, { rejectWithValue }) => {
	try {
		const response = await get<AuthCourse[]>(
			`/users/${userId}/enrolled-classes`
		);
		return response;
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message ||
			e.message ||
			"Failed to fetch enrolled classes";
		return rejectWithValue(errorMessage);
	}
});

export const fetchMyTaughtClasses = createAsyncThunk<
	AuthCourse[], // Return type
	string, // Argument type: teacherId
	{ rejectValue: string }
>("classes/fetchMyTaught", async (teacherId, { rejectWithValue }) => {
	try {
		const response = await get<AuthCourse[]>(
			`/teachers/${teacherId}/taught-classes`
		);
		return response;
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message ||
			e.message ||
			"Failed to fetch taught classes";
		return rejectWithValue(errorMessage);
	}
});

interface FetchAdminParams {
	page?: number;
	limit?: number;
	search?: string;
}
export interface FetchAdminClassesResult {
	// Renamed for clarity to avoid conflict if ClassesState has 'total'
	classes: AdminClassView[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export const fetchAllClassesAdmin = createAsyncThunk<
	FetchAdminClassesResult,
	FetchAdminParams,
	{ rejectValue: string }
>(
	"classes/fetchAllAdmin",
	async ({ page = 1, limit = 10, search }, { rejectWithValue }) => {
		try {
			// Construct query parameters string
			const queryParams = new URLSearchParams();
			queryParams.append("page", String(page));
			queryParams.append("limit", String(limit));
			if (search) {
				queryParams.append("search", search);
			}
			// The apiClient's `get` function takes the base endpoint, and options.url can pass the full path with query
			// Or, construct the full path here:
			const endpointWithPath = `/admin/classes?${queryParams.toString()}`;

			// Get the response from the API
			const response = await get<any>(endpointWithPath);
			console.log("fetchAllClassesAdmin: Fetched classes", response);

			// Determine if the response is an array or a nested structure
			const classesData = Array.isArray(response)
				? response // Direct array response
				: (response.success && response.data)
					? response.data // Nested structure with success and data
					: []; // Fallback to empty array

			console.log("Classes data to map:", classesData);

			// Map backend fields to frontend fields
			const mappedClasses = classesData.map((cls: any) => {
				console.log("Processing class:", cls);

				// Create a new object with the required frontend fields
				const mappedClass: AdminClassView = {
					id: cls.id,
					courseTitle: cls.name || "", // Use name as courseTitle
					courseId: cls.course_id || "",
					teacherName: "N/A", // Default value
					teacherId: cls.teacher_id || null,
					studentCount: 0, // Default value
					status: cls.is_active === true ? "active" : "inactive", // Map is_active to status
					startDate: cls.start_date || "",
					endDate: cls.end_date || "",
					description: cls.description || "",
				};

				console.log("Mapped class:", mappedClass);
				return mappedClass;
			});

			// Determine pagination info
			const pagination = response.pagination || {
				total: mappedClasses.length,
				page: page,
				limit: limit,
				pages: Math.ceil(mappedClasses.length / limit)
			};

			// Return in the expected format for the reducer
			return {
				classes: mappedClasses,
				total: pagination.total,
				page: pagination.page || page,
				limit: pagination.limit || limit,
				totalPages: pagination.pages || Math.ceil(pagination.total / (pagination.limit || limit)),
			};
		} catch (e: any) {
			const errorMessage =
				e.response?.data?.message ||
				e.message ||
				"Failed to fetch admin classes";
			return rejectWithValue(errorMessage);
		}
	}
);

export const fetchCourseClassOptionsForScanner = createAsyncThunk<
	CourseClassOption[],
	void, // No argument needed
	{ rejectValue: string }
>("classes/fetchCourseClassOptions", async (_, { rejectWithValue }) => {
	try {
		console.log("Dispatching fetchCourseClassOptionsForScanner thunk");

		// Get the response from the API
		const response = await get<any>("/class-sessions/options");
		console.log("Received class options response:", response);

		// Handle different response formats
		let responseData;

		// If the response is already in the expected format (our API client might have extracted data)
		if (response.data && response.data.courses && response.data.timeSlots) {
			responseData = response.data;
		}
		// If the response has success and data fields
		else if (response.success && response.data) {
			responseData = response.data;
		}
		// If the response is the direct data object
		else if (response.courses && response.timeSlots) {
			responseData = response;
		}
		// Invalid response format
		else {
			console.error("Invalid response format:", response);
			throw new Error("Invalid response format from class options API");
		}

		// Transform the response into CourseClassOption[] format for backward compatibility
		// This combines courses and timeSlots to create options for the dropdown
		const transformedOptions: CourseClassOption[] = [];

		// Extract courses and timeSlots from the response
		const { courses, timeSlots } = responseData;

		// Create combinations of courses and timeSlots
		courses.forEach((course: any) => {
			timeSlots.forEach((timeSlot: any) => {
				transformedOptions.push({
					id: `${course.id}_${timeSlot.id}`, // Create a combined ID
					courseName: course.name,
					sessionName: timeSlot.name,
				});
			});
		});

		console.log("Transformed course class options:", transformedOptions);
		return transformedOptions;
	} catch (e: any) {
		console.error("Error fetching course class options:", e);
		const errorMessage =
			e.response?.data?.message ||
			e.message ||
			"Failed to fetch class session options";
		return rejectWithValue(errorMessage);
	}
});

// --- CRUD Thunks for AdminClassView ---

export const fetchClassById = createAsyncThunk<
	AdminClassView, // Return type
	string, // Argument type: classId
	{ rejectValue: string }
>("classes/fetchById", async (classId, { rejectWithValue }) => {
	try {
		const response = await get<any>(`/classes/${classId}`);

		// Handle nested response structure
		if (response.success && response.data) {
			const cls = response.data;
			// Map backend fields to frontend fields
			return {
				id: cls.id,
				courseTitle: cls.name || "", // Use name as courseTitle
				courseId: cls.course_id || "",
				teacherName: "N/A", // Default value
				teacherId: cls.teacher_id || null,
				studentCount: 0, // Default value
				status: cls.is_active === true ? "active" : "inactive", // Map is_active to status
				startDate: cls.start_date || "",
				endDate: cls.end_date || "",
				description: cls.description || "",
			};
		}

		// Direct response structure (already handled by API client)
		return response;
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message ||
			e.message ||
			`Failed to fetch class ${classId}`;
		return rejectWithValue(errorMessage);
	}
});

export const createClass = createAsyncThunk<
	AdminClassView, // Return the created class
	CreateClassPayload, // Payload to create
	{ rejectValue: string }
>("classes/create", async (classData, { rejectWithValue }) => {
	try {
		// Map frontend fields to backend fields
		const backendData = {
			name: classData.courseTitle,
			course_id: classData.courseId,
			teacher_id: classData.teacherId,
			is_active: classData.status === "active",
			start_date: classData.startDate,
			end_date: classData.endDate,
			description: classData.description,
			// Include other fields as needed
			...classData,
		};

		const response = await post<any>("/classes", backendData);

		// Handle nested response structure
		if (response.success && response.data) {
			const cls = response.data;
			// Map backend fields to frontend fields
			return {
				id: cls.id,
				courseTitle: cls.name || "", // Use name as courseTitle
				courseId: cls.course_id || "",
				teacherName: "N/A", // Default value
				teacherId: cls.teacher_id || null,
				studentCount: 0, // Default value
				status: cls.is_active === true ? "active" : "inactive", // Map is_active to status
				startDate: cls.start_date || "",
				endDate: cls.end_date || "",
				description: cls.description || "",
			};
		}

		// Direct response structure (already handled by API client)
		return response;
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message || e.message || "Failed to create class";
		return rejectWithValue(errorMessage);
	}
});

export const updateClass = createAsyncThunk<
	AdminClassView, // Return the updated class
	UpdateClassPayload, // Payload includes ID and fields to update
	{ rejectValue: string }
>("classes/update", async (payload, { rejectWithValue }) => {
	// Destructure id from payload to use in the endpoint path
	const { id, ...updateData } = payload;
	if (!id) {
		return rejectWithValue("Class ID is required for update.");
	}
	try {
		// Map frontend fields to backend fields
		const backendData = {
			...(updateData.courseTitle && { name: updateData.courseTitle }),
			...(updateData.courseId && { course_id: updateData.courseId }),
			...(updateData.teacherId && { teacher_id: updateData.teacherId }),
			...(updateData.status && { is_active: updateData.status === "active" }),
			...(updateData.startDate && { start_date: updateData.startDate }),
			...(updateData.endDate && { end_date: updateData.endDate }),
			// Include other fields as needed
			...updateData,
		};

		const response = await put<any>(`/classes/${id}`, backendData);

		// Handle nested response structure
		if (response.success && response.data) {
			const cls = response.data;
			// Map backend fields to frontend fields
			return {
				id: cls.id,
				courseTitle: cls.name || "", // Use name as courseTitle
				courseId: cls.course_id || "",
				teacherName: "N/A", // Default value
				teacherId: cls.teacher_id || null,
				studentCount: 0, // Default value
				status: cls.is_active === true ? "active" : "inactive", // Map is_active to status
				startDate: cls.start_date || "",
				endDate: cls.end_date || "",
				description: cls.description || "",
			};
		}

		// Direct response structure (already handled by API client)
		return response;
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message || e.message || "Failed to update class";
		return rejectWithValue(errorMessage);
	}
});

export const deleteClass = createAsyncThunk<
	string, // Return the ID of deleted class (or void if API returns 204)
	string, // Argument is classId
	{ rejectValue: string }
>("classes/delete", async (classId, { rejectWithValue }) => {
	try {
		// The backend might return a nested response structure
		const response = await del<any>(`/classes/${classId}`);

		// Handle nested response structure
		if (response && response.success) {
			// If the backend returns a success message, return the classId
			return classId;
		} else if (response) {
			// If the backend returns something else, still return the classId
			return classId;
		}

		// Default case - return the classId so the reducer knows which to remove
		return classId;
	} catch (e: any) {
		const errorMessage =
			e.response?.data?.message || e.message || "Failed to delete class";
		return rejectWithValue(errorMessage);
	}
});
