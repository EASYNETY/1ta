// app/(authenticated)/classes/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCurrentClass,
  selectClassesStatus,
  clearCurrentClass
} from '@/features/classes/store/classes-slice';
import { fetchClassById } from '@/features/classes/store/classes-thunks';
import {
  fetchAuthCourseBySlug
} from '@/features/auth-course/store/auth-course-slice';
import {
  fetchAssignments
} from '@/features/assignments/store/assignment-slice';
import {
  fetchGradeItems
} from '@/features/grades/store/grade-slice';
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription, DyraneCardFooter } from '@/components/dyrane-ui/dyrane-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CalendarDays, User, Info, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AdminClassView } from '@/features/classes/types/classes-types';
import { Users } from 'phosphor-react';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import { PageHeader } from '@/components/layout/auth/page-header';
import { ClassProgress } from '@/components/classes/ClassProgress';
import { ClassEnrollmentStatus } from '@/components/classes/ClassEnrollmentStatus';
import { ClassAssignmentLink } from '@/components/courses/ClassAssignmentLink';
import { ClassQuizLink } from '@/components/courses/ClassQuizLink';
import { ClassGradeLink } from '@/components/courses/ClassGradeLink';

// Helper to format date range or single date
const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, "PPP") : 'Invalid Date';
    } catch { return 'Invalid Date'; }
};

