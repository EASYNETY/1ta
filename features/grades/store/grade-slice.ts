// features/grades/store/grade-slice.ts
import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
	GradeItem,
	StudentGrade,
	CourseGrade,
	TeacherGradeItemView,
	StudentGradeItemView,
	GradeState,
	CreateGradeItemPayload,
	UpdateGradeItemPayload,
	AssignGradePayload,
	UpdateGradePayload,
	CalculateCourseGradesPayload,
} from "../types/grade-types";

// --- Import API Client Helpers ---
import { get, post, put, del } from "@/lib/api-client";

// --- Thunks ---

// Simple fetchGrades function for dashboard
export const fetchGrades = createAsyncThunk<
    void,
    void,
    { rejectValue: string }
>("grades/fetchGrades", async (_, { dispatch, rejectWithValue }) => {
    try {
        // Call the more specific fetchGradeItems function with default parameters
        await dispatch(fetchGradeItems({ role: 'student' }));
    } catch (error: any) {
        console.error("Error fetching grades:", error);
        return rejectWithValue(error.message || "Failed to fetch grades");
    }
});

// Fetch grade items (Backend needs to determine response type based on user role/context)
export const fetchGradeItems = createAsyncThunk<
	GradeItem[] | StudentGradeItemView[] | TeacherGradeItemView[], // Return type remains flexible
	{
		role: string; // Hint for backend, but backend should rely on auth token primarily
		userId?: string; // Needed if role is student
		courseId?: string;
		classId?: string;
	},
	{ rejectValue: string }
>(
	"grades/fetchList",
	async ({ role, userId, courseId, classId }, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			// Add params ONLY if they have values. Backend should handle context.
			if (role) params.set("role", role); // Optional hint
			if (userId) params.set("userId", userId);
			if (courseId) params.set("courseId", courseId);
			if (classId) params.set("classId", classId);

			// Assumed Endpoint: GET /grade-items?courseId=...&classId=...&userId=...
			const endpoint = `/grade-items?${params.toString()}`;
			console.log(`Calling API: GET ${endpoint}`);

			// The actual response type depends on backend logic based on the user's role (from token)
			const response = await get<
				GradeItem[] | StudentGradeItemView[] | TeacherGradeItemView[]
			>(endpoint);
			return response;
		} catch (error: any) {
			console.error("Error fetching grade items:", error);
			return rejectWithValue(error.message || "Failed to fetch grade items");
		}
	}
);

// Fetch a specific grade item (Backend determines view based on role)
export const fetchGradeItemById = createAsyncThunk<
	GradeItem | StudentGradeItemView | TeacherGradeItemView, // Return type remains flexible
	{ gradeItemId: string; role: string; userId?: string }, // role/userId might be hints or used for query params
	{ rejectValue: string }
>(
	"grades/fetchById",
	async ({ gradeItemId, role, userId }, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			// Pass context hints if needed by the backend for authorization/view type
			params.set("role", role);
			if (userId) params.set("userId", userId);

			// Assumed Endpoint: GET /grade-items/{gradeItemId}?role=...&userId=...
			const endpoint = `/grade-items/${gradeItemId}?${params.toString()}`;
			console.log(`Calling API: GET ${endpoint}`);

			const response = await get<
				GradeItem | StudentGradeItemView | TeacherGradeItemView
			>(endpoint);
			return response;
		} catch (error: any) {
			console.error(`Error fetching grade item ${gradeItemId}:`, error);
			return rejectWithValue(error.message || "Failed to fetch grade item");
		}
	}
);

// Create a grade item
export const createGradeItem = createAsyncThunk<
	GradeItem,
	CreateGradeItemPayload, // Payload contains { gradeItem: {...} }
	{ rejectValue: string }
