// app/(authenticated)/manage-schedule/[eventId]/page.tsx
"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    fetchScheduleEventById,
    selectCurrentScheduleEvent,
    selectScheduleStatus,
    clearCurrentScheduleEvent
} from '@/features/schedule/store/schedule-slice';
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription, DyraneCardFooter } from '@/components/dyrane-ui/dyrane-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, Info, MapPin, Users, Video, BookOpen, Briefcase, UserCircle, Mail, Image as ImageIcon } from 'lucide-react'; // Added more icons
import { format, isValid, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { ScheduleEvent, ScheduleEventType } from '@/features/schedule/types/schedule-types'; // Ensure this type reflects snake_case
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // For instructor avatar
import { Card } from '@/components/ui/card';

// Helpers
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate) ? format(parsedDate, "PPPP") : 'Invalid Date'; // e.g., Tuesday, July 16th, 2024
};

const formatTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate) ? format(parsedDate, "p") : 'Invalid Time'; // e.g., 1:00 PM
};

const getEventTypeBadgeVariant = (type?: ScheduleEventType) => {
    switch (type) {
        case 'lecture': return 'default';
        case 'lab': return 'secondary';
        case 'exam': return 'destructive';
        case 'office-hours': return 'outline';
        case 'meeting': return 'default'; // Or another color
        case 'other': return 'secondary';
        default: return 'secondary';
    }
};

const EventTypeBadge = ({ type }: { type?: ScheduleEventType }) => {
    if (!type) return null;
    return (
        <Badge variant={getEventTypeBadgeVariant(type)} className="capitalize text-xs px-2 py-0.5">
            {type.replace('-', ' ')}
        </Badge>
    );
};

// Component to render detail items cleanly
const DetailItem = ({ icon: Icon, label, value, isLink, href, children }: {
    icon: React.ElementType,
    label: string,
    value?: string | null,
    isLink?: boolean,
    href?: string,
    children?: React.ReactNode
}) => {
    if (!value && !children) return null;

    return (
        <div className="flex items-start gap-3 border-b pb-3 last:border-b-0 last:pb-0">
            <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
                <p className="text-sm font-medium">{label}</p>
                {children ? (
                    <div className="text-sm text-muted-foreground">{children}</div>
                ) : isLink && href && value ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                        {value}
                    </a>
                ) : (
                    <p className="text-sm text-muted-foreground break-words">{value || "N/A"}</p>
                )}
            </div>
        </div>
    );
};


