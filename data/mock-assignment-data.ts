// data/mock-assignment-data.ts
import type {
	Assignment,
	AssignmentSubmission,
	TeacherAssignmentView,
	StudentAssignmentView,
	AssignmentStatus,
	SubmissionStatus,
	CreateAssignmentPayload,
	UpdateAssignmentPayload,
	SubmitAssignmentPayload,
	GradeSubmissionPayload,
} from "@/features/assignments/types/assignment-types"; // Adjust path
import { formatISO, subDays, addDays, parseISO } from "date-fns";

// --- Mock Data Store (Use 'let' for mutability) ---
let mockAssignmentsStore: Assignment[] = [
	{
		id: "assign_1",
		title: "PMP Week 1 Reading Analysis",
		courseId: "1",
		courseTitle: "PMP® Certification Training",
		description:
			"Read chapters 1-3 of PMBOK Guide and submit a 2-page analysis.",
		dueDate: formatISO(addDays(new Date(), 7)), // Due in 7 days
		pointsPossible: 100,
		status: "published",
		allowLateSubmissions: true,
		createdAt: formatISO(subDays(new Date(), 2)),
		updatedAt: formatISO(subDays(new Date(), 2)),
		createdBy: "teacher_1",
	},
	{
		id: "assign_2",
		title: "HTML Structure Task",
		courseId: "webdev_101",
		courseTitle: "Web Development Bootcamp",
		description: "Create the basic HTML structure for the portfolio project.",
		dueDate: formatISO(addDays(new Date(), 5)),
		pointsPossible: 50,
		status: "published",
		allowLateSubmissions: false,
		createdAt: formatISO(subDays(new Date(), 1)),
		updatedAt: formatISO(subDays(new Date(), 1)),
		createdBy: "teacher_2",
	},
	{
		id: "assign_3",
		title: "JS Functions Practice",
		courseId: "webdev_101",
		courseTitle: "Web Development Bootcamp",
		description: "Complete the exercises on function declaration and scope.",
		dueDate: formatISO(subDays(new Date(), 3)), // Due 3 days ago
		pointsPossible: 100,
		status: "published",
		allowLateSubmissions: true,
		createdAt: formatISO(subDays(new Date(), 10)),
		updatedAt: formatISO(subDays(new Date(), 10)),
		createdBy: "teacher_2",
	},
	{
		id: "assign_4",
		title: "PMP Cost Management Case Study",
		courseId: "1",
		courseTitle: "PMP® Certification Training",
		description:
			"Analyze the provided case study and propose a cost management strategy.",
		dueDate: formatISO(subDays(new Date(), 8)), // Due 8 days ago
		pointsPossible: 150,
		status: "archived",
		allowLateSubmissions: false,
		createdAt: formatISO(subDays(new Date(), 20)),
		updatedAt: formatISO(subDays(new Date(), 5)),
		createdBy: "teacher_1",
	},
];

let mockSubmissionsStore: AssignmentSubmission[] = [
	// Submission for assign_3 (JS Functions) - Graded
	{
		id: "sub_1",
		assignmentId: "assign_3",
		studentId: "student_1",
		studentName: "Alice Student",
		status: "graded",
		submittedAt: formatISO(subDays(new Date(), 4)),
		gradedAt: formatISO(subDays(new Date(), 1)),
		grade: 88,
		feedback: "Good understanding of scope, but check arrow function syntax.",
		gradedBy: "teacher_2",
	},
	// Submission for assign_3 (JS Functions) - Late
	{
		id: "sub_2",
		assignmentId: "assign_3",
		studentId: "student_4",
		studentName: "Diana Hacker",
		status: "late",
		submittedAt: formatISO(subDays(new Date(), 1)),
		gradedAt: null,
		grade: null,
		feedback: null,
	},
	// Submission for assign_4 (PMP Case Study) - Submitted (even though assignment archived)
	{
		id: "sub_3",
		assignmentId: "assign_4",
		studentId: "student_1",
		studentName: "Alice Student",
		status: "submitted",
		submittedAt: formatISO(subDays(new Date(), 9)),
		gradedAt: null,
		grade: null,
		feedback: null,
	},
	// Add more submissions...
];

// --- Mock API Functions ---

