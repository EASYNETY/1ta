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

// --- Mock Imports ---
import {
	getMockGradeItemsForCourse,
	getMockGradeItemsForStudent,
	getMockGradeItemById,
	createMockGradeItem,
	updateMockGradeItem,
	deleteMockGradeItem,
	getMockStudentGradesForGradeItem,
	assignMockGrade,
	updateMockGrade,
	getMockCourseGrades,
	calculateMockCourseGrades,
	getMockStudentGradeById,
} from "@/data/mock-grade-data";

// --- Thunks ---

// Fetch grade items (adapt based on role needs)
export const fetchGradeItems = createAsyncThunk<
	GradeItem[] | StudentGradeItemView[] | TeacherGradeItemView[],
	{
		role: string;
		userId?: string;
		courseId?: string;
		classId?: string;
	},
	{ rejectValue: string }
>(
	"grades/fetchList",
	async ({ role, userId, courseId, classId }, { rejectWithValue }) => {
		try {
			if (role === "student" && userId) {
				return await getMockGradeItemsForStudent(userId, courseId);
			} else if (role === "teacher" || role === "admin") {
				return await getMockGradeItemsForCourse(courseId, classId);
			}
			return [];
		} catch (e: any) {
			return rejectWithValue(e.message);
		}
	}
);

export const fetchGradeItemById = createAsyncThunk<
	GradeItem | StudentGradeItemView | TeacherGradeItemView,
	{ gradeItemId: string; role: string; userId?: string },
	{ rejectValue: string }
>(
	"grades/fetchById",
	async ({ gradeItemId, role, userId }, { rejectWithValue }) => {
		try {
			return await getMockGradeItemById(gradeItemId, role, userId);
		} catch (e: any) {
			return rejectWithValue(e.message);
		}
	}
);

export const createGradeItem = createAsyncThunk<
	GradeItem,
	CreateGradeItemPayload,
	{ rejectValue: string }
