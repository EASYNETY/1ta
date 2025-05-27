// features/auth-course/store/auth-course-slice.ts

import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import { del, get, post, put } from "@/lib/api-client";
import type { RootState } from "@/store";
import type { AuthCourse } from "../types/auth-course-interface";
import type { CourseFormValues } from "@/lib/schemas/course.schema";
import { getCourseIcon } from "@/utils/course-icon-mapping";

// --- Types ---
export interface AuthCoursesState {
	courses: AuthCourse[];
	coursesByCategory: Record<string, AuthCourse[]>;
	categories: string[];
	status: "idle" | "loading" | "succeeded" | "failed";
	deleteStatus?: "idle" | "loading" | "succeeded" | "failed";
	deleteError?: string | null;
	error: string | null;
	currentCourse: AuthCourse | null;
	currentModuleId: string | null;
	currentLessonId: string | null;
}

// --- Initial State ---
const initialState: AuthCoursesState = {
	courses: [],
	coursesByCategory: {},
	categories: [],
	status: "idle",
	deleteStatus: "idle",
	deleteError: null,
	error: null,
	currentCourse: null,
	currentModuleId: null,
	currentLessonId: null,
};

// --- Async Thunks ---

export const fetchAuthCourses = createAsyncThunk<
	AuthCourse[],
	void,
	{ rejectValue: string }