>("grades/create", async (payload, { rejectWithValue }) => {
	try {
		// Assumed Endpoint: POST /grade-items
		const endpoint = "/grade-items";
		console.log(`Calling API: POST ${endpoint}`, payload.gradeItem);

		// Send only the gradeItem data in the body
		const response = await post<GradeItem>(endpoint, payload.gradeItem);
		return response;
	} catch (error: any) {
		console.error("Error creating grade item:", error);
		return rejectWithValue(error.message || "Failed to create grade item");
	}
});

// Update a grade item
export const updateGradeItem = createAsyncThunk<
	GradeItem,
	UpdateGradeItemPayload, // Payload contains { gradeItemId: string, gradeItem: Partial<GradeItem> }
	{ rejectValue: string }
>("grades/update", async ({ gradeItemId, gradeItem }, { rejectWithValue }) => {
	try {
		// Assumed Endpoint: PUT /grade-items/{gradeItemId}
		const endpoint = `/grade-items/${gradeItemId}`;
		console.log(`Calling API: PUT ${endpoint}`, gradeItem);

		// Send only the partial update data in the body
		const response = await put<GradeItem>(endpoint, gradeItem);
		return response;
	} catch (error: any) {
		console.error(`Error updating grade item ${gradeItemId}:`, error);
		return rejectWithValue(error.message || "Failed to update grade item");
	}
});

// Delete a grade item
export const deleteGradeItem = createAsyncThunk<
	string, // Return the ID on success for the reducer
	string, // Argument is gradeItemId
	{ rejectValue: string }
>("grades/delete", async (gradeItemId, { rejectWithValue }) => {
	try {
		// Assumed Endpoint: DELETE /grade-items/{gradeItemId}
		const endpoint = `/grade-items/${gradeItemId}`;
		console.log(`Calling API: DELETE ${endpoint}`);

		// Expecting 204 No Content or similar success response
		await del<void>(endpoint);
		return gradeItemId; // Return the ID for the reducer
	} catch (error: any) {
		console.error(`Error deleting grade item ${gradeItemId}:`, error);
		return rejectWithValue(error.message || "Failed to delete grade item");
	}
});

// Fetch student grades for a specific grade item (Teacher/Admin view)
export const fetchStudentGrades = createAsyncThunk<
	StudentGrade[],
	string, // Argument is gradeItemId
	{ rejectValue: string }
>("grades/fetchStudentGrades", async (gradeItemId, { rejectWithValue }) => {
	try {
		// Assumed Endpoint: GET /grade-items/{gradeItemId}/grades
		const endpoint = `/grade-items/${gradeItemId}/grades`;
		console.log(`Calling API: GET ${endpoint}`);

		const response = await get<StudentGrade[]>(endpoint);
		return response;
	} catch (error: any) {
		console.error(
			`Error fetching student grades for item ${gradeItemId}:`,
			error
		);
		return rejectWithValue(error.message || "Failed to fetch student grades");
	}
});

// Fetch a specific student grade by its own ID
export const fetchStudentGradeById = createAsyncThunk<
	StudentGrade,
	string, // Argument is gradeId (the ID of the StudentGrade record)
	{ rejectValue: string }
>("grades/fetchStudentGradeById", async (gradeId, { rejectWithValue }) => {
	try {
		// Assumed Endpoint: GET /grades/{gradeId}
		const endpoint = `/grades/${gradeId}`;
		console.log(`Calling API: GET ${endpoint}`);

		const response = await get<StudentGrade>(endpoint);
		return response;
	} catch (error: any) {
		console.error(`Error fetching student grade ${gradeId}:`, error);
		return rejectWithValue(error.message || "Failed to fetch student grade");
	}
});

// Assign a grade to a student for a grade item
export const assignGrade = createAsyncThunk<
	StudentGrade,
	AssignGradePayload, // Payload contains studentId, gradeItemId, points, etc.
	{ rejectValue: string }
