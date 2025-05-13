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

		// Use the apiClient's get method with proper error handling
		let courses: PublicCourse[] = [];

		try {
			const response = await get<{
				success: boolean;
				data: PublicCourse[];
				message?: string;
			}>("/public_courses");

			// Check if the response has the expected structure
			if (!response || !response.success) {
				console.error("API Error:", response?.message || "Unknown error");
				throw new Error(response?.message || "Failed to fetch courses");
			}

			courses = response.data;

			if (!Array.isArray(courses)) {
				console.error("Fetched courses data is not an array:", courses);
				throw new Error("Invalid data format received for courses");
			}

			console.log(`Dispatching fetchCourses: Received ${courses.length} courses.`);

		} catch (error) {
			console.error("API Error:", error);

			// Mock data for development when API is not available
			console.log("Using mock data for public courses");

			// Use mock data
			courses = [
				{
					id: "1",
					title: "Introduction to Web Development",
					description: "Learn the basics of HTML, CSS, and JavaScript to build modern websites.",
					category: "Web Development",
					instructor: { name: "John Doe", title: "Senior Web Developer" },
					image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
					level: "Beginner",
					totalVideoDuration: "8 weeks",
					priceUSD: 99.99,
					discountPriceUSD: 79.99,
					studentsEnrolled: 1250,
					rating: 4.8,
					reviewsCount: 320,
					tags: ["HTML", "CSS", "JavaScript"],
					slug: "intro-to-web-dev",
					lessonCount: 24,
					moduleCount: 6
				},
				{
					id: "2",
					title: "Advanced React Development",
					description: "Master React.js and build complex single-page applications with modern practices.",
					category: "Web Development",
					instructor: { name: "Jane Smith", title: "React Specialist" },
					image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
					level: "Intermediate",
					totalVideoDuration: "10 weeks",
					priceUSD: 149.99,
					discountPriceUSD: 129.99,
					studentsEnrolled: 850,
					rating: 4.9,
					reviewsCount: 210,
					tags: ["React", "JavaScript", "Redux"],
					slug: "advanced-react",
					lessonCount: 32,
					moduleCount: 8
				},
				{
					id: "3",
					title: "Data Science Fundamentals",
					description: "Introduction to data analysis, visualization, and machine learning concepts.",
					category: "Data Science",
					instructor: { name: "Michael Johnson", title: "Data Scientist" },
					image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
					level: "Beginner",
					totalVideoDuration: "12 weeks",
					priceUSD: 199.99,
					discountPriceUSD: 169.99,
					studentsEnrolled: 720,
					rating: 4.7,
					reviewsCount: 180,
					tags: ["Python", "Data Analysis", "Statistics"],
					slug: "data-science-fundamentals",
					lessonCount: 28,
					moduleCount: 7
				}
			];
		}

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