// Helper for Status Badge
const getStatusBadge = (status: AdminClassView['status']) => {
    switch (status) {
        case 'active': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="mr-1 h-3 w-3" />Active</Badge>;
        case 'upcoming': return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Upcoming</Badge>;
        case 'inactive': return <Badge variant="outline"><XCircle className="mr-1 h-3 w-3" />Inactive</Badge>;
        case 'archived': return <Badge variant="outline">Archived</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

export default function ViewClassPage() {
    const params = useParams();
    const dispatch = useAppDispatch();
    const classId = params.id as string;
    const [activeTab, setActiveTab] = useState('details');

    // Get class data from Redux store
    const currentClass = useAppSelector(selectCurrentClass);
    const status = useAppSelector(selectClassesStatus);

    // Fetch class data
    useEffect(() => {
        if (classId) {
            dispatch(fetchClassById(classId));
        }
        return () => { dispatch(clearCurrentClass()); } // Clear on unmount
    }, [dispatch, classId]);

    // Fetch course data when class data is available
    useEffect(() => {
        if (currentClass?.courseId) {
            // Fetch course data by course ID
            // Since we don't have courseSlug in AdminClassView, we'll use the course name as a fallback
            const courseName = currentClass.courseTitle?.toLowerCase().replace(/\s+/g, '-') || '';

            // Fetch course data
            dispatch(fetchAuthCourseBySlug(courseName));

            // Fetch assignments for this class
            dispatch(fetchAssignments({
                role: 'student',
                courseId: currentClass.courseId,
                classId: classId
            }));

            // Fetch grade items for this class
            dispatch(fetchGradeItems({
                role: 'student',
                courseId: currentClass.courseId,
                classId: classId
            }));
        }
    }, [dispatch, currentClass, classId]);

    // Get course data from Redux store based on course title
    const courseName = currentClass?.courseTitle?.toLowerCase().replace(/\s+/g, '-') || '';
    const course = useAppSelector(state =>
        state.auth_courses.courses.find(c => c.slug === courseName || c.title?.toLowerCase().replace(/\s+/g, '-') === courseName)
    );

    const isLoading = status === 'loading';
    const isAdmin = true; // TODO: Replace with actual role check

    return (
        <div className="mx-auto">
            <PageHeader
                heading={`Class Details`}
                subheading={`Explore the details of ${currentClass?.courseTitle}`}
            />

            {isLoading && (
                <DyraneCard>
                    <DyraneCardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                    </DyraneCardHeader>
                    <DyraneCardContent className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-6 w-1/3" />
                    </DyraneCardContent>
                </DyraneCard>
            )}

            {!isLoading && !currentClass && status === 'succeeded' && (
                <p className='text-center text-muted-foreground mt-10'>Class not found.</p>
            )}

            {currentClass && !isLoading && (
                <div className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="progress">Progress</TabsTrigger>
                            <TabsTrigger value="assignments">Assignments</TabsTrigger>
                            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                            <TabsTrigger value="grades">Grades</TabsTrigger>
                            <TabsTrigger value="resources">Resources</TabsTrigger>
                        </TabsList>

                        {/* Class Details Tab */}
                        <TabsContent value="details" className="space-y-6 mt-6">
                            <DyraneCard>
                                <DyraneCardHeader>
                                    <DyraneCardTitle>{currentClass.courseTitle}</DyraneCardTitle>
                                    <DyraneCardDescription>Details for this class session.</DyraneCardDescription>
                                </DyraneCardHeader>
                                <DyraneCardContent className="space-y-4">
                                    <div className="flex items-center gap-3 border-b pb-3">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Instructor</p>
                                            <p className="text-sm text-muted-foreground">{currentClass.teacherName || 'Not Assigned'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 border-b pb-3">
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Enrolled Students</p>
                                            <p className="text-sm text-muted-foreground">{currentClass.studentCount}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 border-b pb-3">
                                        <Info className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Status</p>
                                            {getStatusBadge(currentClass.status)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 border-b pb-3">
                                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Dates</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDateDisplay(currentClass.startDate)} - {formatDateDisplay(currentClass.endDate)}
                                            </p>
                                        </div>
                                    </div>
                                    {currentClass.location && (
                                        <div className="flex items-center gap-3 border-b pb-3">
                                            <MapPin className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Location</p>
                                                <p className="text-sm text-muted-foreground">{currentClass.location}</p>
                                            </div>
                                        </div>
                                    )}
                                    {currentClass.description && (
                                        <div>
                                            <p className="text-sm font-medium mb-1">Description</p>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentClass.description}</p>
                                        </div>
                                    )}
                                </DyraneCardContent>
                                <DyraneCardFooter className="flex justify-between">
                                    <DyraneButton variant="outline" asChild>
                                        <Link href="/timetable">View Schedule</Link>
                                    </DyraneButton>
                                    {isAdmin && (
                                        <Button asChild>
                                            <Link href={`/classes/${classId}/edit`}>Edit Class</Link>
                                        </Button>
                                    )}
                                </DyraneCardFooter>
                            </DyraneCard>

                            {/* Enrollment Status */}
                            {course && (
                                <ClassEnrollmentStatus
                                    classId={classId}
                                    courseId={course.id}
                                    courseTitle={course.title}
                                    courseImage={course.image}
                                    instructorName={currentClass.teacherName}
                                    maxSlots={currentClass.maxSlots}
                                    studentCount={currentClass.studentCount}
                                    startDate={currentClass.startDate}
                                    endDate={currentClass.endDate}
                                    schedule={typeof currentClass.schedule === 'object'
                                        ? `${currentClass.schedule.days?.join(', ') || ''} ${currentClass.schedule.time || ''}`.trim()
                                        : currentClass.schedule}
                                    location={currentClass.location}
                                    status={currentClass.status}
                                />
                            )}
                        </TabsContent>

                        {/* Progress Tracking Tab */}
                        <TabsContent value="progress" className="space-y-6 mt-6">
                            {course && (
                                <ClassProgress
                                    classId={classId}
                                    courseId={course.id}
                                    courseSlug={course.slug}
                                />
                            )}
                        </TabsContent>

                        {/* Assignments Tab */}
                        <TabsContent value="assignments" className="space-y-6 mt-6">
                            {course && (
                                <div className="space-y-6">
                                    <DyraneCard>
                                        <DyraneCardHeader>
                                            <DyraneCardTitle>Class Assignments</DyraneCardTitle>
                                            <DyraneCardDescription>
                                                View and manage assignments for this class
                                            </DyraneCardDescription>
                                        </DyraneCardHeader>
                                        <DyraneCardContent>
                                            <ClassAssignmentLink
                                                courseId={course.id}
                                                classId={classId}
                                            />
                                        </DyraneCardContent>
                                    </DyraneCard>
                                </div>
                            )}
                        </TabsContent>

                        {/* Quizzes Tab */}
                        <TabsContent value="quizzes" className="space-y-6 mt-6">
                            {course && (
                                <div className="space-y-6">
                                    <DyraneCard>
                                        <DyraneCardHeader>
                                            <DyraneCardTitle>Class Quizzes</DyraneCardTitle>
                                            <DyraneCardDescription>
                                                View and take quizzes for this class
                                            </DyraneCardDescription>
                                        </DyraneCardHeader>
                                        <DyraneCardContent>
                                            <ClassQuizLink
                                                courseSlug={course.slug}
                                                classId={classId}
                                            />
                                        </DyraneCardContent>
                                    </DyraneCard>
                                </div>
                            )}
                        </TabsContent>

                        {/* Grades Tab */}
                        <TabsContent value="grades" className="space-y-6 mt-6">
                            {course && (
                                <div className="space-y-6">
                                    <DyraneCard>
                                        <DyraneCardHeader>
                                            <DyraneCardTitle>Class Grades</DyraneCardTitle>
                                            <DyraneCardDescription>
                                                View your grades for this class
                                            </DyraneCardDescription>
                                        </DyraneCardHeader>
                                        <DyraneCardContent>
                                            <ClassGradeLink
                                                courseId={course.id}
                                                classId={classId}
                                            />
                                        </DyraneCardContent>
                                    </DyraneCard>
                                </div>
                            )}
                        </TabsContent>

                        {/* Resources Tab */}
                        <TabsContent value="resources" className="space-y-6 mt-6">
                            <DyraneCard>
                                <DyraneCardHeader>
                                    <DyraneCardTitle>Class Resources</DyraneCardTitle>
                                    <DyraneCardDescription>
                                        Additional materials and resources for this class
                                    </DyraneCardDescription>
                                </DyraneCardHeader>
                                <DyraneCardContent>
                                    <p className="text-muted-foreground text-center py-6">
                                        No resources available yet
                                    </p>
                                </DyraneCardContent>
                            </DyraneCard>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}