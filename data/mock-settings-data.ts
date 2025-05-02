// data/mock-settings-data.ts
import type { NotificationPreferences } from "@/features/settings/types/settings-types";

// Mock in-memory store for preferences (simple example)
let userNotificationPreferences: Record<string, NotificationPreferences> = {
	user_123: {
		// Match a mock user ID
		email: {
			newMessages: true,
			courseUpdates: true,
			assignmentAlerts: false,
			systemAnnouncements: true,
		},
	},
};

// --- Mock API Functions ---

export const mockGetNotificationPreferences = async (
	userId: string
): Promise<NotificationPreferences | null> => {
	console.log(`MOCK: Fetching notification preferences for user ${userId}`);
	await new Promise((res) => setTimeout(res, 350)); // Simulate delay

	// Return specific user's prefs or a default if not found
	return (
		userNotificationPreferences[userId] || {
			email: {
				// Default prefs
				newMessages: true,
				courseUpdates: true,
				assignmentAlerts: true,
				systemAnnouncements: true,
			},
		}
	);
};

export const mockUpdateNotificationPreferences = async (
	userId: string,
	preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
	console.log(
		`MOCK: Updating notification preferences for user ${userId}`,
		preferences
	);
	await new Promise((res) => setTimeout(res, 500));

	// Get current prefs or start with default
	const currentPrefs = userNotificationPreferences[userId] || {
		email: {
			newMessages: true,
			courseUpdates: true,
			assignmentAlerts: true,
			systemAnnouncements: true,
		},
	};

	// Merge updates (simple merge, nested objects need careful handling)
	const updatedPrefs = {
		...currentPrefs,
		email: {
			...currentPrefs.email,
			...preferences.email, // Update email prefs if provided
		},
		// Add merging for other sections like 'push' if implemented
	};

	// Save back to mock store
	userNotificationPreferences[userId] = updatedPrefs;

	console.log(`MOCK: Updated preferences for ${userId}:`, updatedPrefs);
	return updatedPrefs; // Return the full updated object
};

// Add mocks for other settings endpoints as needed (e.g., change password)
