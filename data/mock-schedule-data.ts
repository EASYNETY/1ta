// data/mock-schedule-data.ts
import {
	ScheduleEvent,
	CreateScheduleEventPayload,
} from "@/features/schedule/types/schedule-types"; // Import payload types
import { startOfWeek, addDays, formatISO, parseISO, isValid } from "date-fns";

// --- Existing setup ---
const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 });

const createDate = (
	dayOffset: number,
	hour: number,
	minute: number = 0
): string => {
	const date = addDays(weekStart, dayOffset);
	date.setHours(hour, minute, 0, 0);
	return formatISO(date);
};

// Use 'let' for mutability
let mockScheduleEvents: ScheduleEvent[] = [
	// ... (your existing mock events) ...
	{
		id: "sched_1",
		title: "PMP Fundamentals",
		courseId: "1",
		courseSlug: "pmp-certification-training",
		courseTitle: "PMP® Certification Training",
		startTime: createDate(0, 9),
		endTime: createDate(0, 11),
		type: "lecture",
		location: "Virtual Classroom A",
		instructor: "Dr. Sarah Johnson",
		instructorId: "teacher_1",
		meetingLink: "https://zoom.us/j/mock1",
		description: "Introduction to PMBOK framework.",
		attendees: ["student_1", "student_2", "student_3"],
	},
	{
		id: "sched_2",
		title: "JS Variables & Functions",
		courseId: "webdev_101",
		courseSlug: "web-dev-bootcamp",
		courseTitle: "Web Development Bootcamp",
		startTime: createDate(1, 14),
		endTime: createDate(1, 16),
		type: "lecture",
		location: "Room 301",
		instructor: "Michael Chen",
		instructorId: "teacher_2",
		description: "Covering var, let, const and function basics.",
		attendees: ["student_1", "student_4"],
	},
	{
		id: "sched_3",
		title: "Project Planning Quiz",
		courseId: "1",
		courseSlug: "pmp-certification-training",
		courseTitle: "PMP® Certification Training",
		startTime: createDate(2, 10),
		endTime: createDate(2, 11),
		type: "exam",
		location: "Online Portal",
		instructor: "Dr. Sarah Johnson",
		instructorId: "teacher_1",
		description: "Quiz on project initiation.",
		attendees: ["student_1", "student_2", "student_3"],
	},
	{
		id: "sched_4",
		title: "HTML/CSS Practice Lab",
		courseId: "webdev_101",
		courseSlug: "web-dev-bootcamp",
		courseTitle: "Web Development Bootcamp",
		startTime: createDate(3, 13),
		endTime: createDate(3, 15),
		type: "lab",
		location: "Computer Lab 2",
		instructor: "Michael Chen",
		instructorId: "teacher_2",
		description: "Hands-on session.",
		attendees: ["student_1", "student_4"],
	},
	{
		id: "sched_5",
		title: "Web Dev Office Hours",
		courseId: "webdev_101",
		courseSlug: "web-dev-bootcamp",
		courseTitle: "Web Development Bootcamp",
		startTime: createDate(3, 16),
		endTime: createDate(3, 17),
		type: "office-hours",
		location: "Teacher's Virtual Room",
		instructor: "Michael Chen",
		instructorId: "teacher_2",
		meetingLink: "https://zoom.us/j/mock2",
		attendees: ["student_1", "student_4"],
	},
];

// --- Existing Mock API Functions ---
export const getMockSchedule = async (
	role: string,
	userId?: string
): Promise<ScheduleEvent[]> => {
	// ... (implementation as before, returning filtered subset of mockScheduleEvents) ...
	console.log(
		`MOCK: Fetching schedule for Role: ${role}, UserID: ${userId || "N/A"}`
	);
	await new Promise((res) => setTimeout(res, 300 + Math.random() * 300));
	let results = mockScheduleEvents; // Start with all

	if (role === "teacher" && userId) {
		results = mockScheduleEvents.filter(
			(event) => event.instructorId === userId
		);
	} else if (role === "student" && userId) {
		results = mockScheduleEvents.filter((event) =>
			event.attendees?.includes(userId)
		);
	} else if (role !== "admin") {
		results = []; // Non-admin without specific ID sees nothing unless specified otherwise
	}
	// Return deep copy
	return JSON.parse(JSON.stringify(results));
};

