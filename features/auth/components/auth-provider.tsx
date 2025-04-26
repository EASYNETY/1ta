"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

interface AuthProviderProps {
  children: React.ReactNode;
}

const publicRoutes = ["/", "/login", "/signup", "/register", "/forgot-password"];

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitialized) return;

    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login");
    }

    if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
      router.push("/dashboard");
    }

    if (isAuthenticated && user) {
      if (pathname.startsWith("/admin") && user.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isInitialized, pathname, router, user]);

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
