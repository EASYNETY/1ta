// app/(authenticated)/manage-schedule/[eventId]/page.tsx
"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchScheduleEventById, selectCurrentScheduleEvent, selectScheduleStatus, clearCurrentScheduleEvent } from '@/features/schedule/store/schedule-slice'; // Adjust path
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription, DyraneCardFooter } from '@/components/dyrane-ui/dyrane-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, Info, MapPin, Users, Video, BookOpen } from 'lucide-react'; // Add relevant icons
import { format, isValid, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge'; // For event type
import type { ScheduleEvent, ScheduleEventType } from '@/features/schedule/types/schedule-types';
import { User } from 'phosphor-react';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';

// Helpers
const formatDate = (dateString?: string) => dateString && isValid(parseISO(dateString)) ? format(parseISO(dateString), "PPPP") : 'N/A'; // e.g., Tuesday, July 16th, 2024
const formatTime = (dateString?: string) => dateString && isValid(parseISO(dateString)) ? format(parseISO(dateString), "h:mm a") : 'N/A';

const getEventTypeBadge = (type?: ScheduleEventType) => {
    if (!type) return null;
    // ... (copy badge logic from row component or import from utils) ...
    return <Badge variant="secondary" className="capitalize">{type}</Badge>
};


export default function ViewScheduleEventPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const eventId = params.eventId as string;

    const currentEvent = useAppSelector(selectCurrentScheduleEvent);
    const status = useAppSelector(selectScheduleStatus);

    useEffect(() => {
        if (eventId) {
            dispatch(fetchScheduleEventById(eventId));
        }
        return () => { dispatch(clearCurrentScheduleEvent()); } // Clear on unmount
    }, [dispatch, eventId]);

    const isLoading = status === 'loading';

    return (
        <AuthorizationGuard allowedRoles={['admin']}> {/* Adjust roles */}
            <div className="mx-auto">
                <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manage Schedule
                </Button>

                {isLoading && (
                    <DyraneCard>
                        <DyraneCardHeader><Skeleton className="h-8 w-3/4" /></DyraneCardHeader>
                        <DyraneCardContent className="space-y-4"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-16 w-full" /></DyraneCardContent>
                    </DyraneCard>
                )}

                {!isLoading && !currentEvent && status === 'succeeded' && (
                    <p className='text-center text-muted-foreground mt-10'>Schedule event not found.</p>
                )}

                {currentEvent && !isLoading && (
                    <DyraneCard>
                        <DyraneCardHeader>
                            <DyraneCardTitle className="flex items-center gap-2">
                                {currentEvent.title} {getEventTypeBadge(currentEvent.type)}
                            </DyraneCardTitle>
                            <DyraneCardDescription>Details for this scheduled event.</DyraneCardDescription>
                        </DyraneCardHeader>
                        <DyraneCardContent className="space-y-4">
                            <div className="flex items-start gap-3 border-b pb-3">
                                <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium">Date & Time</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(currentEvent.startTime)}<br />
                                        {formatTime(currentEvent.startTime)} - {formatTime(currentEvent.endTime)}
                                    </p>
                                </div>
                            </div>
                            {currentEvent.courseTitle && (
                                <div className="flex items-start gap-3 border-b pb-3">
                                    <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Course</p>
                                        <p className="text-sm text-muted-foreground hover:underline">
                                            <Link href={`/courses/${currentEvent.courseSlug || currentEvent.courseId}`}>
                                                {currentEvent.courseTitle}
                                            </Link>
                                            {currentEvent.classId && <span className="ml-2 text-xs">(Class: {currentEvent.classId})</span>}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {currentEvent.instructor && (
                                <div className="flex items-start gap-3 border-b pb-3">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Instructor</p>
                                        <p className="text-sm text-muted-foreground">{currentEvent.instructor}</p>
                                    </div>
                                </div>
                            )}
                            {currentEvent.location && (
                                <div className="flex items-start gap-3 border-b pb-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Location</p>
                                        <p className="text-sm text-muted-foreground">{currentEvent.location}</p>
                                    </div>
                                </div>
                            )}
                            {currentEvent.meetingLink && (
                                <div className="flex items-start gap-3 border-b pb-3">
                                    <Video className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Meeting Link</p>
                                        <a href={currentEvent.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                                            {currentEvent.meetingLink}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {currentEvent.description && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Description</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentEvent.description}</p>
                                </div>
                            )}
                            {/* TODO: Display Attendees list if needed */}

                        </DyraneCardContent>
                        <DyraneCardFooter className="flex justify-end">
                            <Button asChild>
                                <Link href={`/manage-schedule/${eventId}/edit`}>Edit Event</Link>
                            </Button>
                        </DyraneCardFooter>
                    </DyraneCard>
                )}
            </div>
        </AuthorizationGuard>
    );
}