>("auth_courses/fetchAuthCourses", async (_, { rejectWithValue }) => {
	try {
		console.log("Dispatching fetchAuthCourses: Calling API client...");

		// Use the apiClient's get method with proper error handling
		const response = await get<{
			success?: boolean;
			data?: AuthCourse[];
			message?: string;
		} | AuthCourse[]>("/auth_courses");

		console.log("Raw API response structure:", {
			type: typeof response,
			isArray: Array.isArray(response),
			hasSuccess: 'success' in response,
			hasData: 'data' in response,
			keys: Object.keys(response || {}).slice(0, 10)
		});

		// Handle different response formats with robust object-to-array conversion
		let courses: AuthCourse[];

		// Check if response has the nested structure with success/data properties
		if (response && typeof response === 'object' && !Array.isArray(response) && 'success' in response && 'data' in response) {
			// This is a nested response format
			if (!response.success) {
				console.error("API Error:", response.message || "Unknown error");
				throw new Error(response.message || "Failed to fetch auth courses");
			}

			if (!response.data) {
				console.error("API Error: Missing courses data in response");
				throw new Error("Courses data not found in response");
			}

			// Check if response.data is an array or object with numeric keys
			if (Array.isArray(response.data)) {
				console.log("✅ Standard format detected - using response.data");
				courses = response.data;
			} else if (response.data && typeof response.data === 'object') {
				console.log("🔍 Analyzing response.data object:", {
					dataType: typeof response.data,
					keys: Object.keys(response.data).slice(0, 10)
				});

				// Check if it's an object with numeric keys
				const keys = Object.keys(response.data);
				const numericKeys = keys.filter(key => !isNaN(parseInt(key))).sort((a, b) => parseInt(a) - parseInt(b));
				const hasNumericKeys = numericKeys.length > 0;

				console.log("🔍 Object analysis:", {
					totalKeys: keys.length,
					numericKeys: numericKeys.slice(0, 10),
					hasNumericKeys,
					nonNumericKeys: keys.filter(key => isNaN(parseInt(key)))
				});

				if (hasNumericKeys) {
					console.log("🔧 Converting object with numeric keys to array...");

					// Convert object with numeric keys to array
					courses = [];
					for (const key of numericKeys) {
						if (response.data[key] !== undefined) {
							courses.push(response.data[key]);
						}
					}

					console.log(`✅ Successfully converted object to array with ${courses.length} items`);
				} else {
					console.log("🔧 Using Object.values as fallback...");
					courses = Object.values(response.data);
				}
			} else {
				console.error("API Error: response.data is not an array or object");
				throw new Error("Invalid response.data format");
			}
		} else if (Array.isArray(response)) {
			// This is a direct array response format
			console.log("✅ Direct array format detected");
			courses = response;
		} else if (response && typeof response === 'object') {
			// Try to extract data from any object structure
			const responseObj = response as Record<string, any>;
			const possibleData = responseObj.data || responseObj.courses || responseObj.items || response;

			console.log("🔍 Analyzing object response:", {
				dataType: typeof possibleData,
				isArray: Array.isArray(possibleData),
				keys: Object.keys(possibleData || {}).slice(0, 10)
			});

			if (Array.isArray(possibleData)) {
				console.log("✅ Found array in object structure");
				courses = possibleData;
			} else if (possibleData && typeof possibleData === 'object') {
				// Check if it's an object with numeric keys (the main issue)
				const keys = Object.keys(possibleData);
				const numericKeys = keys.filter(key => !isNaN(parseInt(key))).sort((a, b) => parseInt(a) - parseInt(b));
				const hasNumericKeys = numericKeys.length > 0;

				console.log("🔍 Object analysis:", {
					totalKeys: keys.length,
					numericKeys: numericKeys.slice(0, 10),
					hasNumericKeys,
					nonNumericKeys: keys.filter(key => isNaN(parseInt(key)))
				});

				if (hasNumericKeys) {
					console.log("🔧 Converting object with numeric keys to array...");

					// Convert object with numeric keys to array
					courses = [];
					for (const key of numericKeys) {
						if (possibleData[key] !== undefined) {
							courses.push(possibleData[key]);
						}
					}

					console.log(`✅ Successfully converted object to array with ${courses.length} items`);
				} else {
					console.log("🔧 Using Object.values as fallback...");
					courses = Object.values(possibleData);
				}
			} else {
				console.error("API Error: Could not find array data in response", response);
				throw new Error("Failed to extract course data from response");
			}
		} else {
			console.error("API Error: Unexpected response format", response);
			throw new Error("Unexpected API response format");
		}

		// Final validation - ensure we have an array
		if (!Array.isArray(courses)) {
			console.error("❌ CRITICAL: courses is still not an array after conversion!", {
				type: typeof courses,
				constructor: (courses as any)?.constructor?.name,
				value: courses
			});
			throw new Error("Failed to convert response to array format");
		}

		console.log(`✅ Successfully processed ${courses.length} auth courses as array`);

		// Apply PNG icon mapping to courses
		const coursesWithIcons = courses.map(course => ({
			...course,
			iconUrl: getCourseIcon(course.title, course.id)
		}));

		return coursesWithIcons;
	} catch (error) {
		let message = "Failed to fetch courses";

		if (error instanceof Error) {
			message = error.message;

			// Handle rate limiting specifically
			if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
				message = "Too many requests. Please wait a moment before trying again.";
			}
		}

		console.error("fetchAuthCourses Thunk Error:", message);
		return rejectWithValue(message);
	}
});

export const fetchCourseBySlug = createAsyncThunk<
	AuthCourse,
	string,
	{ rejectValue: string }