// --- NEW Mock CRUD Functions ---

// Fetch ALL events (for management table, includes simple pagination)
export const getAllMockScheduleEvents = async (
	page: number = 1,
	limit: number = 10
	// filters?: { dateFrom?: string; dateTo?: string; type?: string; courseId?: string } // Add filter parameters later
): Promise<{ events: ScheduleEvent[]; total: number }> => {
	console.log(
		`MOCK: Fetching ALL schedule events. Page: ${page}, Limit: ${limit}`
	);
	await new Promise((res) => setTimeout(res, 300 + Math.random() * 200));

	let filteredEvents = [...mockScheduleEvents];

	// TODO: Apply filtering based on 'filters' parameter if implemented

	const total = filteredEvents.length;
	// Sort by start time for consistency
	filteredEvents.sort(
		(a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
	);

	const paginatedEvents = filteredEvents.slice(
		(page - 1) * limit,
		page * limit
	);

	// Return deep copy
	return { events: JSON.parse(JSON.stringify(paginatedEvents)), total };
};

export const getMockScheduleEventById = async (
	eventId: string
): Promise<ScheduleEvent> => {
	console.log(`MOCK: Fetching event by ID: ${eventId}`);
	await new Promise((res) => setTimeout(res, 150 + Math.random() * 150));
	const event = mockScheduleEvents.find((e) => e.id === eventId);
	if (!event) {
		throw new Error(`Mock Error: Schedule event with ID ${eventId} not found.`);
	}
	return JSON.parse(JSON.stringify(event)); // Deep copy
};

export const createMockScheduleEvent = async (
	eventData: CreateScheduleEventPayload
): Promise<ScheduleEvent> => {
	console.log("MOCK: Creating schedule event", eventData);
	await new Promise((res) => setTimeout(res, 250 + Math.random() * 200));

	// TODO: Add logic to find instructor name based on instructorId if needed
	// const instructorName = mockTeachers.find(t => t.id === eventData.instructorId)?.name;

	const newEvent: ScheduleEvent = {
		...eventData,
		id: `sched_new_${Date.now()}`, // Generate unique ID
		// instructor: instructorName, // Add if needed
		// courseTitle: look up course title based on courseId if needed
	};
	mockScheduleEvents.unshift(newEvent); // Add to start
	console.log(
		"MOCK: Schedule event created, new count:",
		mockScheduleEvents.length
	);
	return JSON.parse(JSON.stringify(newEvent)); // Deep copy
};

export const updateMockScheduleEvent = async (
	eventId: string,
	updateData: Partial<Omit<ScheduleEvent, "id">>
): Promise<ScheduleEvent> => {
	console.log(`MOCK: Updating event ${eventId}`, updateData);
	await new Promise((res) => setTimeout(res, 200 + Math.random() * 200));
	const index = mockScheduleEvents.findIndex((e) => e.id === eventId);
	if (index === -1) {
		throw new Error(
			`Mock Error: Event with ID ${eventId} not found for update.`
		);
	}
	// TODO: Add logic to update instructor/course name if ID changes
	mockScheduleEvents[index] = {
		...mockScheduleEvents[index],
		...updateData,
	};
	console.log(`MOCK: Event ${eventId} updated.`);
	return JSON.parse(JSON.stringify(mockScheduleEvents[index])); // Deep copy
};

export const deleteMockScheduleEvent = async (
	eventId: string
): Promise<void> => {
	console.log(`MOCK: Deleting event ${eventId}`);
	await new Promise((res) => setTimeout(res, 300 + Math.random() * 150));
	const initialLength = mockScheduleEvents.length;
	mockScheduleEvents = mockScheduleEvents.filter((e) => e.id !== eventId);
	if (mockScheduleEvents.length === initialLength) {
		throw new Error(
			`Mock Error: Event with ID ${eventId} not found for deletion.`
		);
	}
	console.log("MOCK: Event deleted, new count:", mockScheduleEvents.length);
};
