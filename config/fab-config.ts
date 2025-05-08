// src/config/fab-config.ts
import React from "react";
import {
	Plus,
	QrCode,
	Barcode as BarcodeIcon,
	PencilSimpleLine,
	Ticket,
	UserPlus,
	ChalkboardTeacher,
	BookOpen,
	CalendarPlus,
	Icon, // Import base Icon type if needed for typing
} from "phosphor-react";
import { UserRole } from "@/types/user.types";

// Define the possible action types the FAB can perform
export type FabActionType =
	| "navigate"
	| "showStudentBarcode"
	| "openScanModal" // Example: Trigger a scanning modal/component directly
	| "openCreateChatModal"
	| "openCreateTicketModal"
	| "openCreateClassModal"
	| "openCreateStudentModal"
	| "openCreateCourseModal"
	| "openCreateEventModal"
	| "none"; // Represents no FAB action

// Define the structure for a single FAB configuration rule
export interface FabConfigRule {
	/** Regex or string to match the pathname */
	pathPattern: RegExp | string;
	/** Roles for which this rule applies */
	roles: UserRole[];
	/** The type of action to perform */
	actionType: FabActionType;
	/** Aria label for accessibility */
	ariaLabel: string;
	/** Icon component to display */
	icon: React.ElementType<IconProps>; // Use Phosphor's IconProps or a suitable type
	/** Optional: Href for navigation actions */
	href?: string;
	/** Optional: Priority for rule matching (higher first) - useful for overrides */
	priority?: number;
	requiredFlags?: Array<"isCorporateManager">; // NEW: Check if user MUST have these flags
	excludeFlags?: Array<"isCorporateManager">; // NEW: Check if user MUST NOT have these flags
}

// Define the props needed by Phosphor icons (adjust if needed)
interface IconProps {
	size?: number | string;
	weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
	color?: string;
	mirrored?: boolean;
}

