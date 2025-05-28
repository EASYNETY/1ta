// features/public-course/store/public-course-slice.ts

import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import { get } from "@/lib/api-client"; // Import ONLY the 'get' function from API client
import type { RootState } from "@/store";
import { PublicCourse } from "../types/public-course-interface";
import { getCourseIcon } from "@/utils/course-icon-mapping";
import { getProxiedImageUrl } from "@/utils/imageProxy";

// Fallback data for when API calls fail
const fallbackCourses: PublicCourse[] = [
	{
		id: "1",
		slug: "pmp-certification-training",
		title: "PMP® Certification Training",
		subtitle: "PMP® Certification Training",
		description:
			"<p>35 Hours of Instructor-Led Training: Comprehensive live sessions delivered by PMI-certified instructors with industry expertise.</p><p>Aligned with the Latest PMI Standards: Training based on the updated PMBOK® Guide and the latest PMP® exam content outline.</p>",
		category: "Project Management",
		image: "/placeholder.svg",
		iconUrl: "/images/icons/Prince2 practitioner-01-01.png",
		previewVideoUrl:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+1-20241221_063337-Meeting+Recording+1.mp4",
		instructor: {
			name: "Expert Instructor",
			title: "Project Management",
		},
		level: "Advanced",
		tags: ["PMP® Certification Training"],
		priceUSD: 0,
		learningOutcomes: [
			"Gain a comprehensive understanding of project management principles and best practices.",
			"Learn all concepts and knowledge areas outlined in the PMBOK® Guide",
			"Develop skills in initiating, planning, executing, monitoring, controlling, and closing projects",
			"Acquire the knowledge needed to pass the PMP certification exam",
		],
		prerequisites: [
			"Flexi Pass Enabled: Flexibility to reschedule your cohort within first 90 days of access.",
			"Live, online classroom training by top instructors and practitioners",
			"Lifetime access to high-quality self-paced eLearning content curated by industry experts",
			"Learner support and assistance available 24/7",
		],
		modules: [
			{
				title: "Assessments & Quizzes",
				duration: "5 lessons",
				lessons: [
					{
						title: "Mock Test-1",
						duration: "(quiz)",
						isPreview: false,
					},
					{
						title: "Mock Test-2",
						duration: "(quiz)",
						isPreview: false,
					},
				],
			},
			{
				title: "Core Training Modules",
				duration: "8 lessons",
				lessons: [
					{
						title: "PMP Training Day 1",
						duration: "04:00:00",
						isPreview: false,
					},
					{
						title: "PMP Training Day 2",
						duration: "03:27:24",
						isPreview: false,
					},
				],
			},
		],
		lessonCount: 14,
		moduleCount: 3,
		totalVideoDuration: "Approx. 29.2 hours",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Community",
	},
];

// --- Types ---
export interface CoursesState {
	allCourses: PublicCourse[];
	coursesByCategory: Record<string, PublicCourse[]>;
	categories: string[];
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}

// --- Initial State ---
// Initialize with fallback data to ensure we always have something to display
const initialCoursesByCategory = fallbackCourses.reduce(
	(acc, course) => {
		const category = course.category;
		(acc[category] = acc[category] || []).push(course);
		return acc;
	},
	{} as Record<string, PublicCourse[]>
);

