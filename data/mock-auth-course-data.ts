// Combined Mock Data and Types for Public and Authenticated Courses
// Origin: Merged from multiple files (interfaces, public data, auth data)

// --- Type Definitions ---

// --- Public Course Related Types ---

export type CourseCategory =
	| "Web Development"
	| "Data Science"
	| "Mobile Development"
	| "Cybersecurity"
	| "Cloud Computing"
	| "AI & ML"
	| "Business"
	| "Design"
	| "Marketing"
	| "Mathematics"
	| "Science"
	| "Language"
	| "Health & Fitness"
	| "Project Management"; // Added based on usage

export interface PublicCourseLesson {
	title: string;
	duration: string; // e.g., HH:MM:SS or "(quiz)"
	isPreview?: boolean; // Based on partner 'is_free' flag
}

export interface PublicCourseModule {
	title: string; // Section title (derived or default)
	duration: string; // e.g., "X lessons"
	lessons?: PublicCourseLesson[];
}

export interface PublicCourseInstructor {
	name: string; // Default name usually
	title?: string; // Optional, maybe derived from category
}

export interface PublicCourse {
	id: string;
	slug: string;
	title: string;
	subtitle?: string; // Often derived from category/subcategory
	description: string; // Contains HTML, needs careful rendering
	category: CourseCategory; // Use the specific type
	image: string; // Keep placeholder as a fallback if video fails/missing
	previewVideoUrl?: string; // URL for the video preview
	instructor: PublicCourseInstructor;
	level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
	tags?: string[]; // Derived from subcategory or other fields
	priceUSD: number; // Default to 0 if not provided by partner
	discountPriceUSD?: number; // Optional
	learningOutcomes?: string[]; // Parsed from partner data
	prerequisites?: string[]; // Parsed from partner data
	modules?: PublicCourseModule[];
	lessonCount: number; // Total number of lessons/quizzes
	moduleCount: number; // Total number of modules/sections
	totalVideoDuration?: string | null; // Calculated, e.g., "Approx. 29.5 hours"
	language?: string; // Default or from data
	certificate?: boolean; // Default assumption
	accessType?: "Lifetime" | "Limited"; // Default assumption
	supportType?: "Instructor" | "Community" | "Both" | "None"; // Default assumption
}

// --- Auth Related Types ---

// Placeholder User type - replace with your actual definition if available
export interface User {
	id: string;
	name: string;
	email: string;
	role: "student" | "teacher" | "admin" | string; // Add other roles as needed
	dateOfBirth?: string;
	classId?: string;
	barcodeId?: string;
	guardianId?: null;
	cartItems?: any[];
	// Add any other relevant user properties
}

export interface AuthResponse {
	user: User;
	token: string;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterData {
	name: string;
	email: string;
	password: string;
	dateOfBirth?: string;
	classId?: string;
	barcodeId?: string;
	guardianId?: null;
	cartItems?: any[];
}

export interface ResetPasswordPayload {
	token: string;
	password: string;
	// confirmPassword is only needed for client-side validation
}

export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isInitialized: boolean;
	isLoading: boolean;
	error: string | null;
	skipOnboarding: boolean;
}

// --- Authenticated Course Related Types ---

export interface AuthLessonContent {
	videoUrl?: string;
	quizId?: string;
	// Add other content types like text content, assignment details etc.
}

export interface AuthLesson {
	id: string;
	title: string;
	type: "video" | "quiz" | "assignment" | "text" | "other"; // Expand as needed
	duration: string; // Original duration string or calculated time
	isPreview: boolean;
	isCompleted: boolean;
	content?: AuthLessonContent; // Optional content details
}

export interface AuthModule {
	id: string;
	title: string;
	order: number; // Order of the module in the course
	description?: string; // Added description
	duration: string; // Original duration string (e.g., "X lessons")
	lessons: AuthLesson[];
}

export interface Assignment {
	id: string;
	title: string;
	description: string;
	status: "pending" | "submitted" | "graded" | "overdue";
	dueDate?: string; // ISO date string
	submissionUrl?: string;
	grade?: number;
	feedback?: string;
}

export interface AuthCourse extends PublicCourse {
	modules: AuthModule[]; // Override modules with the authenticated structure
	enrolmentStatus: "enroled" | "not_enroled" | "pending";
	progress: number; // Percentage completion (0-100)
	completedLessons: string[]; // Array of completed lesson IDs
	quizScores: Record<string, number>; // quizId: score
	notes: any[]; // Define a specific Note type if possible
	discussions: any[]; // Define a specific Discussion thread type if possible
	assignments?: Assignment[];
	enrolmentDate?: string; // ISO date string
	lastAccessed?: string; // ISO date string
	isAvailableForEnrolment?: boolean; // Whether the course is available for enrolment
}

// --- Public Mock Course Data Generation ---

// Helper Functions for Public Data
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
					// Basic decoding for common entities - more robust might be needed
					return item
						.replace(/\\u([\dA-F]{4})/gi, (_, grp) =>
							String.fromCharCode(parseInt(grp, 16))
						)
						.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
						.replace(/"/g, '"')
						.replace(/'/g, "'")
						.replace(/&/g, "&")
						.replace(/</g, "<")
						.replace(/>/g, ">");
				} catch (decodeError) {
					console.warn("Could not decode string entities:", item, decodeError);
					return String(item); // Fallback
				}
			}
			return String(item); // Fallback for non-string items
		});
	} catch (error) {
		// Don't log error in production, maybe just warn in dev
		// console.error("Parse Error in safeParseJsonArray:", jsonString, error);
		return []; // Return empty array on error
	}
}

function slugify(text: string): string {
	if (!text) return "";
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/&/g, "-and-") // Replace & with 'and'
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/[^\w\-]+/g, "") // Remove all non-word chars except -
		.replace(/\-\-+/g, "-") // Replace multiple - with single -
		.replace(/^-+/, "") // Trim - from start of text
		.replace(/-+$/, ""); // Trim - from end of text
}

function mapCategory(
	partnerCategory?: string,
	partnerSubCategory?: string
): CourseCategory {
	const cat = (partnerCategory || partnerSubCategory || "").toLowerCase();
	if (cat.includes("project management") || cat.includes("pmp"))
		return "Project Management";
	if (cat.includes("web development")) return "Web Development";
	if (cat.includes("data science")) return "Data Science";
	// Add more robust category mappings here based on actual partner data
	return "Business"; // Default category if no match
}

