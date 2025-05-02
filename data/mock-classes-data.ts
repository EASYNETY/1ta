// data/mock-classes-data.ts
import type { AuthCourse } from "@/features/auth-course/types/auth-course-interface";
import type { AdminClassView } from "@/features/classes/types/classes-types";
import { mockAuthCourseData } from "./mock-auth-course-data";

// --- Mock API Functions ---

export const getMockEnrolledClasses = async (
	studentId: string
): Promise<AuthCourse[]> => {
	console.log(`MOCK: Fetching enrolled classes for student ${studentId}`);
	await new Promise((res) => setTimeout(res, 450));
	// Simulate enrollment - return the first course for student_123, maybe none for others
	if (studentId === "student_123") {
		return mockAuthCourseData.slice(0, 1); // Example: Return only PMP course
	}
	return [];
};

export const getMockTaughtClasses = async (
	teacherId: string
): Promise<AuthCourse[]> => {
	console.log(`MOCK: Fetching taught classes for teacher ${teacherId}`);
	await new Promise((res) => setTimeout(res, 350));
	// Simulate - return courses matching teacherId (add instructorId to your AuthCourse mock)
	// Example: Assuming teacher_1 teaches PMP (courseId '1')
	if (teacherId === "teacher_1") {
		return mockAuthCourseData.filter((c) => c.id === "1");
	}
	// Example: Assuming teacher_789 teaches Web Dev (courseId 'webdev_101' - need to add this course)
	if (teacherId === "teacher_789") {
		// return mockAuthCourseData.filter(c => c.id === 'webdev_101'); // Add webdev course to mock data first
		return []; // Placeholder
	}
	return [];
};

export const getMockAllClassesAdmin = async (
	page: number = 1,
	limit: number = 10,
	search?: string
): Promise<{ classes: AdminClassView[]; total: number }> => {
	console.log(
		`MOCK: Fetching all classes for admin. Page: ${page}, Limit: ${limit}, Search: ${search}`
	);
	await new Promise((res) => setTimeout(res, 600));

	// Simulate admin view - create simplified AdminClassView data
	const allAdminClasses: AdminClassView[] = mockAuthCourseData.map(
		(course, index) => ({
			id: `class_${course.id}_${index + 1}`, // Create a distinct class ID
			courseTitle: course.title,
			teacherName: course.instructor.name,
			teacherId: `teacher_${index + 1}`, // Assign mock teacher IDs
			studentCount: Math.floor(10 + Math.random() * 40), // Random student count
			status: index % 3 === 0 ? "inactive" : "active", // Random status
			startDate: course.enrollmentDate, // Reuse dates for mock simplicity
			endDate: course.lastAccessed,
		})
	);

	let filteredClasses = allAdminClasses;
	if (search) {
		const query = search.toLowerCase();
		filteredClasses = allAdminClasses.filter(
			(c) =>
				c.courseTitle.toLowerCase().includes(query) ||
				c.teacherName?.toLowerCase().includes(query)
		);
	}

	const total = filteredClasses.length;
	const paginatedClasses = filteredClasses.slice(
		(page - 1) * limit,
		page * limit
	);

	return { classes: paginatedClasses, total };
};