const initialState: CoursesState = {
	allCourses: fallbackCourses,
	coursesByCategory: initialCoursesByCategory,
	categories: Object.keys(initialCoursesByCategory).sort(),
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
		const response = await get<{
			success: boolean;
			data: PublicCourse[];
			message?: string;
		}>("/public_courses");

		// Check if the response has the expected structure
		if (!response) {
			console.error("API Error: No response received");
			throw new Error("Failed to fetch courses - No response");
		}

		console.log("Raw API response structure:", {
			type: typeof response,
			isArray: Array.isArray(response),
			hasSuccess: "success" in response,
			hasData: "data" in response,
			keys: Object.keys(response || {}).slice(0, 10),
		});

		// Handle different response formats with robust object-to-array conversion
		let courses: PublicCourse[] = [];

		if (response.success && Array.isArray(response.data)) {
			// Standard format: { success: true, data: [...] }
			console.log("✅ Standard format detected - using response.data");
			courses = response.data;
		} else if (Array.isArray(response)) {
			// Direct array format
			console.log("✅ Direct array format detected");
			courses = response;
		} else if (typeof response === "object" && response !== null) {
			// Try to extract data from any object structure
			const responseObj = response as Record<string, any>;
			const possibleData =
				responseObj.data ||
				responseObj.courses ||
				responseObj.items ||
				response;

			console.log("🔍 Analyzing object response:", {
				dataType: typeof possibleData,
				isArray: Array.isArray(possibleData),
				keys: Object.keys(possibleData || {}).slice(0, 10),
			});

			if (Array.isArray(possibleData)) {
				console.log("✅ Found array in object structure");
				courses = possibleData;
			} else if (possibleData && typeof possibleData === "object") {
				// Check if it's an object with numeric keys (the main issue)
				const keys = Object.keys(possibleData);
				const numericKeys = keys
					.filter((key) => !isNaN(parseInt(key)))
					.sort((a, b) => parseInt(a) - parseInt(b));
				const hasNumericKeys = numericKeys.length > 0;

				console.log("🔍 Object analysis:", {
					totalKeys: keys.length,
					numericKeys: numericKeys.slice(0, 10),
					hasNumericKeys,
					nonNumericKeys: keys.filter((key) => isNaN(parseInt(key))),
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

					console.log(
						`✅ Successfully converted object to array with ${courses.length} items`
					);
				} else {
					console.log("🔧 Using Object.values as fallback...");
					courses = Object.values(possibleData);
				}
			} else {
				console.error(
					"API Error: Could not find array data in response",
					response
				);
				throw new Error("Failed to extract course data from response");
			}
		} else {
			console.error("API Error: Unexpected response format", response);
			throw new Error("Unexpected API response format");
		}

		// Final validation
		if (!Array.isArray(courses)) {
			console.error(
				"❌ CRITICAL: courses is still not an array after conversion!",
				{
					type: typeof courses,
					constructor: courses?.constructor?.name,
					value: courses,
				}
			);
			throw new Error("Failed to convert response to array format");
		}

		console.log(`✅ Successfully processed ${courses.length} courses as array`);

		// Apply PNG icon mapping to courses
		const coursesWithIcons = courses.map((course) => ({
			...course,
			iconUrl:
				course.image !== "http://34.249.241.206:5000/placeholder.svg"
					? getProxiedImageUrl(course.image)
					: getCourseIcon(course.title, course.id),
		}));

		return coursesWithIcons;
	} catch (error) {
		let message = "Failed to fetch courses";

		if (error instanceof Error) {
			message = error.message;

			// Handle rate limiting specifically
			if (
				error.message.includes("429") ||
				error.message.includes("Too Many Requests")
			) {
				message =
					"Too many requests. Please wait a moment before trying again.";
			}
		}

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
				state.status = "loading";
				state.error = null;
			})
			.addCase(
				fetchCourses.fulfilled,
				(state, action: PayloadAction<PublicCourse[]>) => {
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
				}
			)
			.addCase(fetchCourses.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Unknown error fetching courses";

				// Use fallback data if available and state is empty
				if (fallbackCourses.length > 0 && state.allCourses.length === 0) {
					state.allCourses = fallbackCourses;

					// Process fallback data into derived states
					state.coursesByCategory = fallbackCourses.reduce(
						(acc, course) => {
							const category = course.category;
							(acc[category] = acc[category] || []).push(course);
							return acc;
						},
						{} as Record<string, PublicCourse[]>
					);
					state.categories = Object.keys(state.coursesByCategory).sort();
				}
			});
	},
});

// --- Selectors ---

export const selectAllCourses = (state: RootState) =>
	state.public_courses.allCourses;
// Note: selectFeaturedCourses was removed as it wasn't in the state
export const selectCoursesByCategory = (state: RootState) =>
	state.public_courses.coursesByCategory;
export const selectCourseCategories = (state: RootState) =>
	state.public_courses.categories;
export const selectCoursesStatus = (state: RootState) =>
	state.public_courses.status;
export const selectCoursesError = (state: RootState) =>
	state.public_courses.error;
// Export potential sync actions if you add any
// export const { clearCourses } = courseSlice.actions;

// --- Export Reducer ---
export default publicCourseSlice.reducer;