function mapLevel(partnerLevel?: string): PublicCourse["level"] {
	const level = (partnerLevel || "").toLowerCase();
	if (level === "beginner") return "Beginner";
	if (level === "intermediate") return "Intermediate";
	if (level === "advanced") return "Advanced";
	return "All Levels"; // Default level
}

function calculateTotalVideoDuration(lessons: any[]): string | null {
	let totalSeconds = 0;
	let foundVideo = false;
	lessons?.forEach((lesson) => {
		// Check if it's a video and has a valid duration format
		if (
			lesson.lesson_type === "video" &&
			typeof lesson.duration === "string" &&
			lesson.duration.match(/^\d{2}:\d{2}:\d{2}$/) // HH:MM:SS
		) {
			try {
				const parts = lesson.duration.split(":").map(Number);
				if (parts.length === 3 && !parts.some(isNaN)) {
					totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
					foundVideo = true;
				} else {
					console.warn(
						`Invalid duration format detected after split: ${lesson.duration}`
					);
				}
			} catch (e) {
				console.warn(`Could not parse duration string: ${lesson.duration}`, e);
			}
		}
	});

	if (!foundVideo || totalSeconds <= 0) {
		return null; // Return null if no valid video durations found
	}

	const hours = totalSeconds / 3600;
	const formattedHours = Number(hours.toFixed(1)); // Format to one decimal place
	return `Approx. ${formattedHours} hours`;
}

