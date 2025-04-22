"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const publicRoutes = ["/login", "/register", "/forgot-password"];

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if the route is public
    const isPublicRoute = publicRoutes.includes(pathname);

    // If not authenticated and not on a public route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login");
    }

    // If authenticated and on a public route, redirect to dashboard
    if (isAuthenticated && isPublicRoute) {
      router.push("/dashboard");
    }

    // Role-based redirects (optional)
    if (isAuthenticated && user) {
      // Example: Redirect students trying to access admin pages
      if (pathname.startsWith("/admin") && user.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, pathname, router, user]);

  return <>{children}</>;
}
