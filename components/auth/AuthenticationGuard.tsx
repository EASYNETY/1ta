// components/auth/AuthorizationGuard.tsx
"use client";

import { ReactNode } from 'react';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button'; // Use your button component

interface AuthorizationGuardProps {
    allowedRoles: string[];
    children: ReactNode;
}

export function AuthorizationGuard({ allowedRoles, children }: AuthorizationGuardProps) {
    const { user } = useAppSelector((state) => state.auth);

    if (!user || !allowedRoles.includes(user.role)) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Access Denied</h2>
                    <p className="text-muted-foreground mt-2">
                        You don't have permission to access this page.
                    </p>
                    <DyraneButton asChild className="mt-4">
                        {/* Adjust the link based on where non-authorized users should go */}
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </DyraneButton>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}