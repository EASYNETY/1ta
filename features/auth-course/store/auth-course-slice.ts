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
			success: boolean;
			data: AuthCourse[];
			message?: string;
		}>("/auth_courses");

		// Check if the response has the expected structure
		if (!response || !response.success) {
			console.error("API Error:", response?.message || "Unknown error");
			throw new Error(response?.message || "Failed to fetch auth courses");
		}

		// Extract the courses from the response
		const courses = response.data;

		if (!Array.isArray(courses)) {
			console.error("Fetched auth courses data is not an array:", courses);
			throw new Error("Invalid data format received for auth courses");
		}

		return courses;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to fetch courses";
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
		const course = await get<AuthCourse>(`/auth_courses/${slug}`);
		if (!course || typeof course !== "object") {
			throw new Error("Invalid data received for course");
		}
		return course;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to fetch course by slug";
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
		const course = await get<AuthCourse>(`/auth_courses/slug/${slug}`);
		if (!course) throw new Error("Course not found");
		return course;
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
			await post<void>(
				`/auth_courses/${courseId}/lessons/${lessonId}/complete`,
				{
					completed,
				}
			);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to update lesson status";
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
			success: boolean;
			data: AuthCourse;
			message?: string;
		}>("/auth_courses", processedData);

		// Check if the response has the expected structure
		if (!response || !response.success) {
			console.error("API Error:", response?.message || "Unknown error");
			throw new Error(response?.message || "Failed to create course");
		}

		return response.data;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to create course";
		console.error("createAuthCourse Thunk Error:", message);
		return rejectWithValue(message);
	}
});

export const updateAuthCourse = createAsyncThunk<
	AuthCourse, // Return the updated course on success
	{ courseId: string; courseData: CourseFormValues }, // Expect the course ID and form data
	{ rejectValue: string }
>("auth_courses/updateAuthCourse", async ({ courseId, courseData }, { rejectWithValue }) => {
	try {
		console.log(`Dispatching updateAuthCourse for course ${courseId}`);

		// Process the form data to match API expectations
		const processedData = {
			...courseData,
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
			success: boolean;
			data: AuthCourse;
			message?: string;
		}>(`/auth_courses/${courseId}`, processedData);

		// Check if the response has the expected structure
		if (!response || !response.success) {
			console.error("API Error:", response?.message || "Unknown error");
			throw new Error(response?.message || "Failed to update course");
		}

		return response.data;
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
		// Assuming your API endpoint for deleting is /auth_courses/{courseId}
		// The 'del' function likely doesn't return the full course, adjust if needed
		await del<void>(`/auth_courses/${courseId}`);
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

// --- Export Reducer ---
export default authCourseSlice.reducer;
