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
import { isAdmin } from "@/types/user.types"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/auth/page-header"

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

    // Redirect non-admin users
    useEffect(() => {
        if (user && !isAdmin(user)) {
            router.push("/dashboard")
        }
    }, [user, router])

    useEffect(() => {
        if (user && isAdmin(user)) {
            // Fetch all tickets for admin
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
    const filteredTickets = tickets.filter((ticket) => {
        if (!searchQuery) return true

        const query = searchQuery.toLowerCase()
        return (
            ticket.subject.toLowerCase().includes(query) ||
            ticket.description.toLowerCase().includes(query) ||
            ticket.studentName?.toLowerCase().includes(query) ||
            ticket.id.toLowerCase().includes(query)
        )
    })

    // Count tickets by status
    const ticketCounts = {
        all: tickets.length,
        open: tickets.filter((t) => t.status === "open").length,
        in_progress: tickets.filter((t) => t.status === "in_progress").length,
        resolved: tickets.filter((t) => t.status === "resolved").length,
        closed: tickets.filter((t) => t.status === "closed").length,
    }

    if (!user || !isAdmin(user)) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You don't have permission to access this page.</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                heading="Ticket Management"
                subheading="View and manage all support tickets"
            />

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <Tabs
                    defaultValue="all"
                    className="w-full"
                    onValueChange={(value) => setStatusFilter(value as TicketStatus | "all")}
                >
                    <TabsList className="grid grid-cols-5 w-full max-w-2xl">
                        <TabsTrigger value="all">
                            All{" "}
                            <Badge variant="outline" className="ml-2">
                                {ticketCounts.all}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="open">
                            Open{" "}
                            <Badge variant="outline" className="ml-2">
                                {ticketCounts.open}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="in_progress">
                            In Progress{" "}
                            <Badge variant="outline" className="ml-2">
                                {ticketCounts.in_progress}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="resolved">
                            Resolved{" "}
                            <Badge variant="outline" className="ml-2">
                                {ticketCounts.resolved}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="closed">
                            Closed{" "}
                            <Badge variant="outline" className="ml-2">
                                {ticketCounts.closed}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
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
