// lib/auth-listener.ts
"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/features/auth/store/auth-slice";

/**
 * Component that listens for auth-related events
 * and dispatches appropriate actions
 */
export function AuthListener() {
	const dispatch = useAppDispatch();

	useEffect(() => {
		// Listen for unauthorized event
		const handleUnauthorized = () => {
			dispatch(logout());
		};

		// Add event listener
		window.addEventListener("auth:unauthorized", handleUnauthorized);

		// Clean up
		return () => {
			window.removeEventListener("auth:unauthorized", handleUnauthorized);
		};
	}, [dispatch]);

	// This component doesn't render anything
	return null;
}