>("grades/create", async (payload, { rejectWithValue }) => {
	try {
		return await createMockGradeItem(payload);
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

export const updateGradeItem = createAsyncThunk<
	GradeItem,
	UpdateGradeItemPayload,
	{ rejectValue: string }
>("grades/update", async ({ gradeItemId, gradeItem }, { rejectWithValue }) => {
	try {
		return await updateMockGradeItem(gradeItemId, gradeItem);
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

export const deleteGradeItem = createAsyncThunk<
	string,
	string,
	{ rejectValue: string }
>("grades/delete", async (gradeItemId, { rejectWithValue }) => {
	try {
		await deleteMockGradeItem(gradeItemId);
		return gradeItemId;
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

// Fetch student grades for a grade item (Teacher/Admin)
export const fetchStudentGrades = createAsyncThunk<
	StudentGrade[],
	string,
	{ rejectValue: string }
>("grades/fetchStudentGrades", async (gradeItemId, { rejectWithValue }) => {
	try {
		return await getMockStudentGradesForGradeItem(gradeItemId);
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

// Fetch a specific student grade
export const fetchStudentGradeById = createAsyncThunk<
	StudentGrade,
	string,
	{ rejectValue: string }
>("grades/fetchStudentGradeById", async (gradeId, { rejectWithValue }) => {
	try {
		return await getMockStudentGradeById(gradeId);
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

// Assign a grade to a student
export const assignGrade = createAsyncThunk<
	StudentGrade,
	AssignGradePayload,
	{ rejectValue: string }
>("grades/assign", async (payload, { rejectWithValue }) => {
	try {
		return await assignMockGrade(payload);
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

// Update an existing grade
export const updateGrade = createAsyncThunk<
	StudentGrade,
	UpdateGradePayload,
	{ rejectValue: string }
>("grades/updateGrade", async ({ gradeId, grade }, { rejectWithValue }) => {
	try {
		return await updateMockGrade(gradeId, grade);
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

// Fetch course grades
export const fetchCourseGrades = createAsyncThunk<
	CourseGrade[],
	{ courseId: string; classId?: string; studentId?: string },
	{ rejectValue: string }
>(
	"grades/fetchCourseGrades",
	async ({ courseId, classId, studentId }, { rejectWithValue }) => {
		try {
			return await getMockCourseGrades(courseId, classId, studentId);
		} catch (e: any) {
			return rejectWithValue(e.message);
		}
	}
);

// Calculate course grades
export const calculateCourseGrades = createAsyncThunk<
	CourseGrade[],
	CalculateCourseGradesPayload,
	{ rejectValue: string }
>("grades/calculateCourseGrades", async (payload, { rejectWithValue }) => {
	try {
		return await calculateMockCourseGrades(payload);
	} catch (e: any) {
		return rejectWithValue(e.message);
	}
});

// --- Initial State ---
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
			state.studentGrades = [];
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
				if (action.payload.length > 0 && "grade" in action.payload[0]) {
					state.studentGradeItems = action.payload as StudentGradeItemView[];
				} else {
					state.gradeItems = action.payload as GradeItem[];
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
			})
			.addCase(fetchGradeItemById.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.currentGradeItem = action.payload;
			})
			.addCase(fetchGradeItemById.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch grade item";
			});

		// Create Grade Item
		builder
			.addCase(createGradeItem.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(createGradeItem.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				state.gradeItems.unshift(action.payload);
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
				const index = state.gradeItems.findIndex(
					(item) => item.id === action.payload.id
				);
				if (index !== -1) state.gradeItems[index] = action.payload;

				const studentIndex = state.studentGradeItems.findIndex(
					(item) => item.id === action.payload.id
				);
				if (studentIndex !== -1)
					state.studentGradeItems[studentIndex] = {
						...state.studentGradeItems[studentIndex],
						...action.payload,
					};

				if (state.currentGradeItem?.id === action.payload.id)
					state.currentGradeItem = action.payload;
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
				state.operationStatus = "succeeded";
				state.gradeItems = state.gradeItems.filter(
					(item) => item.id !== action.payload
				);
				state.studentGradeItems = state.studentGradeItems.filter(
					(item) => item.id !== action.payload
				);
				if (state.currentGradeItem?.id === action.payload)
					state.currentGradeItem = null;
			})
			.addCase(deleteGradeItem.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to delete grade item";
			});

		// Fetch Student Grades
		builder
			.addCase(fetchStudentGrades.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchStudentGrades.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.studentGrades = action.payload;
			})
			.addCase(fetchStudentGrades.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch student grades";
			});

		// Fetch Student Grade By ID
		builder
			.addCase(fetchStudentGradeById.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchStudentGradeById.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.currentGrade = action.payload;
			})
			.addCase(fetchStudentGradeById.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch student grade";
			});

		// Assign Grade
		builder
			.addCase(assignGrade.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(assignGrade.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				const index = state.studentGrades.findIndex(
					(grade) => grade.id === action.payload.id
				);
				if (index !== -1) {
					state.studentGrades[index] = action.payload;
				} else {
					state.studentGrades.push(action.payload);
				}
				state.currentGrade = action.payload;
			})
			.addCase(assignGrade.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to assign grade";
			});

		// Update Grade
		builder
			.addCase(updateGrade.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(updateGrade.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				const index = state.studentGrades.findIndex(
					(grade) => grade.id === action.payload.id
				);
				if (index !== -1) state.studentGrades[index] = action.payload;
				state.currentGrade = action.payload;
			})
			.addCase(updateGrade.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to update grade";
			});

		// Fetch Course Grades
		builder
			.addCase(fetchCourseGrades.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchCourseGrades.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.courseGrades = action.payload;
			})
			.addCase(fetchCourseGrades.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Failed to fetch course grades";
			});

		// Calculate Course Grades
		builder
			.addCase(calculateCourseGrades.pending, (state) => {
				state.operationStatus = "loading";
			})
			.addCase(calculateCourseGrades.fulfilled, (state, action) => {
				state.operationStatus = "succeeded";
				state.courseGrades = action.payload;
			})
			.addCase(calculateCourseGrades.rejected, (state, action) => {
				state.operationStatus = "failed";
				state.error = action.payload ?? "Failed to calculate course grades";
			});
	},
});

// --- Actions & Selectors ---
export const {
	clearGradeError,
	resetGradeOperationStatus,
	clearCurrentGradeItem,
	clearCurrentGrade,
	setCurrentCourseGrade,
} = gradeSlice.actions;

// Selectors
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
