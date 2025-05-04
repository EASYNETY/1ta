// features/classes/store/classes-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import type { ClassesState, AdminClassView } from "../types/classes-types";
import { get, post, put, del } from "@/lib/api-client";

// Define payload types for create/update if different from AdminClassView
type CreateClassPayload = Omit<AdminClassView, "id" | "studentCount">;
type UpdateClassPayload = Partial<CreateClassPayload> & { id: string };

// Import mocks (replace with API client later)
import {
	getMockEnrolledClasses,
	getMockTaughtClasses,
	getMockAllClassesAdmin,
	createMockClass,
	getMockClassById,
	updateMockClass,
	deleteMockClass,
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

// --- NEW CRUD Thunks ---
export const fetchClassById = createAsyncThunk<
	AdminClassView, // Return type
	string, // Argument type (classId)
	{ rejectValue: string }
>("classes/fetchById", async (classId, { rejectWithValue }) => {
	try {
		// Replace with API call: return await get<AdminClassView>(`/classes/${classId}`);
		return await getMockClassById(classId);
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

export const createClass = createAsyncThunk<
	AdminClassView, // Return the created class
	CreateClassPayload, // Payload to create
	{ rejectValue: string }
>("classes/create", async (classData, { rejectWithValue }) => {
	try {
		// Replace with API call: return await post<AdminClassView>('/classes', classData);
		return await createMockClass(classData);
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

export const updateClass = createAsyncThunk<
	AdminClassView, // Return the updated class
	UpdateClassPayload, // Payload includes ID and fields to update
	{ rejectValue: string }
>("classes/update", async ({ id, ...updateData }, { rejectWithValue }) => {
	try {
		// Replace with API call: return await put<AdminClassView>(`/classes/${id}`, updateData);
		return await updateMockClass(id, updateData);
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

export const deleteClass = createAsyncThunk<
	string, // Return the ID of deleted class
	string, // Argument is classId
	{ rejectValue: string }
>("classes/delete", async (classId, { rejectWithValue }) => {
	try {
		// Replace with API call: await del<void>(`/classes/${classId}`);
		await deleteMockClass(classId);
		return classId;
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});
// --- End NEW CRUD Thunks ---

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
	currentClass: null, // Add currentClass
	status: "idle",
	operationStatus: "idle", // Add operationStatus
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
		clearCurrentClass: (state) => {
			state.currentClass = null;
		}, // Action to clear viewed/edited class
		resetOperationStatus: (state) => {
			state.operationStatus = "idle";
		}, // Reset after CUD
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

		// Fetch Class By ID
		builder
			.addCase(fetchClassById.pending, (state) => {
				state.status = "loading";
				state.currentClass = null;
			}) // Clear previous while loading
			.addCase(fetchClassById.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.currentClass = action.payload;
			})
			.addCase(fetchClassById.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch class details";
			});

		// Create Class
		builder
			.addCase(createClass.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(createClass.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				state.allClasses.unshift(action.payload); // Add to beginning of admin list
				// Optionally update pagination or trigger refetch
			})
			.addCase(createClass.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to create class";
			});

		// Update Class
		builder
			.addCase(updateClass.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(updateClass.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				const index = state.allClasses.findIndex(
					(c) => c.id === action.payload.id
				);
				if (index !== -1) state.allClasses[index] = action.payload; // Update in admin list
				if (state.currentClass?.id === action.payload.id)
					state.currentClass = action.payload; // Update current if viewing/editing
				// Update myClasses if needed
			})
			.addCase(updateClass.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to update class";
			});

		// Delete Class
		builder
			.addCase(deleteClass.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(deleteClass.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				state.allClasses = state.allClasses.filter(
					(c) => c.id !== action.payload
				); // Remove from admin list
				// Update pagination or trigger refetch
				// Remove from myClasses if needed
			})
			.addCase(deleteClass.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to delete class";
			});

		// General Matchers (addMatcher) AFTER cases
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
export const { clearClassesError, clearCurrentClass, resetOperationStatus } =
	classesSlice.actions;
export const selectCurrentClass = (state: RootState) =>
	state.classes.currentClass; // Selector for single class
export const selectOperationStatus = (state: RootState) =>
	state.classes.operationStatus;
export const selectMyClasses = (state: RootState) => state.classes.myClasses;
export const selectAllAdminClasses = (state: RootState) =>
	state.classes.allClasses;
export const selectAdminPagination = (state: RootState) =>
	state.classes.adminPagination;
export const selectClassesStatus = (state: RootState) => state.classes.status;
export const selectClassesError = (state: RootState) => state.classes.error;

export default classesSlice.reducer;
