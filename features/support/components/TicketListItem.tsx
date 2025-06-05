// features/support/components/TicketListItem.tsx
import React from 'react';
import Link from 'next/link';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNowStrict } from 'date-fns';
import { parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { SupportTicket, TicketStatus, TicketPriority } from '../types/support-types';
import { Tag, MessageSquare, Clock } from 'lucide-react'; // Icons
import { useAppSelector } from '@/store/hooks';
import { hasAdminAccess, isAdmin, isCustomerCare } from '@/types/user.types';

interface TicketListItemProps {
    ticket: SupportTicket;
}

export const getStatusVariant = (status: TicketStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
        case 'open': return 'default'; // Primary/Blue
        case 'in_progress': return 'secondary'; // Yellow/Orange
        case 'resolved': return 'outline'; // Greenish (using outline for contrast)
        case 'closed': return 'outline'; // Gray
        default: return 'secondary';
    }
};

export const getPriorityStyles = (priority: TicketPriority): string => {
    switch (priority) {
        case 'urgent': return 'text-red-600 dark:text-red-400 font-semibold';
        case 'high': return 'text-orange-600 dark:text-orange-400 font-medium';
        case 'medium': return 'text-yellow-600 dark:text-yellow-400';
        case 'low': return 'text-blue-600 dark:text-blue-400';
        default: return '';
    }
}

export const TicketListItem: React.FC<TicketListItemProps> = ({ ticket }) => {
    const { user } = useAppSelector(state => state.auth);

    const formatTimeAgo = (dateString?: string) => {
        if (!dateString) return '';
        try {
            return formatDistanceToNowStrict(parseISO(dateString), { addSuffix: true });
        } catch {
            return 'Invalid date';
        }
    };

    // Determine the link based on user role
    const ticketLink = user && (hasAdminAccess(user) || isCustomerCare(user))
        ? `/admin/tickets/${ticket.id}`
        : `/support/tickets/${ticket.id}`;

    return (
        <DyraneCard className="hover:shadow-md transition-shadow duration-150">
            <Link href={ticketLink} className="block">
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getStatusVariant(ticket.status)} className="capitalize text-xs h-5 px-1.5">{ticket.status.replace('_', ' ')}</Badge>
                            <p className={cn("text-xs font-medium uppercase tracking-wide", getPriorityStyles(ticket.priority))}>
                                {ticket.priority}
                            </p>
                        </div>
                        <h3 className="font-semibold truncate text-md">{ticket.subject}</h3>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">{ticket.description}</p>
                    </div>
                    <div className="flex flex-col sm:items-end text-xs text-muted-foreground flex-shrink-0 gap-1 sm:gap-0 pt-2 sm:pt-0 border-t sm:border-none">
                        <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> Ticket #{ticket.id.split('_')[1] || ticket.id}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Updated {formatTimeAgo(ticket.updatedAt)}</span>
                        {/* Optionally show response count */}
                        {/* <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3"/> {ticket.responses?.length || 0} Responses</span> */}
                    </div>
                </CardContent>
            </Link>
        </DyraneCard>
    );
};