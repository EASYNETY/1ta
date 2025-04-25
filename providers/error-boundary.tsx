// provider/error-boundary.tsx

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
    children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
    const [hasError, setHasError] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const errorHandler = (error: ErrorEvent) => {
            console.error("Caught error:", error)
            setError(error.error)
            setHasError(true)
        }

        window.addEventListener("error", errorHandler)

        return () => {
            window.removeEventListener("error", errorHandler)
        }
    }, [])

    if (hasError) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
                <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                    <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="mt-6 text-3xl font-bold">Something went wrong</h1>
                <p className="mt-4 max-w-md text-muted-foreground">
                    {error?.message || "An unexpected error occurred. Please try again later."}
                </p>
                <div className="mt-8 flex space-x-4">
                    <DyraneButton onClick={() => window.location.reload()}>Refresh page</DyraneButton>
                    <DyraneButton variant="outline" onClick={() => (window.location.href = "/")}>
                        Go to home
                    </DyraneButton>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
