import Link from "next/link"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className="text-9xl font-bold text-primary">404</h1>
            <h2 className="mt-4 text-3xl font-bold">Page Not Found</h2>
            <p className="mt-4 max-w-md text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="mt-8">
                <DyraneButton asChild>
                    <Link href="/">Return to Home</Link>
                </DyraneButton>
            </div>
        </div>
    )
}
