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
	previewVideoUrl?: string;
	instructor: {
		name: string;
		title?: string;
		bio?: string;
		avatar?: string;
	};
	level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
	tags?: string[];
	priceUSD: number;
	discountPriceUSD?: number;
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

export type CourseProgressStatus = "not-started" | "in-progress" | "completed";