// Raw Partner Data (Embedded Here for the example course)
const partnerRawDataPMP: any[] = [
	{
		id: "3",
		title: "PMP Training Day 1",
		duration: "04:00:00",
		course_id: "1",
		section_id: "2",
		video_type: "html5",
		video_url:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+1-20241221_063337-Meeting+Recording+1.mp4",
		video_url_web:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+1-20241221_063337-Meeting+Recording+1.mp4",
		video_type_web: "amazon",
		lesson_type: "video",
		is_free: "0",
		attachment: null,
		attachment_url: "https://sitespower.com/uploads/lesson_files/",
		attachment_type: "file",
		summary: "PMP Training Day 1",
		is_completed: 0,
		course_category: "Project Management",
		course_sub_category: "PMP® Certification Training",
		course_title: "PMP® Certification Training",
		about_course:
			'<p><span id="docs-internal-guid-d01cdc6f-7fff-8b1a-b208-62e414265944"></span></p><p dir="ltr" xss="removed"><span id="docs-internal-guid-874b89a2-7fff-f048-5c2f-c37b62464344"></span></p><p class="MsoNormal"><span lang="EN" xss=removed>The\r\nPMP® (Project Management Professional) Certification Training operates as a\r\nworldwide recognized educational program that improves your project management\r\nabilities and professional opportunities. The course follows the PMBOK® Guide\r\nframework established by PMI in its delivery of vital project management\r\nprinciples and essential tools and techniques. The training program provides\r\ninstruction from PMI-certified teachers who use practical examples and\r\ninteractive exercises to help students pass the PMP® exam while developing\r\nproject leadership skills for various business sectors.<o></o></span></p>',
		short_description:
			"SitesPower' PMP Certification Training is designed to help professionals acquire the knowledge and skills required to pass the Project Management Professional (PMP) certification exam. Our course is designed by industry experts and is aligned with the latest PMBOK Guide - 7th Edition to ensure that you gain a comprehensive understanding of project management concepts and practices. With our course, you can enhance your project management skills and advance your career prospects.",
		description:
			'<span id="docs-internal-guid-21f00479-7fff-104f-568e-777b123647f0"><p dir="ltr" xss="removed">35 Hours of Instructor-Led Training: Comprehensive live sessions delivered by PMI-certified instructors with industry expertise.</p><p dir="ltr" xss="removed">Aligned with the Latest PMI Standards: Training based on the updated PMBOK® Guide and the latest PMP® exam content outline.</p><p dir="ltr" xss="removed">Access to Exclusive Study Materials: Includes digital courseware, downloadable guides, and reference tools for in-depth learning.</p><p dir="ltr" xss="removed">Full-Length Mock Exams & Practice Questions: Evaluate your readiness with mock tests, quizzes, and a question bank of over 1,000 PMP® exam-like questions.</p><p dir="ltr" xss="removed">Scenario-Based Learning: Explore real-world project management scenarios and case studies to develop practical skills.</p><p dir="ltr" xss="removed">Flexible Learning Formats: Choose from live online, self-paced, or classroom sessions to match your schedule.</p><p dir="ltr" xss="removed">PMP Application Assistance: Get step-by-step guidance in completing your PMP exam application for a hassle-free process.</p><p dir="ltr" xss="removed">Interactive Sessions with Real-Time Q&A: Engage with expert trainers during live sessions for personalized insights and clarification.</p><p dir="ltr" xss="removed">Post-Training Support: Access additional resources and expert mentorship to ensure success in your PMP® certification journey.</p><p dir="ltr" xss="removed">Earn 35 PDUs: Fulfill the mandatory 35 Professional Development Units (PDUs) required to take the PMP® exam.</p><div><br></div></span>',
		course_description_question:
			'["PMP Certification Training","PMP Course Benefits"]',
		course_description_answer:
			'[{"show":"1","answer":"<p><strong>PMP Certification Training: Live Online</strong></p>\\r\\n<p>The PMP\\u00ae Certification Training Course from PMI-certified instructors with practical project management experience provides all necessary project management principles<br><br>The training program provides 35 hours of instructor-led live instruction, which targets PMP\\u00ae exam readiness using the current PMBOK\\u00ae Guide and PMI Exam Content Outline.</p>\\r\\n<p><strong>Exclusive Training Resources Include:</strong></p>\\r\\n<ul>\\r\\n<li>Comprehensive course materials that aligned with the latest PMP\\u00ae exam objectives.</li>\\r\\n<li>The platform provides simulated exam conditions through complete practice tests for readiness evaluation.</li>\\r\\n<li>Case Studies and real-world scenarios can help gain insights into effective project management strategies.</li>\\r\\n<li>The course includes practical exercises that improve your skills in project planning together with execution and stakeholder management practices.</li>\\r\\n</ul>\\r\\n<p>\\u00a0The PMP\\u00ae Certification Training provides all the necessary tools to successfully guide projects while improving career opportunities and delivering global recognition and superior project results.</p>"},{"show":"1","answer":"<ul>\\r\\n<li>Acquire comprehensive knowledge and skills in project management</li>\\r\\n<li>Understand the latest project management practices and methodologies</li>\\r\\n<li>Learn from industry experts with real-world experience</li>\\r\\n<li>Gain hands-on experience through real-life projects and case studies</li>\\r\\n<li>Boost your career prospects with a globally recognized PMP certification</li>\\r\\n</ul>"}]',
		outcomes:
			'["Gain a comprehensive understanding of project management principles and best practices.","Learn all concepts and knowledge areas outlined in the PMBOK\\u00ae Guide","Develop skills in initiating, planning, executing, monitoring, controlling, and closing projects","Acquire the knowledge needed to pass the PMP certification exam"]',
		what_will_i_learn: null,
		faqs: '{"What is covered under the 24\\/7 support promise?":"<p><span xss=removed>Our committed team is here to assist you through email, chat, calls, and community forums. On-demand support is available to guide you through the</span><span xss=removed><span>\\u00a0</span>PMP\\u00ae Certification Training</span><span xss=removed>. Once you finish the<span>\\u00a0</span></span><span xss=removed>PMP\\u00ae Certification Training</span><span xss=removed>, you will gain lifelong access to our community forum.</span></p>","What is covered under the 24\\/7 support promise? ":"<p>Project Management Professional (PMP) certification is an internationally acclaimed professional certificate in project management from the Project Management Institute (PMI). This certification includes agile, predictive, and hybrid approaches, testifying to your experience as a certified associate in project leadership and expertise in handling critical situations. Individuals with PMP certification are regarded as great leaders who can make the team work smarter and better.</p>","What are the Career Opportunities for PMP\\u00ae Certified Professionals?":"<p>After obtaining PMP certification, you can access various job roles, including project manager, program manager, portfolio manager, PMO lead, and more. Sitespower Project Management Professional Certification Training ensures that these job roles are within reach, making your transition into them seamless. <br></p>","PMP Exam & Certification?":"You must meet specific education and experience requirements to qualify for the PMP certification. You need either a four-year degree with at least 36 months of project management experience and 35 hours of project management education or a high school diploma with 60 months of project management experience and 35 hours of project management education to become a project management professional. Completing a PMP certification course can help you fulfill the educational requirement."}',
		category_id: "1",
		sub_category_id: "4",
		section: "[1,1,2,1,2]", // This seems unused in the transformation logic shown
		requirements:
			'["Flexi Pass Enabled: Flexibility to reschedule your cohort within first 90 days of access.","Live, online classroom training by top instructors and practitioners","Lifetime access to high-quality self-paced eLearning content curated by industry experts","Learner support and assistance available 24\\/7"]',
		level: "advanced",
		course_agenda_preview_file: null,
		course_agenda_s3_bucket_complete_file: null,
		course_agenda_complete_file: null,
		course_agenda_brochure_type: null,
		course_agenda_brochure: null,
		// This seems unused in the transformation logic shown
		courseexamtitle:
			'{"PMP Career Advantage":"<p><span id=\\"docs-internal-guid-434621b3-7fff-0253-f947-a5f46275bf40\\"><span xss=removed>Recent statistics indicate that PMP-certified professionals earn higher salaries and have better career prospects compared to their non-certified counterparts. </span></span><br></p>","Higher Salary Potential":"On average, PMP-certified professionals earn 25% more than their non-certified counterparts, as reported by the PMI\'s Project Management Salary Survey."," Expertise in project management":"<p>Nearly 75% of organizations worldwide have reported that they give preference to PMP-certified project managers when hiring or promoting employees.<br></p>"}',
		// This seems unused in the transformation logic shown
		courseexamdesc:
			'["<p><span id=\\"docs-internal-guid-434621b3-7fff-0253-f947-a5f46275bf40\\"><span xss=removed>Recent statistics indicate that PMP-certified professionals earn higher salaries and have better career prospects compared to their non-certified counterparts. </span></span><br></p>","On average, PMP-certified professionals earn 25% more than their non-certified counterparts, as reported by the PMI\'s Project Management Salary Survey.","<p>Nearly 75% of organizations worldwide have reported that they give preference to PMP-certified project managers when hiring or promoting employees.<br></p>"]',
		// This seems unused in the transformation logic shown
		coursefaqquestion:
			'["Will I receive a certification upon completion?","What is the cost of the PMP Certification Training?","How many questions are there in the PMP exam, and what is the passing score?","What is the exam format for the PMP certification?","Is there a time limit for completing the PMP exam?"]',
		// This seems unused in the transformation logic shown
		coursefaqanswer:
			'["<p><span id=\\"docs-internal-guid-0b121847-7fff-74fe-598e-afd1c42bf0fa\\"></span></p><p dir=\\"ltr\\" xss=removed><span xss=removed>Upon successfully completing the course and passing the PMP certification exam, you will earn the globally recognized PMP certification.</span></p>","<p><span id=\\"docs-internal-guid-4ec9bfab-7fff-7404-fe5f-294651431ffb\\"><span xss=removed>The cost of the PMP Certification Training varies depending on the region and you will find the pricing for your region on this page. Please get in touch with us for more information.</span></span><br></p>","<p>The PMP exam consists of 180 multiple-choice questions, and the passing score is determined through a psychometric analysis process. PMI does not disclose the passing score, but it is estimated to be around 61% to 65% of the questions answered correctly.</p>","<p>The PMP exam is computer-based and consists of multiple-choice questions. It is administered at Prometric testing centers worldwide.</p>","<p>Yes, candidates have four hours to complete the PMP exam. This includes the time for reviewing exam instructions and providing feedback at the end of the exam.</p>"]',
		user_validity: true, // This seems unused in the transformation logic shown
	},
	// ... (Include all other partnerData items for the PMP course here) ...
	{
		id: "4",
		title: "PMP Training Day 2",
		duration: "03:27:24",
		course_id: "1",
		section_id: "2",
		video_type: "html5",
		video_url:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+2-20241222_064133-Meeting+Recording.mp4",
		video_url_web:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+2-20241222_064133-Meeting+Recording.mp4",
		video_type_web: "amazon",
		lesson_type: "video",
		is_free: "0",
		attachment: null,
		attachment_url: "https://sitespower.com/uploads/lesson_files/",
		attachment_type: "file",
		summary: "PMP Training Day 2",
		is_completed: 0,
		user_validity: true,
	},
	{
		id: "5",
		title: "PMP Training Day 3",
		duration: "03:45:31",
		course_id: "1",
		section_id: "2",
		video_type: "html5",
		video_url:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+3-20250104_063054-Meeting+Recording.mp4",
		video_url_web:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+3-20250104_063054-Meeting+Recording.mp4",
		video_type_web: "amazon",
		lesson_type: "video",
		is_free: "0",
		attachment: null,
		attachment_url: "https://sitespower.com/uploads/lesson_files/",
		attachment_type: "file",
		summary: "PMP Training Day 3",
		is_completed: 0,
		user_validity: true,
	},
	{
		id: "6",
		title: "PMP Training Day 4",
		duration: "02:55:19",
		course_id: "1",
		section_id: "2",
		video_type: "html5",
		video_url:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+4-20250111_043916-Meeting+Recording.mp4",
		video_url_web:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+4-20250111_043916-Meeting+Recording.mp4",
		video_type_web: "amazon",
		lesson_type: "video",
		is_free: "0",
		attachment: null,
		attachment_url: "https://sitespower.com/uploads/lesson_files/",
		attachment_type: "file",
		summary: "PMP Training Day 4",
		is_completed: 0,
		user_validity: true,
	},
	{
		id: "7",
		title: "PMP Training Day 5",
		duration: "03:13:31",
		course_id: "1",
		section_id: "2",
		video_type: "html5",
		video_url:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+5-20250112_041539-Meeting+Recording.mp4",
		video_url_web:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+5-20250112_041539-Meeting+Recording.mp4",
		video_type_web: "amazon",
		lesson_type: "video",
		is_free: "0",
		attachment: null,
		attachment_url: "https://sitespower.com/uploads/lesson_files/",
		attachment_type: "file",
		summary: "PMP Training Day 5",
		is_completed: 0,
		user_validity: true,
	},
	{
		id: "8",
		title: "PMP Training Day 6",
		duration: "03:56:54",
		course_id: "1",
		section_id: "2",
		video_type: "html5",
		video_url:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+6-20250118_063239-Meeting+Recording.mp4",
		video_url_web:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+6-20250118_063239-Meeting+Recording.mp4",
		video_type_web: "amazon",
		lesson_type: "video",
		is_free: "0",
		attachment: null,
		attachment_url: "https://sitespower.com/uploads/lesson_files/",
		attachment_type: "file",
		summary: "PMP Training Day 6",
		is_completed: 0,
		user_validity: true,
	},
	{
		id: "9",
		title: "PMP Training Day 7",
		duration: "03:54:57",
		course_id: "1",
		section_id: "2",
		video_type: "html5",
		video_url:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+7-20250119_063829-Meeting+Recording.mp4",
		video_url_web:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+7-20250119_063829-Meeting+Recording.mp4",
		video_type_web: "amazon",
		lesson_type: "video",
		is_free: "0",
		attachment: null,
		attachment_url: "https://sitespower.com/uploads/lesson_files/",
		attachment_type: "file",
		summary: "PMP Training Day 7",
		is_completed: 0,
		user_validity: true,
	},
	{
		id: "10",
		title: "PMP Training Day 8",
		duration: "04:00:00",
		course_id: "1",
		section_id: "2",
		video_type: "html5",
		video_url:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+8-20250125_050325-Meeting+Recording.mp4",
		video_url_web:
			"https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+8-20250125_050325-Meeting+Recording.mp4",
		video_type_web: "amazon",
		lesson_type: "video",
		is_free: "0",
		attachment: null,
		attachment_url: "https://sitespower.com/uploads/lesson_files/",
		attachment_type: "file",
		summary: "PMP Training Day 8",
		is_completed: 0,
		user_validity: true,
	},
	{
		id: "11",
		title: "Mock Test-1",
		duration: null,
		course_id: "1",
		section_id: "1", // Section 1 for quizzes
		video_type: "",
		video_url: "",
		video_url_web: null,
		video_type_web: null,
		lesson_type: "quiz",
		is_free: "0",
		attachment: '{"total_marks":"100"}',
		attachment_url:
			'https://sitespower.com/uploads/lesson_files/{"total_marks":"100"}', // Seems incorrect, attachment has data
		attachment_type: "json",
		summary:
			"PMP® exam pattern:\r\n261 multiple choice questions\r\n4 hours duration\r\nPassing percentage: 70% and more for gaining PMP Course Completion Certificate.",
		is_completed: 0,
		user_validity: true,
	},
	{
		id: "12",
		title: "Mock Test-2",
		duration: null,
		course_id: "1",
		section_id: "1",
		video_type: "",
		video_url: "",
		video_url_web: null,
		video_type_web: null,
		lesson_type: "quiz",
		is_free: "0",
		attachment: '{"total_marks":"100"}',
		attachment_url:
			'https://sitespower.com/uploads/lesson_files/{"total_marks":"100"}',
		attachment_type: "json",
		summary: "Quiz summary 2...", // Add unique summary if needed
		is_completed: 0,
		user_validity: true,
	},
	{
		id: "13",
		title: "Mock Test-3",
		duration: null,
		course_id: "1",
		section_id: "1",
		video_type: "",
		video_url: "",
		video_url_web: null,
		video_type_web: null,
		lesson_type: "quiz",
		is_free: "0",
		attachment: '{"total_marks":"100"}',
		attachment_url:
			'https://sitespower.com/uploads/lesson_files/{"total_marks":"100"}',
		attachment_type: "json",
		summary: "Quiz summary 3...", // Add unique summary if needed
		is_completed: 0,
		user_validity: true,
	},
	{
		id: "14",
		title: "Mock Test-4",
		duration: null,
		course_id: "1",
		section_id: "1",
		video_type: "",
		video_url: "",
		video_url_web: null,
		video_type_web: null,
		lesson_type: "quiz",
		is_free: "0",
		attachment: '{"total_marks":"100"}',
		attachment_url:
			'https://sitespower.com/uploads/lesson_files/{"total_marks":"100"}',
		attachment_type: "json",
		summary: "Quiz summary 4...", // Add unique summary if needed
		is_completed: 0,
		user_validity: true,
	},
	{
		id: "15",
		title: "Final Test",
		duration: null,
		course_id: "1",
		section_id: "1",
		video_type: "",
		video_url: "",
		video_url_web: null,
		video_type_web: null,
		lesson_type: "quiz",
		is_free: "0",
		attachment: '{"total_marks":"100"}',
		attachment_url:
			'https://sitespower.com/uploads/lesson_files/{"total_marks":"100"}',
		attachment_type: "json",
		summary: "Final assessment for the course.", // Add unique summary if needed
		is_completed: 0,
		user_validity: true,
	},
];

