// data/mock-schedule-data.ts
import { ScheduleEvent } from "@/features/schedule/types/schedule-types";
import { startOfWeek, addDays, formatISO } from 'date-fns';

// Let's make dates relative to the current week for better testing
const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday

const createDate = (dayOffset: number, hour: number, minute: number = 0): string => {
    const date = addDays(weekStart, dayOffset);
    date.setHours(hour, minute, 0, 0);
    return formatISO(date);
};

const mockScheduleEvents: ScheduleEvent[] = [
    // Monday
    {
        id: "sched_1",
        title: "PMP Fundamentals",
        courseId: "1", // Matches PMP course ID
        courseTitle: "PMP® Certification Training",
        startTime: createDate(0, 9), // Monday 9 AM
        endTime: createDate(0, 11), // Monday 11 AM
        type: "lecture",
        location: "Virtual Classroom A",
        instructor: "Dr. Sarah Johnson",
        instructorId: "teacher_1",
        meetingLink: "https://zoom.us/j/mock1",
        description: "Introduction to PMBOK framework.",
        attendees: ["student_1", "student_2", "student_3"] // Example attendees
    },
    // Tuesday
    {
        id: "sched_2",
        title: "JS Variables & Functions",
        courseId: "webdev_101", // Example ID for a Web Dev Course
        courseTitle: "Web Development Bootcamp",
        startTime: createDate(1, 14), // Tuesday 2 PM
        endTime: createDate(1, 16), // Tuesday 4 PM
        type: "lecture",
        location: "Room 301",
        instructor: "Michael Chen",
        instructorId: "teacher_2",
        description: "Covering var, let, const and function basics.",
        attendees: ["student_1", "student_4"]
    },
    // Wednesday
    {
        id: "sched_3",
        title: "Project Planning Quiz",
        courseId: "1",
        courseTitle: "PMP® Certification Training",
        startTime: createDate(2, 10), // Wednesday 10 AM
        endTime: createDate(2, 11), // Wednesday 11 AM
        type: "exam",
        location: "Online Portal",
        instructor: "Dr. Sarah Johnson",
        instructorId: "teacher_1",
        description: "Quiz on project initiation.",
        attendees: ["student_1", "student_2", "student_3"]
    },
    // Thursday
    {
        id: "sched_4",
        title: "HTML/CSS Practice Lab",
        courseId: "webdev_101",
        courseTitle: "Web Development Bootcamp",
        startTime: createDate(3, 13), // Thursday 1 PM
        endTime: createDate(3, 15), // Thursday 3 PM
        type: "lab",
        location: "Computer Lab 2",
        instructor: "Michael Chen",
        instructorId: "teacher_2",
        description: "Hands-on session.",
        attendees: ["student_1", "student_4"]
    },
     // Thursday - Office Hours
    {
        id: "sched_5",
        title: "Web Dev Office Hours",
        courseId: "webdev_101",
        courseTitle: "Web Development Bootcamp",
        startTime: createDate(3, 16), // Thursday 4 PM
        endTime: createDate(3, 17), // Thursday 5 PM
        type: "office-hours",
        location: "Teacher's Virtual Room",
        instructor: "Michael Chen",
        instructorId: "teacher_2",
        meetingLink: "https://zoom.us/j/mock2",
        attendees: ["student_1", "student_4"] // Typically open to enrolled students
    },
    // Add more events for different days/times/courses/teachers/students
];

// --- Mock API Functions ---

// Simulate fetching schedule based on role and optional date range
export const getMockSchedule = async (
    role: string,
    userId?: string,
    // startDate?: string, // Optional filtering by date range
    // endDate?: string
): Promise<ScheduleEvent[]> => {
    console.log(`MOCK: Fetching schedule for Role: ${role}, UserID: ${userId || 'N/A'}`);
    await new Promise(res => setTimeout(res, 300 + Math.random() * 300));

    if (role === 'admin') {
        return mockScheduleEvents; // Admin sees all
    } else if (role === 'teacher' && userId) {
        return mockScheduleEvents.filter(event => event.instructorId === userId);
    } else if (role === 'student' && userId) {
        // Students see events where they are listed as an attendee
        // In a real system, this would likely be based on enrollment in the course/class associated with the event.
        return mockScheduleEvents.filter(event => event.attendees?.includes(userId));
    }

    return []; // Default empty for unknown roles or missing userId
};