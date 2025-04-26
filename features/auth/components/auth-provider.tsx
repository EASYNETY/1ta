"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { useAuth } from "@/features/auth/hooks/use-auth"

interface AuthProviderProps {
  children: React.ReactNode
}

// Update public routes to include all routes that don't require authentication
const publicRoutes = ["/", "/login", "/signup", "/register", "/forgot-password"]

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const { isInitialized } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isInitialized) {
      // Still initializing auth, don't redirect yet
      return
    }

    // Check if the route is public
    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    // If not authenticated and not on a public route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login")
    }

    // If authenticated and on a login/signup/register page, redirect to dashboard
    if (
      isAuthenticated &&
      (pathname === "/login" || pathname === "/signup")
    ) {
      router.push("/dashboard")
    }

    // Role-based redirects
    if (isAuthenticated && user) {
      // Example: Redirect students trying to access admin pages
      if (pathname.startsWith("/admin") && user.role !== "admin") {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, pathname, router, user, isInitialized])

  // Show loading state while initializing auth
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