// Transformation Logic applied to embedded data (using an IIFE)
const transformPartnerData = (partnerData: any[]): PublicCourse | null => {
	if (!partnerData || partnerData.length === 0) return null;

	// Find item with most metadata (often the first containing course_title etc.)
	const courseInfo =
		partnerData.find((item) => item.course_title) || partnerData[0];
	if (!courseInfo || !courseInfo.course_id) {
		console.error(
			"Cannot transform course data: Missing course_id or core info."
		);
		return null; // Cannot transform if no core data
	}

	// Find the first video lesson for preview
	const firstVideoLesson = partnerData.find(
		(lesson) =>
			lesson.lesson_type === "video" &&
			(lesson.video_url || lesson.video_url_web)
	);
	const previewVideoUrl =
		firstVideoLesson?.video_url || firstVideoLesson?.video_url_web || undefined;

	// Group lessons by section_id
	const sections: Record<string, typeof partnerData> = {};
	partnerData.forEach((lesson) => {
		const sectionId = String(lesson.section_id || "default"); // Ensure section_id is a string
		if (!sections[sectionId]) sections[sectionId] = [];
		sections[sectionId].push(lesson);
	});

	// Create modules from sections
	const moduleCount = Object.keys(sections).length;
	const modules: PublicCourseModule[] = Object.entries(sections)
		.sort(([idA], [idB]) => parseInt(idA, 10) - parseInt(idB, 10)) // Sort numerically
		.map(([sectionId, lessonsInSection]) => {
			// Determine a better section title if possible
			let sectionTitle = `Section ${sectionId}`; // Default
			const firstLessonTitle = lessonsInSection[0]?.title?.toLowerCase() || "";

			if (lessonsInSection.every((l) => l.lesson_type === "quiz")) {
				sectionTitle = "Assessments & Quizzes";
			} else if (firstLessonTitle.includes("pmp training day")) {
				sectionTitle = "Core Training Modules"; // Example specific to PMP data
			} else if (lessonsInSection.length > 0) {
				// Maybe use the title of the first lesson if descriptive enough?
				// sectionTitle = lessonsInSection[0].title; // Uncomment cautiously
			}

			return {
				title: sectionTitle,
				duration: `${lessonsInSection.length} ${lessonsInSection.length === 1 ? "lesson" : "lessons"}`,
				lessons: lessonsInSection
					.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10)) // Sort lessons by ID within module
					.map(
						(l): PublicCourseLesson => ({
							title: l.title || "Untitled Lesson",
							// Use duration if available and valid, otherwise indicate type
							duration:
								l.duration && typeof l.duration === "string"
									? l.duration
									: `(${l.lesson_type || "lesson"})`,
							isPreview: l.is_free === "1", // Convert '1'/'0' string to boolean
						})
					),
			};
		});

	// Calculate counts and duration
	const lessonCount = partnerData.length;
	const totalVideoDuration = calculateTotalVideoDuration(partnerData);

	// Construct the PublicCourse object
	const publicCourse: PublicCourse = {
		id: String(courseInfo.course_id), // Ensure ID is string
		slug: slugify(courseInfo.course_title || `course-${courseInfo.course_id}`),
		title: courseInfo.course_title || "Untitled Course",
		subtitle: courseInfo.course_sub_category || undefined,
		description:
			courseInfo.description ||
			courseInfo.about_course ||
			courseInfo.short_description ||
			"No description provided.",
		category: mapCategory(
			courseInfo.course_category,
			courseInfo.course_sub_category
		),
		// Use a real image path or keep placeholder
		image: `/images/courses/${slugify(courseInfo.course_title || `course-${courseInfo.course_id}`)}.jpg`, // Example dynamic path
		previewVideoUrl: previewVideoUrl,
		instructor: {
			name: "Expert Instructor", // Replace with actual if available
			title: courseInfo.course_category || "Lead Trainer", // Use category as title hint
		},
		level: mapLevel(courseInfo.level),
		tags: courseInfo.course_sub_category
			? [courseInfo.course_sub_category.trim()] // Use subcategory as tag
			: ["Project Management", "Certification"], // Example default tags
		priceUSD: 199.99, // Example price - pull from data if available
		discountPriceUSD: 149.99, // Example discount
		learningOutcomes: safeParseJsonArray(courseInfo.outcomes),
		prerequisites: safeParseJsonArray(courseInfo.requirements),
		modules: modules,
		lessonCount: lessonCount,
		moduleCount: moduleCount,
		totalVideoDuration: totalVideoDuration,
		language: "English", // Assumption, pull from data if available
		certificate: true, // Assumption for PMP, pull from data if available
		accessType: "Lifetime", // Assumption, pull from data if available
		supportType: "Both", // Assumption, pull from data if available
	};

	return publicCourse;
};

