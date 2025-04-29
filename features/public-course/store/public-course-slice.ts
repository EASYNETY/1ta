// features/public-course/store/public-course-slice.ts

import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import { get } from "@/lib/api-client"; // Import ONLY the 'get' function from API client
import type { RootState } from "@/store";
import { PublicCourse } from "../types/public-course-interface";

// --- Types ---
export interface CoursesState {
	allCourses: PublicCourse[];
	coursesByCategory: Record<string, PublicCourse[]>;
	categories: string[];
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}

// --- Initial State ---
const initialState: CoursesState = {
	allCourses: [],
	coursesByCategory: {},
	categories: [],
	status: "idle",
	error: null,
};

// --- Async Thunk to Fetch Courses ---
export const fetchCourses = createAsyncThunk<
	PublicCourse[],
	void,
	{ rejectValue: string }
>("courses/fetchCourses", async (_, { rejectWithValue }) => {
	try {
		console.log("Dispatching fetchCourses: Calling API client...");
		// Use the apiClient's get method
		const courses = await get<PublicCourse[]>("/public_courses");
		if (!Array.isArray(courses)) {
			console.error("Fetched courses data is not an array:", courses);
			throw new Error("Invalid data format received for courses");
		}
		console.log(
			`Dispatching fetchCourses: Received ${courses.length} courses.`
		);
		return courses;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to fetch courses";
		console.error("fetchCourses Thunk Error:", message);
		return rejectWithValue(message);
	}
});

// --- Course Slice Definition ---
export const publicCourseSlice = createSlice({
	name: "public_courses",
	initialState,
	reducers: {
		// Optional: Add sync reducers if needed
		// clearCourses: (state) => {
		//     state = initialState; // Reset state
		// }
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCourses.pending, (state) => {
				console.log("Course Slice: fetchCourses pending...");
				state.status = "loading";
				state.error = null;
			})
			.addCase(
				fetchCourses.fulfilled,
				(state, action: PayloadAction<PublicCourse[]>) => {
					console.log("Course Slice: fetchCourses fulfilled.");
					state.status = "succeeded";
					state.allCourses = action.payload;

					state.coursesByCategory = action.payload.reduce(
						(acc, course) => {
							const category = course.category;
							(acc[category] = acc[category] || []).push(course);
							return acc;
						},
						{} as Record<string, PublicCourse[]>
					);
					state.categories = Object.keys(state.coursesByCategory).sort();

					console.log("Course Slice: State updated -", {
						total: state.allCourses.length,
						categories: state.categories,
					});
				}
			)
			.addCase(fetchCourses.rejected, (state, action) => {
				console.error("Course Slice: fetchCourses rejected -", action.payload);
				state.status = "failed";
				state.error = action.payload ?? "Unknown error fetching courses";
			});
	},
});

// --- Selectors ---

export const selectAllCourses = (state: RootState) => state.public_courses.allCourses;
// Note: selectFeaturedCourses was removed as it wasn't in the state
export const selectCoursesByCategory = (state: RootState) => state.public_courses.coursesByCategory;
export const selectCourseCategories = (state: RootState) => state.public_courses.categories;
export const selectCoursesStatus = (state: RootState) => state.public_courses.status;
export const selectCoursesError = (state: RootState) => state.public_courses.error;
// Export potential sync actions if you add any
// export const { clearCourses } = courseSlice.actions;

// --- Export Reducer ---
export default publicCourseSlice.reducer;
