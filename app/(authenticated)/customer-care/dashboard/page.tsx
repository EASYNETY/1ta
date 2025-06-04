// app/(authenticated)/customer-care/dashboard/page.tsx

"use client";

import React, { useEffect, useMemo } from 'react'; // Added useMemo
import { CustomerCareGuard } from '@/components/auth/PermissionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  QrCode,
  Users,
  MessageSquare,
  LifeBuoy,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp, // Keep if you plan to show trends
  TrendingDown, // Keep if you plan to show trends
  Search,
  Ticket // Added Ticket icon
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks'; // Added useAppDispatch
import {
  fetchAllTickets,
  selectAllTickets,
  selectSupportStatus,
  selectSupportError,
  clearSupportError
} from '@/features/support/store/supportSlice'; // Import from supportSlice
import type { SupportTicket, TicketPriority, TicketStatus } from '@/features/support/types/support-types';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Alert, AlertTitle } from '@/components/ui/alert'; // For error state
import { isToday, parseISO, differenceInHours, formatDistanceToNowStrict } from 'date-fns'; // For date calculations

// StatsCard component (remains mostly the same, but trend logic might change)
function StatsCard({
  title,
  value,
  subValue, // Optional sub-value like "from last week"
  icon: Icon,
  isLoading // Added isLoading prop
}: {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/2 mb-2" />
          {subValue && <Skeleton className="h-4 w-full" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subValue && (
          <p className="text-xs text-muted-foreground">
            {subValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// RecentTicketsTable component (minor adjustments for date formatting)
function RecentTicketsTable({ tickets, isLoading }: { tickets: SupportTicket[], isLoading: boolean }) {
  if (isLoading && tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>No recent support requests found.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tickets to display.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
        <CardDescription>Latest support requests (showing up to 5)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tickets.slice(0, 5).map((ticket) => ( // Show only first 5 or so
            <div key={ticket.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-grow mb-2 sm:mb-0">
                <p className="font-medium text-sm leading-tight truncate max-w-xs sm:max-w-sm md:max-w-md">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground">
                  By: {ticket.studentName || 'N/A'} ({ticket.studentId})
                </p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Badge
                  variant={
                    ticket.priority === 'high' || ticket.priority === 'urgent' ? 'destructive' :
                      ticket.priority === 'medium' ? 'default' : 'secondary'
                  }
                  className="text-xs px-1.5 py-0.5"
                >
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </Badge>
                <Badge
                  variant={
                    ticket.status === 'open' ? 'destructive' :
                      ticket.status === 'in_progress' ? 'default' : 'secondary' // Assuming 'resolved' and 'closed' are secondary
                  }
                  className="text-xs px-1.5 py-0.5"
                >
                  {ticket.status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNowStrict(parseISO(ticket.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
        {tickets.length > 5 && (
          <div className="mt-4 text-center">
            <Button variant="link" size="sm" asChild>
              {/* Link to a full tickets page */}
              <a href="/customer-care/tickets">View All Tickets</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CustomerCareDashboard() {
  const dispatch = useAppDispatch();
  const allTickets = useAppSelector(selectAllTickets);
  const supportStatus = useAppSelector(selectSupportStatus);
  const supportError = useAppSelector(selectSupportError);

  const isLoading = supportStatus === 'loading' || supportStatus === 'idle';

  // Fetch all tickets on mount
  useEffect(() => {
    if (supportStatus === 'idle') { // Fetch only if idle to avoid multiple calls on re-renders
      dispatch(fetchAllTickets({ limit: 1000 })); // Fetch a large number for stats, or implement backend aggregation
    }
  }, [dispatch, supportStatus]);

  // Calculate stats using useMemo to avoid recalculation on every render
  const customerCareStats = useMemo(() => {
    if (!allTickets || allTickets.length === 0) {
      return {
        totalTickets: { value: "0", subValue: "" },
        openTickets: { value: "0", subValue: "" },
        resolvedToday: { value: "0", subValue: "" },
        avgResponseTime: { value: "N/A", subValue: "" }, // Placeholder
        newTicketsToday: { value: "0", subValue: "" }
      };
    }

    const openStatuses: TicketStatus[] = ['open', 'in_progress'];
    const resolvedStatuses: TicketStatus[] = ['resolved', 'closed'];

    const totalTicketsCount = allTickets.length;
    const openTicketsCount = allTickets.filter(ticket => openStatuses.includes(ticket.status)).length;

    const resolvedTodayCount = allTickets.filter(ticket =>
      resolvedStatuses.includes(ticket.status) && ticket.updatedAt && isToday(parseISO(ticket.updatedAt))
    ).length;

    const newTicketsTodayCount = allTickets.filter(ticket =>
      ticket.createdAt && isToday(parseISO(ticket.createdAt))
    ).length;


    // Avg Response Time is complex. We'll use "New Tickets Today" as a simpler metric for now.
    // True Avg Response Time: For each ticket, find first response from staff. Calculate time diff from ticket creation. Average these.
    // This would require ticket.responses to be populated in allTickets or a separate calculation.

    return {
      totalTickets: { value: totalTicketsCount.toString(), subValue: "All time" },
      openTickets: { value: openTicketsCount.toString(), subValue: `Currently active` },
      resolvedToday: { value: resolvedTodayCount.toString(), subValue: "Updated today" },
      avgResponseTime: { value: "N/A", subValue: "Calculation TBD" }, // Placeholder
      newTicketsToday: { value: newTicketsTodayCount.toString(), subValue: "Created today" }
    };
  }, [allTickets]);

  if (supportError && !isLoading) {
    return (
      <CustomerCareGuard>
        <div className="flex items-center justify-center h-screen">
          <Alert variant="destructive" className="w-full max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <CardDescription>{supportError}</CardDescription>
            <Button onClick={() => dispatch(fetchAllTickets({ limit: 1000 }))} className="mt-4">Retry</Button>
          </Alert>
        </div>
      </CustomerCareGuard>
    )
  }


  return (
    <CustomerCareGuard>
      <div className="space-y-6 p-4 md:p-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Customer Care Dashboard</h1>
          <p className="text-muted-foreground">
            Support overview and student assistance tools
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Tickets"
            value={customerCareStats.totalTickets.value}
            subValue={customerCareStats.totalTickets.subValue}
            icon={Ticket} // Changed icon
            isLoading={isLoading}
          />
          <StatsCard
            title="Open Tickets"
            value={customerCareStats.openTickets.value}
            subValue={customerCareStats.openTickets.subValue}
            icon={AlertCircle}
            isLoading={isLoading}
          />
          <StatsCard
            title="Resolved Today"
            value={customerCareStats.resolvedToday.value}
            subValue={customerCareStats.resolvedToday.subValue}
            icon={CheckCircle}
            isLoading={isLoading}
          />
          <StatsCard
            title="New Tickets Today" // Changed from Avg Response Time
            value={customerCareStats.newTicketsToday.value}
            subValue={customerCareStats.newTicketsToday.subValue}
            icon={MessageSquare} // More relevant icon
            isLoading={isLoading}
          />
        </div>

        {/* Quick Actions & Today's Activity side-by-side on larger screens */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common customer care tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Using flex-wrap for better responsiveness of buttons */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: QrCode, label: "Scan Student", action: () => console.log("Scan barcode") },
                  { icon: Search, label: "Search Student", action: () => console.log("Search student") },
                  { icon: MessageSquare, label: "New Ticket", action: () => console.log("New ticket") },
                  { icon: Users, label: "Student Directory", action: () => console.log("Student directory") },
                ].map((item, idx) => (
                  <Button key={idx} variant="outline" className="h-auto p-3 flex-grow basis-[calc(50%-0.375rem)] md:basis-auto md:flex-grow-0 flex flex-col items-center justify-center space-y-1 min-w-[120px]" onClick={item.action}>
                    <item.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs text-center">{item.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Activity Today</CardTitle>
              <CardDescription>Your personal performance summary</CardDescription>
            </CardHeader>
            <CardContent>
              {/* This data would ideally come from a specific API or be calculated based on assigned tickets */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Tickets I Resolved:</span>
                  <span className="font-medium">{isLoading ? <Skeleton className="h-4 w-8 inline-block" /> : "8"}</span> {/* Mocked */}
                </div>
                <div className="flex items-center justify-between">
                  <span>My Avg. Response:</span>
                  <span className="font-medium">{isLoading ? <Skeleton className="h-4 w-20 inline-block" /> : "1.2 hours"}</span> {/* Mocked */}
                </div>
                <div className="flex items-center justify-between">
                  <span>Students I Assisted:</span>
                  <span className="font-medium">{isLoading ? <Skeleton className="h-4 w-8 inline-block" /> : "15"}</span> {/* Mocked */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tickets Table */}
        <RecentTicketsTable tickets={allTickets || []} isLoading={isLoading} />

        {/* Student Information Access (Barcode Scanner) */}
        {/* This section seems more like a feature than just informational.
            Consider if it needs to be interactive or just a call to action. */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information Lookup</CardTitle>
            <CardDescription>Quickly access student profiles</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <QrCode className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-md font-medium mb-1">Scan Student ID Card</h3>
            <p className="text-sm text-muted-foreground mb-3 max-w-md mx-auto">
              Use a barcode scanner or manually enter ID to view student details, attendance, and timetables.
            </p>
            <Button onClick={() => console.log("Open Scanner / Search Student")}>
              <Search className="mr-2 h-4 w-4" />
              Lookup Student
            </Button>
          </CardContent>
        </Card>
      </div>
    </CustomerCareGuard>
  );
}