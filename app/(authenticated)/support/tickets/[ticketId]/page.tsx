// app/(authenticated)/support/tickets/[ticketId]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Use useParams
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, MessageSquare, Send, Loader2, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { format, parseISO, isValid } from 'date-fns';
import { formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    fetchTicketById,
    addTicketResponse,
    selectCurrentTicket,
    selectTicketStatus,
    selectSupportError,
    selectSupportCreateStatus, // For response sending status
    clearCurrentTicket,
    clearSupportError,
    resetCreateStatus,
} from '@/features/support/store/supportSlice'; // Adjust path
import type { TicketPriority, TicketResponse, TicketStatus } from '@/features/support/types/support-types';
import { Label } from '@/components/ui/label';
import { getPriorityStyles, getStatusVariant } from '@/features/support/components/TicketListItem';
import { PageHeader } from '@/components/layout/auth/page-header';


// Helper to format date string safely
const safeFormatDetailedDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, "PPP 'at' p") : 'Invalid Date';
    } catch { return 'Error'; }
};

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);

    // Support ticket detail page accessible to all authenticated users
    const ticket = useAppSelector(selectCurrentTicket);
    const status = useAppSelector(selectTicketStatus); // Status for fetching the ticket
    const responseStatus = useAppSelector(selectSupportCreateStatus); // Status for sending response
    const error = useAppSelector(selectSupportError);
    const ticketId = typeof params.ticketId === 'string' ? params.ticketId : '';
    const [replyContent, setReplyContent] = useState('');
    const isSendingReply = responseStatus === 'loading';


    useEffect(() => {
        if (ticketId && user?.id && user.role) {
            // Fetch ticket only if ID is valid and user context exists
            console.log(`Fetching ticket detail: ${ticketId}`);
            dispatch(fetchTicketById({ ticketId, userId: user.id, role: user.role }));
        } else if (!ticketId || !user) {
            console.error("Missing ticket ID or user context for fetching ticket detail");
            // Optionally redirect or show error
        }

        // Cleanup on unmount
        return () => {
            dispatch(clearCurrentTicket());
            dispatch(clearSupportError());
            dispatch(resetCreateStatus());
        };
    }, [dispatch, ticketId, user?.id, user?.role]);


    const handleAddResponse = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedContent = replyContent.trim();
        if (!trimmedContent || !ticket || !user || isSendingReply) return;

        dispatch(addTicketResponse({
            ticketId: ticket.id,
            message: trimmedContent,
            senderId: user.id,
            senderRole: user.role,
        })).unwrap()
            .then(() => {
                setReplyContent(''); // Clear input on success
                // Status is reset in slice/thunk? Or manually reset: dispatch(resetCreateStatus());
                // Maybe scroll to bottom of messages
            })
            .catch((err) => {
                // Error toast handled by slice/rejected case?
                console.error("Failed to send reply:", err);
            });
    };

    if (status === 'loading') {
        return (
            <div className="max-w-3xl mx-auto space-y-4 p-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    if (status === 'failed' || !ticket) {
        return (
            <div className="mx-auto">
                <DyraneButton variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets
                </DyraneButton>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Ticket</AlertTitle>
                    <AlertDescription>{error || 'Could not load the support ticket details.'}</AlertDescription>
                </Alert>
            </div>
        );
    }


    return (
        <div className="mx-auto">
            {/* Header */}
            <PageHeader
                heading="Support Ticket"
                subheading="View and manage your support ticket"
            />

            <DyraneCard className="mb-6">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <CardTitle className="text-xl">{ticket.title}</CardTitle>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={getStatusVariant(ticket.status)} className="capitalize">{ticket.status.replace('_', ' ')}</Badge>
                            <span className={cn("text-xs font-medium uppercase tracking-wide", getPriorityStyles(ticket.priority))}>{ticket.priority}</span>
                        </div>
                    </div>
                    <CardDescription className="text-xs pt-1">
                        Opened by {ticket.user?.name ?? ticket.user?.id ?? "Unknown"} on {safeFormatDetailedDate(ticket.createdAt)}
                        {' • '} Last updated: {safeFormatDetailedDate(ticket.updatedAt)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{ticket.description}</p>
                </CardContent>
            </DyraneCard>

            <h2 className="text-xl font-semibold mb-4">Responses</h2>

            {/* Response List */}
            <div className="space-y-4 mb-6">
                {ticket.responses && ticket.responses.length > 0 ? (
                    ticket.responses.map((response) => (
                        <div key={response.id} className="flex gap-3">
                            <Avatar className="h-8 w-8 border">
                                {/* Optionally show avatar or fallback */}
                                <AvatarFallback>{response.userName?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 p-3 rounded-md bg-muted/60 border">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-semibold">{response.userName || 'Staff'}</span>
                                    <span className="text-xs text-muted-foreground">{safeFormatDetailedDate(response.createdAt)}</span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground italic">No responses yet.</p>
                )}
            </div>

            {/* Feedback Link (Add this below the responses or in a convenient spot) */}
            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <DyraneButton
                    variant="outline"
                    onClick={() => router.push(`/support/feedback/create?ticketId=${ticket.id}`)}
                    className="mt-6"
                >
                    Submit Feedback
                </DyraneButton>
            )}

            {/* Add Response Form (Show if ticket is not resolved/closed) */}
            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <form onSubmit={handleAddResponse} className="space-y-3 border-t pt-6">
                    <Label htmlFor="replyMessage" className="font-semibold">Add a Reply</Label>
                    <Textarea
                        id="replyMessage"
                        placeholder="Type your message here..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[100px]"
                        required
                        disabled={isSendingReply}
                    />
                    <DyraneButton type="submit" disabled={!replyContent.trim() || isSendingReply}>
                        {isSendingReply && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Reply
                    </DyraneButton>
                    {responseStatus === 'failed' && error && (
                        <p className="text-xs text-destructive mt-1">{error}</p>
                    )}
                </form>
            )}
        </div>
    );
}