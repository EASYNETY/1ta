// features/auth-course/store/auth-course-slice.ts

import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import { get, post } from "@/lib/api-client";
import type { RootState } from "@/store";
import type { AuthCourse } from "../types/auth-course-interface";

// --- Types ---
export interface AuthCoursesState {
	courses: AuthCourse[];
	coursesByCategory: Record<string, AuthCourse[]>;
	categories: string[];
	status: "idle" | "loading" | "succeeded" | "failed";
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
		const courses = await get<AuthCourse[]>("/auth_courses");
		if (!Array.isArray(courses)) {
			throw new Error("Invalid data format received for courses");
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
