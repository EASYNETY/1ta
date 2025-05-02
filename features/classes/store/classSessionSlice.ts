// features/classes/store/classSessionSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CourseClass = {
	id: string;
	courseName: string;
	sessionName: string;
};

const initialState: CourseClass = {
	id: "",
	courseName: "",
	sessionName: "",
};

const classSessionSlice = createSlice({
	name: "classSession",
	initialState,
	reducers: {
		setCourseClass: (state, action: PayloadAction<CourseClass>) => {
			return action.payload ?? null;
		},
	},
});

export const { setCourseClass } = classSessionSlice.actions;
export const selectCourseClass = (state: { classSession: CourseClass }) =>
	state.classSession;
export default classSessionSlice.reducer;
