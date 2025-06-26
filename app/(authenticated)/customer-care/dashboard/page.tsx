// app/(authenticated)/customer-care/dashboard/page.tsx
// FULLY CORRECTED AND UNABBREVIATED

"use client";

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CustomerCareGuard } from '@/components/auth/PermissionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  QrCode,
  Users,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Search,
  Ticket,
  RefreshCw
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchAllTickets,
  selectAllTickets,
  selectSupportStatus,
  selectSupportError,
  clearSupportError
} from '@/features/support/store/supportSlice';
import type { SupportTicket, TicketStatus, TicketPriority } from '@/features/support/types/support-types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { isToday, parseISO, formatDistanceToNowStrict } from 'date-fns';
import { PageHeader } from '@/components/layout/auth/page-header';

// --- StatsCard Component ---
interface StatsCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  isLoading?: boolean;
  className?: string;
}

function StatsCard({ title, value, subValue, icon: Icon, isLoading, className }: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
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
    <Card className={className}>
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

// --- RecentTicketsTable Component ---
interface RecentTicketsTableProps {
  tickets: SupportTicket[];
  isLoading: boolean;
}
function RecentTicketsTable({ tickets, isLoading }: RecentTicketsTableProps) {
  if (isLoading && (!tickets || tickets.length === 0)) {
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

  const getPriorityVariant = (priority: TicketPriority): "destructive" | "default" | "secondary" => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
      default:
        return 'secondary';
    }
  };

  const getStatusVariant = (status: TicketStatus): "destructive" | "default" | "secondary" | "outline" => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'default';
      case 'resolved':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
        <CardDescription>Latest support requests (showing up to 5 most recently updated)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tickets
            .slice()
            // Defensive sort: ensure updatedAt exists before parsing
            .sort((a, b) => (parseISO(b.updatedAt || 0 as any).getTime() - parseISO(a.updatedAt || 0 as any).getTime()))
            .slice(0, 5)
            .map((ticket) => (
              <div key={ticket.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors dark:border-gray-700">
                <div className="flex-grow mb-2 sm:mb-0 pr-2">
                  {/* FIX: Changed href to use correct admin path */}
                  <Link href={`/admin/tickets/${ticket.id}`} className="hover:underline block">
                    {/* FIX: Use `ticket.title` instead of `ticket.subject` */}
                    <p className="font-medium text-sm leading-tight truncate max-w-xs sm:max-w-sm md:max-w-md dark:text-gray-100">{ticket.title}</p>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {/* FIX: Use the nested `user` object and `userId` */}
                    By: {ticket.user?.name || 'Unknown User'}
                    {ticket.userId ? ` (ID: ${ticket.userId.substring(0, 8)}...)` : ' (ID: Unknown)'}
                  </p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Badge
                    variant={getPriorityVariant(ticket.priority)}
                    className="text-xs px-1.5 py-0.5 capitalize"
                  >
                    {ticket.priority}
                  </Badge>
                  <Badge
                    variant={getStatusVariant(ticket.status)}
                    className="text-xs px-1.5 py-0.5 capitalize"
                  >
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap" title={ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'}>
                    {ticket.createdAt ? formatDistanceToNowStrict(parseISO(ticket.createdAt), { addSuffix: true }) : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
        </div>
        {tickets.length > 5 && (
          <div className="mt-4 text-center">
            {/* FIX: Changed href to correct admin path */}
            <Button variant="link" size="sm" asChild>
              <Link href="/admin/tickets">View All Tickets</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Main Dashboard Component ---
export default function CustomerCareDashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const allTickets = useAppSelector(selectAllTickets);
  const supportStatus = useAppSelector(selectSupportStatus);
  const supportError = useAppSelector(selectSupportError);

  const isLoading = supportStatus === 'loading' || (supportStatus === 'idle' && (!allTickets || allTickets.length === 0));

  useEffect(() => {
    if (loggedInUser && (supportStatus === 'idle' || allTickets.length === 0)) {
      dispatch(clearSupportError());
      dispatch(fetchAllTickets({ limit: 10000, page: 1 }));
    }
  }, [dispatch, loggedInUser, allTickets.length, supportStatus]);

  const customerCareStats = useMemo(() => {
    if (!allTickets || allTickets.length === 0) {
      return {
        totalTickets: { value: "0", subValue: "All time" },
        openTickets: { value: "0", subValue: "Currently active" },
        resolvedToday: { value: "0", subValue: "Updated today" },
        newTicketsToday: { value: "0", subValue: "Created today" }
      };
    }
    const openStatuses: TicketStatus[] = ['open', 'in_progress'];
    const resolvedStatuses: TicketStatus[] = ['resolved', 'closed'];

    const totalTicketsCount = allTickets.length;
    const openTicketsCount = allTickets.filter(ticket => openStatuses.includes(ticket.status)).length;

    const resolvedTodayCount = allTickets.filter(ticket =>
      resolvedStatuses.includes(ticket.status) &&
      ticket.updatedAt &&
      isToday(parseISO(ticket.updatedAt))
    ).length;

    const newTicketsTodayCount = allTickets.filter(ticket =>
      ticket.createdAt &&
      isToday(parseISO(ticket.createdAt))
    ).length;

    return {
      totalTickets: { value: totalTicketsCount.toString(), subValue: "All time" },
      openTickets: { value: openTicketsCount.toString(), subValue: `${openTicketsCount} currently active` },
      resolvedToday: { value: resolvedTodayCount.toString(), subValue: "Resolved or closed today" },
      newTicketsToday: { value: newTicketsTodayCount.toString(), subValue: "Received today" }
    };
  }, [allTickets]);

  const myActivityStats = useMemo(() => {
    if (!loggedInUser || !allTickets || allTickets.length === 0) {
      return {
        ticketsResolvedOrLastHandledByMeToday: 0,
      };
    }

    const resolvedStatuses: TicketStatus[] = ['resolved', 'closed'];
    let ticketsHandledByMeToday = 0;

    allTickets.forEach(ticket => {
      const ticketResolvedOrClosedToday =
        resolvedStatuses.includes(ticket.status) &&
        ticket.updatedAt &&
        isToday(parseISO(ticket.updatedAt));

      // This logic is flawed because the `responses` array isn't available in the list view.
      // This is a note for future improvement: to get this stat, the backend would need
      // to either provide `lastResponderId` on the ticket object or a new endpoint.
      if (ticketResolvedOrClosedToday) {
        if (ticket.responses && ticket.responses.length > 0) {
          const sortedResponses = [...ticket.responses].sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());
          const lastResponse = sortedResponses[0];

          if (lastResponse && lastResponse.userId === loggedInUser.id) {
            ticketsHandledByMeToday++;
            return;
          }
        }
      }
    });

    return {
      ticketsResolvedOrLastHandledByMeToday: ticketsHandledByMeToday,
    };
  }, [loggedInUser, allTickets]);

  if (supportError && !isLoading) {
    return (
      <CustomerCareGuard>
        <div className="flex items-center justify-center h-screen p-4">
          <Alert variant="destructive" className="w-full max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Support Data</AlertTitle>
            <CardDescription>{supportError}</CardDescription>
            <Button
              onClick={() => {
                dispatch(clearSupportError());
                dispatch(fetchAllTickets({ limit: 10000, page: 1 }));
              }}
              className="mt-4"
            >
              Retry
            </Button>
          </Alert>
        </div>
      </CustomerCareGuard>
    );
  }

  const quickActions = [
    { icon: QrCode, label: "Scan Student ID", href: "/attendance/scan" },
    { icon: Search, label: "Student Directory", href: "/customer-care/students" },
    { icon: MessageSquare, label: "Create New Ticket", href: "/support/tickets/new" },
    { icon: Ticket, label: "View All Tickets", href: "/admin/tickets" }, // Corrected path
  ];

  return (
    <CustomerCareGuard>
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader
          heading="Customer Care Dashboard"
          subheading="Support overview and student assistance tools"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Tickets"
            value={customerCareStats.totalTickets.value}
            subValue={customerCareStats.totalTickets.subValue}
            icon={Ticket}
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
            title="Tickets Resolved Today"
            value={customerCareStats.resolvedToday.value}
            subValue={customerCareStats.resolvedToday.subValue}
            icon={CheckCircle}
            isLoading={isLoading}
          />
          <StatsCard
            title="New Tickets Today"
            value={customerCareStats.newTicketsToday.value}
            subValue={customerCareStats.newTicketsToday.subValue}
            icon={MessageSquare}
            isLoading={isLoading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common customer care tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {quickActions.map((item, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="h-auto p-3 flex-grow basis-[calc(50%-0.375rem)] md:basis-auto md:flex-grow-0 flex flex-col items-center justify-center space-y-1 min-w-[120px] hover:bg-accent transition-colors dark:hover:bg-accent/70"
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs text-center font-medium">{item.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Activity Today</CardTitle>
              <CardDescription>Your key interactions and resolutions</CardDescription>
            </CardHeader>
            <CardContent>
              {(isLoading && (!myActivityStats || myActivityStats.ticketsResolvedOrLastHandledByMeToday === undefined)) ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between"><span>My Handled Tickets:</span><Skeleton className="h-4 w-10 inline-block" /></div>
                  <div className="flex items-center justify-between"><span>My Avg. Response:</span><Skeleton className="h-4 w-24 inline-block" /></div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Tickets Handled by Me Today:</span>
                    <span className="font-semibold text-lg">{myActivityStats.ticketsResolvedOrLastHandledByMeToday}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>My Avg. First Response Time:</span>
                    <span className="font-medium text-muted-foreground italic">N/A</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <RecentTicketsTable tickets={allTickets || []} isLoading={isLoading} />

        <Card>
          <CardHeader>
            <CardTitle>Student Information Lookup</CardTitle>
            <CardDescription>Quickly access student profiles using ID card scan</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <QrCode className="h-12 w-12 mx-auto mb-3 text-primary" />
            <h3 className="text-md font-medium mb-1">Scan Student ID Card</h3>
            <p className="text-sm text-muted-foreground mb-3 max-w-md mx-auto">
              Use a barcode scanner or navigate to the scan page to look up student details.
            </p>
            <Button onClick={() => router.push('/attendance/scan')}>
              <QrCode className="mr-2 h-4 w-4" />
              Open Scanner Page
            </Button>
          </CardContent>
        </Card>
      </div>
    </CustomerCareGuard>
  );
}