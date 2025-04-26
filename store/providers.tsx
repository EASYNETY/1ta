// store/providers.tsx
"use client";

import type React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./index"; // Import from store/index.ts
import { useAuth } from "@/features/auth/hooks/use-auth";

export function Providers({ children }: { children: React.ReactNode }) {
  console.log("Rendering Redux Providers..."); // Add log for debugging
  function AuthInitializer() {
    useAuth();
    return null;
  }
  return (
    <Provider store={store}>
      <AuthInitializer />
      {/* PersistGate delays rendering children until persisted state is loaded */}
      {/* Loading prop can be a React component for a loading indicator */}
      <PersistGate loading={null} persistor={persistor}>
        {() => { // Use function child for PersistGate v6+ to avoid hydration issues with SSR/Next.js
          console.log("Redux state rehydrated, rendering children.");
          return children;
        }}
      </PersistGate>
    </Provider>
  );
}