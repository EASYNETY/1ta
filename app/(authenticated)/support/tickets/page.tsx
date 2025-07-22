// app/(authenticated)/support/tickets/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, ClipboardList, Search } from "lucide-react"
import {
    fetchAllTickets,
    selectAllTickets,
    selectSupportStatus,
    selectSupportError,
    clearSupportError,
} from "@/features/support/store/supportSlice"
import { TicketListItem } from "@/features/support/components/TicketListItem"
import type { SupportTicket, TicketStatus } from "@/features/support/types/support-types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { hasAdminAccess, isCustomerCare } from "@/types/user.types"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/auth/page-header"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function AdminTicketsPage() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { user } = useAppSelector((state) => state.auth)
    const tickets = useAppSelector(selectAllTickets)
    const status = useAppSelector(selectSupportStatus)
    const error = useAppSelector(selectSupportError)
    const isLoading = status === "loading"

    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all")
    const [searchQuery, setSearchQuery] = useState("")

    // Redirect non-authorized users (allow admin and customer_care)
    // useEffect(() => {
    //     if (user && !hasAdminAccess(user) ) {
    //         console.log("User does not have access to tickets:", user.role);
    //         router.push("/dashboard");
    //     }
    // }, [user, router])

    useEffect(() => {
        if (user && (hasAdminAccess(user) || isCustomerCare(user))) {
            // Fetch all tickets for admin and super_admin
            dispatch(
                fetchAllTickets({
                    status: statusFilter === "all" ? undefined : statusFilter,
                }),
            )
        }

        // Clear errors on mount
        dispatch(clearSupportError())
    }, [dispatch, user, statusFilter])

    // Filter tickets by search query
    const filteredTickets = (tickets ?? []).filter((ticket) => {
        if (!searchQuery) return true

        const query = searchQuery.toLowerCase()
        return (
            ticket.title.toLowerCase().includes(query) ||
            ticket.description.toLowerCase().includes(query) ||
            ticket.user.name?.toLowerCase().includes(query) ||
            ticket.id.toLowerCase().includes(query)
        )
    })

    // Count tickets by status
    const safeTickets = tickets ?? [];
    const ticketCounts = {
        all: safeTickets.length,
        open: safeTickets.filter((t) => t.status === "open").length,
        in_progress: safeTickets.filter((t) => t.status === "in_progress").length,
        resolved: safeTickets.filter((t) => t.status === "resolved").length,
        closed: safeTickets.filter((t) => t.status === "closed").length,
    }

    // if (!user || (!hasAdminAccess(user) && !isCustomerCare(user))) {
    //     return (
    //         <Alert variant="destructive">
    //             <AlertTriangle className="h-4 w-4" />
    //             <AlertTitle>Access Denied</AlertTitle>
    //             <AlertDescription>You don't have permission to access this page.</AlertDescription>
    //         </Alert>
    //     )
    // }

    const tabItems = [
        { value: "all" as const, label: "All", count: ticketCounts.all },
        { value: "open" as const, label: "Open", count: ticketCounts.open },
        { value: "in_progress" as const, label: "In Progress", count: ticketCounts.in_progress },
        { value: "resolved" as const, label: "Resolved", count: ticketCounts.resolved },
        { value: "closed" as const, label: "Closed", count: ticketCounts.closed },
    ];

    const handleValueChange = (value: string) => {
        setStatusFilter(value as TicketStatus | "all");
    };

    return (
        <div className="space-y-6">
            <PageHeader
                heading="Ticket Management"
                subheading="View and manage all support tickets"
            />

            <div className="flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <Tabs
                    value={statusFilter}
                    className="w-full sm:max-w-2xl" // Constrain Tabs width on desktop
                    onValueChange={handleValueChange}
                >
                    <ScrollArea
                        className="w-full whitespace-nowrap" // Allow content to not wrap, enabling horizontal scroll
                    >
                        <TabsList
                            className={cn(
                                // --- Mobile First (Scrollable) ---
                                // Uses shadcn's default TabsList (inline-flex) + adjustments
                                "inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground",
                                "gap-1", // Add a small gap between items for scrolling
                                // --- SM Breakpoint and Up (Grid) ---
                                "sm:grid sm:w-full sm:grid-cols-5 sm:justify-center sm:gap-2" // Override to grid, fill width, 5 cols, center items
                            )}
                        >
                            {tabItems.map((item) => (
                                <TabsTrigger
                                    key={item.value}
                                    value={item.value}
                                    // On desktop, make triggers take equal width in the grid
                                    className="sm:flex-1"
                                >
                                    {item.label}
                                    <Badge variant="outline" className="ml-2 tabular-nums">
                                        {item.count}
                                    </Badge>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <ScrollBar orientation="horizontal" className="h-2 sm:hidden" /> {/* Show scrollbar only on mobile */}
                    </ScrollArea>
                </Tabs>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tickets..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TicketStatus | "all")}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tickets</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                </div>
            )}

            {status === "failed" && error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Tickets</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {status === "succeeded" && filteredTickets.length === 0 && (
                <div className="text-center py-10 border rounded-lg bg-card">
                    <p className="text-muted-foreground">No tickets found matching your criteria.</p>
                </div>
            )}

            {status === "succeeded" && filteredTickets.length > 0 && (
                <div className="space-y-4">
                    {filteredTickets.map((ticket: SupportTicket) => (
                        <TicketListItem key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            )}
        </div>
    )
}
