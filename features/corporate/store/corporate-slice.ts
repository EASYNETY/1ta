// features/corporate/store/corporate-slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { StudentUser } from "@/types/user.types"; // Use StudentUser type
import { get, post, put, del } from "@/lib/api-client"; // Import CRUD methods

// Import mock functions
// Assuming these will be added to mock-corporate-data.ts or similar
import {
	getMockManagedStudents,
	// createManagedStudent is handled by mockRegister or a modified POST /users mock
	// updateManagedStudent is handled by mockUpdateMyProfile or PUT /users/:id mock
	// deleteManagedStudent is handled by DELETE /users/:id mock
	deleteMockManagedStudent, // We might need a specific delete mock if different from general user delete
} from "@/data/mock-corporate-data"; // Adjust path

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

export const fetchManagedStudents = createAsyncThunk<
	FetchManagedStudentsResult,
	FetchManagedStudentsParams,
	{ rejectValue: string }
>("corporate/fetchManagedStudents", async (params, { rejectWithValue }) => {
	try {
		const { corporateId, page = 1, limit = 10, search = "" } = params;
		// API Call Example: const result = await get<FetchManagedStudentsResult>(`/corporate/${corporateId}/students?page=${page}&limit=${limit}&search=${search}`);
		// MOCK Call:
		const result = await getMockManagedStudents(
			corporateId,
			page,
			limit,
			search
		);
		return result;
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to fetch managed students");
	}
});

// Thunk for *Manager* creating a student. Assumes backend handles corporateId linking & slot check.
// Uses the standard '/users' or a specific '/corporate/students' endpoint. Let's use '/users' for now.
export const createManagedStudent = createAsyncThunk<
	StudentUser, // Returns the newly created student user object
	CreateManagedStudentPayload & { corporateId: string }, // Manager provides name/email, thunk adds corporateId
	{ rejectValue: string }
>("corporate/createManagedStudent", async (payload, { rejectWithValue }) => {
	try {
		console.log("Dispatching createManagedStudent:", payload);
		// The backend's POST /users needs to handle the corporate context
		// It receives name, email, (maybe password), and the *manager's* corporateId
		// It should check slots for that corporateId before creating.
		const response = await post<StudentUser>("/users", payload); // Backend assigns role, corpId, etc.
		return response;
	} catch (error: any) {
		return rejectWithValue(error.message || "Failed to create student");
	}
});

// Thunk for *Manager* updating a student they manage.
// Uses the standard '/users/:id' endpoint, but backend must verify manager's permission.
export const updateManagedStudent = createAsyncThunk<
	StudentUser,
	UpdateManagedStudentPayload,
	{ rejectValue: string }
>(
	"corporate/updateManagedStudent",
	async ({ id, ...updateData }, { rejectWithValue }) => {
		try {
			console.log(`Dispatching updateManagedStudent for ${id}:`, updateData);
			// Backend PUT /users/:id needs to verify the requesting user (manager) has rights over student 'id'
			const response = await put<StudentUser>(`/users/${id}`, updateData); // Send only allowed fields
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message || "Failed to update student");
		}
	}
);

// Thunk for *Manager* deleting/removing a student they manage.
// Uses standard '/users/:id', backend must verify permission & handle slot freeing.
export const deleteManagedStudent = createAsyncThunk<
	string, // Return deleted student ID
	{ studentId: string; corporateId: string }, // Need studentId to delete, corporateId for context/logging?
	{ rejectValue: string }
>(
	"corporate/deleteManagedStudent",
	async ({ studentId }, { rejectWithValue }) => {
		try {
			console.log(`Dispatching deleteManagedStudent for ${studentId}`);
			// Backend DELETE /users/:id needs permission check
			await del<void>(`/users/${studentId}`);
			// MOCK call simulation:
			await deleteMockManagedStudent(studentId); // Assuming a specific mock for this
			return studentId;
		} catch (error: any) {
			return rejectWithValue(error.message || "Failed to remove student");
		}
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
				state.managedStudents.unshift(action.payload); // Add to list
				// Optionally update pagination total
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
				state.operationStatus = "succeeded";
				state.managedStudents = state.managedStudents.filter(
					(s) => s.id !== action.payload
				);
				// Optionally update pagination total
				if (state.pagination) state.pagination.totalStudents--;
				if (state.currentManagedStudent?.id === action.payload)
					state.currentManagedStudent = null;
			})
			.addCase(deleteManagedStudent.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to remove student";
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
