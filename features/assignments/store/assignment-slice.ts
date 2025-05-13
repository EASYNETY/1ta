import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
	Assignment,
	AssignmentSubmission,
	TeacherAssignmentView,
	StudentAssignmentView,
	AssignmentState,
	UpdateAssignmentPayload,
	CreateAssignmentPayload,
	GradeSubmissionPayload,
	SubmitAssignmentPayload,
} from "../types/assignment-types"; // Adjust path
import { get, post, put, del } from "@/lib/api-client"; // Import CRUD methods

// --- Thunks ---

// Fetch assignments (adapt based on role needs)
export const fetchAssignments = createAsyncThunk<
	Assignment[] | StudentAssignmentView[] | TeacherAssignmentView[], // Return type depends on fetch context
	{
		role: string;
		userId?: string;
		courseId?: string;
		classId?: string /* filters? */;
	},
	{ rejectValue: string }
>(
	"assignments/fetchList",
	async ({ role, userId, courseId, classId }, { rejectWithValue }) => {
		try {
			// Construct query parameters
			const params = new URLSearchParams();
			params.append("role", role);
			if (userId) params.append("userId", userId);
			if (courseId) params.append("courseId", courseId);
			if (classId) params.append("classId", classId);
			
			// API call based on role
			if (role === "student" && userId) {
				// API: GET /assignments?role=student&userId=...
				return await get<StudentAssignmentView[]>(`/assignments?${params.toString()}`);
			} else if (role === "teacher" || role === "admin") {
				// API: GET /assignments?role=teacher&courseId=...&classId=...
				return await get<TeacherAssignmentView[]>(`/assignments?${params.toString()}`);
			}
			return []; // Default empty
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to fetch assignments");
		}
	}
);

export const fetchAssignmentById = createAsyncThunk<
	Assignment | StudentAssignmentView | TeacherAssignmentView, // Return appropriate type
	{ assignmentId: string; role: string; userId?: string },
	{ rejectValue: string }
>(
	"assignments/fetchById",
	async ({ assignmentId, role, userId }, { rejectWithValue }) => {
		try {
			// Construct query parameters
			const params = new URLSearchParams();
			params.append("role", role);
			if (userId) params.append("userId", userId);
			
			// API Call: GET /assignments/{assignmentId}?role=...&userId=...
			return await get<Assignment | StudentAssignmentView | TeacherAssignmentView>(
				`/assignments/${assignmentId}?${params.toString()}`
			);
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to fetch assignment");
		}
	}
);

export const createAssignment = createAsyncThunk<
	Assignment,
	CreateAssignmentPayload,
	{ rejectValue: string }
>("assignments/create", async (payload, { rejectWithValue }) => {
	try {
		// API Call: POST /assignments
		return await post<Assignment>("/assignments", payload);
	} catch (e: any) {
		return rejectWithValue(e.message || "Failed to create assignment");
	}
});

export const updateAssignment = createAsyncThunk<
	Assignment,
	UpdateAssignmentPayload, // Argument type is { assignmentId: string, assignment: Partial<...> }
	{ rejectValue: string }
>(
	"assignments/update",
	async ({ assignmentId, assignment }, { rejectWithValue }) => {
		try {
			// API Call: PUT /assignments/{assignmentId}
			return await put<Assignment>(`/assignments/${assignmentId}`, assignment);
		} catch (e: any) {
			return rejectWithValue(e.message || "Failed to update assignment");
		}
	}
);

export const deleteAssignment = createAsyncThunk<
	string,
	string,
	{ rejectValue: string }
>("assignments/delete", async (assignmentId, { rejectWithValue }) => {
	try {
		// API Call: DELETE /assignments/{assignmentId}
		await del(`/assignments/${assignmentId}`);
		return assignmentId;
	} catch (e: any) {
		return rejectWithValue(e.message || "Failed to delete assignment");
	}
});

// Student Submission
export const submitAssignment = createAsyncThunk<
	AssignmentSubmission,
	SubmitAssignmentPayload,
	{ rejectValue: string }
>("assignments/submit", async (payload, { rejectWithValue }) => {
	try {
		// API Call: POST /assignments/{assignmentId}/submissions
		return await post<AssignmentSubmission>(`/assignments/${payload.assignmentId}/submissions`, payload);
	} catch (e: any) {
		return rejectWithValue(e.message || "Failed to submit assignment");
	}
});

// Fetch Submissions for an Assignment (Teacher/Admin)
export const fetchSubmissions = createAsyncThunk<
	AssignmentSubmission[],
	string /* assignmentId */,
	{ rejectValue: string }
>("assignments/fetchSubmissions", async (assignmentId, { rejectWithValue }) => {
	try {
		// API Call: GET /assignments/{assignmentId}/submissions
		return await get<AssignmentSubmission[]>(`/assignments/${assignmentId}/submissions`);
	} catch (e: any) {
		return rejectWithValue(e.message || "Failed to fetch submissions");
	}
});

// Grade a Submission (Teacher/Admin)
export const gradeSubmission = createAsyncThunk<
	AssignmentSubmission,
	GradeSubmissionPayload,
	{ rejectValue: string }
>("assignments/grade", async (payload, { rejectWithValue }) => {
	try {
		// API Call: PUT /submissions/{submissionId}/grade
		return await put<AssignmentSubmission>(`/submissions/${payload.submissionId}/grade`, payload);
	} catch (e: any) {
		return rejectWithValue(e.message || "Failed to grade submission");
	}
});

