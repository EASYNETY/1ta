// app/(authenticated)/layout.tsx

'use client'

import type React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/auth/app-sidebar";
import { Header } from "@/components/layout/auth/header";
import { MobileNav } from "@/components/layout/auth/mobile-nav";
import { AbstractBackground } from "@/components/layout/abstract-background";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { fetchUserProfileThunk } from "@/features/auth/store/auth-thunks";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const dispatch = useAppDispatch()
    const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth)

    useEffect(() => {
        // Fetch user profile data when authenticated
        if (isAuthenticated && user && isInitialized) {
            dispatch(fetchUserProfileThunk())
        }
    }, [isAuthenticated, dispatch])

    return (
        // Set defaultOpen to true to show sidebar expanded by default
        <SidebarProvider defaultOpen={true}>
            {/* Set collapsible to "icon" to enable the icon-only state */}
            <AppSidebar collapsible="icon" />
            <SidebarInset>
                <div className="flex min-h-screen flex-col">
                    <Header />
                    <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 relative min-h-screen w-full">
                        <AbstractBackground className="opacity-90 dark:opacity-80" />
                        {children}
                    </main>
                    <MobileNav />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}