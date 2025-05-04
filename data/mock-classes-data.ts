// data/mock-classes-data.ts
import type { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import type { AdminClassView } from "@/features/classes/types/classes-types";
import { mockAuthCourseData } from "./mock-auth-course-data";
import { formatISO } from "date-fns"; // For generating consistent date strings

// --- Define the shape of data used for creating/updating ---
// This might differ slightly from AdminClassView (e.g., no studentCount on create)
type CreateClassData = Omit<AdminClassView, "id" | "studentCount">;
type UpdateClassData = Partial<CreateClassData>;

// --- Initialize Mock Class Data (use 'let' for mutability) ---
// Generate initial data based on courses, similar to getMockAllClassesAdmin logic
// But store it in a variable we can modify
let mockAdminClasses: AdminClassView[] = mockAuthCourseData.map(
	(course, index) => ({
		id: `class_${course.id}_${index + 1}`, // Create a distinct class ID
		courseTitle: course.title,
		courseId: course.id, // Add courseId link back
		teacherName: course.instructor.name,
		teacherId: `teacher_${index + 1}`, // Assign mock teacher IDs
		studentCount: Math.floor(10 + Math.random() * 40), // Random student count
		status:
			index % 3 === 0 ? "inactive" : index % 3 === 1 ? "upcoming" : "active", // Add upcoming status
		description: `Description for ${course.title}`, // Add mock description
		// Use consistent ISO date strings (date part only)
		startDate: course.enrollmentDate
			? formatISO(new Date(course.enrollmentDate), { representation: "date" })
			: undefined,
		endDate: course.lastAccessed
			? formatISO(new Date(course.lastAccessed), { representation: "date" })
			: undefined,
	})
);

// --- Existing Mock API Functions ---

export const getMockEnrolledClasses = async (
	studentId: string
): Promise<AuthCourse[]> => {
	console.log(`MOCK: Fetching enrolled classes for student ${studentId}`);
	await new Promise((res) => setTimeout(res, 450));
	// Simulate enrollment based on mockAdminClasses student list if available,
	// or just return some courses for now.
	// Example: Find classes this student might be in (requires more complex mock data)
	// For now, return a subset of courses
	return mockAuthCourseData.slice(0, 2);
};

export const getMockTaughtClasses = async (
	teacherId: string
): Promise<AuthCourse[]> => {
	console.log(`MOCK: Fetching taught classes for teacher ${teacherId}`);
	await new Promise((res) => setTimeout(res, 350));
	// Find classes assigned to this teacher
	const taughtClassIds = mockAdminClasses
		.filter((cls) => cls.teacherId === teacherId)
		.map((cls) => cls.courseId); // Get the linked AuthCourse IDs
	// Return the corresponding AuthCourse data
	return mockAuthCourseData.filter((course) =>
		taughtClassIds.includes(course.id)
	);
};

export const getMockAllClassesAdmin = async (
	page: number = 1,
	limit: number = 10,
	search?: string
): Promise<{ classes: AdminClassView[]; total: number }> => {
	console.log(
		`MOCK: Fetching all classes for admin. Page: ${page}, Limit: ${limit}, Search: ${search}`
	);
	await new Promise((res) => setTimeout(res, 300 + Math.random() * 300));

	let filteredClasses = [...mockAdminClasses]; // Use the mutable array

	if (search) {
		const query = search.toLowerCase();
		filteredClasses = filteredClasses.filter(
			(c) =>
				c.courseTitle.toLowerCase().includes(query) ||
				c.teacherName?.toLowerCase().includes(query)
		);
	}

	const total = filteredClasses.length;
	// Sort by title or date for consistency (optional)
	filteredClasses.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle));

	const paginatedClasses = filteredClasses.slice(
		(page - 1) * limit,
		page * limit
	);

	// Return a deep copy to prevent direct mutation of the mock store from outside
	return { classes: JSON.parse(JSON.stringify(paginatedClasses)), total };
};

// --- NEW Mock CRUD Functions ---

