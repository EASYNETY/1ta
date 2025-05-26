// features/classes/components/StudentClassesTab.tsx
"use client";

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import Link from 'next/link';
import { BookOpen, AlertTriangle } from 'lucide-react';
import { CourseCard } from '@/components/dashboard/course-card'; // Reuse dashboard card
import { selectClassesError, selectClassesStatus, selectMyClasses } from '../store/classes-slice';
import { fetchMyEnrolledClasses } from '../store/classes-thunks';

const StudentClassesTab: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const myClasses = useAppSelector(selectMyClasses);
    const status = useAppSelector(selectClassesStatus);
    const error = useAppSelector(selectClassesError);

    useEffect(() => {
        if (user?.id) { // Fetch only if idle and user exists
            dispatch(fetchMyEnrolledClasses(user.id));
        }
    }, [dispatch, user?.id]);

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

    if (status === 'loading') {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[300px] w-full rounded-xl" />)}
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Classes</AlertTitle>
                <AlertDescription>{error || 'Could not load your enrolled classes.'}</AlertDescription>
            </Alert>
        );
    }

    return (
        myClasses.length > 0 ? (
            <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={container} initial="hidden" animate="show"
            >
                {myClasses.map((course, index) => (
                    <CourseCard key={course.id} course={course} index={index} />
                ))}
            </motion.div>
        ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Enrolled Courses</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                    You haven't enrolled in any courses yet. Explore the available courses to start learning.
                </p>
                <DyraneButton asChild>
                    <Link href="/courses">Browse Courses</Link>
                </DyraneButton>
            </div>
        )
    );
};

export default StudentClassesTab;