>("auth_courses/fetchCourseBySlug", async (slug, { rejectWithValue }) => {
	try {
		console.log(`Dispatching fetchCourseBySlug: ${slug}`);

		// Use the apiClient's get method with proper error handling
		const response = await get<{
			success?: boolean;
			data?: AuthCourse;
			message?: string;
		} | AuthCourse>(`/auth_courses/${slug}`);

		console.log("Raw API response structure:", {
			type: typeof response,
			isArray: Array.isArray(response),
			hasSuccess: 'success' in response,
			hasData: 'data' in response,
			keys: Object.keys(response || {}).slice(0, 10)
		});

		// Handle both response formats (direct or nested with success/data)
		let course: AuthCourse;

		// Check if response has the nested structure with success/data properties
		if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
			// This is a nested response format
			if (!response.success) {
				console.error("API Error:", response.message || "Unknown error");
				throw new Error(response.message || "Failed to fetch course");
			}

			if (!response.data) {
				console.error("API Error: Missing course data in response");
				throw new Error("Course data not found in response");
			}

			course = response.data;
		} else {
			// This is a direct response format
			course = response as AuthCourse;
		}

		// Validate the course object
		if (!course || typeof course !== 'object' || !course.id) {
			console.error("Invalid course data received:", course);
			throw new Error("Invalid course data received");
		}

		// Apply PNG icon mapping to course
		const courseWithIcon = {
			...course,
			iconUrl: getCourseIcon(course.title, course.id)
		};

		return courseWithIcon;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to fetch course by slug";
		console.error("fetchCourseBySlug Thunk Error:", message);
		return rejectWithValue(message);
	}
});

export const fetchAuthCourseBySlug = createAsyncThunk<
	AuthCourse,
	string,
	{ rejectValue: string }
>("auth_courses/fetchCourseBySlug", async (slug, { rejectWithValue }) => {
	try {
		console.log(`Dispatching fetchAuthCourseBySlug: ${slug}`);

		// Use the apiClient's get method with proper error handling
		const response = await get<{
			success?: boolean;
			data?: AuthCourse;
			message?: string;
		} | AuthCourse>(`/auth_courses/slug/${slug}`);

		console.log("Raw API response structure:", {
			type: typeof response,
			isArray: Array.isArray(response),
			hasSuccess: 'success' in response,
			hasData: 'data' in response,
			keys: Object.keys(response || {}).slice(0, 10)
		});

		// Handle both response formats (direct or nested with success/data)
		let course: AuthCourse;

		// Check if response has the nested structure with success/data properties
		if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
			// This is a nested response format
			if (!response.success) {
				console.error("API Error:", response.message || "Unknown error");
				throw new Error(response.message || "Failed to fetch course");
			}

			if (!response.data) {
				console.error("API Error: Missing course data in response");
				throw new Error("Course data not found in response");
			}

			course = response.data;
		} else {
			// This is a direct response format
			course = response as AuthCourse;
		}

		// Validate the course object
		if (!course || typeof course !== 'object' || !course.id) {
			console.error("Invalid course data received:", course);
			throw new Error("Invalid course data received");
		}

		// Apply PNG icon mapping to course
		const courseWithIcon = {
			...course,
			iconUrl: getCourseIcon(course.title, course.id)
		};

		return courseWithIcon;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to fetch course";
		console.error("fetchAuthCourseBySlug Thunk Error:", message);
		return rejectWithValue(message);
	}
});

export const markLessonComplete = createAsyncThunk<
	void,
	{ courseId: string; lessonId: string; completed: boolean },
	{ rejectValue: string }
>(
	"auth_courses/markLessonComplete",
	async ({ courseId, lessonId, completed }, { rejectWithValue }) => {
		try {
			console.log(
				`Marking lesson ${lessonId} as ${completed ? "complete" : "incomplete"}`
			);

			// Use the apiClient's post method with proper error handling
			const response = await post<{
				success?: boolean;
				message?: string;
			} | void>(
				`/auth_courses/${courseId}/lessons/${lessonId}/complete`,
				{
					completed,
				}
			);

			// Check if response has the nested structure with success property
			if (response && typeof response === 'object' && 'success' in response) {
				// This is a nested response format
				if (!response.success) {
					console.error("API Error:", response.message || "Unknown error");
					throw new Error(response.message || "Failed to update lesson status");
				}
			}

			// If we got here, the operation was successful
			return;
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to update lesson status";
			console.error("markLessonComplete Thunk Error:", message);
			return rejectWithValue(message);
		}
	}
);

export const createAuthCourse = createAsyncThunk<
	AuthCourse, // Return the created course on success
	CourseFormValues, // Expect the course form data as argument
	{ rejectValue: string }
