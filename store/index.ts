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
import chatReducer from "@/features/chat/store/chatSlice";
import userReducer from '@/features/chat/store/user-slice';
import settingsReducer from "@/features/settings/store/settingsSlice";
import supportReducer from "@/features/support/store/supportSlice";
import checkoutReducer from "@/features/checkout/store/checkoutSlice";
import paymentHistoryReducer from "@/features/payment/store/payment-slice";
import adminPaymentsReducer from "@/features/payment/store/adminPayments";
import corporateReducer from "@/features/corporate/store/corporate-slice";
import assignmentsReducer from "@/features/assignments/store/assignment-slice";
import gradesReducer from "@/features/grades/store/grade-slice";
import notificationsReducer from "@/features/notifications/store/notifications-slice";
import searchReducer from "@/features/search/store/search-slice";
import analyticsReducer from "@/features/analytics/store/analytics-slice";
import reportsReducer from "@/features/analytics/store/reports-slice";
import studentBiodataReducer from "@/features/analytics/store/student-biodata-slice";
import accountingReducer from "@/features/payment/store/accounting-slice";

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
		"checkout",
		"public_courses",
		"auth_courses",
		"attendanceMarking",
		"classSession",
		"paymentHistory",
		"adminPayments",
		"schedule",
		"classes",
		"chat",
		"settings",
		"support",
		"corporate",
		"assignments",
		"grades",
		"notifications",
		"search",
		"analytics",
		"reports",
		"studentBiodata",
		"accounting",
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
	checkout: checkoutReducer,
	attendanceMarking: attendanceMarkingReducer,
	classSession: classSessionReducer,
	paymentHistory: paymentHistoryReducer,
	adminPayments: adminPaymentsReducer,
	schedule: scheduleReducer,
	classes: classesReducer,
	chat: chatReducer,
	users: userReducer,
	settings: settingsReducer,
	support: supportReducer,
	corporate: corporateReducer,
	assignments: assignmentsReducer,
	grades: gradesReducer,
	notifications: notificationsReducer,
	search: searchReducer,
	analytics: analyticsReducer,
	reports: reportsReducer,
	studentBiodata: studentBiodataReducer,
	accounting: accountingReducer,
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
