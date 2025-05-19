// features/classes/store/classes-slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"; // Removed createAsyncThunk from here
import type { RootState } from "@/store";
import type { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import type {
	ClassesState,
	AdminClassView,
	CourseClassOption,
} from "../types/classes-types";
// No direct apiClient import needed here anymore for thunks

// VVVV Import thunks from the new file VVVV
import {
	fetchMyEnrolledClasses,
	fetchMyTaughtClasses,
	fetchAllClassesAdmin,
	fetchCourseClassOptionsForScanner,
	fetchClassById,
	createClass,
	updateClass,
	deleteClass,
	// FetchAdminClassesResult // Import if needed for action payload typing, but usually inferred
} from "./classes-thunks"; // Assuming thunks are in the same directory
import type { FetchAdminClassesResult } from "./classes-thunks"; // Explicit import for clarity

// --- Initial State (remains the same) ---
const initialState: ClassesState = {
	myClasses: [],
	allClasses: [],
	currentClass: null,
	status: "idle", // General status for list fetching (myClasses, allAdminClasses)
	operationStatus: "idle", // Status for CUD operations and fetchById
	error: null, // General error for list fetching
	adminPagination: null,
	courseClassOptions: [],
	courseClassOptionsStatus: "idle",
	courseClassOptionsError: null,
};

// --- Slice ---
const classesSlice = createSlice({
	name: "classes",
	initialState,
	reducers: {
		clearClassesError: (state) => {
			state.error = null;
			// Also clear specific errors if you add them (e.g., operationError)
			state.courseClassOptionsError = null;
		},
		clearCurrentClass: (state) => {
			state.currentClass = null;
			state.operationStatus = "idle"; // Reset status when clearing current class
			state.error = null;
		},
		resetOperationStatus: (state) => {
			state.operationStatus = "idle";
			state.error = null; // Clear general error too if it was related to an operation
		},
		setCourseClassOptionStatus: (
			state,
			action: PayloadAction<"idle" | "loading" | "succeeded" | "failed">
		) => {
			state.courseClassOptionsStatus = action.payload;
		},
		// Optional: A reducer to clear courseClassOptions if needed, e.g., on logout
		clearCourseClassOptions: (state) => {
			state.courseClassOptions = [];
			state.courseClassOptionsStatus = "idle";
			state.courseClassOptionsError = null;
		},
	},
	extraReducers: (builder) => {
		// Fetch My Enrolled Classes
		builder
			.addCase(fetchMyEnrolledClasses.pending, (state) => {
				state.status = "loading"; // Use general 'status' for list loading
				state.error = null;
			})
			.addCase(
				fetchMyEnrolledClasses.fulfilled,
				(state, action: PayloadAction<AuthCourse[]>) => {
					state.status = "succeeded";
					state.myClasses = action.payload || []; // Ensure it's never null/undefined
				}
			)
			.addCase(fetchMyEnrolledClasses.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch enrolled classes";
			});

		// Fetch My Taught Classes
		builder
			.addCase(fetchMyTaughtClasses.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(
				fetchMyTaughtClasses.fulfilled,
				(state, action: PayloadAction<AuthCourse[]>) => {
					state.status = "succeeded";
					// Assuming myClasses is used for both student and teacher contexts, overwrite it.
					// If you need to store them separately, add another field to ClassesState.
					state.myClasses = action.payload || []; // Ensure it's never null/undefined
				}
			)
			.addCase(fetchMyTaughtClasses.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch taught classes";
			});

		// Fetch All Classes Admin
		builder
			.addCase(fetchAllClassesAdmin.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(
				fetchAllClassesAdmin.fulfilled,
				(state, action: PayloadAction<FetchAdminClassesResult>) => {
					console.log("fetchAllClassesAdmin.fulfilled received:", action.payload);
					state.status = "succeeded";

					// The payload should always have a classes array now
					const classes = action.payload.classes || [];
					console.log("Setting allClasses to:", classes);
					state.allClasses = classes;

					state.adminPagination = {
						currentPage: action.payload.page || 1,
						limit: action.payload.limit || 10,
						totalClasses: action.payload.total || 0,
						totalPages: action.payload.totalPages || 1,
					};

					console.log("Updated state.allClasses:", state.allClasses);
				}
			)
			.addCase(fetchAllClassesAdmin.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch admin classes";
			});

		// Fetch Course Class Options For Scanner
		builder
			.addCase(fetchCourseClassOptionsForScanner.pending, (state) => {
				state.courseClassOptionsStatus = "loading";
				state.courseClassOptionsError = null;
			})
			.addCase(
				fetchCourseClassOptionsForScanner.fulfilled,
				(state, action: PayloadAction<CourseClassOption[]>) => {
					state.courseClassOptionsStatus = "succeeded";
					state.courseClassOptions = action.payload || []; // Ensure it's never null/undefined
				}
			)
			.addCase(fetchCourseClassOptionsForScanner.rejected, (state, action) => {
				state.courseClassOptionsStatus = "failed";
				state.courseClassOptionsError =
					action.payload ?? "Failed to load class session options.";
			});

		// Fetch Class By ID
		builder
			.addCase(fetchClassById.pending, (state) => {
				state.operationStatus = "loading"; // Use operationStatus for single item fetch/CUD
				state.currentClass = null;
				state.error = null; // Clear general error
			})
			.addCase(
				fetchClassById.fulfilled,
				(state, action: PayloadAction<AdminClassView>) => {
					state.operationStatus = "succeeded";
					state.currentClass = action.payload;
				}
			)
			.addCase(fetchClassById.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to fetch class details"; // Set general error
			});

		// Create Class
		builder
			.addCase(createClass.pending, (state) => {
				state.operationStatus = "loading";
				state.error = null;
			})
			.addCase(
				createClass.fulfilled,
				(state, action: PayloadAction<AdminClassView>) => {
					state.operationStatus = "succeeded";
					state.allClasses.unshift(action.payload);
					if (state.adminPagination) {
						// Increment total if pagination exists
						state.adminPagination.totalClasses += 1;
						state.adminPagination.totalPages = Math.ceil(
							state.adminPagination.totalClasses / state.adminPagination.limit
						);
					}
				}
			)
			.addCase(createClass.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to create class";
			});

		// Update Class
		builder
			.addCase(updateClass.pending, (state) => {
				state.operationStatus = "loading";
				state.error = null;
			})
			.addCase(
				updateClass.fulfilled,
				(state, action: PayloadAction<AdminClassView>) => {
					state.operationStatus = "succeeded";
					const index = state.allClasses.findIndex(
						(c) => c.id === action.payload.id
					);
					if (index !== -1) state.allClasses[index] = action.payload;
					if (state.currentClass?.id === action.payload.id)
						state.currentClass = action.payload;
					// Also update in myClasses if the updated class is present there
					const myClassIndex = state.myClasses.findIndex(
						(c) => c.id === action.payload.id
					);
					if (myClassIndex !== -1) {
						// Assuming AdminClassView can be cast or mapped to AuthCourse for myClasses
						// This might need careful type handling or fetching AuthCourse again
						state.myClasses[myClassIndex] = {
							...state.myClasses[myClassIndex],
							...action.payload,
						};
					}
				}
			)
			.addCase(updateClass.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to update class";
			});

		// Delete Class
		builder
			.addCase(deleteClass.pending, (state) => {
				state.operationStatus = "loading";
				state.error = null;
			})
			.addCase(
				deleteClass.fulfilled,
				(state, action: PayloadAction<string>) => {
					// action.payload is classId
					state.operationStatus = "succeeded";
					state.allClasses = state.allClasses.filter(
						(c) => c.id !== action.payload
					);
					state.myClasses = state.myClasses.filter(
						(c) => c.id !== action.payload
					); // Also remove from myClasses
					if (state.currentClass?.id === action.payload)
						state.currentClass = null;
					if (
						state.adminPagination &&
						state.allClasses.length < state.adminPagination.totalClasses
					) {
						// Decrement total
						state.adminPagination.totalClasses -= 1;
						state.adminPagination.totalPages = Math.ceil(
							state.adminPagination.totalClasses / state.adminPagination.limit
						);
						if (
							state.adminPagination.currentPage >
								state.adminPagination.totalPages &&
							state.adminPagination.totalPages > 0
						) {
							state.adminPagination.currentPage =
								state.adminPagination.totalPages;
							// Optionally dispatch fetchAllClassesAdmin for the new current page here if items on current page became 0
						}
					}
				}
			)
			.addCase(deleteClass.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to delete class";
			});
	},
});