// Additional mock course data for testing
const additionalMockCourses: PublicCourse[] = [
	{
		id: "2",
		slug: "web-development-fundamentals",
		title: "Web Development Fundamentals",
		subtitle: "Learn HTML, CSS, and JavaScript",
		description: "A comprehensive introduction to web development covering HTML, CSS, and JavaScript fundamentals.",
		category: "Web Development",
		image: "/images/courses/web-development-fundamentals.jpg",
		instructor: {
			name: "Sarah Johnson",
			title: "Senior Web Developer",
		},
		level: "Beginner",
		tags: ["HTML", "CSS", "JavaScript", "Frontend"],
		priceUSD: 99.99,
		discountPriceUSD: 79.99,
		learningOutcomes: [
			"Build responsive websites with HTML and CSS",
			"Create interactive web pages with JavaScript",
			"Understand modern web development practices"
		],
		prerequisites: ["Basic computer skills"],
		modules: [
			{
				title: "HTML Basics",
				duration: "5 lessons",
				lessons: [
					{ title: "Introduction to HTML", duration: "00:30:00", isPreview: true },
					{ title: "HTML Elements and Tags", duration: "00:45:00" },
					{ title: "Forms and Input Elements", duration: "00:40:00" },
					{ title: "Semantic HTML", duration: "00:35:00" },
					{ title: "HTML Best Practices", duration: "00:25:00" }
				]
			},
			{
				title: "CSS Styling",
				duration: "6 lessons",
				lessons: [
					{ title: "CSS Basics", duration: "00:30:00" },
					{ title: "Selectors and Properties", duration: "00:40:00" },
					{ title: "Layout with Flexbox", duration: "00:50:00" },
					{ title: "CSS Grid", duration: "00:45:00" },
					{ title: "Responsive Design", duration: "00:55:00" },
					{ title: "CSS Animations", duration: "00:35:00" }
				]
			}
		],
		lessonCount: 11,
		moduleCount: 2,
		totalVideoDuration: "Approx. 7.5 hours",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Community"
	},
	{
		id: "3",
		slug: "data-science-python",
		title: "Data Science with Python",
		subtitle: "Master data analysis and machine learning",
		description: "Learn data science fundamentals using Python, pandas, and scikit-learn.",
		category: "Data Science",
		image: "/images/courses/data-science-python.jpg",
		instructor: {
			name: "Dr. Michael Chen",
			title: "Data Science Lead",
		},
		level: "Intermediate",
		tags: ["Python", "Data Analysis", "Machine Learning", "Pandas"],
		priceUSD: 149.99,
		discountPriceUSD: 119.99,
		learningOutcomes: [
			"Analyze data using Python and pandas",
			"Build machine learning models",
			"Visualize data with matplotlib and seaborn"
		],
		prerequisites: ["Basic Python knowledge"],
		modules: [
			{
				title: "Python for Data Science",
				duration: "4 lessons",
				lessons: [
					{ title: "NumPy Fundamentals", duration: "00:45:00", isPreview: true },
					{ title: "Pandas Data Manipulation", duration: "01:00:00" },
					{ title: "Data Cleaning Techniques", duration: "00:50:00" },
					{ title: "Exploratory Data Analysis", duration: "00:55:00" }
				]
			}
		],
		lessonCount: 4,
		moduleCount: 1,
		totalVideoDuration: "Approx. 3.5 hours",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Instructor"
	},
	{
		id: "4",
		slug: "mobile-app-development",
		title: "Mobile App Development with React Native",
		subtitle: "Build cross-platform mobile apps",
		description: "Create mobile applications for iOS and Android using React Native.",
		category: "Mobile Development",
		image: "/images/courses/mobile-app-development.jpg",
		instructor: {
			name: "Alex Rodriguez",
			title: "Mobile Development Expert",
		},
		level: "Advanced",
		tags: ["React Native", "Mobile", "iOS", "Android"],
		priceUSD: 179.99,
		discountPriceUSD: 139.99,
		learningOutcomes: [
			"Build native mobile apps with React Native",
			"Implement navigation and state management",
			"Deploy apps to app stores"
		],
		prerequisites: ["React.js experience", "JavaScript proficiency"],
		modules: [
			{
				title: "React Native Basics",
				duration: "3 lessons",
				lessons: [
					{ title: "Setting up Development Environment", duration: "00:30:00", isPreview: true },
					{ title: "Components and Styling", duration: "00:45:00" },
					{ title: "Navigation Setup", duration: "00:40:00" }
				]
			}
		],
		lessonCount: 3,
		moduleCount: 1,
		totalVideoDuration: "Approx. 2 hours",
		language: "English",
		certificate: true,
		accessType: "Lifetime",
		supportType: "Both"
	}
];

