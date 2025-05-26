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
import { AuthListener } from "@/lib/auth-listener";
import { SleekLogoLoader } from "@/components/ui/SleekLogoLoader";


interface AuthProviderProps {
  children: React.ReactNode;
}

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/help-support",
  "/contact",
  "/public-courses",
  "/privacy-policy",
  "/terms-conditions",
  "/cookies-policy",
  "/data-protection-policy"
];

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
      return;
    }

    // Clear cart for corporate students
    if (isAuthenticated && user && isStudent(user) && user.corporateId != null && !user.isCorporateManager) {
      dispatch(clearCart());
    }

    const isPublic = isPathPublic(pathname);

    // --- Scenario 1: Not Authenticated ---
    if (!isAuthenticated) {
      if (!isPublic) {
        router.push("/login");
      }
      // If it IS public, do nothing, let them stay
      return; // End checks for unauthenticated user
    }

    // --- Scenario 2: Authenticated ---
    if (isAuthenticated) {
      // If user data is needed but not loaded yet, wait (should be handled by isInitialized usually)
      if (!user) {
        return;
      }

      // A) Onboarding Check
      if (!isProfileComplete(user) && !skipOnboarding && pathname !== "/profile") {
        router.push("/profile");
        return; // Prioritize profile completion
      }

      // B) Already Authenticated on Public Route Check
      if (isPublic) {
        router.push("/dashboard");
        return;
      }

      // C) Role-Based Access Control for Private Routes

      // Super Admin has access to everything, so check other roles first

      // Admin routes - Super Admin and Admin only
      if (pathname.startsWith("/admin") && !['super_admin', 'admin'].includes(user.role)) {
        router.push("/dashboard");
        return;
      }

      // Analytics dashboard - Super Admin only (Admin should not access)
      if (pathname.startsWith("/admin/analytics") && user.role !== "super_admin") {
        router.push("/dashboard");
        return;
      }

      // Accounting routes - Super Admin and Accounting only
      if (pathname.startsWith("/accounting") && !['super_admin', 'accounting'].includes(user.role)) {
        router.push("/dashboard");
        return;
      }

      // Customer Care routes - Super Admin and Customer Care only
      if (pathname.startsWith("/customer-care") && !['super_admin', 'customer_care'].includes(user.role)) {
        router.push("/dashboard");
        return;
      }

      // Teacher routes - Super Admin, Admin, and Teacher
      if (pathname.startsWith("/teacher") && !['super_admin', 'admin', 'teacher'].includes(user.role)) {
        router.push("/dashboard");
        return;
      }

      // Corporate management - Students who are corporate managers
      if (pathname.startsWith("/corporate-management") && !(user.role === "student" && user.isCorporateManager === true)) {
        router.push("/dashboard");
        return;
      }

      // If none of the above conditions met, user is authenticated, profile complete (or skipped),
      // and on an appropriate private route - do nothing, allow access.
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
  // Show loading while waiting for Redux state initialization AND component mount
  if (!isInitialized || !isMounted) {
    return (
      // <div className="flex h-screen w-screen items-center justify-center">
      //   <div className="text-center">
      //     {/* Spinner */}
      //     <div style={{ border: "4px solid goldenrod", width: "36px", height: "36px", borderRadius: "50%", borderTopColor: "#D4AF3733", borderRightColor: "#D4AF37", borderBottomColor: "#D4AF3733", animation: "spin 1s ease infinite", margin: "0 auto" }}></div>
      //     <style jsx global>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
      //     <p className="mt-4" style={{ color: "goldenrod" }}>Initializing...</p>
      //   </div>
      // </div>
      <SleekLogoLoader />
    );
  }

  // Render children once initialization is complete and component is mounted
  return <>
    {/* AuthListener is used to keep track of auth state */}
    {/* It should be placed inside the AuthProvider */}
    <AuthListener />
    {children}
  </>;
}