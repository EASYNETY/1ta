// src/hooks/useFilteredPrimaryNavItems.ts

import { useMemo } from "react"; // Import useMemo for optimization
import { useAppSelector } from "@/store/hooks";
import { isStudent, User as UserType } from "@/types/user.types"; // Use UserType alias
import {
	LayoutDashboard,
	GraduationCap,
	CheckCircle,
	Calendar,
	QrCode, // Use Lucide Calendar
} from "lucide-react"; // Using Lucide consistently
import { UsersThree } from "phosphor-react";

// Define NavItem type here or import from a shared config/type file
export interface NavItem {
	title: string;
	href: string;
	icon: React.ElementType; // Keep generic React ElementType
	roles: Array<
		| "super_admin"
		| "admin"
		| "accounting"
		| "customer_care"
		| "teacher"
		| "student"
	>;
	badgeCount?: number;
	hidden?: boolean; // Flag to explicitly hide
	requiredFlags?: Array<"isCorporateManager">; // Flag requirement
}

// Use this hook to dynamically filter primary navigation based on role and flags
export function useFilteredPrimaryNavItems(): NavItem[] {
	const { user } = useAppSelector((state) => state.auth);

	// Memoize the filtered list to avoid recalculation on every render unless user changes
	const filteredItems = useMemo(() => {
		if (!user) return []; // Return empty if no user

		const isCorpManager = isStudent(user) && user.isCorporateManager === true;

		// Define the base items structure within the hook/memo
		const baseNavItems: NavItem[] = [
			{
				title: "Dashboard",
				// Dynamically set href based on manager status
				href: isCorpManager ? "/corporate-management" : "/dashboard",
				icon: LayoutDashboard,
				roles: ["super_admin", "admin", "teacher", "student"],
			},
			{
				title: "Dashboard",
				href: "/accounting/dashboard",
				icon: LayoutDashboard,
				roles: ["accounting"],
			},
			{
				title: "Dashboard",
				href: "/customer-care/dashboard",
				icon: LayoutDashboard,
				roles: ["customer_care"],
			},
			{
				title: "Courses",
				href: "/courses",
				icon: GraduationCap,
				roles: ["student", "teacher", "super_admin", "admin"],
				// A manager might still browse courses to assign, so not hidden by default
			},
			{
				title: "Attendance",
				href: "/attendance",
				icon: CheckCircle,
				roles: ["student", "teacher", "super_admin", "admin", "customer_care"],
				// Hide for corporate managers (they manage student attendance via their dashboard)
				hidden: isCorpManager,
			},
			{
				title: "Scan Student",
				href: "/attendance/scan",
				icon: QrCode,
				roles: ["customer_care"],
			},
			{
				title: "Timetable",
				href: "/timetable",
				icon: Calendar, // Use Lucide icon
				roles: ["student", "teacher", "super_admin", "admin", "customer_care"],
				// Hide for corporate managers (they manage class schedules via class/event management)
				hidden: isCorpManager,
			},
			{
				title: "Discussions",
				href: "/chat",
				icon: UsersThree, // Use Lucide icon
				roles: ["student", "teacher", "super_admin", "admin", "customer_care"],
				badgeCount: 0, // TODO: Get actual chat unread count here
				// Hide for corporate managers? Or allow access to course chats they purchased?
				// Let's hide for simplicity for now, assuming their focus is management.
				hidden: isCorpManager,
			},
		];

		// Filter based on role, hidden flag, and required flags
		return baseNavItems.filter((item) => {
			// Check if user's role is included
			if (!item.roles.includes(user.role)) return false;
			// Check if explicitly hidden
			if (item.hidden) return false;
			// Check if required flags are met
			if (item.requiredFlags?.includes("isCorporateManager") && !isCorpManager)
				return false;
			// If all checks pass, include the item
			return true;
		});
	}, [user]); // Recalculate only when the user object changes

	return filteredItems;
}
