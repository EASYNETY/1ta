// features/auth-course/store/auth-course-slice.ts

import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import { del, get, post } from "@/lib/api-client";
import type { RootState } from "@/store";
import type { AuthCourse } from "../types/auth-course-interface";

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