// Generate the public course data
export const publicMockCourseData: PublicCourse[] = [
	// Process the embedded PMP data
	transformPartnerData(partnerRawDataPMP),
	// Add additional mock courses
	...additionalMockCourses,
].filter((course): course is PublicCourse => course !== null); // Filter out any nulls from failed transformations

// --- Authenticated Mock Course Data Generation ---

export let mockAuthCourseData: AuthCourse[] = publicMockCourseData.map(
	(publicCourse, courseIndex) => {
		// Generate detailed modules and lessons for the authenticated view
		const authModules: AuthModule[] =
			publicCourse.modules?.map((publicModule, moduleIndex) => {
				const moduleId = `module-${publicCourse.id}-${moduleIndex + 1}`;
				const authLessons: AuthLesson[] =
					publicModule.lessons?.map((publicLesson, lessonIndex) => {
						const lessonId = `lesson-${moduleId}-${lessonIndex + 1}`;
						const isQuiz = publicLesson.title.toLowerCase().includes("test"); // More specific check for quiz
						const lessonType: AuthLesson["type"] = isQuiz ? "quiz" : "video"; // Simple type determination

						// Construct content based on type
						let content: AuthLessonContent | undefined;
						if (lessonType === "video") {
							// Try to find the original video URL from raw data if needed, or use a pattern
							// Example: Use a predictable pattern based on lesson title/index
							// Using modulo for variety as in original example
							const videoIndex =
								((courseIndex * 10 + moduleIndex * 5 + lessonIndex) % 8) + 1; // Example variation
							content = {
								videoUrl: `https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+${videoIndex}.mp4`,
							};
						} else if (lessonType === "quiz") {
							content = {
								quizId: lessonId, // Use lesson ID as quiz ID
							};
						}

						return {
							id: lessonId,
							title: publicLesson.title,
							order: lessonIndex + 1,
							type: lessonType,
							duration: publicLesson.duration, // Keep original duration string
							isPreview: publicLesson.isPreview || false,
							isCompleted: false, // Default to not completed
							content: content,
						};
					}) || [];

				return {
					id: moduleId,
					title: publicModule.title,
					// Add a generic description or pull from source if available
					order: moduleIndex + 1,
					description: `Content for ${publicModule.title}.`,
					duration: publicModule.duration, // Keep original module duration string
					lessons: authLessons,
				};
			}) || [];

		// Calculate initial progress (0)
		const progress = 0;

		// Create the authenticated course object
		const authCourse: AuthCourse = {
			...publicCourse, // Spread all properties from PublicCourse
			modules: authModules, // Override with detailed AuthModule structure
			enrolmentStatus: "enroled",
			progress: progress,
			completedLessons: [], // Initially empty
			quizScores: {}, // Initially empty
			notes: [], // Initially empty
			discussions: [], // Initially empty
			assignments: [
				// Example assignment
				{
					id: `assignment-${publicCourse.id}-1`,
					title: "Final Course Project Submission",
					description:
						"Apply the core concepts learned throughout the PMP course in a comprehensive project plan.",
					status: "pending",
					dueDate: new Date(
						Date.now() + 21 * 24 * 60 * 60 * 1000
					).toISOString(), // 21 days from now
				},
			],
			enrolmentDate: new Date(
				Date.now() - 7 * 24 * 60 * 60 * 1000
			).toISOString(), // Enroled 7 days ago
			lastAccessed: new Date(
				Date.now() - 1 * 24 * 60 * 60 * 1000
			).toISOString(), // Accessed yesterday
		};

		return authCourse;
	}
);

// --- Mock API Functions ---

// Public API Mocks
export const getPublicMockCourses = async (): Promise<PublicCourse[]> => {
	console.log(
		"%c MOCK API: Fetching all public courses ",
		"background: #666; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 200 + Math.random() * 300)
	); // Simulate network delay
	// Return a deep copy to prevent mutation of the original mock data
	return JSON.parse(JSON.stringify(publicMockCourseData));
};

