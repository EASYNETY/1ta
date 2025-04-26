// src/store/index.ts
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
} from "redux-persist"; // Import specific action types
import storage from "redux-persist/lib/storage"; // Default: localStorage
// Import Reducers
import authReducer from "@/features/auth/store/auth-slice"; // Assuming path
import courseReducer from "@/features/courses/store/course-slice";
import cartReducer from "@/features/cart/store/cart-slice"; // Assuming path

// --- Persist Config ---
const persistConfig = {
	key: "1techacademy-root", // Use a project-specific key
	storage, // The storage engine (localStorage by default)
	version: 1, // Optional: Schema version
	whitelist: ["auth", "cart"], // Only persist these slices
	// blacklist: ['courses'] // Courses are typically fetched, not persisted
};

// --- Root Reducer ---
// Combine all feature reducers here
const rootReducer = combineReducers({
	auth: authReducer,
	courses: courseReducer, // Add the course reducer
	cart: cartReducer, // Add the cart reducer
	// Add other reducers as your app grows
});

// --- Persisted Reducer ---
// Wrap the root reducer with redux-persist logic
const persistedReducer = persistReducer(persistConfig, rootReducer);

// --- Store Configuration ---
export const store = configureStore({
	reducer: persistedReducer, // Use the persisted version of the root reducer
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// Ignore specific action types from redux-persist to prevent console warnings
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
			// Optional: Add other middleware like RTK Query middleware if used
		}),
	// Enable Redux DevTools only in development environment for performance/security
	devTools: process.env.NODE_ENV !== "production",
});

// --- Persistor Export ---
// Used by PersistGate in Providers component
export const persistor = persistStore(store);

// --- Type Exports for Hooks ---
// Derive RootState type from the rootReducer (before persistence)
export type RootState = ReturnType<typeof rootReducer>;
// Standard AppDispatch type
export type AppDispatch = typeof store.dispatch;
