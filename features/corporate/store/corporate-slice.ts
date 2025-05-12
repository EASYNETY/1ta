// features/corporate/store/corporate-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { isStudent, type StudentUser } from "@/types/user.types"; // Use StudentUser type
import { get, post, put, del } from "@/lib/api-client"; // Import CRUD methods

// --- State Definition ---
interface CorporateState {
	managedStudents: StudentUser[]; // List of students managed by the current manager
	currentManagedStudent: StudentUser | null; // For viewing/editing a specific student
	status: "idle" | "loading" | "succeeded" | "failed"; // Status for fetching lists
	operationStatus: "idle" | "loading" | "succeeded" | "failed"; // Status for CUD operations on students
	error: string | null; // General fetch/operation error
	pagination: {
		// Optional pagination for student list
		currentPage: number;
		totalPages: number;
		totalStudents: number;
		limit: number;
	} | null;
}

// --- Initial State ---
const initialState: CorporateState = {
	managedStudents: [],
	currentManagedStudent: null,
	status: "idle",
	operationStatus: "idle",
	error: null,
	pagination: null,
};

// --- Payload Types ---
interface FetchManagedStudentsParams {
	corporateId: string;
	page?: number;
	limit?: number;
	search?: string; // Optional search filter
}
interface FetchManagedStudentsResult {
	students: StudentUser[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
// Type for creating (Manager provides Name/Email, Backend adds corporateId etc.)
export type CreateManagedStudentPayload = {
	name: string;
	email: string /* initial password optional */;
};
// Type for updating (Manager can likely only update Name, Status?)
export type UpdateManagedStudentPayload = {
	id: string;
	name?: string;
	isActive?: boolean /* other allowed fields */;
};

// --- Thunks ---

// Fetch the list of students managed by the specific corporate manager
export const fetchManagedStudents = createAsyncThunk<
	FetchManagedStudentsResult,
	FetchManagedStudentsParams,
	{ rejectValue: string }
>("corporate/fetchManagedStudents", async (params, { rejectWithValue }) => {
	try {
		const { corporateId, page = 1, limit = 10, search = "" } = params;

		const queryParams = new URLSearchParams({
			page: String(page),
			limit: String(limit),
			...(search && { search }),
		}).toString();

		// Endpoint: GET /corporate/{corporateId}/students?page=...&limit=...&search=...
		const endpoint = `/corporate/${corporateId}/students?${queryParams}`;
		console.log(`Calling API: GET ${endpoint}`);

		const result = await get<FetchManagedStudentsResult>(endpoint);
		return result;
	} catch (error: any) {
		console.error("Error fetching managed students:", error);
		return rejectWithValue(error.message || "Failed to fetch managed students");
	}
});

// Create a new student managed by the corporate manager
export const createManagedStudent = createAsyncThunk<
	StudentUser,
	CreateManagedStudentPayload & { corporateId: string }, // Thunk needs corporateId context
	{ rejectValue: string }
>("corporate/createManagedStudent", async (payload, { rejectWithValue }) => {
	try {
		// Endpoint: POST /users (Assuming backend handles corporate context)
		const endpoint = "/users";
		console.log(`Calling API: POST ${endpoint}`, payload);

		const response = await post<StudentUser>(endpoint, payload);
		return response;
	} catch (error: any) {
		console.error("Error creating managed student:", error);
		return rejectWithValue(error.message || "Failed to create student");
	}
});

// Update an existing student managed by the corporate manager
export const updateManagedStudent = createAsyncThunk<
	StudentUser,
	UpdateManagedStudentPayload, // Contains { id: string, ...updateData }
	{ rejectValue: string }
>(
	"corporate/updateManagedStudent",
	async ({ id, ...updateData }, { rejectWithValue }) => {
		try {
			// Endpoint: PUT /users/{id} (Assuming backend verifies permission)
			const endpoint = `/users/${id}`;
			console.log(`Calling API: PUT ${endpoint}`, updateData);

			const response = await put<StudentUser>(endpoint, updateData);
			return response;
		} catch (error: any) {
			console.error(`Error updating managed student ${id}:`, error);
			return rejectWithValue(error.message || "Failed to update student");
		}
	}
);

// Delete/remove a student managed by the corporate manager
export const deleteManagedStudent = createAsyncThunk<
	string, // Return deleted student ID
	{ studentId: string; corporateId: string }, // corporateId might be needed for logging/context
	{ rejectValue: string }
>(
	"corporate/deleteManagedStudent",
	async ({ studentId /*, corporateId */ }, { rejectWithValue }) => {
		try {
			// Endpoint: DELETE /corporate/students/{studentId}
			// Assumes this is the correct endpoint for manager deletion in both mock and live
			const endpoint = `/corporate/students/${studentId}`;
			console.log(`Calling API: DELETE ${endpoint}`);

			await del<void>(endpoint); // Expecting 204 No Content or similar
			return studentId; // Return ID for reducer to filter the list
		} catch (error: any) {
			console.error(`Error deleting managed student ${studentId}:`, error);
			return rejectWithValue(error.message || "Failed to remove student");
		}
	}
);

// Find student in existing auth.users list and set as current (No API Call)
export const findAndSetCurrentManagedStudent = createAsyncThunk<
	StudentUser | null,
	string,
	{ state: RootState; rejectValue: string }
>(
	"corporate/findAndSetCurrentManagedStudent",
	async (studentId, { getState, rejectWithValue }) => {
		console.log(`THUNK: Attempting to find student ${studentId} in auth.users`);
		const state = getState();
		const allUsers = state.auth.users;
		const manager = state.auth.user as StudentUser; // Assuming manager has StudentUser type properties needed

		if (!manager || !manager.isCorporateManager) {
			console.warn("Action requires a corporate manager.");
			return rejectWithValue("Action requires a corporate manager.");
		}
		if (!allUsers || allUsers.length === 0) {
			console.warn("THUNK: auth.users list is empty. Cannot find student.");
			return rejectWithValue("User list not available.");
		}
		const foundUser = allUsers.find((user) => user.id === studentId);
		if (!foundUser) {
			console.log(`THUNK: Student ${studentId} not found in auth.users.`);
			return null;
		}
		if (!isStudent(foundUser)) {
			console.warn(`THUNK: User ${studentId} found, but is not a student.`);
			return rejectWithValue("User found is not a student.");
		}
		if (foundUser.corporateId !== manager.corporateId) {
			console.warn(
				`THUNK: Access denied - Manager does not manage this student.`
			);
			return rejectWithValue("Access denied: You do not manage this student.");
		}
		console.log(`THUNK: Student ${studentId} found and validated:`, foundUser);
		return foundUser;
	}
);

// --- Slice Definition ---
const corporateSlice = createSlice({
	name: "corporate",
	initialState,
	reducers: {
		clearCorporateError: (state) => {
			state.error = null;
		},
		resetOperationStatus: (state) => {
			state.operationStatus = "idle";
			state.error = null;
		},
		clearCurrentManagedStudent: (state) => {
			state.currentManagedStudent = null;
		},
	},
	extraReducers: (builder) => {
		// Fetch Managed Students
		builder
			.addCase(fetchManagedStudents.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchManagedStudents.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.managedStudents = action.payload.students;
				state.pagination = {
					currentPage: action.payload.page,
					limit: action.payload.limit,
					totalStudents: action.payload.total,
					totalPages: action.payload.totalPages,
				};
			})
			.addCase(fetchManagedStudents.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed loading students";
			});

		// Create Managed Student
		builder
			.addCase(createManagedStudent.pending, (state) => {
				state.operationStatus = "loading";
				state.error = null;
			})
			.addCase(createManagedStudent.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				state.managedStudents.unshift(action.payload);
				if (state.pagination) state.pagination.totalStudents++;
			})
			.addCase(createManagedStudent.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to create student";
			});

