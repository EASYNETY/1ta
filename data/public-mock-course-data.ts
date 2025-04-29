// data/public-mock-course-data.ts

import {
	PublicCourse,
	CourseCategory,
} from "@/features/public-course/types/public-course-interface"; // Adjust path as needed

// --- Helper Functions ---
function safeParseJsonArray(jsonString: string | undefined | null): string[] {
	if (!jsonString) return [];
	try {
		// Attempt to parse the JSON string
		const parsed = JSON.parse(jsonString);

		// Ensure the parsed result is an array
		if (!Array.isArray(parsed)) {
			console.warn("Parsed JSON is not an array:", jsonString);
			return [];
		}

		// Map items, decode HTML entities, and ensure they are strings
		return parsed.map((item) => {
			if (typeof item === "string") {
				try {
					// More robust decoding might be needed for complex cases
					return item
						.replace(/\\u([\dA-F]{4})/gi, (match, grp) =>
							String.fromCharCode(parseInt(grp, 16))
						) // Handle \uXXXX escapes
						.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)) // Handle &#DEC;
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
		console.error("Parse Error in safeParseJsonArray:", jsonString, error);
		return [];
	}
}

function slugify(text: string): string {
	if (!text) return "";
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/&/g, "-and-")
		.replace(/\s+/g, "-")
		.replace(/[^\w\-]+/g, "") // Allow letters, numbers, underscore, hyphen
		.replace(/\-\-+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "");
}

function mapCategory(
	partnerCategory?: string,
	partnerSubCategory?: string
): CourseCategory {
	const cat = (partnerCategory || partnerSubCategory || "").toLowerCase();
	if (cat.includes("project management") || cat.includes("pmp"))
		return "Project Management";
	// Add more category mappings here
	return "Business"; // Default category
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
	lessons.forEach((lesson) => {
		if (
			lesson.lesson_type === "video" &&
			typeof lesson.duration === "string" &&
			lesson.duration.match(/^\d{2}:\d{2}:\d{2}$/) // Validate HH:MM:SS format
		) {
			try {
				const parts = lesson.duration.split(":").map(Number);
				// Double check parts are valid numbers after map
				if (parts.length === 3 && !parts.some(isNaN)) {
					totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
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

	if (totalSeconds <= 0) {
		// Check if any valid duration was added
		return null;
	}

	const hours = totalSeconds / 3600;
	// Format to one decimal place, handle potential floating point issues
	const formattedHours = Number(hours.toFixed(1));
	return `Approx. ${formattedHours} hours`;
}

// --- Transformation Logic applied to embedded data ---

export const publicMockCourseData: PublicCourse[] = [
	// We assume the raw data below represents ONE course.
	// The IIFE processes this single course data array.
	(() => {
		// --- The Raw Partner Data (Embedded Here) ---
		const partnerData: any[] = [
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
				section: "[1,1,2,1,2]",
				requirements:
					'["Flexi Pass Enabled: Flexibility to reschedule your cohort within first 90 days of access.","Live, online classroom training by top instructors and practitioners","Lifetime access to high-quality self-paced eLearning content curated by industry experts","Learner support and assistance available 24\\/7"]',
				level: "advanced",
				course_agenda_preview_file: null,
				course_agenda_s3_bucket_complete_file: null,
				course_agenda_complete_file: null,
				course_agenda_brochure_type: null,
				course_agenda_brochure: null,
				courseexamtitle:
					'{"PMP Career Advantage":"<p><span id=\\"docs-internal-guid-434621b3-7fff-0253-f947-a5f46275bf40\\"><span xss=removed>Recent statistics indicate that PMP-certified professionals earn higher salaries and have better career prospects compared to their non-certified counterparts. </span></span><br></p>","Higher Salary Potential":"On average, PMP-certified professionals earn 25% more than their non-certified counterparts, as reported by the PMI\'s Project Management Salary Survey."," Expertise in project management":"<p>Nearly 75% of organizations worldwide have reported that they give preference to PMP-certified project managers when hiring or promoting employees.<br></p>"}',
				courseexamdesc:
					'["<p><span id=\\"docs-internal-guid-434621b3-7fff-0253-f947-a5f46275bf40\\"><span xss=removed>Recent statistics indicate that PMP-certified professionals earn higher salaries and have better career prospects compared to their non-certified counterparts. </span></span><br></p>","On average, PMP-certified professionals earn 25% more than their non-certified counterparts, as reported by the PMI\'s Project Management Salary Survey.","<p>Nearly 75% of organizations worldwide have reported that they give preference to PMP-certified project managers when hiring or promoting employees.<br></p>"]',
				coursefaqquestion:
					'["Will I receive a certification upon completion?","What is the cost of the PMP Certification Training?","How many questions are there in the PMP exam, and what is the passing score?","What is the exam format for the PMP certification?","Is there a time limit for completing the PMP exam?"]',
				coursefaqanswer:
					'["<p><span id=\\"docs-internal-guid-0b121847-7fff-74fe-598e-afd1c42bf0fa\\"></span></p><p dir=\\"ltr\\" xss=removed><span xss=removed>Upon successfully completing the course and passing the PMP certification exam, you will earn the globally recognized PMP certification.</span></p>","<p><span id=\\"docs-internal-guid-4ec9bfab-7fff-7404-fe5f-294651431ffb\\"><span xss=removed>The cost of the PMP Certification Training varies depending on the region and you will find the pricing for your region on this page. Please get in touch with us for more information.</span></span><br></p>","<p>The PMP exam consists of 180 multiple-choice questions, and the passing score is determined through a psychometric analysis process. PMI does not disclose the passing score, but it is estimated to be around 61% to 65% of the questions answered correctly.</p>","<p>The PMP exam is computer-based and consists of multiple-choice questions. It is administered at Prometric testing centers worldwide.</p>","<p>Yes, candidates have four hours to complete the PMP exam. This includes the time for reviewing exam instructions and providing feedback at the end of the exam.</p>"]',
				user_validity: true,
			},
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
				summary:
					",PMP® exam pattern:\r\n261 multiple choice questions\r\n4 hours duration\r\nPassing percentage: 70% and more for gaining PMP Course Completion Certificate.",
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
				summary:
					"PMP® exam pattern:\r\n261 multiple choice questions\r\n4 hours duration\r\nPassing percentage: 70% and more for gaining PMP Course Completion Certificate.",
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
				summary:
					"PMP® exam pattern:\r\n261 multiple choice questions\r\n4 hours duration\r\nPassing percentage: 70% and more for gaining PMP Course Completion Certificate.",
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
				summary:
					"PMP® exam pattern:\r\n261 multiple choice questions\r\n4 hours duration\r\nPassing percentage: 70% and more for gaining PMP Course Completion Certificate.",
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
				summary:
					"PMP® exam pattern:\r\n261 multiple choice questions\r\n4 hours duration\r\nPassing percentage: 70% and more for gaining PMP Course Completion Certificate.",
				is_completed: 0,
				user_validity: true,
			},
		];
		// --- End of Raw Partner Data ---

		// Find item with most metadata (often the first)
		const courseInfo =
			partnerData.find((item) => item.course_title) || partnerData[0];
		if (!courseInfo) return null; // Cannot transform if no data

		// Find the first video lesson for preview
		const firstVideoLesson = partnerData.find(
			(lesson) =>
				lesson.lesson_type === "video" &&
				(lesson.video_url || lesson.video_url_web)
		);
		const previewVideoUrl =
			firstVideoLesson?.video_url ||
			firstVideoLesson?.video_url_web ||
			undefined;

		// Group lessons by section_id
		const sections: Record<string, typeof partnerData> = {};
		partnerData.forEach((lesson) => {
			if (!sections[lesson.section_id]) sections[lesson.section_id] = [];
			sections[lesson.section_id].push(lesson);
		});

		// Create modules
		const moduleCount = Object.keys(sections).length;
		const modules = Object.entries(sections)
			.sort(([idA], [idB]) => parseInt(idA, 10) - parseInt(idB, 10))
			.map(([sectionId, lessonsInSection]) => {
				let sectionTitle = `Section ${sectionId}`; // Default title
				if (
					sectionId === "1" &&
					lessonsInSection.every((l) => l.lesson_type === "quiz")
				)
					sectionTitle = "Assessments & Quizzes";
				else if (
					sectionId === "2" &&
					lessonsInSection.every((l) => l.lesson_type === "video")
				)
					sectionTitle = "Core Training Modules";
				return {
					title: sectionTitle,
					duration: `${lessonsInSection.length} ${lessonsInSection.length === 1 ? "lesson" : "lessons"}`,
					lessons: lessonsInSection.map((l) => ({
						title: l.title,
						duration: l.duration || `(${l.lesson_type})`,
						isPreview: l.is_free === "1",
					})),
				};
			});

		// Calculate counts and duration
		const lessonCount = partnerData.length;
		const totalVideoDuration = calculateTotalVideoDuration(partnerData);

		// Construct the PublicCourse object
		const publicCourse: PublicCourse = {
			id: courseInfo.course_id,
			slug: slugify(
				courseInfo.course_title || `course-${courseInfo.course_id}`
			),
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
			image: "/placeholder.svg", // Fallback image path
			previewVideoUrl: previewVideoUrl, // Use the found video URL
			instructor: {
				name: "Expert Instructor", // Generic public name
				title: courseInfo.course_category || undefined, // Use category as title hint
			},
			level: mapLevel(courseInfo.level),
			tags: courseInfo.course_sub_category
				? [courseInfo.course_sub_category]
				: [],
			priceUSD: 0, // Defaulting to 0 as no price in partner data
			discountPriceUSD: undefined, // No discount info
			learningOutcomes: safeParseJsonArray(courseInfo.outcomes),
			prerequisites: safeParseJsonArray(courseInfo.requirements),
			modules: modules,
			lessonCount: lessonCount,
			moduleCount: moduleCount,
			totalVideoDuration: totalVideoDuration,
			language: "English", // Assumption
			certificate: true, // Assumption for PMP
			accessType: "Lifetime", // Assumption
			supportType: "Community", // Assumption
		};

		return publicCourse; // Return the single transformed course object
	})(),
	// Add more IIFE blocks here if you have data for other courses
	// to transform and add to the array. Example:
	// (() => {
	//    const anotherCoursePartnerData = [ { course_id: "2", ... }, ... ];
	//    // ... transformation logic for course 2 ...
	//    return transformedCourse2;
	// })(),
].filter(Boolean) as PublicCourse[]; // Filter out any potential nulls from failed transformations

export const getPublicMockCourses = async (): Promise<PublicCourse[]> => {
	console.log(
		"%c MOCK API: Fetching all courses ",
		"background: #555; color: #eee"
	);
	await new Promise((resolve) =>
		setTimeout(resolve, 350 + Math.random() * 250)
	); // Simulate delay
	// Return a deep copy to prevent accidental mutation of original mock data
	return JSON.parse(JSON.stringify(publicMockCourseData));
};
