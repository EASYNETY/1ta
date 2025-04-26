// features/courses/store/course-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Course } from "@/data/mock-course-data"; // Import Course type
import { get } from "@/lib/api-client"; // Import ONLY the 'get' function from API client
import type { RootState } from "@/store";

// --- Types ---
export interface CoursesState {
    allCourses: Course[];
    featuredCourses: Course[];
    coursesByCategory: Record<string, Course[]>;
    categories: string[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// --- Initial State ---
const initialState: CoursesState = {
    allCourses: [],
    featuredCourses: [],
    coursesByCategory: {},
    categories: [],
    status: 'idle',
    error: null,
};

// --- Async Thunk to Fetch Courses ---
export const fetchCourses = createAsyncThunk<Course[], void, { rejectValue: string }>(
    'courses/fetchCourses',
    async (_, { rejectWithValue }) => {
        try {
            console.log("Dispatching fetchCourses: Calling API client...");
            // Use the apiClient's get method
            const courses = await get<Course[]>('/courses');
            if (!Array.isArray(courses)) {
                console.error("Fetched courses data is not an array:", courses);
                throw new Error("Invalid data format received for courses");
            }
             console.log(`Dispatching fetchCourses: Received ${courses.length} courses.`);
            return courses;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch courses';
            console.error("fetchCourses Thunk Error:", message);
            return rejectWithValue(message);
        }
    }
);

// --- Course Slice Definition ---
export const courseSlice = createSlice({
    name: 'courses',
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
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
                console.log("Course Slice: fetchCourses fulfilled.");
                state.status = 'succeeded';
                state.allCourses = action.payload;

                // Process data into derived states
                state.featuredCourses = action.payload.filter(course => course.isFeatured);
                state.coursesByCategory = action.payload.reduce((acc, course) => {
                    const category = course.category;
                    (acc[category] = acc[category] || []).push(course);
                    return acc;
                }, {} as Record<string, Course[]>);
                state.categories = Object.keys(state.coursesByCategory).sort();

                console.log("Course Slice: State updated -", {
                    total: state.allCourses.length,
                    featured: state.featuredCourses.length,
                    categories: state.categories,
                });
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                console.error("Course Slice: fetchCourses rejected -", action.payload);
                state.status = 'failed';
                state.error = action.payload ?? 'Unknown error fetching courses';
            });
    },
});

// --- Selectors ---
export const selectAllCourses = (state: RootState) => state.courses.allCourses;
export const selectFeaturedCourses = (state: RootState) => state.courses.featuredCourses;
export const selectCoursesByCategory = (state: RootState) => state.courses.coursesByCategory;
export const selectCourseCategories = (state: RootState) => state.courses.categories;
export const selectCoursesStatus = (state: RootState) => state.courses.status;
export const selectCoursesError = (state: RootState) => state.courses.error;

// Export potential sync actions if you add any
// export const { clearCourses } = courseSlice.actions;

// --- Export Reducer ---
export default courseSlice.reducer;