>("grades/assign", async (payload, { rejectWithValue }) => {
	try {
		// Assumed Endpoint: POST /grades
		const endpoint = "/grades";
		console.log(`Calling API: POST ${endpoint}`, payload);

		const response = await post<StudentGrade>(endpoint, payload);
		return response;
	} catch (error: any) {
		console.error("Error assigning grade:", error);
		return rejectWithValue(error.message || "Failed to assign grade");
	}
});

// Update an existing student grade
export const updateGrade = createAsyncThunk<
	StudentGrade,
	UpdateGradePayload, // Payload contains { gradeId: string, grade: Partial<StudentGrade> }
	{ rejectValue: string }
>("grades/updateGrade", async ({ gradeId, grade }, { rejectWithValue }) => {
	try {
		// Assumed Endpoint: PUT /grades/{gradeId}
		const endpoint = `/grades/${gradeId}`;
		console.log(`Calling API: PUT ${endpoint}`, grade);

		// Send only the partial grade update data
		const response = await put<StudentGrade>(endpoint, grade);
		return response;
	} catch (error: any) {
		console.error(`Error updating grade ${gradeId}:`, error);
		return rejectWithValue(error.message || "Failed to update grade");
	}
});

// Fetch calculated course grades
export const fetchCourseGrades = createAsyncThunk<
	CourseGrade[],
	{ courseId: string; classId?: string; studentId?: string }, // Context parameters
	{ rejectValue: string }
>(
	"grades/fetchCourseGrades",
	async ({ courseId, classId, studentId }, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			if (classId) params.set("classId", classId);
			if (studentId) params.set("studentId", studentId); // Usually for fetching a single student's overall grade

			// Assumed Endpoint: GET /courses/{courseId}/grades?classId=...&studentId=...
			const endpoint = `/courses/${courseId}/grades?${params.toString()}`;
			console.log(`Calling API: GET ${endpoint}`);

			const response = await get<CourseGrade[]>(endpoint);
			return response;
		} catch (error: any) {
			console.error(
				`Error fetching course grades for course ${courseId}:`,
				error
			);
			return rejectWithValue(error.message || "Failed to fetch course grades");
		}
	}
);

// Trigger calculation of course grades (and potentially publish)
export const calculateCourseGrades = createAsyncThunk<
	CourseGrade[], // Assuming API returns the updated/calculated course grades
	CalculateCourseGradesPayload, // Payload contains courseId, maybe classId, publishImmediately flag
	{ rejectValue: string }
>("grades/calculateCourseGrades", async (payload, { rejectWithValue }) => {
	try {
		// Assumed Endpoint: POST /courses/{courseId}/calculate-grades
		// (or PUT if it's idempotent, but POST often used for actions)
		const endpoint = `/courses/${payload.courseId}/calculate-grades`;
		console.log(`Calling API: POST ${endpoint}`, payload);

		// Send the payload which might include filters or options
		const response = await post<CourseGrade[]>(endpoint, payload);
		return response;
	} catch (error: any) {
		console.error(
			`Error calculating course grades for course ${payload.courseId}:`,
			error
		);
		return rejectWithValue(
			error.message || "Failed to calculate course grades"
		);
	}
});

// --- Initial State ---
// (Initial state remains the same)
const initialState: GradeState = {
	gradeItems: [],
	studentGradeItems: [],
	currentGradeItem: null,
	studentGrades: [],
	currentGrade: null,
	courseGrades: [],
	currentCourseGrade: null,
	status: "idle",
	operationStatus: "idle",
	error: null,
};

