// data/mock-corporate-data.ts (or add to mock-auth-data.ts)
import type { StudentUser } from "@/types/user.types";
import { users as mockAuthUsers } from "./mock-auth-data"; // Import the mutable user list

export const getMockManagedStudents = async (
	corporateId: string,
	page: number = 1,
	limit: number = 10,
	search?: string
): Promise<{
	students: StudentUser[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}> => {
	console.log(
		`MOCK: Fetching managed students for corporateId: ${corporateId}, Page: ${page}, Limit: ${limit}, Search: ${search}`
	);
	await new Promise((res) => setTimeout(res, 400));

	// Filter users by corporateId and ensure they are NOT the manager themselves
	let companyStudents = mockAuthUsers.filter(
		(u) =>
			u.corporateId === corporateId &&
			u.role === "student" &&
			!u.isCorporateManager
	) as StudentUser[]; // Cast after filtering

	if (search) {
		const query = search.toLowerCase();
		companyStudents = companyStudents.filter(
			(s) =>
				s.name?.toLowerCase().includes(query) ||
				s.email.toLowerCase().includes(query)
		);
	}

	const total = companyStudents.length;
	const totalPages = Math.ceil(total / limit);
	const paginatedStudents = companyStudents.slice(
		(page - 1) * limit,
		page * limit
	);

	return {
		students: JSON.parse(JSON.stringify(paginatedStudents)), // Deep copy
		total,
		page,
		limit,
		totalPages,
	};
};

// Mock delete specifically for manager context (removes user from main list)
export const deleteMockManagedStudent = async (
	studentId: string
): Promise<void> => {
	console.log(`MOCK: Deleting managed student ${studentId}`);
	await new Promise((res) => setTimeout(res, 300));
	const initialLength = mockAuthUsers.length;
	// Find the student first to check ownership (optional in mock, backend MUST do this)
	const studentIndex = mockAuthUsers.findIndex(
		(u) => u.id === studentId && !u.isCorporateManager
	);
	if (studentIndex === -1) {
		throw new Error(
			`Mock Error: Managed student with ID ${studentId} not found.`
		);
	}
	// Reassign the main users array excluding the deleted one
	mockAuthUsers.splice(studentIndex, 1); // Modify in place using splice

	if (mockAuthUsers.length === initialLength) {
		throw new Error(`Mock Error: Failed to delete student ${studentId}.`);
	}
	console.log(
		"MOCK: Managed student deleted, new total user count:",
		mockAuthUsers.length
	);
};

// Note: createManagedStudent and updateManagedStudent mocks are implicitly handled by
// the existing mockRegister and mockUpdateMyProfile if the API endpoints map to them,
// BUT the backend needs the crucial logic to check slots/permissions.
// If you use specific endpoints like POST /corporate/students, add mocks for those.
