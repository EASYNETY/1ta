// app/(authenticated)/support/page.tsx
"use client";

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, LifeBuoy, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { fetchMyTickets, selectMyTickets, selectSupportStatus, selectSupportError, clearSupportError } from '@/features/support/store/supportSlice';
import { TicketListItem } from '@/features/support/components/TicketListItem'; // Import the list item
import { SupportTicket } from '@/features/support/types/support-types';

export default function MySupportTicketsPage() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const tickets = useAppSelector(selectMyTickets) || [];
    const status = useAppSelector(selectSupportStatus);
    const error = useAppSelector(selectSupportError);
    const isLoading = status === 'loading';

    useEffect(() => {
        if (user?.id) { // Fetch only if needed
            dispatch(fetchMyTickets({ userId: user.id }));
        }
        dispatch(clearSupportError()); // Clear errors on mount
    }, [dispatch, user?.id]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className='flex items-center gap-2'>
                    <LifeBuoy className="h-6 w-6 text-primary" />
                    <h1 className="text-3xl font-bold">My Support Tickets</h1>
                </div>
                <DyraneButton asChild size="sm" className='hidden sm:flex'>
                    <Link href="/support/create"> <PlusCircle className="mr-2 h-4 w-4" /> Create New Ticket</Link>
                </DyraneButton>
            </div>

            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                </div>
            )}

            {status === 'failed' && error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Tickets</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {status === 'succeeded' && tickets.length === 0 && (
                <div className="text-center py-10 border rounded-lg bg-card">
                    <p className="text-muted-foreground">You haven't created any support tickets yet.</p>
                </div>
            )}

            {status === 'succeeded' && tickets.length > 0 && (
                <div className="space-y-4">
                    {tickets.map((ticket: SupportTicket) => (
                        <TicketListItem key={ticket.id} ticket={ticket} />
                    ))}
                    {/* TODO: Add Pagination controls */}
                </div>
            )}
        </div>
    );
}
