// components/courses/AuthenticationGuard.tsx
import Link from "next/link";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";

interface AuthenticationGuardProps {
    children: ReactNode;
}

export function AuthenticationGuard({ children }: AuthenticationGuardProps) {
    const { user } = useAppSelector((state) => state.auth);

    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Authentication Required</h2>
                    <p className="text-muted-foreground mt-2">Please log in to access courses.</p>
                    <DyraneButton asChild className="mt-4">
                        <Link href="/login">Go to Login</Link>
                    </DyraneButton>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
