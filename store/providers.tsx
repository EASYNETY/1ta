"use client";

import type React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./index";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client"; // npm install socket.io-client

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

  /**
   * Multi-user synchronization:
   * Uses Socket.IO to push server-side changes to all clients in real time.
   */
function MultiUserSync() {
  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL || "https://api.1techacademy.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    // Example: Join a global room or a user-specific room
    socket.emit("joinRoom", "global");

    // Receive live state updates
    socket.on("state-update", (action) => {
      if (action?.type) {
        store.dispatch(action); // Directly dispatch Redux action
      }
    });

    return () => {
      socket.emit("leaveRoom", "global");
      socket.disconnect();
    };
  }, []);

  return null;
}

  return (
    <Provider store={store}>
      <AuthInitializer />
      <MultiTabSync />
      <MultiUserSync />
      <PersistGate loading={null} persistor={persistor}>
        {() => children}
      </PersistGate>
    </Provider>
  );
}