// --- Actions & Selectors (Selectors remain the same, actions from reducers object) ---
import { createSafeArraySelector } from "@/lib/utils/safe-data";

export const {
	clearClassesError,
	clearCurrentClass,
	resetOperationStatus,
	clearCourseClassOptions,
	setCourseClassOptionStatus
} = classesSlice.actions;

// Basic selectors
export const selectCurrentClass = (state: RootState) =>
	state.classes.currentClass;
export const selectOperationStatus = (state: RootState) =>
	state.classes.operationStatus;
export const selectMyClasses = (state: RootState) => state.classes.myClasses;
export const selectAllAdminClasses = (state: RootState) =>
	state.classes.allClasses;
export const selectAdminPagination = (state: RootState) =>
	state.classes.adminPagination;
export const selectClassesStatus = (state: RootState) => state.classes.status; // General list status
export const selectClassesError = (state: RootState) => state.classes.error; // General list error

// Basic course class options selectors
const selectCourseClassOptionsRaw = (state: RootState) =>
	state.classes.courseClassOptions;
export const selectCourseClassOptionsStatus = (state: RootState) =>
	state.classes.courseClassOptionsStatus;
export const selectCourseClassOptionsError = (state: RootState) =>
	state.classes.courseClassOptionsError;

// Safe selectors that handle null/undefined values
export const selectAllCourseClassOptions = createSafeArraySelector(selectCourseClassOptionsRaw);

// For backward compatibility, also export the raw selectors
export const selectMyClassesSafe = createSafeArraySelector(selectMyClasses);
export const selectAllAdminClassesSafe = createSafeArraySelector(selectAllAdminClasses);

export default classesSlice.reducer;
