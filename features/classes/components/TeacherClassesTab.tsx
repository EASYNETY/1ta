// features/classes/components/TeacherClassesTab.tsx
"use client";

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import Link from 'next/link';
import { BookOpen, AlertTriangle, Users } from 'lucide-react';
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card'; // Use Card for list view
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Use Card for list view
import { fetchMyTaughtClasses } from '../store/classes-thunks';
import { selectClassesError, selectClassesStatus, selectMyClasses } from '../store/classes-slice';

const TeacherClassesTab: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const myClasses = useAppSelector(selectMyClasses);
    const status = useAppSelector(selectClassesStatus);
    const error = useAppSelector(selectClassesError);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchMyTaughtClasses(user.id));
        }
    }, [dispatch, user?.id]);

    const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

    if (status === 'loading') {
        return (
            <div className="space-y-4">
                <Skeleton className="h-[80px] w-full rounded-lg" />
                <Skeleton className="h-[80px] w-full rounded-lg" />
                <Skeleton className="h-[80px] w-full rounded-lg" />
            </div>
        );
    }

    if (status === 'failed') {
        return (<Alert variant="destructive">...</Alert>); // Error handling
    }

    return (
        myClasses.length > 0 ? (
            <motion.div
                className="space-y-4"
                initial="hidden" animate="show"
                variants={{ show: { transition: { staggerChildren: 0.1 } } }} // Container for stagger
            >
                {myClasses.map((course) => (
                    <motion.div key={course.id} variants={itemVariants}>
                        <DyraneCard className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-muted rounded flex-shrink-0 overflow-hidden hidden sm:block">
                                        <img src={course.image || '/placeholder.svg'} alt={course.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-md">{course.title}</h3>
                                        <p className="text-sm text-muted-foreground">{course.category} • {course.level}</p>
                                        {/* Add student count if available */}
                                        {/* <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3"/> {course.studentCount || 'N/A'} Students</p> */}
                                    </div>
                                </div>
                                <DyraneButton variant="outline" size="sm" asChild>
                                    {/* TODO: Link to teacher-specific class management page */}
                                    <Link href={`/teacher/classes/${course.id}/manage`}>Manage</Link>
                                </DyraneButton>
                            </CardContent>
                        </DyraneCard>
                    </motion.div>
                ))}
            </motion.div>
        ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Classes Assigned</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                    You are not currently assigned to teach any classes. Contact administration if this seems incorrect.
                </p>
            </div>
        )
    );
};

export default TeacherClassesTab;