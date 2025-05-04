// features/auth/components/auth-provider.tsx

"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react"; // Import useRef
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { isProfileComplete } from "../utils/profile-completeness";
import { fetchUserProfileThunk } from "../store/auth-thunks";
import { useToast } from "@/hooks/use-toast";
import { isStudent } from "@/types/user.types";
import { clearCart } from "@/features/cart/store/cart-slice";

interface AuthProviderProps {
  children: React.ReactNode;
}

const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];

// Helper to check if path is public
const isPathPublic = (pathname: string): boolean => {
  return publicRoutes.some((route) => {
    if (route === "/") return pathname === "/";
    // Allow subpaths of public routes? Adjust if needed.
    // If /reset-password/token should be public, use startsWith.
    // If only /reset-password exact should be public, use ===.
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized, user, skipOnboarding } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);
  const hasFetchedProfile = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch user profile ONLY ONCE after initial authentication/mount
  useEffect(() => {
    // Ensure it runs only client-side and only if authenticated but fetch hasn't happened
    if (isMounted && isAuthenticated && !hasFetchedProfile.current) {
      console.log("AuthProvider: Dispatching fetchUserProfileThunk...");
      dispatch(fetchUserProfileThunk());
      hasFetchedProfile.current = true;
    }
    // Reset fetch flag if user logs out
    if (isMounted && !isAuthenticated && hasFetchedProfile.current) {
      hasFetchedProfile.current = false;
    }
  }, [isAuthenticated, isMounted, dispatch]);

  // Main effect: handles redirects and route access control
  useEffect(() => {
    // Wait for mount and initialization
    if (!isMounted || !isInitialized) {
      console.log("AuthProvider: Waiting for initialization or mount...");
      return;
    }
    console.log(`AuthProvider: Running checks. Path: ${pathname}, Auth: ${isAuthenticated}, Initialized: ${isInitialized}`);

    // Clear cart for corporate students
    if (isAuthenticated && user && isStudent(user) && user.corporateId != null && !user.isCorporateManager) {
      console.log("AuthProvider: Corporate student detected, clearing cart");
      dispatch(clearCart());
    }

    const isPublic = isPathPublic(pathname);

    // --- Scenario 1: Not Authenticated ---
    if (!isAuthenticated) {
      if (!isPublic) {
        console.log("AuthProvider: Not authenticated, private route. Redirecting to /login");
        router.push("/login");
      }
      // If it IS public, do nothing, let them stay
      return; // End checks for unauthenticated user
    }

    // --- Scenario 2: Authenticated ---
    if (isAuthenticated) {
      // If user data is needed but not loaded yet, wait (should be handled by isInitialized usually)
      if (!user) {
        console.log("AuthProvider: Authenticated but user object not ready yet.");
        return;
      }

      // A) Onboarding Check
      if (!isProfileComplete(user) && !skipOnboarding && pathname !== "/profile") {
        console.log("AuthProvider: Authenticated, profile incomplete. Redirecting to /profile");
        // No need for toast here usually, profile page explains it
        router.push("/profile");
        return; // Prioritize profile completion
      }

      // B) Already Authenticated on Public Route Check
      if (isPublic) {
        console.log("AuthProvider: Authenticated on public route. Redirecting to /dashboard");
        router.push("/dashboard");
        return;
      }

      // C) Role-Based Access Control for Private Routes (add more as needed)
      if (pathname.startsWith("/admin") && user.role !== "admin") {
        console.log("AuthProvider: Admin route unauthorized. Redirecting...");
        router.push("/dashboard");
        return;
      }
      if (pathname.startsWith("/teacher") && !['teacher', 'admin'].includes(user.role)) {
        console.log("AuthProvider: Teacher route unauthorized. Redirecting...");
        router.push("/dashboard");
        return;
      }
      if (pathname.startsWith("/corporate-management") && !(user.role === "student" && user.isCorporateManager === true)) {
        console.log("AuthProvider: Corporate route unauthorized. Redirecting...");
        router.push("/dashboard");
        return;
      }

      // If none of the above conditions met, user is authenticated, profile complete (or skipped),
      // and on an appropriate private route - do nothing, allow access.
      console.log("AuthProvider: Access granted.");
    }

  }, [
    // --- Refined Dependencies ---
    isAuthenticated,
    isInitialized,
    pathname, // Essential for route checks
    user, // Essential for profile/role checks (use user?.role, user?.id etc. inside if needed)
    skipOnboarding, // Essential for onboarding check
    isMounted, // Ensure runs client-side after mount
    router, // Needed for redirection (stable enough usually)
  ]);

  // --- Loading State ---
  // Show only while waiting for Redux state initialization AND component mount
  if (!isInitialized || !isMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          {/* Spinner */}
          <div style={{ border: "4px solid goldenrod", width: "36px", height: "36px", borderRadius: "50%", borderTopColor: "#D4AF3733", borderRightColor: "#D4AF37", borderBottomColor: "#D4AF3733", animation: "spin 1s ease infinite", margin: "0 auto" }}></div>
          <style jsx global>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
          <p className="mt-4" style={{ color: "goldenrod" }}>Initializing...</p>
        </div>
      </div>
    );
  }

  // Render children once initialization is complete and component is mounted
  return <>{children}</>;
}