// features/classes/store/classes-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import type { ClassesState, AdminClassView } from "../types/classes-types";

// Import mocks (replace with API client later)
import {
	getMockEnrolledClasses,
	getMockTaughtClasses,
	getMockAllClassesAdmin,
} from "@/data/mock-classes-data";

// --- Thunks ---
export const fetchMyEnrolledClasses = createAsyncThunk<
	AuthCourse[],
	string,
	{ rejectValue: string }
>("classes/fetchMyEnrolled", async (userId, { rejectWithValue }) => {
	try {
		return await getMockEnrolledClasses(userId);
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

export const fetchMyTaughtClasses = createAsyncThunk<
	AuthCourse[],
	string,
	{ rejectValue: string }
>("classes/fetchMyTaught", async (teacherId, { rejectWithValue }) => {
	try {
		return await getMockTaughtClasses(teacherId);
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

interface FetchAdminParams {
	page?: number;
	limit?: number;
	search?: string;
}
interface FetchAdminResult {
	classes: AdminClassView[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export const fetchAllClassesAdmin = createAsyncThunk<
	FetchAdminResult,
	FetchAdminParams,
	{ rejectValue: string }
>(
	"classes/fetchAllAdmin",
	async ({ page = 1, limit = 10, search }, { rejectWithValue }) => {
		try {
			const { classes, total } = await getMockAllClassesAdmin(
				page,
				limit,
				search
			);
			const totalPages = Math.ceil(total / limit);
			return { classes, total, page, limit, totalPages };
		} catch (e: any) {
			return rejectWithValue(e.message);
		}
	}
);

// --- Initial State ---
const initialState: ClassesState = {
	myClasses: [],
	allClasses: [],
	status: "idle",
	error: null,
	adminPagination: null,
};

// --- Slice ---
const classesSlice = createSlice({
	name: "classes",
	initialState,
	reducers: {
		clearClassesError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// My Enrolled / Taught (Combined handling example)
		// --- REORDERED SECTION ---

		// 1. Specific Cases (addCase) FIRST
		builder
			.addCase(fetchAllClassesAdmin.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchAllClassesAdmin.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.allClasses = action.payload.classes;
				state.adminPagination = {
					currentPage: action.payload.page,
					limit: action.payload.limit,
					totalClasses: action.payload.total,
					totalPages: action.payload.totalPages,
				};
			})
			.addCase(fetchAllClassesAdmin.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch admin classes";
			});

		// 2. General Matchers (addMatcher) AFTER cases
		builder
			.addMatcher(
				// Pending for fetchMy...
				(action) =>
					action.type.startsWith("classes/fetchMy") &&
					action.type.endsWith("/pending"),
				(state) => {
					state.status = "loading";
					state.error = null;
				}
			)
			.addMatcher(
				// Fulfilled for fetchMy...
				(action): action is PayloadAction<AuthCourse[]> =>
					action.type.startsWith("classes/fetchMy") &&
					action.type.endsWith("/fulfilled"),
				(state, action) => {
					state.status = "succeeded";
					// Decide how to handle myClasses: overwrite or merge?
					// Overwrite seems reasonable if fetching specific role's list
					state.myClasses = action.payload;
				}
			)
			.addMatcher(
				// Rejected for fetchMy...
				(action): action is PayloadAction<string> =>
					action.type.startsWith("classes/fetchMy") &&
					action.type.endsWith("/rejected"),
				(state, action) => {
					state.status = "failed";
					state.error = action.payload ?? "Failed to fetch classes";
				}
			);
	},
});

// --- Actions & Selectors ---
export const { clearClassesError } = classesSlice.actions;
export const selectMyClasses = (state: RootState) => state.classes.myClasses;
export const selectAllAdminClasses = (state: RootState) =>
	state.classes.allClasses;
export const selectAdminPagination = (state: RootState) =>
	state.classes.adminPagination;
export const selectClassesStatus = (state: RootState) => state.classes.status;
export const selectClassesError = (state: RootState) => state.classes.error;

export default classesSlice.reducer;
