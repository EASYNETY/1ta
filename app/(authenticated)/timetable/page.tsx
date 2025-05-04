// app/(authenticated)/timetable/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link'; // Import Link
import { Settings } from 'lucide-react'; // Icon for manage button

// Import Tab Content Components
import ScheduleView from '@/features/schedule/components/ScheduleView';
import StudentClassesTab from '@/features/classes/components/StudentClassesTab';
import TeacherClassesTab from '@/features/classes/components/TeacherClassesTab';
import AdminClassesTab from '@/features/classes/components/AdminClassesTab';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button'; // Import DyraneButton

export default function TimetablePage() {
    const { user } = useAppSelector((state) => state.auth);
    // Default to 'schedule', let useEffect handle role-specific default if needed
    const [activeTab, setActiveTab] = useState<string>("schedule");

    // Function to determine default tab based on role - prevents flicker
    const getDefaultTab = (role: string | undefined): string => {
        switch (role) {
            // Define default tabs for each role if 'schedule' isn't always the default
            case 'admin': return 'schedule'; // Or 'all-classes' if preferred
            case 'teacher': return 'schedule'; // Or 'my-classes-teacher'
            case 'student': return 'schedule'; // Or 'my-classes-student'
            default: return 'schedule';
        }
    };

    // Set initial active tab based on user role once user data is loaded
    useEffect(() => {
        if (user) {
            setActiveTab(getDefaultTab(user.role));
        }
    }, [user]); // Only run when user data changes


    // Determine tabs based on role
    const getRoleTabs = () => {
        if (!user) return null;

        const scheduleTab = <TabsTrigger key="schedule" value="schedule">Schedule</TabsTrigger>;
        let classesTab = null;

        switch (user.role) {
            case "admin":
                classesTab = <TabsTrigger key="all-classes" value="all-classes">All Classes</TabsTrigger>;
                break;
            case "teacher":
                classesTab = <TabsTrigger key="my-classes-teacher" value="my-classes-teacher">My Classes</TabsTrigger>;
                break;
            case "student":
                classesTab = <TabsTrigger key="my-classes-student" value="my-classes-student">My Classes</TabsTrigger>;
                break;
        }

        return [scheduleTab, classesTab].filter(Boolean);
    };

    // Determine content based on role and active tab
    const renderTabContent = () => {
        if (!user) return <Skeleton className="h-[400px] w-full" />;

        // Derive tab value dynamically for classes based on role
        const myClassesTabValue = user.role === 'teacher' ? 'my-classes-teacher' : 'my-classes-student';

        switch (activeTab) {
            case "schedule":
                return <ScheduleView role={user.role} userId={user.id} />;
            case "all-classes":
                return user.role === 'admin' ? <AdminClassesTab /> : null; // Only admin sees this content
            case myClassesTabValue: // Handle dynamic tab value
                if (user.role === 'teacher') return <TeacherClassesTab />;
                if (user.role === 'student') return <StudentClassesTab />;
                return null; // Should not happen if tabs are generated correctly
            default:
                // Fallback to schedule if tab value is unexpected
                console.warn("Unexpected active tab:", activeTab);
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
        <div className="space-y-6"> {/* Reduced padding for page */}
            {/* Header with Manage Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 md:px-6">
                <h1 className="text-3xl font-bold">Timetable & Classes</h1>
                {/* Conditionally render Manage button for Admin */}
                {user.role === 'admin' && (
                    <DyraneButton size="sm" variant="outline" asChild>
                        <Link href="/manage-schedule">
                            <Settings className="mr-2 h-4 w-4" />
                            Manage Schedule
                        </Link>
                    </DyraneButton>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Adjust grid cols based on the number of tabs available */}
                <TabsList className={`mx-4 md:mx-6 mb-4 grid w-full ${getRoleTabs()?.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} md:max-w-[400px]`}>
                    {getRoleTabs()}
                </TabsList>

                {/* Render content directly */}
                <div className="px-4 md:px-6">
                    {renderTabContent()}
                </div>

            </Tabs>
        </div>
    );
}