export const getPublicMockCourseBySlug = async (
	slug: string
): Promise<PublicCourse | null> => {
	console.log(
		`%c MOCK API: Fetching public course with slug "${slug}" `,
		"background: #666; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 150 + Math.random() * 200)
	); // Simulate delay

	const course = publicMockCourseData.find((c) => c.slug === slug);
	if (!course) return null;

	return JSON.parse(JSON.stringify(course)); // Return a deep copy
};

// Authenticated API Mocks
export const getAuthMockCourses = async (): Promise<AuthCourse[]> => {
	console.log(
		"%c MOCK API: Fetching all authenticated courses ",
		"background: #555; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 300 + Math.random() * 350)
	); // Simulate delay
	return JSON.parse(JSON.stringify(mockAuthCourseData)); // Return a deep copy
};

export const deleteAuthMockCourse = async (courseId: string): Promise<boolean> => {
    const initialLength = mockAuthCourseData.length;
    // Filter out the course with the matching ID
    mockAuthCourseData = mockAuthCourseData.filter(course => course.id !== courseId);
    // Return true if an item was removed, false otherwise
    return mockAuthCourseData.length < initialLength;
};

export const getAuthMockCourseBySlug = async (
	slug: string
): Promise<AuthCourse | null> => {
	console.log(
		`%c MOCK API: Fetching authenticated course with slug "${slug}" `,
		"background: #555; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 250 + Math.random() * 250)
	); // Simulate delay

	const course = mockAuthCourseData.find((c) => c.slug === slug);
	if (!course) return null;

	return JSON.parse(JSON.stringify(course)); // Return a deep copy
};

// Example mutation function (would update state/DB in real app)
export const markLessonCompleteMock = async (
	courseSlug: string, // Use slug as it's often the identifier in URLs
	lessonId: string,
	completed: boolean
): Promise<AuthCourse | null> => {
	console.log(
		`%c MOCK API: Setting lesson ${lessonId} in course ${courseSlug} completion to ${completed} `,
		"background: #555; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 100 + Math.random() * 100)
	); // Simulate small delay

	// Find the course in our "database" (the mock array)
	const courseIndex = mockAuthCourseData.findIndex(
		(c) => c.slug === courseSlug
	);
	if (courseIndex === -1) {
		console.error(`Mock API Error: Course with slug ${courseSlug} not found.`);
		return null; // Course not found
	}

	const course = mockAuthCourseData[courseIndex];
	let lessonFound = false;

	// Find and update the lesson
	const updatedModules = course.modules.map((module) => ({
		...module,
		lessons: module.lessons.map((lesson) => {
			if (lesson.id === lessonId) {
				lessonFound = true;
				return { ...lesson, isCompleted: completed };
			}
			return lesson;
		}),
	}));

	if (!lessonFound) {
		console.error(
			`Mock API Error: Lesson with ID ${lessonId} not found in course ${courseSlug}.`
		);
		// Optionally return the unmodified course or null depending on desired behavior
		return JSON.parse(JSON.stringify(course)); // Return unchanged course copy
	}

	// Update completedLessons array
	let updatedCompletedLessons = [...course.completedLessons];
	if (completed) {
		if (!updatedCompletedLessons.includes(lessonId)) {
			updatedCompletedLessons.push(lessonId);
		}
	} else {
		updatedCompletedLessons = updatedCompletedLessons.filter(
			(id) => id !== lessonId
		);
	}

	// Recalculate progress
	const totalLessons = course.modules.reduce(
		(acc, mod) => acc + mod.lessons.length,
		0
	);
	const completedCount = updatedCompletedLessons.length;
	const newProgress =
		totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

	// Update the course in our mock data array
	mockAuthCourseData[courseIndex] = {
		...course,
		modules: updatedModules,
		completedLessons: updatedCompletedLessons,
		progress: newProgress,
		lastAccessed: new Date().toISOString(), // Update last accessed time
	};

	console.log(
		`%c MOCK API: Course ${courseSlug} progress updated to ${newProgress}%`,
		"background: #555; color: #eee"
	);

	// Return a deep copy of the *updated* course
	return JSON.parse(JSON.stringify(mockAuthCourseData[courseIndex]));
};

// Example: Add mock function for submitting quiz score
export const submitQuizScoreMock = async (
	courseSlug: string,
	quizId: string, // Usually same as lessonId for quizzes
	score: number
): Promise<AuthCourse | null> => {
	console.log(
		`%c MOCK API: Submitting score ${score} for quiz ${quizId} in course ${courseSlug} `,
		"background: #555; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 100 + Math.random() * 100)
	); // Simulate small delay

	const courseIndex = mockAuthCourseData.findIndex(
		(c) => c.slug === courseSlug
	);
	if (courseIndex === -1) {
		console.error(`Mock API Error: Course with slug ${courseSlug} not found.`);
		return null;
	}

	const course = mockAuthCourseData[courseIndex];

	// Ensure the lesson exists and is a quiz
	let isQuizLesson = false;
	course.modules.forEach((mod) => {
		mod.lessons.forEach((les) => {
			if (les.id === quizId && les.type === "quiz") {
				isQuizLesson = true;
			}
		});
	});

	if (!isQuizLesson) {
		console.error(
			`Mock API Error: Lesson ID ${quizId} is not a quiz or does not exist in course ${courseSlug}.`
		);
		return JSON.parse(JSON.stringify(course)); // Return unchanged course copy
	}

	// Update the quiz score
	const updatedQuizScores = {
		...course.quizScores,
		[quizId]: score,
	};

	// Update the course in the mock data array
	mockAuthCourseData[courseIndex] = {
		...course,
		quizScores: updatedQuizScores,
		lastAccessed: new Date().toISOString(),
	};

	// Also mark the quiz lesson as complete upon submission
	// You might call markLessonCompleteMock internally or repeat the logic
	const updatedCourseAfterCompletion = await markLessonCompleteMock(
		courseSlug,
		quizId,
		true
	);

	console.log(
		`%c MOCK API: Quiz ${quizId} score updated for course ${courseSlug}`,
		"background: #555; color: #eee"
	);

	return updatedCourseAfterCompletion; // Return the course state after completion marking
};