>("auth_courses/createAuthCourse", async (courseData, { rejectWithValue }) => {
	try {
		console.log("Dispatching createAuthCourse with data:", courseData);

		// Process the form data to match API expectations
		const processedData = {
			...courseData,
			// Map available_for_enrolment to isAvailableForEnrolment for API compatibility
			isAvailableForEnrolment: courseData.available_for_enrolment,
			tags: Array.isArray(courseData.tags)
				? courseData.tags
				: courseData.tags ? courseData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
			learningOutcomes: Array.isArray(courseData.learningOutcomes)
				? courseData.learningOutcomes
				: courseData.learningOutcomes ? courseData.learningOutcomes.split('\n').map(item => item.trim()).filter(Boolean) : [],
			prerequisites: Array.isArray(courseData.prerequisites)
				? courseData.prerequisites
				: courseData.prerequisites ? courseData.prerequisites.split('\n').map(item => item.trim()).filter(Boolean) : [],
		};

		// Make the API call to create the course
		const response = await post<{
			success?: boolean;
			data?: AuthCourse;
			message?: string;
		} | AuthCourse>("/auth_courses", processedData);

		console.log("Raw API response structure:", {
			type: typeof response,
			isArray: Array.isArray(response),
			hasSuccess: 'success' in response,
			hasData: 'data' in response,
			keys: Object.keys(response || {}).slice(0, 10)
		});

		// Handle both response formats (direct or nested with success/data)
		let course: AuthCourse;

		// Check if response has the nested structure with success/data properties
		if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
			// This is a nested response format
			if (!response.success) {
				console.error("API Error:", response.message || "Unknown error");
				throw new Error(response.message || "Failed to create course");
			}

			if (!response.data) {
				console.error("API Error: Missing course data in response");
				throw new Error("Course data not found in response");
			}

			course = response.data;
		} else {
			// This is a direct response format
			course = response as AuthCourse;
		}

		// Validate the course object
		if (!course || typeof course !== 'object' || !course.id) {
			console.error("Invalid course data received:", course);
			throw new Error("Invalid course data received");
		}

		return course;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to create course";
		console.error("createAuthCourse Thunk Error:", message);
		return rejectWithValue(message);
	}
});

export const updateAuthCourse = createAsyncThunk<
	AuthCourse, // Return the updated course on success
	{ couseSlug: string; courseData: CourseFormValues }, // Expect the course ID and form data
	{ rejectValue: string }
>("auth_courses/updateAuthCourse", async ({ couseSlug, courseData }, { rejectWithValue }) => {
	try {
		console.log(`Dispatching updateAuthCourse for course ${couseSlug}`);

		// Process the form data to match API expectations
		const processedData = {
			...courseData,
			// Map available_for_enrolment to isAvailableForEnrolment for API compatibility
			isAvailableForEnrolment: courseData.available_for_enrolment,
			tags: Array.isArray(courseData.tags)
				? courseData.tags
				: courseData.tags ? courseData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
			learningOutcomes: Array.isArray(courseData.learningOutcomes)
				? courseData.learningOutcomes
				: courseData.learningOutcomes ? courseData.learningOutcomes.split('\n').map(item => item.trim()).filter(Boolean) : [],
			prerequisites: Array.isArray(courseData.prerequisites)
				? courseData.prerequisites
				: courseData.prerequisites ? courseData.prerequisites.split('\n').map(item => item.trim()).filter(Boolean) : [],
		};

		// Make the API call to update the course
		const response = await put<{
			success?: boolean;
			data?: AuthCourse;
			message?: string;
		} | AuthCourse>(`/auth_courses/${couseSlug}`, processedData);

		console.log("Raw API response structure:", {
			type: typeof response,
			isArray: Array.isArray(response),
			hasSuccess: 'success' in response,
			hasData: 'data' in response,
			keys: Object.keys(response || {}).slice(0, 10)
		});

		// Handle both response formats (direct or nested with success/data)
		let course: AuthCourse;

		// Check if response has the nested structure with success/data properties
		if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
			// This is a nested response format
			if (!response.success) {
				console.error("API Error:", response.message || "Unknown error");
				throw new Error(response.message || "Failed to update course");
			}

			if (!response.data) {
				console.error("API Error: Missing course data in response");
				throw new Error("Course data not found in response");
			}

			course = response.data;
		} else {
			// This is a direct response format
			course = response as AuthCourse;
		}

		// Validate the course object
		if (!course || typeof course !== 'object' || !course.id) {
			console.error("Invalid course data received:", course);
			throw new Error("Invalid course data received");
		}

		return course;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to update course";
		console.error("updateAuthCourse Thunk Error:", message);
		return rejectWithValue(message);
	}
});