// Fetch for Teacher/Admin (includes submission counts)
export const getMockAssignmentsForCourse = async (
	courseId?: string,
	classId?: string
): Promise<TeacherAssignmentView[]> => {
	console.log(
		`MOCK: Fetching assignments for Course ${courseId} / Class ${classId}`
	);
	await new Promise((res) => setTimeout(res, 400));
	let assignments = mockAssignmentsStore;
	if (courseId)
		assignments = assignments.filter((a) => a.courseId === courseId);
	if (classId) assignments = assignments.filter((a) => a.classId === classId); // If using classId link

	const results: TeacherAssignmentView[] = assignments.map((a) => {
		const submissions = mockSubmissionsStore.filter(
			(s) => s.assignmentId === a.id
		);
		return {
			...a,
			totalSubmissions: submissions.length,
			gradedSubmissions: submissions.filter((s) => s.status === "graded")
				.length,
			// totalStudentsInClass: find total students for a.classId (needs class data)
		};
	});
	return JSON.parse(JSON.stringify(results));
};

// Fetch for Student (includes their submission)
export const getMockAssignmentsForStudent = async (
	userId: string,
	courseId?: string
): Promise<StudentAssignmentView[]> => {
	console.log(
		`MOCK: Fetching assignments for Student ${userId}, Course ${courseId}`
	);
	await new Promise((res) => setTimeout(res, 350));
	let assignments = mockAssignmentsStore.filter(
		(a) => a.status === "published"
	); // Students only see published
	if (courseId)
		assignments = assignments.filter((a) => a.courseId === courseId);

	const results: StudentAssignmentView[] = assignments.map((a) => {
		const submission =
			mockSubmissionsStore.find(
				(s) => s.assignmentId === a.id && s.studentId === userId
			) || null;
		let displayStatus: SubmissionStatus | "due_soon" | "overdue" = "pending";
		const now = new Date();
		const dueDate = parseISO(a.dueDate);

		if (submission) {
			displayStatus = submission.status; // late, submitted, graded
		} else if (dueDate < now) {
			displayStatus = "overdue";
		} else if (subDays(dueDate, 3) <= now) {
			// Due within 3 days
			displayStatus = "due_soon";
		}

		return { ...a, submission, displayStatus };
	});
	return JSON.parse(JSON.stringify(results));
};

export const getMockAssignmentById = async (
	assignmentId: string,
	role: string,
	userId?: string
): Promise<Assignment | StudentAssignmentView | TeacherAssignmentView> => {
	console.log(`MOCK: Fetching assignment ${assignmentId} for role ${role}`);
	await new Promise((res) => setTimeout(res, 200));
	const assignment = mockAssignmentsStore.find((a) => a.id === assignmentId);
	if (!assignment) throw new Error("Assignment not found");

	if (role === "student" && userId) {
		const submission =
			mockSubmissionsStore.find(
				(s) => s.assignmentId === assignment.id && s.studentId === userId
			) || null;
		let displayStatus: SubmissionStatus | "due_soon" | "overdue" = "pending"; // Recalculate here too
		// ... (calculate displayStatus logic as above) ...
		return JSON.parse(
			JSON.stringify({ ...assignment, submission, displayStatus })
		);
	} else if (role === "teacher" || role === "admin") {
		const submissions = mockSubmissionsStore.filter(
			(s) => s.assignmentId === assignment.id
		);
		return JSON.parse(
			JSON.stringify({
				...assignment,
				totalSubmissions: submissions.length,
				gradedSubmissions: submissions.filter((s) => s.status === "graded")
					.length,
			})
		);
	}
	return JSON.parse(JSON.stringify(assignment)); // Default return basic assignment
};

export const createMockAssignment = async (
	payload: CreateAssignmentPayload // Use the correct payload type
): Promise<Assignment> => {
	console.log("MOCK: Creating assignment", payload);
	await new Promise((res) => setTimeout(res, 300));

	// --- FIXED: Access data from payload.assignment ---
	const newAssignment: Assignment = {
		// Spread the properties from the nested assignment object
		...payload.assignment,
		// Generate system fields
		id: `assign_new_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`, // Slightly more unique ID
		createdAt: formatISO(new Date()),
		updatedAt: formatISO(new Date()),
		// createdBy is already required in the payload.assignment type
		// courseTitle would ideally be fetched/set based on courseId by backend/mock logic if needed immediately
		courseTitle: `Course for ${payload.assignment.courseId}`, // Placeholder title
		// Ensure status is set correctly, defaulting if necessary
		status: payload.assignment.status ?? "draft", // Default to 'draft' if not provided
	};
	// --- End Fix ---

	mockAssignmentsStore.unshift(newAssignment); // Add to the mutable store
	console.log(
		"MOCK: Assignment created, new count:",
		mockAssignmentsStore.length
	);
	return JSON.parse(JSON.stringify(newAssignment)); // Return deep copy
};