export const getMockClassById = async (
	classId: string
): Promise<AdminClassView> => {
	console.log(`MOCK: Fetching class by ID: ${classId}`);
	await new Promise((res) => setTimeout(res, 200 + Math.random() * 200));

	const foundClass = mockAdminClasses.find((cls) => cls.id === classId);

	if (!foundClass) {
		throw new Error(`Mock Error: Class with ID ${classId} not found.`);
	}
	// Return a deep copy
	return JSON.parse(JSON.stringify(foundClass));
};

export const createMockClass = async (
	classData: CreateClassData
): Promise<AdminClassView> => {
	console.log("MOCK: Creating new class", classData);
	await new Promise((res) => setTimeout(res, 300 + Math.random() * 300));

	// Find teacher name if teacherId is provided
	const teacherName =
		mockTeachers.find((t) => t.id === classData.teacherId)?.name || undefined;

	const newClass: AdminClassView = {
		...classData,
		id: `class_new_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`, // Generate unique-ish ID
		studentCount: 0, // New classes start with 0 students
		teacherName: teacherName, // Add teacher name based on ID
		// Ensure dates are strings if provided
		startDate: classData.startDate
			? formatISO(new Date(classData.startDate), { representation: "date" })
			: undefined,
		endDate: classData.endDate
			? formatISO(new Date(classData.endDate), { representation: "date" })
			: undefined,
	};

	mockAdminClasses.unshift(newClass); // Add to the start of the array
	console.log("MOCK: Class created, new count:", mockAdminClasses.length);

	// Return a deep copy
	return JSON.parse(JSON.stringify(newClass));
};

export const updateMockClass = async (
	classId: string,
	updateData: UpdateClassData
): Promise<AdminClassView> => {
	console.log(`MOCK: Updating class ${classId}`, updateData);
	await new Promise((res) => setTimeout(res, 250 + Math.random() * 250));

	const classIndex = mockAdminClasses.findIndex((cls) => cls.id === classId);
	if (classIndex === -1) {
		throw new Error(
			`Mock Error: Class with ID ${classId} not found for update.`
		);
	}

	// Find teacher name if teacherId is being updated
	let teacherName = mockAdminClasses[classIndex].teacherName; // Keep existing name by default
	if (updateData.teacherId !== undefined) {
		// Check if teacherId is part of the update
		teacherName =
			mockTeachers.find((t) => t.id === updateData.teacherId)?.name ||
			undefined;
	}

	// Merge existing data with update data
	mockAdminClasses[classIndex] = {
		...mockAdminClasses[classIndex],
		...updateData,
		teacherName: teacherName, // Update teacher name based on ID change
		// Ensure dates are correctly formatted strings if updated
		startDate: updateData.startDate
			? formatISO(new Date(updateData.startDate), { representation: "date" })
			: mockAdminClasses[classIndex].startDate,
		endDate: updateData.endDate
			? formatISO(new Date(updateData.endDate), { representation: "date" })
			: mockAdminClasses[classIndex].endDate,
	};

	console.log(`MOCK: Class ${classId} updated.`);
	// Return a deep copy of the updated class
	return JSON.parse(JSON.stringify(mockAdminClasses[classIndex]));
};

export const deleteMockClass = async (classId: string): Promise<void> => {
	console.log(`MOCK: Deleting class ${classId}`);
	await new Promise((res) => setTimeout(res, 300 + Math.random() * 200));

	const initialLength = mockAdminClasses.length;
	mockAdminClasses = mockAdminClasses.filter((cls) => cls.id !== classId);

	if (mockAdminClasses.length === initialLength) {
		throw new Error(
			`Mock Error: Class with ID ${classId} not found for deletion.`
		);
	}

	console.log("MOCK: Class deleted, new count:", mockAdminClasses.length);
	// No return value needed for DELETE typically, maybe just success/fail
};

// --- Helper Data (Example teacher list used in create/update) ---
// In a real app, this would likely come from a user/teacher store/API
const mockTeachers = [
	{ id: "teacher_1", name: "Dr. Sarah Johnson" },
	{ id: "teacher_2", name: "Michael Chen" },
	// Add more mock teachers
];
