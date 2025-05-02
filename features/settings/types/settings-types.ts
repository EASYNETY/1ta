// features/settings/types/settings-types.ts

// Example structure for User Profile data used in settings forms
// Might overlap/extend your existing User type in authSlice
export interface UserProfileFormData {
	name: string;
	// email: string; // Typically read-only
	bio?: string;
	avatarUrl?: string; // URL or reference to upload
	phone?: string; // Optional, maybe role-dependent
	// Add role-specific fields if editable here
	teachingSubjects?: string[]; // Teacher
	officeHours?: string; // Teacher
}

// Example structure for Security settings
export interface SecuritySettings {
	// loginHistory: Array<{ timestamp: string; ipAddress: string; device: string }>; // Post-MVP
	twoFactorEnabled: boolean; // Post-MVP
}

// Example structure for Notification preferences
export interface NotificationPreferences {
	email: {
		newMessages: boolean;
		courseUpdates: boolean;
		assignmentAlerts: boolean;
		systemAnnouncements: boolean;
	};
	// push: { ... }; // Post-MVP
}

// Combined state for a potential settings slice
export interface SettingsState {
	profileStatus: "idle" | "loading" | "succeeded" | "failed";
	profileError: string | null;
	securityStatus: "idle" | "loading" | "succeeded" | "failed"; // Example
	securityError: string | null;
	notificationStatus: "idle" | "loading" | "succeeded" | "failed"; // Example
	notificationError: string | null;
	// Store fetched settings if not directly modifying the user object in authSlice
	notificationPreferences: NotificationPreferences | null;
}
