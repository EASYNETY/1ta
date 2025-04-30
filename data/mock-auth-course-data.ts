import type { AuthCourse } from "@/features/auth-course/types/auth-course-interface";

// --- Helper Functions ---
function safeParseJsonArray(jsonString: string | undefined | null): string[] {
	if (!jsonString) return [];
	try {
		const parsed = JSON.parse(jsonString);
		if (!Array.isArray(parsed)) {
			console.warn("Parsed JSON is not an array:", jsonString);
			return [];
		}
		return parsed.map((item) => {
			if (typeof item === "string") {
				try {
					return item
						.replace(/\\u([\dA-F]{4})/gi, (match, grp) =>
							String.fromCharCode(Number.parseInt(grp, 16))
						)
						.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
						.replace(/"/g, '"')
						.replace(/'/g, "'")
						.replace(/&/g, "&")
						.replace(/</g, "<")
						.replace(/>/g, ">");
				} catch (decodeError) {
					console.warn("Could not decode string entities:", item, decodeError);
					return String(item);
				}
			}
			return String(item);
		});
	} catch (error) {
		console.error("Parse Error in safeParseJsonArray:", jsonString, error);
		return [];
	}
}

// --- Mock Authenticated Course Data ---
export const mockAuthCourseData: AuthCourse[] = [
	{
		id: "1",
		slug: "pmp-certification-training",
		title: "PMP® Certification Training",
		subtitle: "Project Management Professional",
		description: `<p>The PMP® (Project Management Professional) Certification Training operates as a worldwide recognized educational program that improves your project management abilities and professional opportunities. The course follows the PMBOK® Guide framework established by PMI in its delivery of vital project management principles and essential tools and techniques.</p>
        <p>The training program provides instruction from PMI-certified teachers who use practical examples and interactive exercises to help students pass the PMP® exam while developing project leadership skills for various business sectors.</p>`,
		category: "Project Management",
		image: "/placeholder.svg",
		previewVideoUrl:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+1-20241221_063337-Meeting+Recording+1.mp4",
		instructor: {
			name: "Dr. Sarah Johnson",
			title: "PMP Certified Instructor",
			bio: "Dr. Johnson has over 15 years of experience in project management and has helped hundreds of students achieve PMP certification.",
			avatar: "/placeholder.svg?height=200&width=200",
		},
		level: "Advanced",
		tags: ["Project Management", "PMP", "Certification"],
		priceUSD: 499,
		discountPriceUSD: 399,
		learningOutcomes: [
			"Gain a comprehensive understanding of project management principles and best practices.",
			"Learn all concepts and knowledge areas outlined in the PMBOK® Guide",
			"Develop skills in initiating, planning, executing, monitoring, controlling, and closing projects",
			"Acquire the knowledge needed to pass the PMP certification exam",
		],
		prerequisites: [
			"Flexi Pass Enabled: Flexibility to reschedule your cohort within first 90 days of access.",
			"Live, online classroom training by top instructors and practitioners",
			"Lifetime access to high-quality self-paced eLearning content curated by industry experts",
			"Learner support and assistance available 24/7",
		],
		modules: [
			{
				id: "module-1",
				title: "Core Training Modules",
				description: "Essential PMP training modules covering key concepts",
				duration: "8 lessons",
				order: 1,
				lessons: [
					{
						id: "lesson-1-1",
						title: "PMP Training Day 1",
						duration: "04:00:00",
						type: "video",
						order: 1,
						isPreview: true,
						isCompleted: true,
						videoUrl:
							"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+1-20241221_063337-Meeting+Recording+1.mp4",
					},
					{
						id: "lesson-1-2",
						title: "PMP Training Day 2",
						duration: "04:00:00",
						type: "video",
						order: 2,
						isCompleted: true,
						videoUrl:
							"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+2-20241221_063337-Meeting+Recording+2.mp4",
					},
					{
						id: "lesson-1-3",
						title: "PMP Training Day 3",
						duration: "04:00:00",
						type: "video",
						order: 3,
						isCompleted: false,
						videoUrl:
							"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+3-20241221_063337-Meeting+Recording+3.mp4",
					},
					{
						id: "lesson-1-4",
						title: "PMP Training Day 4",
						duration: "04:00:00",
						type: "video",
						order: 4,
						isCompleted: false,
						videoUrl:
							"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+4-20241221_063337-Meeting+Recording+4.mp4",
					},
					{
						id: "lesson-1-5",
						title: "PMP Training Day 5",
						duration: "04:00:00",
						type: "video",
						order: 5,
						isCompleted: false,
						videoUrl:
							"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+5-20241221_063337-Meeting+Recording+5.mp4",
					},
					{
						id: "lesson-1-6",
						title: "PMP Training Day 6",
						duration: "04:00:00",
						type: "video",
						order: 6,
						isCompleted: false,
						videoUrl:
							"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+6-20241221_063337-Meeting+Recording+6.mp4",
					},
					{
						id: "lesson-1-7",
						title: "PMP Training Day 7",
						duration: "04:00:00",
						type: "video",
						order: 7,
						isCompleted: false,
						videoUrl:
							"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+7-20241221_063337-Meeting+Recording+7.mp4",
					},
					{
						id: "lesson-1-8",
						title: "PMP Training Day 8",
						duration: "04:00:00",
						type: "video",
						order: 8,
						isCompleted: false,
						videoUrl:
							"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+8-20241221_063337-Meeting+Recording+8.mp4",
					},
				],
				isCompleted: false,
				progress: 25,
			},
			{
				id: "module-2",
				title: "Practice Tests and Quizzes",
				description: "Test your knowledge with practice exams",
				duration: "4 lessons",
				order: 2,
				lessons: [
					{
						id: "lesson-2-1",
						title: "PMP Practice Quiz 1",
						duration: "01:00:00",
						type: "quiz",
						order: 1,
						isCompleted: false,
						quizId: "quiz-1",
					},
					{
						id: "lesson-2-2",
						title: "PMP Practice Quiz 2",
						duration: "01:00:00",
						type: "quiz",
						order: 2,
						isCompleted: false,
						quizId: "quiz-2",
					},
					{
						id: "lesson-2-3",
						title: "PMP Full Practice Exam 1",
						duration: "04:00:00",
						type: "quiz",
						order: 3,
						isCompleted: false,
						quizId: "exam-1",
					},
					{
						id: "lesson-2-4",
						title: "PMP Full Practice Exam 2",
						duration: "04:00:00",
						type: "quiz",
						order: 4,
						isCompleted: false,
						quizId: "exam-2",
					},
				],
				isCompleted: false,
				progress: 0,
			},
		],
		lessonCount: 12,
		moduleCount: 2,
		totalVideoDuration: "32 hours",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Instructor",

		// Auth-specific fields
		enrollmentDate: "2023-12-01T00:00:00.000Z",
		progress: 25,
		lastAccessedDate: "2023-12-15T00:00:00.000Z",
		lastAccessedModuleId: "module-1",
		lastAccessedLessonId: "lesson-1-3",
		completedLessons: ["lesson-1-1", "lesson-1-2"],
		quizScores: {},
		notes: [
			{
				id: "note-1",
				lessonId: "lesson-1-1",
				content: "Important note about project charter",
				timestamp: 1200,
				createdAt: "2023-12-05T00:00:00.000Z",
			},
		],
		bookmarks: [
			{
				id: "bookmark-1",
				lessonId: "lesson-1-2",
				timestamp: 3600,
				title: "Key concept explanation",
				createdAt: "2023-12-10T00:00:00.000Z",
			},
		],
	},
	{
		id: "2",
		slug: "web-development-bootcamp",
		title: "Web Development Bootcamp",
		subtitle: "Full Stack Development with React and Node.js",
		description: `<p>This comprehensive bootcamp takes you from beginner to professional web developer. You'll learn HTML, CSS, JavaScript, React, Node.js, and more.</p>
        <p>Through hands-on projects and real-world applications, you'll build a portfolio that showcases your skills to potential employers.</p>`,
		category: "Web Development",
		image: "/placeholder.svg",
		instructor: {
			name: "Michael Chen",
			title: "Senior Web Developer",
			bio: "Michael has worked as a developer for over 10 years and has taught thousands of students online.",
			avatar: "/placeholder.svg?height=200&width=200",
		},
		level: "Beginner",
		tags: ["Web Development", "JavaScript", "React", "Node.js"],
		priceUSD: 599,
		discountPriceUSD: 499,
		learningOutcomes: [
			"Build responsive websites using HTML5, CSS3, and JavaScript",
			"Create dynamic web applications with React",
			"Develop backend services with Node.js and Express",
			"Work with databases including MongoDB and SQL",
			"Deploy applications to production environments",
		],
		prerequisites: [
			"No prior programming experience required",
			"Basic computer skills",
			"Desire to learn and practice regularly",
		],
		modules: [
			{
				id: "module-1",
				title: "HTML & CSS Fundamentals",
				description: "Learn the building blocks of web development",
				duration: "5 lessons",
				order: 1,
				lessons: [
					{
						id: "lesson-1-1",
						title: "Introduction to HTML",
						duration: "01:30:00",
						type: "video",
						order: 1,
						isPreview: true,
						isCompleted: true,
					},
					{
						id: "lesson-1-2",
						title: "HTML Elements and Structure",
						duration: "02:00:00",
						type: "video",
						order: 2,
						isCompleted: true,
					},
					{
						id: "lesson-1-3",
						title: "Introduction to CSS",
						duration: "01:45:00",
						type: "video",
						order: 3,
						isCompleted: true,
					},
					{
						id: "lesson-1-4",
						title: "CSS Layout and Flexbox",
						duration: "02:30:00",
						type: "video",
						order: 4,
						isCompleted: false,
					},
					{
						id: "lesson-1-5",
						title: "Responsive Design",
						duration: "02:15:00",
						type: "video",
						order: 5,
						isCompleted: false,
					},
				],
				isCompleted: false,
				progress: 60,
			},
			{
				id: "module-2",
				title: "JavaScript Essentials",
				description: "Master the programming language of the web",
				duration: "6 lessons",
				order: 2,
				lessons: [
					{
						id: "lesson-2-1",
						title: "JavaScript Basics",
						duration: "02:00:00",
						type: "video",
						order: 1,
						isCompleted: false,
					},
					{
						id: "lesson-2-2",
						title: "Functions and Objects",
						duration: "02:30:00",
						type: "video",
						order: 2,
						isCompleted: false,
					},
					{
						id: "lesson-2-3",
						title: "DOM Manipulation",
						duration: "02:15:00",
						type: "video",
						order: 3,
						isCompleted: false,
					},
					{
						id: "lesson-2-4",
						title: "Events and Event Handling",
						duration: "01:45:00",
						type: "video",
						order: 4,
						isCompleted: false,
					},
					{
						id: "lesson-2-5",
						title: "Asynchronous JavaScript",
						duration: "02:30:00",
						type: "video",
						order: 5,
						isCompleted: false,
					},
					{
						id: "lesson-2-6",
						title: "JavaScript Quiz",
						duration: "01:00:00",
						type: "quiz",
						order: 6,
						isCompleted: false,
						quizId: "js-quiz-1",
					},
				],
				isCompleted: false,
				progress: 0,
			},
		],
		lessonCount: 11,
		moduleCount: 2,
		totalVideoDuration: "20 hours",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both",

		// Auth-specific fields
		enrollmentDate: "2023-11-15T00:00:00.000Z",
		progress: 30,
		lastAccessedDate: "2023-12-10T00:00:00.000Z",
		lastAccessedModuleId: "module-1",
		lastAccessedLessonId: "lesson-1-4",
		completedLessons: ["lesson-1-1", "lesson-1-2", "lesson-1-3"],
		quizScores: {},
	},
];

// --- Mock API Functions ---
export const getAuthMockCourses = async (): Promise<AuthCourse[]> => {
	console.log(
		"%c MOCK API: Fetching all authenticated courses ",
		"background: #555; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 350 + Math.random() * 250)
	); // Simulate delay
	return JSON.parse(JSON.stringify(mockAuthCourseData)); // Return a deep copy to prevent accidental mutation
};

export const getAuthMockCourseBySlug = async (
	slug: string
): Promise<AuthCourse | null> => {
	console.log(
		`%c MOCK API: Fetching authenticated course with slug "${slug}" `,
		"background: #555; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 250 + Math.random() * 200)
	); // Simulate delay

	const course = mockAuthCourseData.find((course) => course.slug === slug);
	if (!course) return null;

	return JSON.parse(JSON.stringify(course)); // Return a deep copy
};

export const markLessonCompleteMock = async (
	courseId: string,
	lessonId: string,
	completed: boolean
): Promise<void> => {
	console.log(
		`%c MOCK API: Marking lesson ${lessonId} as ${completed ? "completed" : "incomplete"} `,
		"background: #555; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 200 + Math.random() * 100)
	); // Simulate delay

	// In a real API, this would update the database
	// Here we just simulate a successful response
	return;
};
