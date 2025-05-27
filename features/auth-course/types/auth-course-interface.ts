// features/auth-course/types/auth-course-interface.ts

// Extend the PublicCourse interface with authenticated user-specific fields
export interface AuthCourse {
	id: string;
	slug: string;
	title: string;
	subtitle?: string;
	description: string;
	category: string;
	image: string;
	iconUrl?: string;
	previewVideoUrl?: string;
	instructor: {
		name: string;
		title?: string;
		bio?: string;
		avatar?: string;
	};
	level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
	tags?: string[];
	available_for_enrolment?: boolean; // Whether the course is available for enrolment
	isAvailableForEnrolment?: boolean; // Alternative field name for available_for_enrolment
	priceUSD: number;
	priceNaira?: number; // Price in Naira
	discountPriceUSD?: number;
	discountPriceNaira?: number; // Discount price in Naira
	learningOutcomes?: string[];
	prerequisites?: string[];
	modules: AuthCourseModule[];
	lessonCount: number;
	moduleCount: number;
	totalVideoDuration?: string | null;
	language?: string;
	certificate?: boolean;
	accessType?: "Lifetime" | "Limited";
	supportType?: "Instructor" | "Community" | "Both" | "None";

	// Auth-specific fields
	enrollmentDate?: string;
	expiryDate?: string;
	progress?: number; // 0-100
	lastAccessedDate?: string;
	lastAccessedModuleId?: string;
	lastAccessedLessonId?: string;
	completedLessons?: string[]; // Array of lesson IDs
	quizScores?: Record<string, number>; // Quiz ID to score mapping
	notes?: AuthCourseNote[];
	bookmarks?: AuthCourseBookmark[];
	certificateUrl?: string;
	certificateIssuedDate?: string;
}

export interface AuthCourseModule {
	id: string;
	title: string;
	description?: string;
	duration: string;
	order: number;
	lessons: AuthCourseLesson[];
	isCompleted?: boolean;
	progress?: number; // 0-100
}

export interface AuthCourseLesson {
	id: string;
	title: string;
	description?: string;
	duration: string;
	type: "video" | "quiz" | "assignment" | "text" | "download";
	order: number;
	isPreview?: boolean;
	isCompleted?: boolean;
	videoUrl?: string;
	textContent?: string;
	downloadUrl?: string;
	quizId?: string;
	assignmentId?: string;
	lastAccessedDate?: string;
	isUnlocked?: boolean; // For locked lessons
}

export interface AuthCourseNote {
	id: string;
	lessonId: string;
	content: string;
	timestamp?: number; // For video notes
	createdAt: string;
	updatedAt?: string;
}

export interface AuthCourseBookmark {
	id: string;
	lessonId: string;
	timestamp: number; // For video bookmarks
	title: string;
	createdAt: string;
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

export interface AuthCourse {
	id: string;
	slug: string;
	title: string;
	subtitle?: string;
	description: string;
	category: string; // Consider using CourseCategory type if shared
	image: string;
	iconUrl?: string;
	previewVideoUrl?: string;
	instructor: {
		name: string;
		title?: string;
		bio?: string;
		avatar?: string;
	};
	level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
	tags?: string[];
	available_for_enrolment?: boolean; // Whether the course is available for enrolment
	isAvailableForEnrolment?: boolean; // Alternative field name for available_for_enrolment
	priceUSD: number;
	priceNaira?: number; // Price in Naira
	discountPriceUSD?: number;
	discountPriceNaira?: number; // Discount price in Naira
	learningOutcomes?: string[];
	prerequisites?: string[];
	modules: AuthCourseModule[];
	lessonCount: number;
	moduleCount: number;
	totalVideoDuration?: string | null;
	language?: string;
	certificate?: boolean;
	accessType?: "Lifetime" | "Limited";
	supportType?: "Instructor" | "Community" | "Both" | "None";

	// Auth-specific fields (Add missing ones here)
	enrolmentStatus: "enrolled" | "not_enrolled" | "pending"; // <-- ADDED
	enrolmentDate?: string;
	expiryDate?: string;
	progress?: number; // 0-100
	lastAccessedDate?: string;
	lastAccessedModuleId?: string; // Consider renaming for clarity if needed
	lastAccessedLessonId?: string; // Consider renaming for clarity if needed
	completedLessons?: string[]; // Array of lesson IDs
	quizScores?: Record<string, number>; // Quiz ID to score mapping
	notes?: AuthCourseNote[];
	bookmarks?: AuthCourseBookmark[];
	discussions: any[]; // <-- ADDED (Use a specific type like DiscussionThread[] if available)
	assignments?: Assignment[]; // <-- ADDED
	certificateUrl?: string;
	certificateIssuedDate?: string;
	lastAccessed?: string; // <-- ADDED (Consolidate last access fields?)
}

export interface AuthCourseModule {
	id: string;
	title: string;
	description?: string;
	duration: string;
	order: number;
	lessons: AuthCourseLesson[];
	isCompleted?: boolean; // Added for consistency?
	progress?: number; // 0-100 - Added for consistency?
}

// --- Add AuthLessonContent Interface ---
export interface AuthLessonContent {
	videoUrl?: string;
	quizId?: string;
	textContent?: string; // Added based on interface definition
	downloadUrl?: string; // Added based on interface definition
	assignmentId?: string; // Added based on interface definition
	// Add other content types like assignment details etc.
}
// --- End AuthLessonContent Interface ---

export interface AuthCourseLesson {
	id: string;
	title: string;
	description?: string;
	duration: string;
	type: "video" | "quiz" | "assignment" | "text" | "download";
	order: number;
	isPreview?: boolean;
	isCompleted?: boolean;
	content?: AuthLessonContent; // <-- UPDATED to use interface
	lastAccessedDate?: string; // <-- Consider renaming if needed
	isUnlocked?: boolean; // For locked lessons
	// Remove duplicated fields now in 'content' if they were here before
	// videoUrl?: string; // Moved to content
	// textContent?: string; // Moved to content
	// downloadUrl?: string; // Moved to content
	// quizId?: string; // Moved to content
	// assignmentId?: string; // Moved to content
}

export interface AuthCourseNote {
	id: string;
	lessonId: string;
	content: string;
	timestamp?: number; // For video notes
	createdAt: string;
	updatedAt?: string;
}

export interface AuthCourseBookmark {
	id: string;
	lessonId: string;
	timestamp: number; // For video bookmarks
	title: string;
	createdAt: string;
}

export type CourseProgressStatus = "not-started" | "in-progress" | "completed";
