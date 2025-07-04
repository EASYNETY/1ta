// app/(authenticated)/admin/tickets/[ticketId]/page.tsx

"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import {
    fetchTicketById,
    addTicketResponse,
    updateTicketStatus,
    selectCurrentTicket,
    selectTicketStatus,
    selectSupportError,
    selectSupportCreateStatus,
    clearCurrentTicket,
    clearSupportError,
    resetCreateStatus,
} from "@/features/support/store/supportSlice";
import type { TicketResponse, TicketStatus } from "@/features/support/types/support-types";
import { Label } from "@/components/ui/label";
import { getPriorityStyles, getStatusVariant } from "@/features/support/components/TicketListItem";
import { hasAdminAccess, isCustomerCare } from "@/types/user.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/auth/page-header";
import { toast } from "sonner";

const safeFormatDetailedDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, "PPP 'at' p") : "Invalid Date";
    } catch {
        return "Error";
    }
};

export default function AdminTicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const ticket = useAppSelector(selectCurrentTicket);
    const status = useAppSelector(selectTicketStatus);
    const responseStatus = useAppSelector(selectSupportCreateStatus);
    const error = useAppSelector(selectSupportError);
    const ticketId = typeof params.ticketId === "string" ? params.ticketId : "";
    const [replyContent, setReplyContent] = useState("");
    const isSendingReply = responseStatus === "loading";

    useEffect(() => {
        if (user && (!hasAdminAccess(user) && !isCustomerCare(user))) {
            router.push("/dashboard");
        }
    }, [user, router]);

    useEffect(() => {
        if (ticketId && user?.id && (hasAdminAccess(user) || isCustomerCare(user))) {
            dispatch(fetchTicketById({ ticketId, userId: user.id, role: user.role }));
        }
        return () => {
            dispatch(clearCurrentTicket());
            dispatch(clearSupportError());
            dispatch(resetCreateStatus());
        };
    }, [dispatch, ticketId, user]);

    const handleAddResponse = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedContent = replyContent.trim();
        if (!trimmedContent || !ticket || !user || isSendingReply) return;

        dispatch(
            addTicketResponse({
                ticketId: ticket.id,
                message: trimmedContent,
                senderId: user.id,
                senderRole: user.role,
            }),
        )
            .unwrap()
            .then(() => {
                setReplyContent("");
                toast.success("Response sent successfully!");
            })
            .catch((err) => {
                toast.error("Failed to send reply.");
                console.error("Failed to send reply:", err);
            });
    };

    const handleStatusChange = (newStatus: TicketStatus) => {
        if (!ticket || ticket.status === newStatus) return;

        toast.info(`Updating status...`);
        dispatch(updateTicketStatus({ ticketId: ticket.id, status: newStatus }))
            .unwrap()
            .then(() => {
                toast.success("Ticket status updated successfully!");
            })
            .catch(() => {
                toast.error("Failed to update status.");
            });
    };

    if (!user || (!hasAdminAccess(user) && !isCustomerCare(user))) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You don't have permission to access this page.</AlertDescription>
            </Alert>
        );
    }

    if (status === "loading") {
        return (
            <div className="max-w-3xl mx-auto space-y-4 p-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    if (status === "failed" || !ticket) {
        return (
            <div className="max-w-3xl mx-auto p-4">
                <DyraneButton variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets
                </DyraneButton>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Ticket</AlertTitle>
                    <AlertDescription>{error || "Could not load the support ticket details."}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="mx-auto">
            <PageHeader
                heading="Ticket Management"
                subheading="View and manage all support tickets"
            />

            <DyraneCard className="mb-6">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <CardTitle className="text-xl">{ticket.title}</CardTitle>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={getStatusVariant(ticket.status)} className="capitalize">
                                {ticket.status.replace("_", " ")}
                            </Badge>
                            <span className={cn("text-xs font-medium uppercase tracking-wide", getPriorityStyles(ticket.priority))}>
                                {ticket.priority}
                            </span>
                        </div>
                    </div>
                    <CardDescription className="text-xs pt-1">
                        Opened by {ticket.user?.name || ticket.user?.id} on {safeFormatDetailedDate(ticket.createdAt)}
                        {" • "} Last updated: {safeFormatDetailedDate(ticket.updatedAt)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{ticket.description}</p>
                    <div className="mt-6 pt-6 border-t">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Label htmlFor="status-select" className="mr-2 text-sm">
                                    Status:
                                </Label>
                                <Select value={ticket.status}
                                    onValueChange={(value) => handleStatusChange(value as TicketStatus)}
                                >
                                    <SelectTrigger id="status-select" className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <DyraneButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusChange("resolved")}
                                    className="text-green-600"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark Resolved
                                </DyraneButton>
                                <DyraneButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusChange("closed")}
                                    className="text-red-600"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Close Ticket
                                </DyraneButton>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </DyraneCard>

            <h2 className="text-xl font-semibold mb-4">Conversation History</h2>

            <div className="space-y-4 mb-6">
                {ticket.responses && ticket.responses.length > 0 ? (
                    ticket.responses.map((response: TicketResponse) => (
                        <div key={response.id} className="flex gap-3">
                            <Avatar
                                className={cn("h-8 w-8 border", {
                                    "border-primary": response.responder?.role === "admin" || response.responder?.role === 'super_admin',
                                    "border-blue-500": response.responder?.role === "teacher",
                                    "border-green-500": response.responder?.role === "student",
                                })}
                            >
                                <AvatarFallback className="text-primary font-medium">
                                    {response.responder?.name?.charAt(0) || "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div
                                className={cn("flex-1 p-3 rounded-md border", {
                                    "bg-primary/10 border-primary/20": response.responder?.role === "admin" || response.responder?role === 'super_admin',
                                    "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800":
                                        response.responder?.role === "teacher",
                                    "bg-muted/60": response.responder?.role === "student",
                                })}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-semibold flex items-center gap-1">
                                        {response.responder?.name || "Unknown"}
                                        <Badge variant="outline" className="ml-2 text-xs capitalize">
                                            {response.responder?.role}
                                        </Badge>
                                    </span>
                                    <span className="text-xs text-muted-foreground">{safeFormatDetailedDate(response.createdAt)}</span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground italic">No responses yet.</p>
                )}
            </div>

            <form onSubmit={handleAddResponse} className="space-y-3 border-t pt-6">
                <Label htmlFor="replyMessage" className="font-semibold">
                    Add Admin Response
                </Label>
                <Textarea
                    id="replyMessage"
                    placeholder="Type your response here..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[100px]"
                    required
                    disabled={isSendingReply}
                />
                <div className="flex justify-end">
                    <DyraneButton type="submit" disabled={!replyContent.trim() || isSendingReply}>
                        {isSendingReply && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Response
                    </DyraneButton>
                </div>
                {responseStatus === "failed" && error && <p className="text-xs text-destructive mt-1">{error}</p>}
            </form>
        </div>
    );
}