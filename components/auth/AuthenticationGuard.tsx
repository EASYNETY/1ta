// components/auth/AuthorizationGuard.tsx
"use client";

import { ReactNode } from 'react';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { UserRole } from '@/types/user.types';

interface AuthorizationGuardProps {
    /** Allowed roles - legacy support */
    allowedRoles?: UserRole[];
    /** Required permission - new permission-based approach */
    permission?: Permission;
    /** Multiple permissions - user needs ANY of these */
    permissions?: Permission[];
    /** Multiple permissions - user needs ALL of these */
    requireAllPermissions?: Permission[];
    children: ReactNode;
}

export function AuthorizationGuard({
    allowedRoles,
    permission,
    permissions,
    requireAllPermissions,
    children
}: AuthorizationGuardProps) {
    const { user } = useAppSelector((state) => state.auth);
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    // Determine if user has access
    let hasAccess = false;

    if (allowedRoles && user) {
        // Legacy role-based check
        hasAccess = allowedRoles.includes(user.role);
    } else if (permission) {
        // Single permission check
        hasAccess = hasPermission(permission);
    } else if (permissions) {
        // Multiple permissions - user needs ANY
        hasAccess = hasAnyPermission(permissions);
    } else if (requireAllPermissions) {
        // Multiple permissions - user needs ALL
        hasAccess = hasAllPermissions(requireAllPermissions);
    }

    if (!hasAccess) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Access Denied</h2>
                    <p className="text-muted-foreground mt-2">
                        You don't have permission to access this page.
                    </p>
                    <DyraneButton asChild className="mt-4">
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </DyraneButton>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}