export default function ViewScheduleEventPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const eventId = params.eventId as string;

    // currentEvent will be ScheduleEvent type (snake_case from backend)
    const currentEvent = useAppSelector(selectCurrentScheduleEvent);
    const status = useAppSelector(selectScheduleStatus);

    useEffect(() => {
        if (eventId) {
            dispatch(fetchScheduleEventById(eventId));
        }
        return () => { dispatch(clearCurrentScheduleEvent()); }
    }, [dispatch, eventId]);

    const isLoading = status === 'loading' && !currentEvent; // Show loading only if no event data yet

    // Prefer denormalized names, fallback to nested object names
    const courseDisplayName = currentEvent?.course_title || currentEvent?.course_name || currentEvent?.course?.name;
    const classDisplayName = currentEvent?.class_name || currentEvent?.class?.name;
    const instructorDisplayName = currentEvent?.instructor_name || currentEvent?.instructorUser?.name || currentEvent?.instructor;

    return (
        <AuthorizationGuard allowedRoles={['super_admin', 'admin', 'teacher']}> {/* Adjusted roles */}
            <div className="mx-auto max-w-3xl"> {/* Added max-width for better readability */}
                <DyraneButton variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Schedule
                </DyraneButton>

                {isLoading && (
                    <DyraneCard>
                        <DyraneCardHeader>
                            <Skeleton className="h-8 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </DyraneCardHeader>
                        <DyraneCardContent className="space-y-6">
                            {[...Array(5)].map((_, i) => ( // Skeleton for 5 detail items
                                <div key={i} className="flex items-start gap-3 border-b pb-3">
                                    <Skeleton className="h-5 w-5 rounded-full mt-0.5 flex-shrink-0" />
                                    <div className="w-full">
                                        <Skeleton className="h-4 w-1/4 mb-1.5" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </DyraneCardContent>
                    </DyraneCard>
                )}

                {!isLoading && !currentEvent && status === 'succeeded' && (
                    <DyraneCard>
                        <DyraneCardContent className="py-10">
                            <p className='text-center text-lg text-muted-foreground'>Schedule event not found.</p>
                            <p className='text-center text-sm text-muted-foreground mt-2'>It might have been deleted or you may not have permission to view it.</p>
                        </DyraneCardContent>
                    </DyraneCard>
                )}

                {currentEvent && !isLoading && (
                    <Card>
                        <DyraneCardHeader>
                            <div className="flex justify-between items-start">
                                <DyraneCardTitle className="text-2xl font-semibold">
                                    {currentEvent.title}
                                </DyraneCardTitle>
                                <EventTypeBadge type={currentEvent.type} />
                            </div>
                            <DyraneCardDescription>Detailed information for this scheduled event.</DyraneCardDescription>
                        </DyraneCardHeader>
                        <DyraneCardContent className="space-y-5">
                            <DetailItem icon={CalendarDays} label="Date & Time">
                                {formatDate(currentEvent.start_time)}
                                <br />
                                {currentEvent.start_time_formatted && currentEvent.end_time_formatted ? (
                                    `${currentEvent.start_time_formatted} - ${currentEvent.end_time_formatted}`
                                ) : (
                                    `${formatTime(currentEvent.start_time)} - ${formatTime(currentEvent.end_time)}`
                                )}
                            </DetailItem>

                            <DetailItem icon={BookOpen} label="Course & Class">
                                {courseDisplayName ? (
                                    <Link href={`/courses/${currentEvent.course_slug || currentEvent.course_id}`} className="font-medium text-primary hover:underline">
                                        {courseDisplayName}
                                    </Link>
                                ) : (
                                    "N/A"
                                )}
                                {currentEvent.course?.description && <p className="text-xs mt-0.5"><em>{currentEvent.course.description}</em></p>}
                                <div className="mt-1 pt-1 border-t border-dashed">
                                    Class: {classDisplayName || `ID: ${currentEvent.class_id}` || "N/A"}
                                    {currentEvent.class?.description && <p className="text-xs mt-0.5"><em>{currentEvent.class.description}</em></p>}
                                </div>
                            </DetailItem>

                            {(instructorDisplayName || currentEvent.instructorUser?.email) && (
                                <DetailItem icon={UserCircle} label="Instructor">
                                    <div className="flex items-center gap-2">
                                        {currentEvent.instructorUser?.avatarUrl && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={currentEvent.instructorUser.avatarUrl} alt={instructorDisplayName || 'Instructor'} />
                                                <AvatarFallback>{instructorDisplayName?.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div>
                                            {instructorDisplayName || "N/A"}
                                            {currentEvent.instructorUser?.email && (
                                                <div className="text-xs flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {currentEvent.instructorUser.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DetailItem>
                            )}

                            <DetailItem icon={MapPin} label="Location" value={currentEvent.location} />
                            <DetailItem icon={Video} label="Meeting Link" value={currentEvent.meeting_link} isLink href={currentEvent.meeting_link || undefined} />

                            {currentEvent.description && (
                                <DetailItem icon={Info} label="Description">
                                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                                        {currentEvent.description}
                                    </div>
                                </DetailItem>
                            )}

                            {/* Example for attendees - adjust based on how you want to display them */}
                            {/* {currentEvent.attendees && currentEvent.attendees.length > 0 && (
                                <DetailItem icon={Users} label="Attendees">
                                    <p>{currentEvent.attendees.join(', ')} (IDs shown)</p>
                                     You'd likely fetch user details for these IDs to show names 
                                </DetailItem>
                            )} */}

                            <div className="pt-3 text-xs text-muted-foreground space-y-0.5">
                                <p>Event ID: {currentEvent.id}</p>
                                <p>Created: {formatDate(currentEvent.created_at)} at {formatTime(currentEvent.created_at)}</p>
                                <p>Last Updated: {formatDate(currentEvent.updated_at)} at {formatTime(currentEvent.updated_at)}</p>
                            </div>

                        </DyraneCardContent>
                        <DyraneCardFooter className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => router.push('/manage-schedule')}>Close</Button>
                            <Button asChild>
                                <Link href={`/manage-schedule/${eventId}/edit`}>Edit Event</Link>
                            </Button>
                        </DyraneCardFooter>
                    </Card>
                )}
            </div>
        </AuthorizationGuard>
    );
}