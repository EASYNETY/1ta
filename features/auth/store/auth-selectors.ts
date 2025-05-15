// features/auth/store/auth-selectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import { createSafeArraySelector, safeArray } from '@/lib/utils/safe-data';
import { User } from '@/types/user.types';

// Basic selectors
export const selectAuthState = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsAuthInitialized = (state: RootState) => state.auth.isInitialized;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectSkipOnboarding = (state: RootState) => state.auth.skipOnboarding;

// Users list selectors
export const selectUsers = (state: RootState) => state.auth.users;
export const selectTotalUsers = (state: RootState) => state.auth.totalUsers;
export const selectUsersLoading = (state: RootState) => state.auth.usersLoading;
export const selectUsersError = (state: RootState) => state.auth.usersError;

// Safe selectors that handle null/undefined values
export const selectSafeUsers = createSafeArraySelector(selectUsers);

// Derived selectors
export const selectUsersByRole = createSelector(
  [selectUsers, (_, role: string) => role],
  (users, role) => safeArray(users).filter(user => user.role === role)
);

export const selectSafeUsersByRole = createSelector(
  [selectSafeUsers, (_, role: string) => role],
  (users, role) => users.filter(user => user.role === role)
);

export const selectUserById = createSelector(
  [selectUsers, (_, id: string) => id],
  (users, id) => safeArray(users).find(user => user.id === id)
);

export const selectUserRole = createSelector(
  [selectCurrentUser],
  (user) => user?.role || null
);

export const selectUserName = createSelector(
  [selectCurrentUser],
  (user) => user?.name || ''
);

export const selectUserEmail = createSelector(
  [selectCurrentUser],
  (user) => user?.email || ''
);

export const selectUserAvatar = createSelector(
  [selectCurrentUser],
  (user) => user?.avatarUrl || null
);

export const selectOnboardingStatus = createSelector(
  [selectCurrentUser],
  (user) => user?.onboardingStatus || 'incomplete'
);

export const selectIsAdmin = createSelector(
  [selectUserRole],
  (role) => role === 'admin'
);

export const selectIsTeacher = createSelector(
  [selectUserRole],
  (role) => role === 'teacher'
);

export const selectIsStudent = createSelector(
  [selectUserRole],
  (role) => role === 'student'
);

// Export a function to get all selectors for a specific role
export const getUsersByRoleSelectors = (role: string) => ({
  selectAll: (state: RootState) => selectUsersByRole(state, role),
  selectById: (state: RootState, id: string) => 
    selectUsersByRole(state, role).find(user => user.id === id),
  selectCount: (state: RootState) => 
    selectUsersByRole(state, role).length,
});
