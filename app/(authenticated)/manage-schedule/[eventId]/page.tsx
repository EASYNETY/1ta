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
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    ArrowLeft, CalendarDays, Info, MapPin, Users, Video, BookOpen, UserCircle, Mail, Edit, XCircle, Tag, Clock, Briefcase  // Added Tag for Event ID, Clock for timestamps
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { ScheduleEvent, ScheduleEventType } from '@/features/schedule/types/schedule-types';
import { AuthorizationGuard } from '@/components/auth/AuthenticationGuard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Using standard shadcn Card
import { Separator } from '@/components/ui/separator'; // For visual separation
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { DyraneCardFooter } from '@/components/dyrane-ui/dyrane-card';
import { PageHeader } from '@/components/layout/auth/page-header';

// Helpers
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate) ? format(parsedDate, "EEEE, MMMM do, yyyy") : 'Invalid Date'; // Fuller date format
};

const formatTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate) ? format(parsedDate, "p") : 'Invalid Time'; // e.g., 1:00 PM
};

const getEventTypeBadgeVariant = (type?: ScheduleEventType) => {
    switch (type) {
        case 'lecture': return 'default'; // bg-primary text-primary-foreground
        case 'lab': return 'secondary';   // bg-secondary text-secondary-foreground
        case 'exam': return 'destructive';// bg-destructive text-destructive-foreground
        case 'office-hours': return 'outline'; // Bordered, transparent bg
        case 'meeting': return 'default'; // Consider 'info' or 'warning' if you add custom variants
        case 'other': return 'secondary';
        default: return 'secondary';
    }
};

const EventTypeBadge = ({ type }: { type?: ScheduleEventType }) => {
    if (!type) return null;
    return (
        <Badge variant={getEventTypeBadgeVariant(type)} className="capitalize text-xs ml-2 px-2.5 py-1">
            {type.replace('-', ' ')}
        </Badge>
    );
};

// Reusable component for displaying a section of details
const DetailSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-3">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
        <div className="space-y-4 pl-2">{children}</div>
    </div>
);

