// app/(authenticated)/timetable/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DyraneCard } from '@/components/dyrane-ui/dyrane-card'; // Optional card wrapper for tabs
import { CardContent } from '@/components/ui/card'; // Optional
import { Skeleton } from "@/components/ui/skeleton"; // For loading

// Import Tab Content Components 
import ScheduleView from '@/features/schedule/components/ScheduleView';
import StudentClassesTab from '@/features/classes/components/StudentClassesTab';
import TeacherClassesTab from '@/features/classes/components/TeacherClassesTab';
import AdminClassesTab from '@/features/classes/components/AdminClassesTab';

export default function TimetablePage() {
    const { user } = useAppSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState<string>("schedule"); // Default to schedule

    // Determine tabs based on role
    const getRoleTabs = () => {
        if (!user) return null;

        const scheduleTab = <TabsTrigger key="schedule" value="schedule">Schedule</TabsTrigger>;
        let classesTab = null;
        let classesTabValue = "";

        switch (user.role) {
            case "admin":
                classesTab = <TabsTrigger key="all-classes" value="all-classes">All Classes</TabsTrigger>;
                classesTabValue = "all-classes";
                break;
            case "teacher":
                classesTab = <TabsTrigger key="my-classes-teacher" value="my-classes-teacher">My Classes</TabsTrigger>;
                classesTabValue = "my-classes-teacher";
                break;
            case "student":
                classesTab = <TabsTrigger key="my-classes-student" value="my-classes-student">My Classes</TabsTrigger>;
                classesTabValue = "my-classes-student";
                break;
        }

        // Set default tab value based on role if needed, otherwise defaults to 'schedule'
        // if (!activeTab && classesTabValue) setActiveTab(classesTabValue); // Example logic

        return [scheduleTab, classesTab].filter(Boolean); // Filter out null if no classes tab for a role
    };

    // Determine content based on role and active tab
    const renderTabContent = () => {
        if (!user) return <Skeleton className="h-[400px] w-full" />; // Or an auth message

        switch (activeTab) {
            case "schedule":
                // Pass role and userId to ScheduleView for data fetching
                return <ScheduleView role={user.role} userId={user.id} />;

            case "all-classes":
                return user.role === 'admin' ? <AdminClassesTab /> : null;

            case "my-classes-teacher":
                return user.role === 'teacher' ? <TeacherClassesTab /> : null;

            case "my-classes-student":
                return user.role === 'student' ? <StudentClassesTab /> : null;

            default:
                // Fallback to schedule if tab value is unexpected
                return <ScheduleView role={user.role} userId={user.id} />;
        }
    };

    // Show loading skeleton if user data isn't available yet
    if (!user) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-full max-w-md" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }


    return (
        <div className="space-y-6 p-1"> {/* Reduced padding for page */}
            <h1 className="text-3xl font-bold px-4 md:px-6">Timetable & Classes</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mx-4 md:mx-6 mb-4 grid w-full grid-cols-2 md:max-w-[400px]"> {/* Adjust grid cols */}
                    {getRoleTabs()}
                </TabsList>

                {/* Render content directly without extra Card wrapper unless desired */}
                <div className="px-4 md:px-6">
                    {renderTabContent()}
                </div>

            </Tabs>
        </div>
    );
}