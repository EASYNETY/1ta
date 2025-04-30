// Define action types for the slice to use
export const AUTH_ACTIONS = {
	LOGIN_START: "auth/loginStart",
	LOGIN_SUCCESS: "auth/loginSuccess",
	LOGIN_FAILURE: "auth/loginFailure",
	FETCH_PROFILE_PENDING: "auth/fetchUserProfile/pending",
	FETCH_PROFILE_FULFILLED: "auth/fetchUserProfile/fulfilled",
	FETCH_PROFILE_REJECTED: "auth/fetchUserProfile/rejected",
	UPDATE_PROFILE_PENDING: "auth/updateUserProfile/pending",
	UPDATE_PROFILE_FULFILLED: "auth/updateUserProfile/fulfilled",
	UPDATE_PROFILE_REJECTED: "auth/updateUserProfile/rejected",
};
