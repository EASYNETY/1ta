// providers/error-boundary.tsx

"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Wifi, RefreshCw, Home } from "lucide-react"
import { ApiError } from "@/lib/api-client"

interface ErrorBoundaryProps {
    children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
    const [hasError, setHasError] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [isNetworkError, setIsNetworkError] = useState(false)

    useEffect(() => {
        const isBenignError = (msg: string) => {
            return (
                msg.includes("ResizeObserver loop") ||
                msg.includes("hydration") || // Hydration mismatch
                msg.includes("Minified React error") // React dev-only minified errors
            )
        }

        const errorHandler = (event: ErrorEvent) => {
            const msg = event?.message || ""
            if (isBenignError(msg)) {
                console.warn("⚠️ Ignored benign browser error:", msg)
                return
            }

            console.error("❌ Caught error:", event)
            setError(event.error)

            if (event.error instanceof ApiError && event.error.isNetworkError) {
                setIsNetworkError(true)
            } else {
                setIsNetworkError(false)
            }

            setHasError(true)
        }

        const rejectionHandler = (event: PromiseRejectionEvent) => {
            const reason = event.reason
            const msg = reason?.message || ""

            if (typeof msg === "string" && isBenignError(msg)) {
                console.warn("⚠️ Ignored benign promise rejection:", msg)
                return
            }

            console.error("❌ Unhandled promise rejection:", event)

            if (reason instanceof Error) {
                setError(reason)

                if (reason instanceof ApiError && reason.isNetworkError) {
                    setIsNetworkError(true)
                } else {
                    setIsNetworkError(false)
                }

                setHasError(true)
            }
        }

        window.addEventListener("error", errorHandler)
        window.addEventListener("unhandledrejection", rejectionHandler)

        return () => {
            window.removeEventListener("error", errorHandler)
            window.removeEventListener("unhandledrejection", rejectionHandler)
        }
    }, [])

    if (hasError) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
                <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                    {isNetworkError ? (
                        <Wifi className="h-10 w-10 text-red-600 dark:text-red-400" />
                    ) : (
                        <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    )}
                </div>
                <h1 className="mt-6 text-3xl font-bold">{isNetworkError ? "Network Error" : "Something went wrong"}</h1>
                <p className="mt-4 max-w-md text-muted-foreground">
                    {isNetworkError
                        ? "Please check your internet connection and try again."
                        : error?.message || "An unexpected error occurred. Please try again later."}
                </p>
                <div className="mt-8 flex space-x-4">
                    <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh page
                    </Button>
                    <Button variant="outline" onClick={() => (window.location.href = "/")} className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Go to home
                    </Button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
