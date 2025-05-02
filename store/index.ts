// store/index.ts

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist";
import { setCookie, parseCookies } from "nookies";

// Import reducers
import authReducer from "@/features/auth/store/auth-slice";
import courseReducer from "@/features/courses/store/course-slice";
import cartReducer from "@/features/cart/store/cart-slice";
import publicCourseReducer from "@/features/public-course/store/public-course-slice";
import authCourseReducer from "@/features/auth-course/store/auth-course-slice";
import pricingReducer from "@/features/pricing/store/pricing-slice";
import attendanceMarkingReducer from "@/features/attendance/store/attendance-slice";
import scheduleReducer from "@/features/schedule/store/schedule-slice";
import classesReducer from "@/features/classes/store/classes-slice";
import classSessionReducer from "@/features/classes/store/classSessionSlice";
import paymentMethodsReducer from "@/features/payment/store/payment-slice";
import chatReducer from "@/features/chat/store/chatSlice";

// --- Custom Cookie Storage ---
const cookieStorage = {
	getItem: (key: string) => {
		return Promise.resolve(parseCookies()[key] || null);
	},
	setItem: (key: string, value: string) => {
		return Promise.resolve(
			setCookie(null, key, value, {
				path: "/",
				maxAge: 30 * 24 * 60 * 60, // Cookie expiration (30 days)
			})
		);
	},
	removeItem: (key: string) => {
		return Promise.resolve(setCookie(null, key, "", { path: "/", maxAge: -1 }));
	},
};

// --- Storage fallback based on client or SSR ---
const isClient = typeof window !== "undefined";

// Use `cookieStorage` for SSR and `redux-persist` storage (localStorage) for client-side
const storage = isClient
	? require("redux-persist/lib/storage").default
	: cookieStorage;

// --- Persist Config ---
const persistConfig = {
	key: "1techacademy-root",
	storage: storage,
	version: 1,
	whitelist: [
		"auth",
		"cart",
		"pricing",
		"public_courses",
		"auth_courses",
		"attendanceMarking",
		"classSession",
		"paymentMethods",
		"schedule",
		"classes",
		"chat",
	],
};

// --- Root Reducer ---
const rootReducer = combineReducers({
	auth: authReducer,
	courses: courseReducer,
	cart: cartReducer,
	public_courses: publicCourseReducer,
	auth_courses: authCourseReducer,
	pricing: pricingReducer,
	attendanceMarking: attendanceMarkingReducer,
	classSession: classSessionReducer,
	paymentMethods: paymentMethodsReducer,
	schedule: scheduleReducer,
	classes: classesReducer,
	chat: chatReducer,
});

// --- Persisted Reducer ---
const persistedReducer = persistReducer(persistConfig, rootReducer);

// --- Store Configuration ---
export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
	devTools: process.env.NODE_ENV !== "production",
});

// --- Persistor Export ---
export const persistor = persistStore(store);

// --- Type Exports for Hooks ---
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
