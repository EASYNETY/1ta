// features/public-course/types/public-course-interface.ts

export interface PublicCourse {
	id: string;
	slug: string;
	title: string;
	subtitle?: string; // Often derived from category/subcategory
	description: string; // Contains HTML, needs careful rendering
	category: string; // Simplified category name
	image: string; // Keep placeholder as a fallback if video fails/missing
	previewVideoUrl?: string; // *** ADDED: URL for the video preview ***
	instructor: {
		name: string; // Default name usually
		title?: string; // Optional, maybe derived from category
	};
	level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
	tags?: string[]; // Derived from subcategory or other fields
	// --- Pricing needed for cart functionality ---
	priceUSD: number; // Default to 0 if not provided by partner
	discountPriceUSD?: number; // Optional
	priceIndividualUSD?: number; // Default to 0 if not provided by partner
	pricing?: {
		corporate?: {
			[corporateId: string]: number; // Corporate pricing per corporate ID
		};
		individual?: number; // Individual pricing
	};
	discountPriceCorporateUSD?: number; // Optional discount for corporate pricing
	discountPriceIndividualUSD?: number; // Optional discount for individual pricing

	// --- End Pricing ---
	learningOutcomes?: string[]; // Parsed from partner data
	prerequisites?: string[]; // Parsed from partner data
	modules?: {
		title: string; // Section title (derived or default)
		duration: string; // e.g., "X lessons"
		lessons?: {
			title: string;
			duration: string; // e.g., HH:MM:SS or "(quiz)"
			isPreview?: boolean; // Based on partner 'is_free' flag
		}[];
	}[];
	lessonCount: number; // Total number of lessons/quizzes
	moduleCount: number; // Total number of modules/sections
	totalVideoDuration?: string | null; // Calculated, e.g., "Approx. 29.5 hours"
	language?: string; // Default or from data
	certificate?: boolean; // Default assumption
	accessType?: "Lifetime" | "Limited"; // Default assumption
	supportType?: "Instructor" | "Community" | "Both" | "None"; // Default assumption
}

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
	| "Project Management";