// --- Initial State ---
const initialState: AssignmentState = {
	assignments: [],
	studentAssignments: [],
	currentAssignment: null,
	currentSubmissions: [],
	currentSubmission: null,
	status: "idle",
	operationStatus: "idle",
	error: null,
};

// --- Slice ---
const assignmentSlice = createSlice({
	name: "assignments",
	initialState,
	reducers: {
		clearAssignmentError: (state) => {
			state.error = null;
		},
		resetAssignmentOperationStatus: (state) => {
			state.operationStatus = "idle";
			state.error = null;
		},
		clearCurrentAssignment: (state) => {
			state.currentAssignment = null;
			state.currentSubmissions = [];
			state.currentSubmission = null;
		},
		clearCurrentSubmission: (state) => {
			state.currentSubmission = null;
		},
	},
	extraReducers: (builder) => {
		// Fetch List
		builder
			.addCase(fetchAssignments.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchAssignments.fulfilled, (state, action) => {
				state.status = "succeeded";
				// Distinguish based on payload type or context if needed
				if (action.payload.length > 0 && "submission" in action.payload[0]) {
					// Rough check for StudentAssignmentView
					state.studentAssignments = action.payload as StudentAssignmentView[];
				} else {
					state.assignments = action.payload as Assignment[]; // For teacher/admin list
				}
				state.error = null;
			})
			.addCase(fetchAssignments.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch assignments";
			});

		// Fetch By ID
		builder
			.addCase(fetchAssignmentById.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchAssignmentById.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.currentAssignment = action.payload;
			})
			.addCase(fetchAssignmentById.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch assignment";
			});

		// Create
		builder
			.addCase(createAssignment.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(createAssignment.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				state.assignments.unshift(action.payload);
			})
			.addCase(createAssignment.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to create assignment";
			});

		// Update
		builder
			.addCase(updateAssignment.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(updateAssignment.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				const index = state.assignments.findIndex(
					(a) => a.id === action.payload.id
				);
				if (index !== -1) state.assignments[index] = action.payload;
				// Update student view if needed
				const studentIndex = state.studentAssignments.findIndex(
					(a) => a.id === action.payload.id
				);
				if (studentIndex !== -1)
					state.studentAssignments[studentIndex] = {
						...state.studentAssignments[studentIndex],
						...action.payload,
					};
				if (state.currentAssignment?.id === action.payload.id)
					state.currentAssignment = action.payload;
			})
			.addCase(updateAssignment.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to update assignment";
			});

		// Delete
		builder
			.addCase(deleteAssignment.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(deleteAssignment.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				state.assignments = state.assignments.filter(
					(a) => a.id !== action.payload
				);
				state.studentAssignments = state.studentAssignments.filter(
					(a) => a.id !== action.payload
				);
				if (state.currentAssignment?.id === action.payload)
					state.currentAssignment = null;
			})
			.addCase(deleteAssignment.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to delete assignment";
			});

		// Submit Assignment (Student)
		builder
			.addCase(submitAssignment.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(submitAssignment.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				// Update the specific student assignment view
				const index = state.studentAssignments.findIndex(
					(a) => a.id === action.payload.assignmentId
				);
				if (index !== -1)
					state.studentAssignments[index].submission = action.payload;
				// Update current assignment if viewing
				if (
					state.currentAssignment &&
					"submission" in state.currentAssignment &&
					state.currentAssignment.id === action.payload.assignmentId
				) {
					(state.currentAssignment as StudentAssignmentView).submission =
						action.payload;
				}
			})
			.addCase(submitAssignment.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to submit assignment";
			});

		// Fetch Submissions (Teacher/Admin)
		builder
			.addCase(fetchSubmissions.pending, (state) => {
				state.status = "loading";
			}) // Reuse main status
			.addCase(fetchSubmissions.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.currentSubmissions = action.payload;
			})
			.addCase(fetchSubmissions.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch submissions";
			});

		// Grade Submission (Teacher/Admin)
		builder
			.addCase(gradeSubmission.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(gradeSubmission.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				// Update the specific submission in the currentSubmissions list
				const index = state.currentSubmissions.findIndex(
					(s) => s.id === action.payload.id
				);
				if (index !== -1) state.currentSubmissions[index] = action.payload;
				// If viewing this specific submission, update it too
				if (state.currentSubmission?.id === action.payload.id)
					state.currentSubmission = action.payload;
				// TODO: Optionally update counts in TeacherAssignmentView in state.assignments
			})
			.addCase(gradeSubmission.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to grade submission";
			});
	},
});

// --- Actions & Selectors ---
export const {
	clearAssignmentError,
	resetAssignmentOperationStatus,
	clearCurrentAssignment,
	clearCurrentSubmission,
} = assignmentSlice.actions;

// Selectors
export const selectAllAssignments = (state: RootState) =>
	state.assignments.assignments;
export const selectStudentAssignments = (state: RootState) =>
	state.assignments.studentAssignments;
export const selectCurrentAssignment = (state: RootState) =>
	state.assignments.currentAssignment;
export const selectCurrentSubmissions = (state: RootState) =>
	state.assignments.currentSubmissions;
export const selectCurrentSubmission = (state: RootState) =>
	state.assignments.currentSubmission;
export const selectAssignmentStatus = (state: RootState) =>
	state.assignments.status;
export const selectAssignmentOperationStatus = (state: RootState) =>
	state.assignments.operationStatus;
export const selectAssignmentError = (state: RootState) =>
	state.assignments.error;

export default assignmentSlice.reducer;
