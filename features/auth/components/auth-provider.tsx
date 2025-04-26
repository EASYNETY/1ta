"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
// Only need useAppSelector to READ the state
import { useAppSelector } from "@/store/hooks";

interface AuthProviderProps {
  children: React.ReactNode;
}

const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];

export function AuthProvider({ children }: AuthProviderProps) {
  // Read state managed by useAuth and reducers
  const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  // State to track whether component has mounted (client-side only)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark component as mounted after first render
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // --- Critical Check: Wait until useAuth confirms initialization ---
    if (!isInitialized || !isMounted) {
      console.log("AuthProvider: Waiting for initialization...");
      return; // Do nothing until useAuth has finished its job
    }
    // --- Initialization is guaranteed complete by useAuth at this point ---
    console.log("AuthProvider: Initialized. Checking routes...");

    const isPublicRoute = publicRoutes.some((route) => {
      if (route === "/") return pathname === "/";
      return pathname === route || pathname.startsWith(`${route}/`);
    });

    // Apply routing rules *after* initialization
    if (!isAuthenticated && !isPublicRoute) {
      console.log("AuthProvider: Redirecting to /login");
      router.push("/login");
      return;
    }

    if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
      console.log("AuthProvider: Redirecting to /dashboard");
      router.push("/dashboard");
      return;
    }

    if (isAuthenticated && user) {
      if (pathname.startsWith("/admin") && user.role !== "admin") {
        console.log("AuthProvider: Admin route unauthorized. Redirecting to /dashboard");
        router.push("/dashboard");
        return;
      }
    }
    console.log("AuthProvider: Route check complete, no redirect needed.");
  }, [isAuthenticated, isInitialized, pathname, router, user, isMounted]);

  // Show loading spinner ONLY while waiting for useAuth
  if (!isInitialized || !isMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          {/* Gold-themed spinner with dimmed right border */}
          <div
            style={{
              border: "4px solid goldenrod",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              borderTopColor: "#D4AF3733", // Bright gold for the rotating part
              borderRightColor: "#D4AF37", // Dimmer gold for the right side
              borderBottomColor: "#D4AF3733", // Keep bright gold for the bottom part
              animation: "spin 1s ease infinite",
              margin: "0 auto",
            }}
          ></div>

          {/* Animation styles */}
          <style jsx global>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
          {/* Message with a gold-colored text */}
          <p className="mt-4 text-goldenrod-500">
            Checking your authentication status...
          </p>
        </div>
      </div>
    );
  }

  // Render children once initialized
  return <>{children}</>;
}
