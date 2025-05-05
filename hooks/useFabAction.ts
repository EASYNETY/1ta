// src/hooks/useFabAction.ts
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
	fabConfigurations,
	FabConfigRule,
	FabActionType,
} from "@/config/fab-config";
import { Plus, Icon } from "phosphor-react"; // Import base Icon type

// Define the props returned by the hook for the FAB component
export interface FabActionProps {
	isVisible: boolean;
	icon: React.ElementType;
	ariaLabel: string;
	onClick: (event?: React.MouseEvent<HTMLElement>) => void; // Generic click handler
}

// Define props the hook needs
interface UseFabActionProps {
	// Define callbacks for specific non-navigation actions
	onShowStudentBarcode: () => void;
	onOpenScanModal?: () => void; // Example
	onOpenCreateChatModal?: () => void; // Example
	// Add more callbacks as needed for other modal types
}

// The default state when no action is applicable
const defaultFabProps: FabActionProps = {
	isVisible: false,
	icon: Plus,
	ariaLabel: "",
	onClick: () => {},
};

export function useFabAction({
	onShowStudentBarcode,
	onOpenScanModal,
	onOpenCreateChatModal,
	// Pass other callbacks here
}: UseFabActionProps): FabActionProps {
	const pathname = usePathname();
	const router = useRouter();
	const { user } = useAppSelector((state) => state.auth);

	const findMatchingRule = React.useCallback((): FabConfigRule | null => {
		if (!user) return null;

		const sortedRules = [...fabConfigurations].sort(
			(a, b) => (b.priority ?? 0) - (a.priority ?? 0)
		);

		for (const rule of sortedRules) {
			const pathMatches =
				typeof rule.pathPattern === "string"
					? pathname === rule.pathPattern // Exact match
					: rule.pathPattern.test(pathname); // Regex match

			const roleMatches = rule.roles.includes(user.role);
			// --- NEW Flag Checks ---
			let flagsMatch = true;
			if (rule.requiredFlags) {
				flagsMatch =
					flagsMatch &&
					rule.requiredFlags.every((flag) => (user as any)[flag] === true);
			}
			if (rule.excludeFlags) {
				flagsMatch =
					flagsMatch &&
					rule.excludeFlags.every((flag) => (user as any)[flag] !== true);
			}
			// --- End Flag Checks ---
			if (pathMatches && roleMatches && flagsMatch) {
				return rule;
			}
		}
		return null; // Should be caught by the catch-all rule, but good practice
	}, [pathname, user]);

	const matchingRule = findMatchingRule();

	// Determine the onClick handler based on the action type
	const getOnClickHandler = React.useCallback(
		(rule: FabConfigRule | null): (() => void) => {
			if (!rule || rule.actionType === "none") {
				return () => {}; // No action
			}

			switch (rule.actionType) {
				case "navigate":
					return rule.href ? () => router.push(rule.href as string) : () => {};
				case "showStudentBarcode":
					return onShowStudentBarcode; // Use the passed-in callback
				case "openScanModal":
					return (
						onOpenScanModal ||
						(() => console.warn("Scan modal handler not provided"))
					);
				case "openCreateChatModal":
					return (
						onOpenCreateChatModal ||
						(() => console.warn("Create chat modal handler not provided"))
					);
				// Add cases for other modal/action types here
				// case 'openCreateClassModal':
				//     return onOpenCreateClassModal || (() => {});
				default:
					console.warn(`Unhandled FAB action type: ${rule.actionType}`);
					return () => {};
			}
		},
		[
			router,
			onShowStudentBarcode,
			onOpenScanModal,
			onOpenCreateChatModal /* include other callbacks */,
		]
	);

	if (!matchingRule || matchingRule.actionType === "none") {
		return defaultFabProps;
	}

	return {
		isVisible: true,
		icon: matchingRule.icon,
		ariaLabel: matchingRule.ariaLabel,
		onClick: getOnClickHandler(matchingRule),
	};
}
