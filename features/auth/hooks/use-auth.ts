"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	loginSuccess,
	logout,
	initializeAuth,
} from "@/features/auth/store/auth-slice";

export function useAuth() {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);

	useEffect(() => {
		// Only run on client side
		if (typeof window === "undefined") return;

		if (!auth.isInitialized) {
			try {
				const token = localStorage.getItem("authToken");
				const userJson = localStorage.getItem("authUser");

				if (token && userJson) {
					const user = JSON.parse(userJson);
					dispatch(
						loginSuccess({
							user,
							token,
						})
					);
				} else {
					// No stored credentials, just mark as initialized
					dispatch(initializeAuth());
				}
			} catch (error) {
				console.error("Error initializing auth:", error);
				dispatch(initializeAuth());
			}
		}
	}, [dispatch, auth.isInitialized]);

	const signOut = () => {
		dispatch(logout());
	};

	return {
		...auth,
		signOut,
	};
}
