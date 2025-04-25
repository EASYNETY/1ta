import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/auth/app-sidebar"
import { Header } from "@/components/layout/auth/header"
import { MobileNav } from "@/components/layout/auth/mobile-nav"

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex min-h-screen flex-col">
                    <Header />
                    <main className="flex-1 p-6 pb-20 md:pb-6">{children}</main>
                    <MobileNav />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
