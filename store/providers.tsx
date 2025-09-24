"use client";

import type React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./index";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  function AuthInitializer() {
    useAuth();
    return null;
  }

  /**
   * Multi-tab synchronization:
   * Detects Redux-persist state changes in other tabs and rehydrates state.
   */
  function MultiTabSync() {
    useEffect(() => {
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === "persist:1techacademy-root") {
          // Option 1: Rehydrate from localStorage (instant)
          persistor.persist();

          // Option 2: Fetch latest data from API (if needed)
          // store.dispatch(fetchLatestData());
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return null;
  }


  return (
    <Provider store={store}>
      <AuthInitializer />
      <MultiTabSync />
      <PersistGate loading={null} persistor={persistor}>
        {() => children}
      </PersistGate>
    </Provider>
  );
}
