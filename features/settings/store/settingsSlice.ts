// features/settings/store/settingsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
	SettingsState,
	NotificationPreferences,
} from "../types/settings-types";

// --- Mock Data Import (Replace with API Client later) ---
// Assume mock functions exist in mock-settings-data.ts
import {
	mockGetNotificationPreferences,
	mockUpdateNotificationPreferences,
} from "@/data/mock-settings-data";

// --- Async Thunks ---

// Thunk to fetch notification preferences
export const fetchNotificationPreferences = createAsyncThunk<
	NotificationPreferences, // Return type
	string, // Argument type: userId
	{ state: RootState; rejectValue: string }
>(
	"settings/fetchNotificationPreferences",
	async (userId, { rejectWithValue }) => {
		try {
			console.log("Thunk: Fetching notification preferences...");
			// TODO: Replace with real API call via apiClient
			const preferences = await mockGetNotificationPreferences(userId);
			if (!preferences) throw new Error("Preferences not found"); // Handle case where mock might return null/undefined
			return preferences;
		} catch (error: any) {
			return rejectWithValue(
				error.message || "Failed to fetch notification preferences"
			);
		}
	}
);

// Thunk to update notification preferences
interface UpdatePrefsPayload {
	userId: string;
	preferences: Partial<NotificationPreferences>; // Allow partial updates
}
export const updateNotificationPreferences = createAsyncThunk<
	NotificationPreferences, // Return type: updated preferences
	UpdatePrefsPayload,
	{ state: RootState; rejectValue: string }
>(
	"settings/updateNotificationPreferences",
	async ({ userId, preferences }, { rejectWithValue }) => {
		try {
			console.log("Thunk: Updating notification preferences...");
			// TODO: Replace with real API call via apiClient
			const updatedPrefs = await mockUpdateNotificationPreferences(
				userId,
				preferences
			);
			return updatedPrefs;
		} catch (error: any) {
			return rejectWithValue(
				error.message || "Failed to update notification preferences"
			);
		}
	}
);

// --- Initial State ---
const initialState: SettingsState = {
	profileStatus: "idle", // Status for profile actions (handled in authSlice?)
	profileError: null,
	securityStatus: "idle", // Status for security actions (change password etc.)
	securityError: null,
	notificationPreferences: null, // Store fetched preferences here
	notificationStatus: "idle", // Status specifically for notifications
	notificationError: null,
};

// --- Slice Definition ---
const settingsSlice = createSlice({
	name: "settings",
	initialState,
	reducers: {
		// Action to clear specific errors if needed
		clearNotificationError: (state) => {
			state.notificationError = null;
		},
		// Potentially actions to handle profile/security states if managed here
		// setProfileLoading: (state) => { state.profileStatus = 'loading'; state.profileError = null; },
		// setSecurityError: (state, action: PayloadAction<string>) => { state.securityStatus = 'failed'; state.securityError = action.payload; }
	},
	extraReducers: (builder) => {
		// --- Notification Preferences Handlers ---
		builder
			.addCase(fetchNotificationPreferences.pending, (state) => {
				state.notificationStatus = "loading";
				state.notificationError = null;
			})
			.addCase(
				fetchNotificationPreferences.fulfilled,
				(state, action: PayloadAction<NotificationPreferences>) => {
					state.notificationStatus = "succeeded";
					state.notificationPreferences = action.payload; // Store fetched data
				}
			)
			.addCase(fetchNotificationPreferences.rejected, (state, action) => {
				state.notificationStatus = "failed";
				state.notificationError =
					action.payload ?? "Failed to load notification settings";
			});

		builder
			.addCase(updateNotificationPreferences.pending, (state) => {
				state.notificationStatus = "loading"; // Or a specific 'updating' status
				state.notificationError = null;
			})
			.addCase(
				updateNotificationPreferences.fulfilled,
				(state, action: PayloadAction<NotificationPreferences>) => {
					state.notificationStatus = "succeeded";
					state.notificationPreferences = action.payload; // Update with saved data
				}
			)
			.addCase(updateNotificationPreferences.rejected, (state, action) => {
				state.notificationStatus = "failed";
				state.notificationError =
					action.payload ?? "Failed to save notification settings";
			});

		// TODO: Add cases/matchers for other settings-related thunks if managed here
		// (e.g., changePassword thunk if not handled solely in authSlice)
	},
});

// --- Actions ---
export const { clearNotificationError /*, other actions */ } =
	settingsSlice.actions;

// --- Selectors ---
export const selectNotificationPreferences = (state: RootState) =>
	state.settings.notificationPreferences;
export const selectNotificationStatus = (state: RootState) =>
	state.settings.notificationStatus;
export const selectNotificationError = (state: RootState) =>
	state.settings.notificationError;
// Add selectors for profile/security status/error if managed here

export default settingsSlice.reducer;
