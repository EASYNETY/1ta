// features/auth/index.ts
// Export all auth-related functionality for easier imports

// Export the auth slice and actions
export { default as authReducer } from './store/auth-slice';
export {
  loginStart,
  loginSuccess,
  loginFailure,
  tokenRefreshed,
  logout,
  updateUser,
  initializeAuth,
  setOnboardingStatus,
  skipOnboardingProcess,
  resetSkipOnboarding,
} from './store/auth-slice';

// Export the auth thunks
export {
  loginThunk,
  signupThunk,
  refreshTokenThunk,
  fetchUserProfileThunk,
  updateUserProfileThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  createCorporateStudentSlotsThunk,
} from './store/auth-thunks';

// Export the user thunks
export {
  fetchAllUsers,
  fetchAllUsersComplete,
  fetchUsersByRole,
  fetchUserById,
  deleteUser,
} from './store/user-thunks';

// Export types
export type { AuthResponse, LoginCredentials, RegisterData, ResetPasswordPayload } from './types/auth-types';
