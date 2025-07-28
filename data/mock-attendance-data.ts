// data/mock-attendance-data.ts
import { format } from 'date-fns';

// Get today's date in YYYY-MM-DD format
export const TODAY = format(new Date(), 'yyyy-MM-dd');

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

// Backend API response format
export interface AttendanceRecord {
	id: string;
	date: string;
	status: AttendanceStatus;
	notes?: string;
	student: {
		id: string;
		name: string;
		email?: string;
	};
	classId: string;
	className: string;
	markedBy: string;
}

// New backend format
export interface BackendAttendanceResponse {
	records: AttendanceRecord[];
	courseId: string;
	totalCount: number;
}

// Original format
export interface TeacherAttendanceResponse {
	courseClassId: string;
	classId: string;
	courseTitle: string;
	totalStudents: number;
	dailyAttendances: DailyAttendance[];
	// New backend format fields
	records?: AttendanceRecord[];
	courseId?: string;
	totalCount?: number;
}

export interface AdminAttendanceResponse {
	courseClassId: string;
	courseTitle: string;
	totalStudents: number;
	dailyAttendances: DailyAttendance[];
}

// Mock attendance data for students (per student)
export const mockStudentAttendance: Record<string, StudentAttendanceRecord[]> =
	{
		"student_1": [
			// Always include today's date at the top
			{ date: TODAY, status: "present" },
			// Historical data
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
		"student_2": [
			// Always include today's date at the top
			{ date: TODAY, status: "late" },
			// Historical data
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
		// Add more students with today's attendance
		"student_3": [
			{ date: TODAY, status: "present" },
			{ date: "2023-12-19", status: "present" },
			{ date: "2023-12-20", status: "absent" },
		],
		"student_4": [
			{ date: TODAY, status: "absent" },
			{ date: "2023-12-19", status: "late" },
			{ date: "2023-12-20", status: "present" },
		],
	};
// Mock attendance data for teacher's class
export const mockClassAttendance: TeacherAttendanceResponse[] = [
	{
		courseClassId: "ccs_1_morn",
		classId: "ccs_1_morn",
		courseTitle: "Web Development Bootcamp",
		totalStudents: 45,
		dailyAttendances: [
			// Always include today's attendance at the top
			{
				date: TODAY,
				courseClassId: "ccs_1_morn",
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
			// Historical data
			{
				date: "2023-12-19",
				courseClassId: "ccs_1_morn",
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
		courseClassId: "ccs_1_aft",
		classId: "ccs_1_aft",
		courseTitle: "Web Development Bootcamp",
		totalStudents: 45,
		dailyAttendances: [
			// Always include today's attendance at the top
			{
				date: TODAY,
				courseClassId: "ccs_1_aft",
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
			// Historical data
			{
				date: "2023-12-19",
				courseClassId: "ccs_1_aft",
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
	// Add a new class with today's attendance
	{
		courseClassId: "ccs_2_morn",
		classId: "ccs_2_morn",
		courseTitle: "Advanced JavaScript",
		totalStudents: 30,
		dailyAttendances: [
			{
				date: TODAY,
				courseClassId: "ccs_2_morn",
				attendances: [
					{ studentId: "student_1", name: "Alex Johnson", status: "present" },
					{ studentId: "student_2", name: "Maria Garcia", status: "late" },
					{ studentId: "student_3", name: "James Wilson", status: "present" },
					{ studentId: "student_4", name: "Sophia Lee", status: "absent" },
					{ studentId: "11", name: "Daniel Martinez", status: "present" },
					{ studentId: "12", name: "Olivia Brown", status: "present" },
				],
			}
		],
	},
];
