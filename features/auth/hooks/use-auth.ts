// features/auth/hooks/use-auth.ts
"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	loginSuccess,
	logout,
	initializeAuth,
} from "@/features/auth/store/auth-slice";
import { parseCookies } from "nookies"; // Import nookies
import { store } from "@/store";
import { isProfileComplete } from "../utils/profile-completeness";

// Timeout duration
const INITIALIZATION_TIMEOUT_MS = 3000;

export function useAuth() {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (typeof window === "undefined") return;

		if (!auth.isInitialized) {
			console.log("useAuth: Starting initialization check (using nookies).");

			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// --- Start the fallback timeout ---
			timeoutRef.current = setTimeout(() => {
				const currentState = store.getState().auth;
				if (!currentState.isInitialized) {
					console.warn(
						`useAuth: Initialization timeout (${INITIALIZATION_TIMEOUT_MS}ms) reached. Forcing initialization.`
					);
					dispatch(initializeAuth());
				}
			}, INITIALIZATION_TIMEOUT_MS);

			// --- Try synchronous initialization from Cookies ---
			try {
				// Parse cookies using nookies
				const cookies = parseCookies(); // No context needed on client-side
				const token = cookies.authToken; // Read the authToken cookie
				const userJson = cookies.authUser; // Read the authUser cookie

				if (token && userJson) {
					console.log("useAuth: Found token and user in cookies.");
					const user = JSON.parse(userJson); // Parse the user JSON
					dispatch(loginSuccess({ user, token }));
					if (timeoutRef.current) clearTimeout(timeoutRef.current);
					console.log(
						"useAuth: Dispatched loginSuccess from cookies, cleared timeout."
					);
				} else {
					console.log("useAuth: No token/user found in cookies.");
					// If no cookies, dispatch initializeAuth to mark as checked (logged out)
					dispatch(initializeAuth());
					if (timeoutRef.current) clearTimeout(timeoutRef.current);
					console.log(
						"useAuth: Dispatched initializeAuth (no cookies), cleared timeout."
					);
				}
			} catch (error) {
				console.error(
					"useAuth: Error reading/parsing auth data from cookies:",
					error
				);
				// If cookies are corrupt (e.g., bad JSON), still initialize
				dispatch(initializeAuth());
				if (timeoutRef.current) clearTimeout(timeoutRef.current);
				console.log(
					"useAuth: Dispatched initializeAuth (cookie error), cleared timeout."
				);
			}
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [dispatch, auth.isInitialized]); // Dependencies

	const signOut = () => {
		dispatch(logout());
		// The logout action will handle clearing cookies
	};

	// Check if the user's profile is complete
	const isProfileCompleted = auth.user ? isProfileComplete(auth.user) : false;

	return {
		...auth,
		signOut,
		isProfileCompleted,
	};
}