		// Update Managed Student
		builder
			.addCase(updateManagedStudent.pending, (state) => {
				state.operationStatus = "loading";
				state.error = null;
			})
			.addCase(updateManagedStudent.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				const index = state.managedStudents.findIndex(
					(s) => s.id === action.payload.id
				);
				if (index !== -1) state.managedStudents[index] = action.payload;
				if (state.currentManagedStudent?.id === action.payload.id)
					state.currentManagedStudent = action.payload;
			})
			.addCase(updateManagedStudent.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to update student";
			});

		// Delete Managed Student
		builder
			.addCase(deleteManagedStudent.pending, (state) => {
				state.operationStatus = "loading";
				state.error = null;
			})
			.addCase(deleteManagedStudent.fulfilled, (state, action) => {
				// action.payload is studentId
				state.operationStatus = "succeeded";
				state.managedStudents = state.managedStudents.filter(
					(s) => s.id !== action.payload
				);
				if (state.pagination) state.pagination.totalStudents--;
				if (state.currentManagedStudent?.id === action.payload)
					state.currentManagedStudent = null;
			})
			.addCase(deleteManagedStudent.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to remove student";
			});

		// Find and Set Current Managed Student
		builder
			.addCase(findAndSetCurrentManagedStudent.pending, (state) => {
				state.status = "loading";
				state.currentManagedStudent = null;
				state.error = null;
			})
			.addCase(findAndSetCurrentManagedStudent.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.currentManagedStudent = action.payload; // Payload is StudentUser | null
				state.error = null;
			})
			.addCase(findAndSetCurrentManagedStudent.rejected, (state, action) => {
				state.status = "failed";
				state.currentManagedStudent = null;
				state.error =
					action.payload ?? "Failed to get student details from list.";
			});
	},
});

// --- Actions & Selectors ---
export const {
	clearCorporateError,
	resetOperationStatus,
	clearCurrentManagedStudent,
} = corporateSlice.actions;

export const selectManagedStudents = (state: RootState) =>
	state.corporate.managedStudents;
export const selectCurrentManagedStudent = (state: RootState) =>
	state.corporate.currentManagedStudent;
export const selectCorporateStatus = (state: RootState) =>
	state.corporate.status;
export const selectCorporateOperationStatus = (state: RootState) =>
	state.corporate.operationStatus;
export const selectCorporateError = (state: RootState) => state.corporate.error;
export const selectCorporatePagination = (state: RootState) =>
	state.corporate.pagination;

export default corporateSlice.reducer;