// Define all FAB configuration rules
// Order matters: More specific rules (higher priority or earlier in the array) should come first.
export const fabConfigurations: FabConfigRule[] = [
	// --- Hide FAB ---
	{
		pathPattern: /^\/attendance\/scan$/, // Exact match for scan page
		roles: ["admin", "teacher", "student"],
		actionType: "none",
		ariaLabel: "",
		icon: Plus, // Placeholder icon, won't be shown
		priority: 100, // High priority to override others
	},
	{
		pathPattern: /^\/settings|\/profile|\/subscription/, // Matches settings, profile, subscription
		roles: ["admin", "teacher", "student"],
		actionType: "none",
		ariaLabel: "",
		icon: Plus,
		priority: 90,
	},
	{
		pathPattern: /^\/support\/create$/, // Hide on create ticket page for student
		roles: ["student"],
		actionType: "none",
		ariaLabel: "",
		icon: Plus,
		priority: 85,
	},

	// --- Specific Page Actions ---
	// --- NEW: Corporate Management FAB ---
	{
		pathPattern: /^\/corporate-management/, // Matches the manager dashboard and subpages
		roles: ["student"], // Only for users with student role
		requiredFlags: ["isCorporateManager"], // Specifically for managers
		actionType: "navigate", // Or "openCreateStudentModal" if using a modal
		ariaLabel: "Add New Student",
		icon: UserPlus, // Icon for adding a student
		href: "/corporate-management/students/create", // Link to the create page
		priority: 75, // High priority for this specific section
	},
	{
		pathPattern: /^\/attendance$/, // Attendance list page
		roles: ["admin", "teacher"],
		actionType: "navigate", // Simple navigation to scan page
		ariaLabel: "Scan Attendance",
		icon: QrCode,
		href: "/attendance/scan",
		priority: 80,
	},
	{
		pathPattern: /^\/attendance$/, // Attendance list page
		roles: ["student"],
		actionType: "showStudentBarcode", // Trigger modal
		ariaLabel: "Show My Barcode",
		icon: BarcodeIcon,
		priority: 80,
	},
	{
		pathPattern: /^\/chat$/, // Any chat page (list or specific room)
		roles: ["admin", "teacher", "student"],
		// actionType: "openCreateChatModal", // Example: Trigger a modal
		actionType: "navigate", // Or navigate to a create page
		ariaLabel: "Start New Chat",
		icon: PencilSimpleLine, // Maybe a pencil icon for creating
		href: "/chat/create", // Navigate to create chat page/view
		priority: 70,
	},
	{
		pathPattern: /^\/courses$/, // Courses list/details pages
		roles: ["admin"],
		// actionType: "openCreateCourseModal",
		actionType: "navigate",
		ariaLabel: "Create Course Template",
		icon: BookOpen,
		href: "/courses/create",
		priority: 60,
	},
	{
		pathPattern: /^\/courses$/, // Courses list/details pages
		roles: ["teacher"],
		// actionType: "openCreateClassModal",
		actionType: "navigate",
		ariaLabel: "Create New Class",
		icon: ChalkboardTeacher,
		href: "/classes/create",
		priority: 60,
	},
	{
		pathPattern: /^\/timetable$/, // Timetable page
		roles: ["admin", "teacher"],
		// actionType: "openCreateEventModal",
		actionType: "navigate",
		ariaLabel: "Add Class/Event",
		icon: CalendarPlus,
		href: "/classes/create", // Reuse class creation? Or a dedicated event creation?
		priority: 50,
	},
	{
		pathPattern: /^\/support$/, // Support ticket list page (exact match)
		roles: ["student"],
		actionType: "navigate",
		ariaLabel: "Create Support Ticket",
		icon: Ticket,
		href: "/support/create",
		priority: 40,
	},
	{
		pathPattern: /^\/users$/, // Admin User management pages
		roles: ["admin"],
		// actionType: "openCreateStudentModal",
		actionType: "navigate",
		ariaLabel: "Add New User",
		icon: UserPlus,
		href: "/users/create",
		priority: 30,
	},

	// --- Default/Dashboard Actions (Fallback) ---
	{
		pathPattern: /^\/dashboard|^\/$/, // Dashboard or root
		roles: ["admin"],
		// actionType: "openCreateStudentModal",
		actionType: "navigate",
		ariaLabel: "Add User",
		icon: UserPlus,
		href: "/users/create",
		priority: 10,
	},
	{
		pathPattern: /^\/dashboard|^\/$/,
		roles: ["teacher"],
		// actionType: "openCreateClassModal",
		actionType: "navigate",
		ariaLabel: "Create Class",
		icon: ChalkboardTeacher,
		href: "/classes/create",
		priority: 10,
	},
	{
		pathPattern: /^\/dashboard|^\/$/,
		roles: ["student"],
		excludeFlags: ["isCorporateManager"],
		actionType: "navigate",
		ariaLabel: "New Support Ticket",
		icon: Ticket,
		href: "/support/create",
		priority: 10,
	},

	// --- Hide FAB on Create Pages ---
	{
		pathPattern: /^\/courses\/create$/,
		roles: ["admin"],
		actionType: "none",
		ariaLabel: "",
		icon: Plus,
		priority: 95,
	},
	{
		pathPattern: /^\/classes\/create$/,
		roles: ["teacher", "admin"],
		actionType: "none",
		ariaLabel: "",
		icon: Plus,
		priority: 95,
	},
	{
		pathPattern: /^\/chat\/create$/,
		roles: ["admin", "teacher", "student"],
		actionType: "none",
		ariaLabel: "",
		icon: Plus,
		priority: 95,
	},
	{
		pathPattern: /^\/users\/create$/,
		roles: ["admin"],
		actionType: "none",
		ariaLabel: "",
		icon: Plus,
		priority: 95,
	},

	// --- Catch-all / No Action Defined ---
	// This rule should ideally not be matched if all cases are covered above.
	// It ensures the hook always returns a defined state.
	{
		pathPattern: /.*/, // Matches anything
		roles: ["admin", "teacher", "student"],
		actionType: "none",
		ariaLabel: "",
		icon: Plus, // Default, won't be shown
		priority: 0,
	},
];
