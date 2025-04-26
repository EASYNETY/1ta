// src/features/auth/store/auth-thunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { post } from "@/lib/api-client";
import { loginSuccess, loginFailure, loginStart } from "./auth-slice";
import router from "next/router";
import type { AuthResponse } from "@/features/auth/types/auth-types"; // ✅

// --- Login Thunk ---
export const loginThunk = createAsyncThunk(
	"auth/login",
	async (credentials: { email: string; password: string }, { dispatch }) => {
		try {
			dispatch(loginStart());

			const { token, user } = await post<AuthResponse>(
				"/auth/login",
				credentials
			); // ✅ Correct typing

			dispatch(loginSuccess({ user, token }));

			localStorage.setItem("authToken", token);
			localStorage.setItem("authUser", JSON.stringify(user));

			router.push("/dashboard");
		} catch (error: any) {
			dispatch(loginFailure(error.message || "Login failed"));
			throw error;
		}
	}
);

// --- Signup Thunk ---
export const signupThunk = createAsyncThunk(
	"auth/signup",
	async (
		userData: {
			name: string;
			email: string;
			password: string;
			dateOfBirth: string;
			classId: string;
			barcodeId: string;
			guardianId: string | null;
		},
		{ dispatch }
	) => {
		try {
			dispatch(loginStart());

			const { token, user } = await post<AuthResponse>(
				"/auth/register",
				userData
			); // ✅

			dispatch(loginSuccess({ user, token }));

			localStorage.setItem("authToken", token);
			localStorage.setItem("authUser", JSON.stringify(user));

			router.push("/dashboard");
		} catch (error: any) {
			dispatch(loginFailure(error.message || "Signup failed"));
			throw error;
		}
	}
);
