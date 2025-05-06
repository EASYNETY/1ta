// lib/auth-listener.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/features/auth/store/auth-slice";
import { useAppDispatch } from "@/store/hooks";

/**
 * Component to listen for auth events and sync with Redux
 * This should be included in your layout or providers component
 */
export function AuthListener() {
	const dispatch = useAppDispatch();
	const router = useRouter();

	useEffect(() => {
		// Listen for the custom unauthorized event
		const handleUnauthorized = () => {
			// Dispatch logout to update Redux state
			dispatch(logout());
		};

		window.addEventListener("auth:unauthorized", handleUnauthorized);

		return () => {
			window.removeEventListener("auth:unauthorized", handleUnauthorized);
		};
	}, [dispatch, router]);

	// This component doesn't render anything
	return null;
}