export const deleteAuthCourse = createAsyncThunk<
	string, // Return the ID of the deleted course on success
	string, // Expect the course ID as argument
	{ rejectValue: string }
>("auth_courses/deleteAuthCourse", async (courseId, { rejectWithValue }) => {
	try {
		console.log(`Dispatching deleteAuthCourse: ${courseId}`);

		// Make the API call to delete the course
		const response = await del<{
			success?: boolean;
			message?: string;
		} | void>(`/auth_courses/${courseId}`);

		// Check if response has the nested structure with success property
		if (response && typeof response === 'object' && 'success' in response) {
			// This is a nested response format
			if (!response.success) {
				console.error("API Error:", response.message || "Unknown error");
				throw new Error(response.message || "Failed to delete course");
			}
		}

		return courseId; // Return the ID to identify which course to remove from state
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to delete course";
		console.error("deleteAuthCourse Thunk Error:", message);
		return rejectWithValue(message);
	}
});

// --- Slice Definition ---
export const authCourseSlice = createSlice({
	name: "auth_courses",
	initialState,
	reducers: {
		setCurrentModule: (state, action: PayloadAction<string | null>) => {
			state.currentModuleId = action.payload;
		},
		setCurrentLesson: (state, action: PayloadAction<string | null>) => {
			state.currentLessonId = action.payload;
		},
		clearCurrentCourse: (state) => {
			state.currentCourse = null;
			state.currentModuleId = null;
			state.currentLessonId = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAuthCourses.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchAuthCourses.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.courses = action.payload;
				state.coursesByCategory = action.payload.reduce(
					(acc, course) => {
						const category = course.category;
						(acc[category] = acc[category] || []).push(course);
						return acc;
					},
					{} as Record<string, AuthCourse[]>
				);
				state.categories = Object.keys(state.coursesByCategory).sort();
			})
			.addCase(fetchAuthCourses.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Unknown error fetching auth courses";
			})
			.addCase(fetchCourseBySlug.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchCourseBySlug.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.currentCourse = action.payload;
			})
			.addCase(fetchCourseBySlug.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Error fetching course by slug";
			})
			.addCase(deleteAuthCourse.pending, (state) => {
				state.deleteStatus = "loading";
				state.deleteError = null;
			})
			.addCase(deleteAuthCourse.fulfilled, (state, action) => {
				state.deleteStatus = "succeeded";
				const deletedCourseId = action.payload;
				// Remove the course from the main list
				state.courses = state.courses.filter(
					(course) => course.id !== deletedCourseId
				);
				// Optionally, update coursesByCategory and categories if needed (more complex)
				// For simplicity, we might just rely on a full refetch later or accept temporary inconsistency
				state.coursesByCategory = state.courses.reduce(
					(acc, course) => {
						const category = course.category;
						(acc[category] = acc[category] || []).push(course);
						return acc;
					},
					{} as Record<string, AuthCourse[]>
				);
				state.categories = Object.keys(state.coursesByCategory).sort();
			})
			.addCase(deleteAuthCourse.rejected, (state, action) => {
				state.deleteStatus = "failed";
				state.deleteError = action.payload ?? "Unknown error deleting course";
			})
			// Handle createAuthCourse
			.addCase(createAuthCourse.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(createAuthCourse.fulfilled, (state, action) => {
				state.status = "succeeded";
				// Add the new course to the courses array
				state.courses.push(action.payload);
				// Update the coursesByCategory
				const category = action.payload.category;
				if (!state.coursesByCategory[category]) {
					state.coursesByCategory[category] = [];
				}
				state.coursesByCategory[category].push(action.payload);
				// Update categories if needed
				if (!state.categories.includes(category)) {
					state.categories.push(category);
					state.categories.sort();
				}
			})
			.addCase(createAuthCourse.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Unknown error creating course";
			})
			// Handle updateAuthCourse
			.addCase(updateAuthCourse.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(updateAuthCourse.fulfilled, (state, action) => {
				state.status = "succeeded";
				// Find and update the course in the courses array
				const index = state.courses.findIndex(course => course.id === action.payload.id);
				if (index !== -1) {
					// Update the course
					state.courses[index] = action.payload;

					// Update coursesByCategory
					// First, remove the course from its old category if it changed
					const oldCategory = state.courses[index].category;
					const newCategory = action.payload.category;

					if (oldCategory !== newCategory) {
						// Remove from old category
						if (state.coursesByCategory[oldCategory]) {
							state.coursesByCategory[oldCategory] = state.coursesByCategory[oldCategory].filter(
								course => course.id !== action.payload.id
							);
							// Clean up empty categories
							if (state.coursesByCategory[oldCategory].length === 0) {
								delete state.coursesByCategory[oldCategory];
								state.categories = state.categories.filter(cat => cat !== oldCategory);
							}
						}

						// Add to new category
						if (!state.coursesByCategory[newCategory]) {
							state.coursesByCategory[newCategory] = [];
						}
						state.coursesByCategory[newCategory].push(action.payload);

						// Update categories if needed
						if (!state.categories.includes(newCategory)) {
							state.categories.push(newCategory);
							state.categories.sort();
						}
					} else {
						// Just update the course in its existing category
						if (state.coursesByCategory[newCategory]) {
							const catIndex = state.coursesByCategory[newCategory].findIndex(
								course => course.id === action.payload.id
							);
							if (catIndex !== -1) {
								state.coursesByCategory[newCategory][catIndex] = action.payload;
							}
						}
					}

					// If this is the current course, update it
					if (state.currentCourse && state.currentCourse.id === action.payload.id) {
						state.currentCourse = action.payload;
					}
				}
			})
			.addCase(updateAuthCourse.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Unknown error updating course";
			});
	},
});

// --- Export Actions ---
export const { setCurrentModule, setCurrentLesson, clearCurrentCourse } =
	authCourseSlice.actions;

// --- Selectors ---
export const selectAuthCourses = (state: RootState) =>
	state.auth_courses.courses;
export const selectAuthCoursesByCategory = (state: RootState) =>
	state.auth_courses.coursesByCategory;
export const selectAuthCourseCategories = (state: RootState) =>
	state.auth_courses.categories;
export const selectAuthCourseStatus = (state: RootState) =>
	state.auth_courses.status;
export const selectAuthCourseError = (state: RootState) =>
	state.auth_courses.error;
export const selectCurrentCourse = (state: RootState) =>
	state.auth_courses.currentCourse;
export const selectCurrentModuleId = (state: RootState) =>
	state.auth_courses.currentModuleId;
export const selectCurrentLessonId = (state: RootState) =>
	state.auth_courses.currentLessonId;
export const selectAuthCourseBySlug = (slug: string) => (state: RootState) =>
	state.auth_courses.courses.find(course => course.slug === slug) ||
	(state.auth_courses.currentCourse?.slug === slug ? state.auth_courses.currentCourse : null);

// --- Export Reducer ---
export default authCourseSlice.reducer;