// Reusable component for individual detail items
const DetailEntry = ({ icon: Icon, label, value, href, children, iconClassName }: {
    icon: React.ElementType,
    label: string,
    value?: string | null,
    href?: string,
    children?: React.ReactNode,
    iconClassName?: string
}) => {
    if (!value && !children) return null;

    return (
        <div className="flex items-start space-x-3">
            <Icon className={`h-5 w-5 ${iconClassName || 'text-muted-foreground'} mt-0.5 flex-shrink-0`} />
            <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                {children ? (
                    <div className="text-sm text-muted-foreground">{children}</div>
                ) : href && value ? (
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

    const currentEvent = useAppSelector(selectCurrentScheduleEvent);
    const status = useAppSelector(selectScheduleStatus);

    useEffect(() => {
        if (eventId) {
            dispatch(fetchScheduleEventById(eventId));
        }
        return () => { dispatch(clearCurrentScheduleEvent()); }
    }, [dispatch, eventId]);

    const isLoading = status === 'loading' && !currentEvent;

    const courseDisplayName = currentEvent?.course_title || currentEvent?.course_name || currentEvent?.course?.name;
    const classDisplayName = currentEvent?.class_name || currentEvent?.class?.name;
    const instructorDisplayName = currentEvent?.instructor_name || currentEvent?.instructorUser?.name || currentEvent?.instructor;

    // Skeleton structure matching the new layout
    const renderSkeleton = () => (
        <Card className="shadow-lg">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-7 w-3/5" /> {/* Title */}
                    <Skeleton className="h-6 w-20" /> {/* Badge */}
                </div>
                <Skeleton className="h-4 w-4/5 mt-1" /> {/* Description */}
            </CardHeader>
            <CardContent className="pt-2 space-y-6">
                {/* Event Details Section Skeleton */}
                <div>
                    <Skeleton className="h-4 w-1/4 mb-3" /> {/* Section Title */}
                    <div className="space-y-4 pl-2">
                        <Skeleton className="h-10 w-full" /> {/* Date & Time */}
                        <Skeleton className="h-6 w-3/4" />   {/* Location */}
                        <Skeleton className="h-6 w-full" />  {/* Meeting Link */}
                    </div>
                </div>
                <Separator />
                {/* Course & Class Skeleton */}
                <div>
                    <Skeleton className="h-4 w-1/3 mb-3" /> {/* Section Title */}
                    <div className="space-y-4 pl-2">
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                <Separator />
                {/* Instructor Skeleton */}
                <div>
                    <Skeleton className="h-4 w-1/4 mb-3" /> {/* Section Title */}
                    <div className="space-y-4 pl-2">
                        <Skeleton className="h-10 w-3/4" />
                    </div>
                </div>
                <Separator />
                {/* Description Skeleton */}
                <div>
                    <Skeleton className="h-4 w-1/5 mb-3" /> {/* Section Title */}
                    <div className="space-y-2 pl-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-6">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
            </CardFooter>
        </Card>
    );

    return (
        <AuthorizationGuard allowedRoles={['super_admin', 'admin', 'teacher']}>
            <div className="py-8 px-4 sm:px-6 lg:px-8 font-sans"> {/* Using system font stack generally */}
                <PageHeader
                    actions={
                        <Button variant="default" size="sm" onClick={() => router.back()} className="">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Schedule
                        </Button>
                    }
                />

                {isLoading && renderSkeleton()}

                {!isLoading && !currentEvent && status === 'succeeded' && (
                    <Card className="shadow-lg">
                        <CardContent className="py-16 text-center">
                            <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                            <p className='text-xl font-semibold text-foreground'>Schedule Event Not Found</p>
                            <p className='text-sm text-muted-foreground mt-2'>
                                The event (ID: {eventId}) might have been deleted or you may not have permission to view it.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {currentEvent && !isLoading && (
                    <Card className="shadow-lg border-border/40"> {/* Subtle border */}
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                                    {currentEvent.title}
                                </CardTitle>
                                <EventTypeBadge type={currentEvent.type} />
                            </div>
                            {/* Optional: A subtitle or brief description if available and distinct from the main description */}
                            {/* <p className="text-sm text-muted-foreground mt-1">Key details for this scheduled event.</p> */}
                        </CardHeader>

                        <CardContent className="pt-2 space-y-6">
                            <DetailSection title="Event Details">
                                <DetailEntry icon={CalendarDays} label="Date & Time">
                                    {formatDate(currentEvent.start_time)}
                                    <span className="block text-lg font-medium text-foreground mt-0.5">
                                        {currentEvent.start_time_formatted && currentEvent.end_time_formatted ? (
                                            `${currentEvent.start_time_formatted.split(', ')[1]} - ${currentEvent.end_time_formatted.split(', ')[1]}` // Extract time if full date included
                                        ) : (
                                            `${formatTime(currentEvent.start_time)} - ${formatTime(currentEvent.end_time)}`
                                        )}
                                    </span>
                                </DetailEntry>
                                {currentEvent.location && <DetailEntry icon={MapPin} label="Location" value={currentEvent.location} />}
                                {currentEvent.meeting_link && <DetailEntry icon={Video} label="Meeting Link" value={currentEvent.meeting_link} href={currentEvent.meeting_link} />}
                            </DetailSection>

                            <Separator />

                            <DetailSection title="Course & Class Information">
                                <DetailEntry icon={BookOpen} label="Course">
                                    {courseDisplayName ? (
                                        <Link href={`/courses/${currentEvent.course_slug || currentEvent.course_id || 'error-no-id'}`} className="font-semibold text-primary hover:underline">
                                            {courseDisplayName}
                                        </Link>
                                    ) : (
                                        <span className="text-muted-foreground">N/A</span>
                                    )}
                                    {currentEvent.course?.description && <p className="text-xs mt-1 text-muted-foreground"><em>{currentEvent.course.description}</em></p>}
                                </DetailEntry>
                                <DetailEntry icon={Briefcase} label="Class Session"> {/* Changed icon for class */}
                                    {classDisplayName || `ID: ${currentEvent.class_id}` || "N/A"}
                                    {currentEvent.class?.description && <p className="text-xs mt-1 text-muted-foreground"><em>{currentEvent.class.description}</em></p>}
                                </DetailEntry>
                            </DetailSection>

                            {(instructorDisplayName || currentEvent.instructorUser?.email) && (
                                <>
                                    <Separator />
                                    <DetailSection title="Instructor Details">
                                        <DetailEntry icon={UserCircle} label="Instructor">
                                            <div className="flex items-center gap-3">
                                                {currentEvent.instructorUser?.avatarUrl && (
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={currentEvent.instructorUser.avatarUrl} alt={instructorDisplayName || 'Instructor'} />
                                                        <AvatarFallback>{instructorDisplayName?.charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div>
                                                    <span className="font-semibold">{instructorDisplayName || "N/A"}</span>
                                                    {currentEvent.instructorUser?.email && (
                                                        <a href={`mailto:${currentEvent.instructorUser.email}`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
                                                            <Mail className="h-3 w-3" /> {currentEvent.instructorUser.email}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </DetailEntry>
                                    </DetailSection>
                                </>
                            )}

                            {currentEvent.description && (
                                <>
                                    <Separator />
                                    <DetailSection title="Description">
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                                            {currentEvent.description}
                                        </div>
                                    </DetailSection>
                                </>
                            )}

                            {/* Attendees - Placeholder for future implementation */}
                            {/* {currentEvent.attendees && currentEvent.attendees.length > 0 && (
                                <>
                                    <Separator />
                                    <DetailSection title="Attendees">
                                        <DetailEntry icon={Users} label={`Registered (${currentEvent.attendees.length})`}>
                                            <p className="text-xs">Attendee details would go here.</p>
                                        </DetailEntry>
                                    </DetailSection>
                                </>
                            )} */}
                        </CardContent>

                        <DyraneCardFooter className="flex flex-col items-start gap-4 pt-6 mt-6 border-t w-full">
                            <div className="w-full text-xs text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2"> <Tag className="h-3.5 w-3.5" /> <span>Event ID: {currentEvent.id}</span></div>
                                <div className="flex items-center gap-2"> <Clock className="h-3.5 w-3.5" /> <span>Created: {formatDate(currentEvent.created_at)} at {formatTime(currentEvent.created_at)}</span></div>
                                <div className="flex items-center gap-2"> <Clock className="h-3.5 w-3.5" /> <span>Last Updated: {formatDate(currentEvent.updated_at)} at {formatTime(currentEvent.updated_at)}</span></div>
                            </div>
                            <div className='flex flex-row w-full justify-between'>
                                <Button variant="outline" onClick={() => router.push('/manage-schedule')}>Close</Button>
                                <Button asChild>
                                    <Link href={`/manage-schedule/${eventId}/edit`}>Edit Event</Link>
                                </Button>
                            </div>

                        </DyraneCardFooter>
                    </Card>
                )}
            </div>
        </AuthorizationGuard>
    );
}
