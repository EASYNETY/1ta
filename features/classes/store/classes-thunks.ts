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

// Helper function to determine if a class is active
// Can handle various formats: boolean (true/false), numeric (1/0), string ('1'/'0', 'true'/'false', 'active'/'inactive')
const isClassActive = (value: any): boolean => {
	// Handle undefined or null
	if (value === undefined || value === null) {
		return false;
	}

	// Handle numeric values (1/0)
	if (typeof value === 'number') {
		return value === 1;
	}

	// Handle boolean values (true/false)
	if (typeof value === 'boolean') {
		return value;
	}

	// Handle string values ('1'/'0', 'true'/'false', 'active'/'inactive')
	if (typeof value === 'string') {
		const normalizedValue = value.toLowerCase();
		return normalizedValue === '1' ||
			normalizedValue === 'true' ||
			normalizedValue === 'active' ||
			normalizedValue === 'yes';
	}

	// Handle object values (check for status property)
	if (typeof value === 'object') {
		if ('status' in value) {
			const status = value.status;
			return status === 'active' || status === true || status === 1;
		}
	}

	// Default to false for any other case
	return false;
};

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
		const response = await get<any>(
			`/users/${userId}/enrolled-classes`
		);

		// Handle different response formats
		if (response.success && Array.isArray(response.data)) {
			// New format: success with data array
			return response.data.map((item: any) => ({
				id: item.id,
				slug: item.courseSlug || '',
				title: item.title || item.courseTitle,
				description: item.description || '',
				category: item.type || 'course',
				image: '/placeholder.svg', // Default image
				instructor: {
					name: item.instructor || 'Instructor',
				},
				level: 'All Levels',
				priceUSD: 0,
				// Add any other required fields with defaults
			}));
		}

		// Original format
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
		const response = await get<any>(
			`/teachers/${teacherId}/taught-classes`
		);

		// Handle different response formats
		if (response.success && Array.isArray(response.data)) {
			// New format: success with data array
			return response.data.map((item: any) => ({
				id: item.id,
				slug: item.courseSlug || '',
				title: item.title || item.courseTitle,
				description: item.description || '',
				category: item.type || 'course',
				image: '/placeholder.svg', // Default image
				instructor: {
					name: item.instructor || 'Instructor',
				},
				level: 'All Levels',
				priceUSD: 0,
				// Add any other required fields with defaults
			}));
		}

		// Original format
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

			// Determine if the response is an array or a nested structure
			// Based on the actual response: {0: {...}, 1: {...}, 2: {...}, pagination: {...}}
			let classesData: any[] = [];

			if (Array.isArray(response)) {
				// Direct array response
				classesData = response;
			} else if (response && response.success === true && Array.isArray(response.data)) {
				// Success response with data array
				classesData = response.data;
			} else if (response && response.data) {
				// Response has a data property but it's not an array
				if (Array.isArray(response.data)) {
					classesData = response.data;
				} else if (typeof response.data === 'object') {
					// Try to extract classes from data object
					classesData = Object.values(response.data);
				}
			} else if (response && response.data && Array.isArray(response.data.classes)) {
				// Nested data.classes array
				classesData = response.data.classes;
			} else if (response && response.classes && Array.isArray(response.classes)) {
				// Direct classes property
				classesData = response.classes;
			} else if (response && typeof response === 'object' && response.pagination) {
				// Object with numeric keys and pagination (the format we're seeing)
				// Extract all properties except 'pagination' as classes
				classesData = Object.entries(response)
					.filter(([key]) => key !== 'pagination' && !isNaN(Number(key)))
					.map(([_, value]) => value);
			} else if (response && typeof response === 'object') {
				// Check if the response itself might be a single class object
				if (response.id && (response.name || response.title)) {
					// This looks like a single class object
					classesData = [response];
				} else {
					// Last resort: try to extract any array-like properties
					const possibleArrays = Object.values(response).filter(val => Array.isArray(val));
					if (possibleArrays.length > 0) {
						// Use the first array found
						classesData = possibleArrays[0];
					} else {
						// Try to convert the object to an array if it has numeric keys
						const objectValues = Object.entries(response)
							.filter(([key]) => !isNaN(Number(key)))
							.map(([_, value]) => value);

						if (objectValues.length > 0) {
							classesData = objectValues;
						}
					}
				}
			}

			// Log the extracted classes data for debugging
			console.log("fetchAllClassesAdmin: Extracted classes data length:", classesData.length);

			// Log the first class for inspection if available
			if (classesData.length > 0) {
				console.log("fetchAllClassesAdmin: First class sample:", classesData[0]);
			}

			// Map backend fields to frontend fields
			const mappedClasses = classesData.map((cls: any) => {
				// Create a new object with the required frontend fields
				const mappedClass: AdminClassView = {
					// Basic identification
					id: cls.id,
					name: cls.name || "",
					courseTitle: cls.name || cls.title || "", // Use name or title as courseTitle
					courseId: cls.courseId || cls.course_id || "",
					course_id: cls.courseId || cls.course_id || "",

					// Teacher information
					teacherName: cls.teacherName || cls.teacher_name ||
						(cls.teacher ? cls.teacher.name : "N/A"),
					teacherId: cls.teacherId || cls.teacher_id || null,
					teacher_id: cls.teacherId || cls.teacher_id || null,
					teacher: cls.teacher,

					// Enrolment and capacity
					studentCount: cls.enrolledStudentsCount || cls.enrolled_students_count || 0,
					max_students: cls.maxStudents || cls.max_students || 30,
					maxStudents: cls.maxStudents || cls.max_students || 30,
					max_slots: cls.maxSlots || cls.max_slots,
					maxSlots: cls.maxSlots || cls.max_slots,
					available_slots: cls.availableSlots || cls.available_slots,
					availableSlots: cls.availableSlots || cls.available_slots,
					enrolled_students_count: cls.enrolledStudentsCount || cls.enrolled_students_count || 0,
					enrolledStudentsCount: cls.enrolledStudentsCount || cls.enrolled_students_count || 0,

					// Status
					status: cls.status || (isClassActive(cls.isActive) ? "active" : "inactive"),
					isActive: cls.isActive,

					// Dates
					startDate: cls.startDate || cls.start_date || "",
					start_date: cls.startDate || cls.start_date || "",
					endDate: cls.endDate || cls.end_date || "",
					end_date: cls.endDate || cls.end_date || "",

					// Schedule and location
					description: cls.description || "",
					schedule: cls.schedule || { days: [], time: "", duration: "" },
					location: cls.location || "",

					// Course relationship
					course: cls.course,

					// Metadata and timestamps
					metadata: cls.metadata,
					createdAt: cls.createdAt || cls.created_at,
					created_at: cls.createdAt || cls.created_at,
					updatedAt: cls.updatedAt || cls.updated_at,
					updated_at: cls.updatedAt || cls.updated_at,
				};

				return mappedClass;
			});

			console.log("fetchAllClassesAdmin: Classes mapped, count:", mappedClasses.length);

			// Determine pagination info from the response
			// Actual response: {0: {...}, 1: {...}, 2: {...}, pagination: { "total": 3, "page": 1, "limit": 10, "pages": 1 }}

			// Use the pagination property directly from the response if available
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

		// Check if the response is in the new format (direct array in data)
		if (response.success && Array.isArray(response.data)) {
			// Transform the new format to match the expected structure
			return response.data.map((item: any) => ({
				id: item.id,
				courseName: item.courseTitle || item.title,
				sessionName: item.description || `${new Date(item.startTime).toLocaleTimeString()} - ${new Date(item.endTime).toLocaleTimeString()}`
			}));
		}

		// If the response is in the old expected format
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
		console.log("fetchClassById response:", response);

		// Handle nested response structure
		// Example response: { "success": true, "data": { ...class } }
		let cls: any;
		if (response.success && response.data) {
			cls = response.data;
			console.log("Class data extracted from response.data:", cls);
		} else {
			cls = response;
			console.log("Using direct response as class data:", cls);
		}

		// Map backend fields to frontend fields
		return {
			// Basic identification
			id: cls.id,
			name: cls.name || "",
			courseTitle: cls.name || cls.title || "", // Use name or title as courseTitle
			courseId: cls.courseId || cls.course_id || "",
			course_id: cls.courseId || cls.course_id || "",

			// Teacher information
			teacherName: cls.teacherName || cls.teacher_name ||
				(cls.teacher ? cls.teacher.name : "N/A"),
			teacherId: cls.teacherId || cls.teacher_id || null,
			teacher_id: cls.teacherId || cls.teacher_id || null,
			teacher: cls.teacher,

			// Enrolment and capacity
			studentCount: cls.enrolledStudentsCount || cls.enrolled_students_count || 0,
			max_students: cls.maxStudents || cls.max_students || 30,
			maxStudents: cls.maxStudents || cls.max_students || 30,
			max_slots: cls.maxSlots || cls.max_slots,
			maxSlots: cls.maxSlots || cls.max_slots,
			available_slots: cls.availableSlots || cls.available_slots,
			availableSlots: cls.availableSlots || cls.available_slots,
			enrolled_students_count: cls.enrolledStudentsCount || cls.enrolled_students_count || 0,
			enrolledStudentsCount: cls.enrolledStudentsCount || cls.enrolled_students_count || 0,

			// Status
			status: cls.status || (isClassActive(cls.isActive) ? "active" : "inactive"),
			isActive: cls.isActive,

			// Dates
			startDate: cls.startDate || cls.start_date || "",
			start_date: cls.startDate || cls.start_date || "",
			endDate: cls.endDate || cls.end_date || "",
			end_date: cls.endDate || cls.end_date || "",

			// Schedule and location
			description: cls.description || "",
			schedule: cls.schedule || { days: [], time: "", duration: "" },
			location: cls.location || "",

			// Course relationship
			course: cls.course,

			// Metadata and timestamps
			metadata: cls.metadata,
			createdAt: cls.createdAt || cls.created_at,
			created_at: cls.createdAt || cls.created_at,
			updatedAt: cls.updatedAt || cls.updated_at,
			updated_at: cls.updatedAt || cls.updated_at,
		};
	} catch (e: any) {
		const errorMsg =
			e.response?.data?.message ||
			e.message ||
			`Failed to fetch class ${classId}`;
		return rejectWithValue(errorMsg);
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
			isActive: classData.status === "active" ? 1 : 0, // Convert status to isActive (1/0)
			start_date: classData.startDate,
			end_date: classData.endDate,
			description: classData.description,
			max_students: classData.maxStudents,
			max_slots: classData.maxSlots,
			location: classData.location,
			schedule: classData.schedule,
			// Include other fields as needed
			...classData,
		};

		const response = await post<any>("/classes", backendData);
		console.log("createClass response:", response);

		// Handle nested response structure
		// Example response: { "success": true, "data": { ...class } }
		let cls: any;
		if (response.success && response.data) {
			cls = response.data;
			console.log("Class data extracted from response.data:", cls);
		} else {
			cls = response;
			console.log("Using direct response as class data:", cls);
		}

		// Map backend fields to frontend fields
		return {
			// Basic identification
			id: cls.id,
			name: cls.name || "",
			courseTitle: cls.name || cls.title || "", // Use name or title as courseTitle
			courseId: cls.courseId || cls.course_id || "",
			course_id: cls.courseId || cls.course_id || "",

			// Teacher information
			teacherName: cls.teacherName || cls.teacher_name ||
				(cls.teacher ? cls.teacher.name : "N/A"),
			teacherId: cls.teacherId || cls.teacher_id || null,
			teacher_id: cls.teacherId || cls.teacher_id || null,
			teacher: cls.teacher,

			// Enrolment and capacity
			studentCount: cls.enrolledStudentsCount || cls.enrolled_students_count || 0,
			max_students: cls.maxStudents || cls.max_students || 30,
			maxStudents: cls.maxStudents || cls.max_students || 30,
			max_slots: cls.maxSlots || cls.max_slots,
			maxSlots: cls.maxSlots || cls.max_slots,
			available_slots: cls.availableSlots || cls.available_slots,
			availableSlots: cls.availableSlots || cls.available_slots,
			enrolled_students_count: cls.enrolledStudentsCount || cls.enrolled_students_count || 0,
			enrolledStudentsCount: cls.enrolledStudentsCount || cls.enrolled_students_count || 0,

			// Status
			status: cls.status || (isClassActive(cls.isActive) ? "active" : "inactive"),
			isActive: cls.isActive,

			// Dates
			startDate: cls.startDate || cls.start_date || "",
			start_date: cls.startDate || cls.start_date || "",
			endDate: cls.endDate || cls.end_date || "",
			end_date: cls.endDate || cls.end_date || "",

			// Schedule and location
			description: cls.description || "",
			schedule: cls.schedule || { days: [], time: "", duration: "" },
			location: cls.location || "",

			// Course relationship
			course: cls.course,

			// Metadata and timestamps
			metadata: cls.metadata,
			createdAt: cls.createdAt || cls.created_at,
			created_at: cls.createdAt || cls.created_at,
			updatedAt: cls.updatedAt || cls.updated_at,
			updated_at: cls.updatedAt || cls.updated_at,
		};
	} catch (e: any) {
		const errorMsg =
			e.response?.data?.message || e.message || "Failed to create class";
		return rejectWithValue(errorMsg);
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
			...(updateData.status && { isActive: updateData.status === "active" ? 1 : 0 }), // Convert status to isActive (1/0)
			...(updateData.startDate && { start_date: updateData.startDate }),
			...(updateData.endDate && { end_date: updateData.endDate }),
			...(updateData.maxStudents && { max_students: updateData.maxStudents }),
			...(updateData.maxSlots && { max_slots: updateData.maxSlots }),
			...(updateData.location && { location: updateData.location }),
			...(updateData.schedule && { schedule: updateData.schedule }),
			// Include other fields as needed
			...updateData,
		};

		const response = await put<any>(`/classes/${id}`, backendData);
		console.log("updateClass response:", response);

		// Handle nested response structure
		// Example response: { "success": true, "data": { ...class } }
		let cls: any;
		if (response.success && response.data) {
			cls = response.data;
			console.log("Class data extracted from response.data:", cls);
		} else {
			cls = response;
			console.log("Using direct response as class data:", cls);
		}

		// Map backend fields to frontend fields
		return {
			// Basic identification
			id: cls.id,
			name: cls.name || "",
			courseTitle: cls.name || cls.title || "", // Use name or title as courseTitle
			courseId: cls.courseId || cls.course_id || "",
			course_id: cls.courseId || cls.course_id || "",

			// Teacher information
			teacherName: cls.teacherName || cls.teacher_name ||
				(cls.teacher ? cls.teacher.name : "N/A"),
			teacherId: cls.teacherId || cls.teacher_id || null,
			teacher_id: cls.teacherId || cls.teacher_id || null,
			teacher: cls.teacher,

			// Enrolment and capacity
			studentCount: cls.enrolledStudentsCount || cls.enrolled_students_count || 0,
			max_students: cls.maxStudents || cls.max_students || 30,
			maxStudents: cls.maxStudents || cls.max_students || 30,
			max_slots: cls.maxSlots || cls.max_slots,
			maxSlots: cls.maxSlots || cls.max_slots,
			available_slots: cls.availableSlots || cls.available_slots,
			availableSlots: cls.availableSlots || cls.available_slots,
			enrolled_students_count: cls.enrolledStudentsCount || cls.enrolled_students_count || 0,
			enrolledStudentsCount: cls.enrolledStudentsCount || cls.enrolled_students_count || 0,

			// Status
			status: cls.status || (isClassActive(cls.isActive) ? "active" : "inactive"),
			isActive: cls.isActive,

			// Dates
			startDate: cls.startDate || cls.start_date || "",
			start_date: cls.startDate || cls.start_date || "",
			endDate: cls.endDate || cls.end_date || "",
			end_date: cls.endDate || cls.end_date || "",

			// Schedule and location
			description: cls.description || "",
			schedule: cls.schedule || { days: [], time: "", duration: "" },
			location: cls.location || "",

			// Course relationship
			course: cls.course,

			// Metadata and timestamps
			metadata: cls.metadata,
			createdAt: cls.createdAt || cls.created_at,
			created_at: cls.createdAt || cls.created_at,
			updatedAt: cls.updatedAt || cls.updated_at,
			updated_at: cls.updatedAt || cls.updated_at,
		};
	} catch (e: any) {
		const errorMsg =
			e.response?.data?.message || e.message || "Failed to update class";
		return rejectWithValue(errorMsg);
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
