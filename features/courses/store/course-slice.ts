import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type { Course } from "@/data/mock-course-data"; // Import Course type
import { get } from "@/lib/api-client"; // Import ONLY the 'get' function from API client
import type { RootState } from "@/store";

// --- Types ---
export interface CoursesState {
	allCourses: Course[];
	featuredCourses: Course[];
	coursesByCategory: Record<string, Course[]>;
	categories: string[];
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}

// --- Initial State ---
const initialState: CoursesState = {
	allCourses: [],
	featuredCourses: [],
	coursesByCategory: {},
	categories: [],
	status: "idle",
	error: null,
};

// --- Async Thunk to Fetch Courses ---
export const fetchCourses = createAsyncThunk<
	Course[],
	void,
	{ rejectValue: string }
>("courses/fetchCourses", async (_, { rejectWithValue }) => {
	try {
		console.log("Dispatching fetchCourses: Calling API client...");

		// Use the apiClient's get method with proper error handling
		const response = await get<{
			success: boolean;
			data: Course[];
			message?: string;
		}>("/courses");

		// Check if the response has the expected structure
		if (!response) {
			console.error("API Error: No response received");
			throw new Error("Failed to fetch courses - No response");
		}

		console.log("Raw API response structure:", {
			type: typeof response,
			isArray: Array.isArray(response),
			hasSuccess: 'success' in response,
			hasData: 'data' in response,
			keys: Object.keys(response || {}).slice(0, 10)
		});

		// Handle different response formats with robust object-to-array conversion
		let courses: Course[] = [];

		if (response.success && Array.isArray(response.data)) {
			// Standard format: { success: true, data: [...] }
			console.log("✅ Standard format detected - using response.data");
			courses = response.data;
		} else if (Array.isArray(response)) {
			// Direct array format
			console.log("✅ Direct array format detected");
			courses = response;
		} else if (typeof response === 'object' && response !== null) {
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

		// Final validation
		if (!Array.isArray(courses)) {
			console.error("❌ CRITICAL: courses is still not an array after conversion!", {
				type: typeof courses,
				constructor: courses?.constructor?.name,
				value: courses
			});
			throw new Error("Failed to convert response to array format");
		}

		console.log(`✅ Successfully processed ${courses.length} courses as array`);

		// Validate that each course has the expected structure
		if (courses.length > 0) {
			const firstCourse = courses[0];
			console.log("First course validation:", {
				hasId: !!firstCourse?.id,
				hasTitle: !!firstCourse?.title,
				type: typeof firstCourse
			});
		}

		return courses;
	} catch (error) {
		let message = "Failed to fetch courses";

		if (error instanceof Error) {
			message = error.message;

			// Handle rate limiting specifically
			if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
				message = "Too many requests. Please wait a moment before trying again.";
			}
		}

		console.error("fetchCourses Thunk Error:", message);
		return rejectWithValue(message);
	}
});

// --- Course Slice Definition ---
export const courseSlice = createSlice({
	name: "courses",
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
				(state, action: PayloadAction<Course[]>) => {
					console.log("Course Slice: fetchCourses fulfilled.");
					state.status = "succeeded";
					state.allCourses = action.payload;

					// Process data into derived states
					state.featuredCourses = action.payload.filter(
						(course) => course.isFeatured
					);
					state.coursesByCategory = action.payload.reduce(
						(acc, course) => {
							const category = course.category;
							(acc[category] = acc[category] || []).push(course);
							return acc;
						},
						{} as Record<string, Course[]>
					);
					state.categories = Object.keys(state.coursesByCategory).sort();

					console.log("Course Slice: State updated -", {
						total: state.allCourses.length,
						featured: state.featuredCourses.length,
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
export const selectAllCourses = (state: RootState) => state.courses.allCourses;
export const selectFeaturedCourses = (state: RootState) =>
	state.courses.featuredCourses;
export const selectCoursesByCategory = (state: RootState) =>
	state.courses.coursesByCategory;
export const selectCourseCategories = (state: RootState) =>
	state.courses.categories;
export const selectCoursesStatus = (state: RootState) => state.courses.status;
export const selectCoursesError = (state: RootState) => state.courses.error;

// Export potential sync actions if you add any
// export const { clearCourses } = courseSlice.actions;

// --- Export Reducer ---
export default courseSlice.reducer;
