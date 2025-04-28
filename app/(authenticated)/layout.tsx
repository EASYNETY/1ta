// components/layout/auth/layout.tsx
import type React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/auth/app-sidebar";
import { Header } from "@/components/layout/auth/header";
import { MobileNav } from "@/components/layout/auth/mobile-nav";
import { AbstractBackground } from "@/components/layout/abstract-background";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        // Set defaultOpen to false here
        <SidebarProvider defaultOpen={false}>
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