export const updateMockAssignment = async (
	assignmentId: string,
	payload: UpdateAssignmentPayload
): Promise<Assignment> => {
	console.log(`MOCK: Updating assignment ${assignmentId}`, payload);
	await new Promise((res) => setTimeout(res, 250));
	const index = mockAssignmentsStore.findIndex((a) => a.id === assignmentId);
	if (index === -1) throw new Error("Assignment not found");
	mockAssignmentsStore[index] = {
		...mockAssignmentsStore[index],
		...payload,
		updatedAt: formatISO(new Date()),
	};
	return JSON.parse(JSON.stringify(mockAssignmentsStore[index]));
};

export const deleteMockAssignment = async (
	assignmentId: string
): Promise<void> => {
	console.log(`MOCK: Deleting assignment ${assignmentId}`);
	await new Promise((res) => setTimeout(res, 300));
	const initialLength = mockAssignmentsStore.length;
	mockAssignmentsStore = mockAssignmentsStore.filter(
		(a) => a.id !== assignmentId
	);
	// Also delete related submissions
	mockSubmissionsStore = mockSubmissionsStore.filter(
		(s) => s.assignmentId !== assignmentId
	);
	if (mockAssignmentsStore.length === initialLength)
		throw new Error("Assignment not found");
};

export const submitMockAssignment = async (
	payload: SubmitAssignmentPayload
): Promise<AssignmentSubmission> => {
	console.log(
		`MOCK: Submitting assignment ${payload.assignmentId} for student ${payload.studentId}`
	);
	await new Promise((res) => setTimeout(res, 400));
	const assignment = mockAssignmentsStore.find(
		(a) => a.id === payload.assignmentId
	);
	if (!assignment) throw new Error("Assignment not found");

	const now = new Date();
	const dueDate = parseISO(assignment.dueDate);
	const status: SubmissionStatus =
		now > dueDate && assignment.allowLateSubmissions ? "late" : "submitted";

	// Check if submission already exists
	const existingIndex = mockSubmissionsStore.findIndex(
		(s) =>
			s.assignmentId === payload.assignmentId &&
			s.studentId === payload.studentId
	);

	const newSubmission: AssignmentSubmission = {
		id:
			existingIndex > -1
				? mockSubmissionsStore[existingIndex].id
				: `sub_${payload.assignmentId}_${payload.studentId}_${Date.now()}`,
		assignmentId: payload.assignmentId,
		studentId: payload.studentId,
		studentName: `Student ${payload.studentId}`, // TODO: Get actual name
		status: status,
		submittedAt: formatISO(now),
		// submissionFiles: payload.submissionFiles, // Handle file data appropriately
		// comments: payload.comments,
		grade: null, // Reset grade on resubmit?
		feedback: null,
		gradedAt: null,
	};

	if (existingIndex > -1) {
		mockSubmissionsStore[existingIndex] = newSubmission; // Overwrite existing
	} else {
		mockSubmissionsStore.push(newSubmission); // Add new
	}

	return JSON.parse(JSON.stringify(newSubmission));
};

export const getMockSubmissionsForAssignment = async (
	assignmentId: string
): Promise<AssignmentSubmission[]> => {
	console.log(`MOCK: Fetching submissions for assignment ${assignmentId}`);
	await new Promise((res) => setTimeout(res, 300));
	const submissions = mockSubmissionsStore.filter(
		(s) => s.assignmentId === assignmentId
	);
	// TODO: Populate student names correctly
	return JSON.parse(JSON.stringify(submissions));
};

export const gradeMockSubmission = async (
	payload: GradeSubmissionPayload
): Promise<AssignmentSubmission> => {
	console.log(`MOCK: Grading submission ${payload.submissionId}`);
	await new Promise((res) => setTimeout(res, 250));
	const index = mockSubmissionsStore.findIndex(
		(s) => s.id === payload.submissionId
	);
	if (index === -1) throw new Error("Submission not found");

	mockSubmissionsStore[index] = {
		...mockSubmissionsStore[index],
		grade: payload.grade,
		feedback: payload.feedback ?? null,
		status: "graded",
		gradedAt: formatISO(new Date()),
		gradedBy: payload.graderId,
	};
	return JSON.parse(JSON.stringify(mockSubmissionsStore[index]));
};