// --- Slice ---
// (Slice definition, reducers, and extraReducers remain exactly the same)
const gradeSlice = createSlice({
	name: "grades",
	initialState,
	reducers: {
		clearGradeError: (state) => {
			state.error = null;
		},
		resetGradeOperationStatus: (state) => {
			state.operationStatus = "idle";
			state.error = null;
		},
		clearCurrentGradeItem: (state) => {
			state.currentGradeItem = null;
			state.studentGrades = []; // Also clear related student grades
		},
		clearCurrentGrade: (state) => {
			state.currentGrade = null;
		},
		setCurrentCourseGrade: (
			state,
			action: PayloadAction<CourseGrade | null>
		) => {
			state.currentCourseGrade = action.payload;
		},
	},
	extraReducers: (builder) => {
		// Fetch Grade Items List
		builder
			.addCase(fetchGradeItems.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchGradeItems.fulfilled, (state, action) => {
				state.status = "succeeded";
				// Logic to differentiate based on payload type might be needed
				// if backend returns different structures predictably.
				// This basic check might suffice if student view *always* has 'grade'.
				if (action.payload.length > 0 && "grade" in action.payload[0]) {
					state.studentGradeItems = action.payload as StudentGradeItemView[];
				} else {
					// Could be GradeItem[] or TeacherGradeItemView[]
					state.gradeItems = action.payload as
						| GradeItem[]
						| TeacherGradeItemView[];
				}
				state.error = null;
			})
			.addCase(fetchGradeItems.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch grade items";
			});

		// Fetch Grade Item By ID
		builder
			.addCase(fetchGradeItemById.pending, (state) => {
				state.status = "loading";
				state.currentGradeItem = null; // Clear while loading
			})
			.addCase(fetchGradeItemById.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.currentGradeItem = action.payload;
			})
			.addCase(fetchGradeItemById.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch grade item";
				state.currentGradeItem = null;
			});

		// Create Grade Item
		builder
			.addCase(createGradeItem.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(createGradeItem.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				// Only add if the current view is Teacher/Admin (GradeItem[])
				if (Array.isArray(state.gradeItems)) {
					state.gradeItems.unshift(action.payload);
				}
			})
			.addCase(createGradeItem.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to create grade item";
			});

		// Update Grade Item
		builder
			.addCase(updateGradeItem.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(updateGradeItem.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				// Update in the main list (Teacher/Admin view)
				const index = state.gradeItems.findIndex(
					(item) => item.id === action.payload.id
				);
				if (index !== -1) state.gradeItems[index] = action.payload;

				// Update in the student view list if present
				const studentIndex = state.studentGradeItems.findIndex(
					(item) => item.id === action.payload.id
				);
				if (studentIndex !== -1) {
					// Merge existing student grade info with updated item info
					const existingGrade = state.studentGradeItems[studentIndex].grade;
					state.studentGradeItems[studentIndex] = {
						...action.payload, // Base updated item
						grade: existingGrade, // Keep the student's specific grade
					};
				}

				// Update the currently viewed item if it matches
				if (state.currentGradeItem?.id === action.payload.id) {
					// If currentGradeItem held student grade, preserve it
					const currentIsStudentView =
						state.currentGradeItem && "grade" in state.currentGradeItem;
					state.currentGradeItem = {
						...action.payload,
						...(currentIsStudentView && {
							grade: (state.currentGradeItem as StudentGradeItemView).grade,
						}),
					};
				}
			})
			.addCase(updateGradeItem.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to update grade item";
			});

		// Delete Grade Item
		builder
			.addCase(deleteGradeItem.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(deleteGradeItem.fulfilled, (state, action) => {
				// action.payload is gradeItemId
				state.operationStatus = "succeeded";
				state.gradeItems = state.gradeItems.filter(
					(item) => item.id !== action.payload
				);
				state.studentGradeItems = state.studentGradeItems.filter(
					(item) => item.id !== action.payload
				);
				if (state.currentGradeItem?.id === action.payload) {
					state.currentGradeItem = null;
					state.studentGrades = []; // Clear related grades if viewing this item
				}
			})
			.addCase(deleteGradeItem.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to delete grade item";
			});

		// Fetch Student Grades (for a specific grade item)
		builder
			.addCase(fetchStudentGrades.pending, (state) => {
				state.status = "loading";
				state.studentGrades = []; // Clear while loading
			})
			.addCase(fetchStudentGrades.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.studentGrades = action.payload;
			})
			.addCase(fetchStudentGrades.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch student grades";
				state.studentGrades = [];
			});

		// Fetch Student Grade By ID (a single grade record)
		builder
			.addCase(fetchStudentGradeById.pending, (state) => {
				state.status = "loading";
				state.currentGrade = null;
			})
			.addCase(fetchStudentGradeById.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.currentGrade = action.payload;
			})
			.addCase(fetchStudentGradeById.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch student grade";
				state.currentGrade = null;
			});

		// Assign Grade (Creates/Updates a specific StudentGrade)
		builder
			.addCase(assignGrade.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(assignGrade.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				// Find if the grade exists in the list currently loaded (for the grade item view)
				const index = state.studentGrades.findIndex(
					// Match by studentId AND gradeItemId (assuming grade IDs might not be stable before creation)
					(grade) =>
						grade.studentId === action.payload.studentId &&
						grade.gradeItemId === action.payload.gradeItemId
				);
				if (index !== -1) {
					state.studentGrades[index] = action.payload; // Update existing
				} else {
					// Only add if it belongs to the currently viewed gradeItem
					if (state.currentGradeItem?.id === action.payload.gradeItemId) {
						state.studentGrades.push(action.payload); // Add new
					}
				}
				// Update currentGrade only if explicitly viewing/editing THIS grade
				// state.currentGrade = action.payload; // Maybe set this only via fetchStudentGradeById
			})
			.addCase(assignGrade.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to assign grade";
			});

		// Update Grade (Updates a specific StudentGrade)
		builder
			.addCase(updateGrade.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(updateGrade.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				// Update in the list of grades for the current item
				const index = state.studentGrades.findIndex(
					(grade) => grade.id === action.payload.id
				);
				if (index !== -1) state.studentGrades[index] = action.payload;

				// Update the currently selected grade if it matches
				if (state.currentGrade?.id === action.payload.id) {
					state.currentGrade = action.payload;
				}
			})
			.addCase(updateGrade.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to update grade";
			});

		// Fetch Course Grades (Overall grades for students in a course)
		builder
			.addCase(fetchCourseGrades.pending, (state) => {
				state.status = "loading";
				state.courseGrades = [];
			})
			.addCase(fetchCourseGrades.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.courseGrades = action.payload;
			})
			.addCase(fetchCourseGrades.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch course grades";
				state.courseGrades = [];
			});

		// Calculate Course Grades (Triggers calculation, returns updated grades)
		builder
			.addCase(calculateCourseGrades.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(calculateCourseGrades.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				// Replace the existing course grades with the newly calculated ones
				state.courseGrades = action.payload;
			})
			.addCase(calculateCourseGrades.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to calculate course grades";
			});
	},
});

// --- Actions & Selectors ---
// (Actions and Selectors remain the same)
export const {
	clearGradeError,
	resetGradeOperationStatus,
	clearCurrentGradeItem,
	clearCurrentGrade,
	setCurrentCourseGrade,
} = gradeSlice.actions;

export const selectAllGradeItems = (state: RootState) =>
	state.grades.gradeItems;
export const selectStudentGradeItems = (state: RootState) =>
	state.grades.studentGradeItems;
export const selectCurrentGradeItem = (state: RootState) =>
	state.grades.currentGradeItem;
export const selectStudentGrades = (state: RootState) =>
	state.grades.studentGrades;
export const selectCurrentGrade = (state: RootState) =>
	state.grades.currentGrade;
export const selectCourseGrades = (state: RootState) =>
	state.grades.courseGrades;
export const selectCurrentCourseGrade = (state: RootState) =>
	state.grades.currentCourseGrade;
export const selectGradeStatus = (state: RootState) => state.grades.status;
export const selectGradeOperationStatus = (state: RootState) =>
	state.grades.operationStatus;
export const selectGradeError = (state: RootState) => state.grades.error;

export default gradeSlice.reducer;
