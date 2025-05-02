// data/mock-attendance-data.ts

// Attendance status type
export type AttendanceStatus = "present" | "absent" | "late";

// Interface for individual student attendance
export interface StudentAttendance {
	studentId: string;
	name: string;
	status: AttendanceStatus;
	time?: string; // Optional time field for more detailed attendance
}

// Interface for daily attendance (used for a teacher's class)
export interface DailyAttendance {
	date: string; // Format: YYYY-MM-DD
	courseClassId: string;
	attendances: StudentAttendance[];
}

// Interface for student-specific attendance (for fetching by student ID)
export interface StudentAttendanceRecord {
	date: string;
	status: AttendanceStatus;
}

// Interface for course attendance (for fetching by teacher)
export interface TeacherAttendanceRecord {
	date: string;
	courseTitle: string;
	totalStudents: number;
	present: number;
	absent: number;
	late: number;
	students: StudentAttendance[];
}

// API Responses
export interface StudentAttendanceResponse {
	studentId: string;
	attendances: StudentAttendanceRecord[];
}

export interface TeacherAttendanceResponse {
	courseClassId: string;
    courseTitle: string;
    totalStudents: number;
	dailyAttendances: DailyAttendance[];
}

export interface AdminAttendanceResponse {
	courseClassId: string;
	courseTitle: string;
	totalStudents: number;
	dailyAttendances: DailyAttendance[];
}

// Mock attendance data for students (per student)
export const mockStudentAttendance: Record<string, StudentAttendanceRecord[]> = {
	stu1: [
		{ date: "2023-12-01", status: "present" },
		{ date: "2023-12-02", status: "present" },
		{ date: "2023-12-05", status: "present" },
		{ date: "2023-12-06", status: "present" },
		{ date: "2023-12-07", status: "present" },
		{ date: "2023-12-08", status: "late" },
		{ date: "2023-12-09", status: "present" },
		{ date: "2023-12-12", status: "absent" },
		{ date: "2023-12-13", status: "present" },
		{ date: "2023-12-14", status: "present" },
		{ date: "2023-12-15", status: "present" },
		{ date: "2023-12-16", status: "present" },
		{ date: "2023-12-19", status: "present" },
		{ date: "2023-12-20", status: "present" },
	],
	stu2: [
		{ date: "2023-12-01", status: "absent" },
		{ date: "2023-12-02", status: "late" },
		{ date: "2023-12-05", status: "present" },
		{ date: "2023-12-06", status: "absent" },
		{ date: "2023-12-07", status: "late" },
		{ date: "2023-12-08", status: "present" },
		{ date: "2023-12-09", status: "absent" },
		{ date: "2023-12-12", status: "present" },
		{ date: "2023-12-13", status: "late" },
		{ date: "2023-12-14", status: "present" },
		{ date: "2023-12-15", status: "present" },
		{ date: "2023-12-16", status: "present" },
		{ date: "2023-12-19", status: "present" },
		{ date: "2023-12-20", status: "present" },
	],
};

// Mock attendance data for teacher's class
export const mockClassAttendance: TeacherAttendanceResponse[] = [
	{
		courseClassId: "webDevBootcamp",
		courseTitle: "Web Development Bootcamp",
		totalStudents: 45,
		dailyAttendances: [
			{
				date: "2023-12-20",
				courseClassId: "webDevBootcamp",
				attendances: [
					{ studentId: "1", name: "John Smith", status: "present" },
					{ studentId: "2", name: "Jane Doe", status: "present" },
					{ studentId: "3", name: "Michael Johnson", status: "absent" },
					{ studentId: "4", name: "Emily Williams", status: "present" },
					{ studentId: "5", name: "David Brown", status: "present" },
					{ studentId: "6", name: "Sarah Miller", status: "late" },
					{ studentId: "7", name: "Robert Wilson", status: "present" },
					{ studentId: "8", name: "Jennifer Moore", status: "present" },
					{ studentId: "9", name: "William Taylor", status: "absent" },
					{ studentId: "10", name: "Elizabeth Anderson", status: "present" },
				],
			},
		],
	},
	{
		courseClassId: "webDevBootcamp",
		courseTitle: "Web Development Bootcamp",
		totalStudents: 45,
		dailyAttendances: [
			{
				date: "2023-12-19",
				courseClassId: "webDevBootcamp",
				attendances: [
					{ studentId: "1", name: "John Smith", status: "present" },
					{ studentId: "2", name: "Jane Doe", status: "present" },
					{ studentId: "3", name: "Michael Johnson", status: "present" },
					{ studentId: "4", name: "Emily Williams", status: "absent" },
					{ studentId: "5", name: "David Brown", status: "present" },
					{ studentId: "6", name: "Sarah Miller", status: "late" },
					{ studentId: "7", name: "Robert Wilson", status: "present" },
					{ studentId: "8", name: "Jennifer Moore", status: "present" },
					{ studentId: "9", name: "William Taylor", status: "absent" },
					{ studentId: "10", name: "Elizabeth Anderson", status: "late" },
				],
			},
		],
	},
];