// Create a new course
export const createAuthMockCourse = async (courseData: any): Promise<AuthCourse> => {
	console.log(
		`%c MOCK API: Creating new course`,
		"background: #555; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 300 + Math.random() * 300)
	); // Simulate delay

	// Generate a unique ID and slug
	const courseId = `course-${Date.now()}`;
	const slug = courseData.title ? slugify(courseData.title) : `course-${Date.now()}`;

	// Create basic module and lesson structure if not provided
	const modules = courseData.modules?.map((module: any, moduleIndex: number) => {
		const moduleId = `module-${courseId}-${moduleIndex + 1}`;
		return {
			id: moduleId,
			title: module.title || `Module ${moduleIndex + 1}`,
			description: module.description || "",
			order: moduleIndex + 1,
			duration: "Multiple lessons",
			lessons: module.lessons?.map((lesson: any, lessonIndex: number) => {
				const lessonId = `lesson-${moduleId}-${lessonIndex + 1}`;
				return {
					id: lessonId,
					title: lesson.title || `Lesson ${lessonIndex + 1}`,
					type: lesson.type || "video",
					duration: lesson.duration || "00:30:00",
					isPreview: false,
					isCompleted: false,
					content: lesson.type === "video" ? { videoUrl: "" } : undefined,
				};
			}) || [],
		};
	}) || [];

	// Create the new course object
	const newCourse: AuthCourse = {
		id: courseId,
		slug: slug,
		title: courseData.title || "New Course",
		subtitle: courseData.subtitle || "",
		description: courseData.description || "",
		category: courseData.category || "Business",
		image: courseData.image || "/placeholder.svg",
		instructor: {
			name: courseData.instructorId || "Instructor Name",
			title: "Instructor",
		},
		level: courseData.level || "All Levels",
		tags: Array.isArray(courseData.tags) ? courseData.tags : [],
		priceUSD: typeof courseData.price === 'number' ? courseData.price : 0,
		discountPriceUSD: typeof courseData.discountPrice === 'number' ? courseData.discountPrice : undefined,
		learningOutcomes: Array.isArray(courseData.learningOutcomes) ? courseData.learningOutcomes : [],
		prerequisites: Array.isArray(courseData.prerequisites) ? courseData.prerequisites : [],
		modules: modules,
		lessonCount: modules.reduce((count: number, module: any) => count + module.lessons.length, 0),
		moduleCount: modules.length,
		totalVideoDuration: "Approx. 10 hours",
		language: courseData.language || "English",
		certificate: courseData.certificate !== undefined ? courseData.certificate : true,
		accessType: courseData.accessType || "Lifetime",
		supportType: courseData.supportType || "Both",
		isAvailableForEnrolment: courseData.available_for_enrolment !== undefined ? courseData.available_for_enrolment : true,
		enrolmentStatus: "enroled",
		progress: 0,
		completedLessons: [],
		quizScores: {},
		notes: [],
		discussions: [],
		assignments: [],
		enrolmentDate: new Date().toISOString(),
		lastAccessed: new Date().toISOString(),
	};

	// Add the new course to the mock data
	mockAuthCourseData.push(newCourse);

	console.log(
		`%c MOCK API: Created new course with ID ${courseId}`,
		"background: #555; color: #eee"
	);

	// Return a deep copy of the new course
	return JSON.parse(JSON.stringify(newCourse));
};

// Update an existing course
export const updateAuthMockCourse = async (courseId: string, courseData: any): Promise<AuthCourse | null> => {
	console.log(
		`%c MOCK API: Updating course with ID ${courseId}`,
		"background: #555; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 300 + Math.random() * 300)
	); // Simulate delay

	// Find the course in our mock data
	const courseIndex = mockAuthCourseData.findIndex((c) => c.id === courseId);
	if (courseIndex === -1) {
		console.error(`Mock API Error: Course with ID ${courseId} not found.`);
		return null;
	}

	const existingCourse = mockAuthCourseData[courseIndex];

	// Update modules if provided
	const updatedModules = courseData.modules?.map((module: any, moduleIndex: number) => {
		// Try to find existing module by index or create a new one
		const existingModule = existingCourse.modules[moduleIndex] || { id: `module-${courseId}-${moduleIndex + 1}` };

		return {
			...existingModule,
			title: module.title || existingModule.title,
			description: module.description || existingModule.description,
			order: moduleIndex + 1,
			lessons: module.lessons?.map((lesson: any, lessonIndex: number) => {
				// Try to find existing lesson by index or create a new one
				const existingLesson = existingModule.lessons?.[lessonIndex] || {
					id: `lesson-${existingModule.id}-${lessonIndex + 1}`,
					isCompleted: false,
					isPreview: false,
				};

				return {
					...existingLesson,
					title: lesson.title || existingLesson.title,
					type: lesson.type || existingLesson.type,
					duration: lesson.duration || existingLesson.duration,
					// Preserve completion status and other auth-specific properties
				};
			}) || existingModule.lessons || [],
		};
	}) || existingCourse.modules;

	// Create the updated course object
	const updatedCourse: AuthCourse = {
		...existingCourse,
		title: courseData.title || existingCourse.title,
		subtitle: courseData.subtitle || existingCourse.subtitle,
		description: courseData.description || existingCourse.description,
		category: courseData.category || existingCourse.category,
		image: courseData.image || existingCourse.image,
		level: courseData.level || existingCourse.level,
		tags: Array.isArray(courseData.tags) ? courseData.tags : existingCourse.tags,
		priceUSD: typeof courseData.price === 'number' ? courseData.price : existingCourse.priceUSD,
		discountPriceUSD: typeof courseData.discountPrice === 'number' ? courseData.discountPrice : existingCourse.discountPriceUSD,
		learningOutcomes: Array.isArray(courseData.learningOutcomes) ? courseData.learningOutcomes : existingCourse.learningOutcomes,
		prerequisites: Array.isArray(courseData.prerequisites) ? courseData.prerequisites : existingCourse.prerequisites,
		modules: updatedModules,
		lessonCount: updatedModules.reduce((count: number, module: any) => count + module.lessons.length, 0),
		moduleCount: updatedModules.length,
		language: courseData.language || existingCourse.language,
		certificate: courseData.certificate !== undefined ? courseData.certificate : existingCourse.certificate,
		accessType: courseData.accessType || existingCourse.accessType,
		supportType: courseData.supportType || existingCourse.supportType,
		isAvailableForEnrolment: courseData.available_for_enrolment !== undefined ? courseData.available_for_enrolment : existingCourse.isAvailableForEnrolment,
		lastAccessed: new Date().toISOString(),
	};

	// Update the course in our mock data
	mockAuthCourseData[courseIndex] = updatedCourse;

	console.log(
		`%c MOCK API: Updated course with ID ${courseId}`,
		"background: #555; color: #eee"
	);

	// Return a deep copy of the updated course
	return JSON.parse(JSON.stringify(updatedCourse));
};
