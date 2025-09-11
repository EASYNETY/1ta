// components/dashboard/assignments-tab.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react"; // Import React and useEffect
import { motion } from "framer-motion";
import { Card, CardDescription } from "@/components/ui/card";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { useAppSelector, useAppDispatch } from "@/store/hooks"; // Import Redux hooks
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileText, CheckCircle, Clock, AlertCircle, AlertTriangle, Settings } from 'lucide-react';
import Link from "next/link";
import { AdminGuard } from "@/components/auth/PermissionGuard";
import { format, parseISO, differenceInDays } from "date-fns"; // Use date-fns format
import { cn } from "@/lib/utils"; // Import cn
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Import Alert

// Import types and slice actions/selectors
import {
    fetchAssignments,
    selectAllAssignments, // For teacher/admin
    selectStudentAssignments, // For student
    selectAssignmentStatus,
    selectAssignmentError,
    clearAssignmentError // To clear errors on mount/change
} from "@/features/assignments/store/assignment-slice"; // Adjust path
import type {
    Assignment, // Base assignment type
    StudentAssignmentView,
    TeacherAssignmentView,
    SubmissionStatus
} from "@/features/assignments/types/assignment-types"; // Adjust path
import { Button } from "../ui/button";
import { File } from "phosphor-react";

// Combined type for easier handling in the component
type AssignmentView = StudentAssignmentView | TeacherAssignmentView;

// --- Helper Functions (Keep or move to utils) ---
const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    try {
        const date = parseISO(dateString); // Use parseISO for ISO strings
        return format(date, "MMM d, yyyy 'at' h:mm a"); // Example format
    } catch { return "Invalid Date"; }
};

const isDueSoon = (dateString?: string | null): boolean => {
    if (!dateString) return false;
    try {
        const dueDate = parseISO(dateString);
        const now = new Date();
        // Only consider due soon if it's actually in the future
        if (dueDate < now) return false;
        const diffDays = differenceInDays(dueDate, now);
        return diffDays <= 3; // Due within 3 days (or less)
    } catch { return false; }
};

const getStatusBadge = (status?: SubmissionStatus | 'due_soon' | 'overdue' | 'archived' | 'draft' | 'published') => {
    // Combine student display status and assignment status handling
    switch (status) {
        // Student Submission Statuses / Display Statuses
        case "pending":
        case "due_soon": // Treat due_soon like pending for display
            return <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-200"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
        case "submitted":
            return <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-200"><CheckCircle className="mr-1 h-3 w-3" />Submitted</Badge>;
        case "graded":
            return <Badge variant="outline" className="border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/50 dark:text-green-100"><CheckCircle className="mr-1 h-3 w-3" />Graded</Badge>;
        case "late":
        case "overdue": // Treat overdue like late for display
            return <Badge variant="destructive" className="border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/50 dark:text-red-100"><AlertCircle className="mr-1 h-3 w-3" />Late/Overdue</Badge>;

        // Assignment Statuses (for Teacher/Admin view if needed, though less common here)
        case "draft": return <Badge variant="secondary">Draft</Badge>;
        case "published": return <Badge variant="default">Published</Badge>; // Could use a specific color
        case "archived": return <Badge variant="outline">Archived</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>; // Fallback
    }
};

// Type guard to differentiate views
function isStudentView(a: AssignmentView): a is StudentAssignmentView {
    return 'submission' in a || 'displayStatus' in a;
}
function isTeacherView(a: AssignmentView): a is TeacherAssignmentView {
    return 'totalSubmissions' in a;
}
// --- End Helper Functions ---


export function AssignmentsTab() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [searchQuery, setSearchQuery] = useState("");
    // Filter state for student view (using SubmissionStatus type)
    const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'due_soon' | 'overdue' | null>(null);

    // --- Selectors ---
    // Select the correct list based on user role
    const assignmentsList = useAppSelector(
        user?.role === 'student' ? selectStudentAssignments : selectAllAssignments
    );
    const status = useAppSelector(selectAssignmentStatus);
    const error = useAppSelector(selectAssignmentError);
    // --- End Selectors ---

    // --- Fetch Data ---
    useEffect(() => {
        if (user?.id && user.role) {
            console.log(`AssignmentsTab: Fetching for role ${user.role}`);
            dispatch(clearAssignmentError()); // Clear previous errors
            dispatch(fetchAssignments({ role: user.role, userId: user.id /* Pass courseId if needed */ }));
        }
    }, [dispatch, user?.id, user?.role]); // Re-fetch if user changes
    // --- End Fetch Data ---

    // --- Filter Logic ---
    const filteredAssignments = useMemo(() => {
        // Start with the fetched list based on role
        const listToFilter = assignmentsList as AssignmentView[]; // Cast for unified handling

        return listToFilter.filter(assignment => {
            // Search Query Filter (Title or Course Title)
            const lowerSearch = searchQuery.toLowerCase();
            const matchesSearch =
                assignment.title.toLowerCase().includes(lowerSearch) ||
                (assignment.courseTitle && assignment.courseTitle.toLowerCase().includes(lowerSearch));

            // Status Filter (Only applies to student view for now)
            let matchesStatus = true;
            if (user?.role === 'student' && statusFilter && isStudentView(assignment)) {
                matchesStatus = assignment.displayStatus === statusFilter;
            }
            // Can add teacher-side status filters later if needed (e.g., filter by assignment.status)

            return matchesSearch && matchesStatus;
        });
    }, [assignmentsList, searchQuery, statusFilter, user?.role]);
    // --- End Filter Logic ---


    if (!user) return null; // Should be handled by parent/layout, but safety check

    // --- Loading State ---
    if (status === 'loading') {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full max-w-sm" /> {/* Filters skeleton */}
                <Skeleton className="h-[100px] w-full rounded-lg" />
                <Skeleton className="h-[100px] w-full rounded-lg" />
                <Skeleton className="h-[100px] w-full rounded-lg" />
            </div>
        );
    }

    // --- Error State ---
    if (status === 'failed') {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Assignments</AlertTitle>
                <AlertDescription>{error || 'Could not load assignments. Please try again later.'}</AlertDescription>
                <Button 
                    variant="destructive" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                        if (user?.id && user.role) {
                            dispatch(clearAssignmentError());
                            dispatch(fetchAssignments({ role: user.role, userId: user.id }));
                        }
                    }}
                >
                    Retry
                </Button>
            </Alert>
        );
    }
    
    // If no assignments are available, show a message
    if (assignmentsList.length === 0 && status === 'succeeded') {
        return (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>
                        {user.role === "student" ? "My Assignments" : "Class Assignments"}
                    </CardTitle>
                    <CardDescription>View upcoming and past assignments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-6 text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium">No Assignments Available</h3>
                        <p className="text-muted-foreground mt-2">
                            {user.role === "student" 
                                ? "You don't have any assignments yet. Check back later." 
                                : "No assignments have been created yet."}
                        </p>
                        {(user.role === "admin" || user.role === "super_admin" || user.role === "teacher") && (
                            <DyraneButton asChild className="mt-4">
                                <Link href="/assignments/create">
                                    Create Assignment
                                </Link>
                            </DyraneButton>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // --- Main Render ---
    return (
        <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search assignments..."
                        className="pl-8 h-9" // Adjusted height
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Status Filters (Student Only) */}
                {user.role === "student" && (
                    <div className="flex gap-1.5 flex-wrap"> {/* Use flex-wrap */}
                        {([null, "pending", "submitted", "graded", "late", "overdue"] as const).map((filterStatus) => (
                            <DyraneButton
                                key={filterStatus ?? 'all'}
                                variant={statusFilter === filterStatus ? "default" : "outline"}
                                size="sm"
                                className="text-xs h-8 px-2.5" // Smaller buttons
                                onClick={() => setStatusFilter(filterStatus)}
                            >
                                {/* Display logic for null='All', handle 'late/overdue' label */}
                                {filterStatus === null ? 'All' : filterStatus === 'late' ? 'Late/Overdue' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                            </DyraneButton>
                        ))}
                    </div>
                )}

                {/* Create Button (Admin Only) */}
                <AdminGuard>
                    <DyraneButton asChild size="sm" className="flex-shrink-0">
                        <Link href="/assignments/create">
                            Create Assignment
                        </Link>
                    </DyraneButton>
                </AdminGuard>
            </div>

            {/* Assignment List Card */}
            <Card className="shadow-sm"> {/* Subtle shadow */}
                <CardHeader>
                    <CardHeader className="flex flex-row items-center justify-between"> {/* Use flex for title and button */}
                        <div>
                            <CardTitle>
                                {user.role === "student" ? "My Assignments" : "Class Assignments"}
                            </CardTitle>
                            <CardDescription>View upcoming and past assignments.</CardDescription> {/* Added description */}
                        </div>
                        {/* --- Add Manage/Create Button for Admin --- */}
                        <AdminGuard>
                            <DyraneButton asChild size="sm">
                                {/* Link to the main assignments management page */}
                                <Link href="/assignments">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Manage Assignments
                                </Link>
                            </DyraneButton>
                        </AdminGuard>
                        {/* --- Add Manage/Create Button for Teacher/Admin --- */}
                        {user.role === "student" && (
                            <DyraneButton asChild size="sm">
                                {/* Link to the main assignments management page */}
                                <Link href="/assignments">
                                    View Assignments
                                </Link>
                            </DyraneButton>
                        )}
                        {/* --- End Button --- */}
                    </CardHeader>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredAssignments.length > 0 ? (
                            filteredAssignments.map((assignment) => (
                                <motion.div
                                    key={assignment.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow bg-card/5 backdrop-blur-sm" // Use bg-card
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Left Side: Details */}
                                    <div className="flex items-start gap-3 flex-grow min-w-0"> {/* Ensure text truncates */}
                                        <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0 mt-1"> {/* Adjusted styles */}
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="min-w-0"> {/* Allow truncation */}
                                            <h3 className="font-semibold truncate">{assignment.title}</h3>
                                            <p className="text-sm text-muted-foreground truncate">{assignment.courseTitle}</p>
                                            {/* Details specific to role */}
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs">
                                                {isStudentView(assignment) ? (
                                                    <>
                                                        {getStatusBadge(assignment.displayStatus)}
                                                        <span className="text-muted-foreground">
                                                            {assignment.displayStatus === "pending" || assignment.displayStatus === "due_soon" ? (
                                                                <>Due: {formatDate(assignment.dueDate)} {isDueSoon(assignment.dueDate) && <span className="ml-1 text-destructive font-medium">(Due Soon!)</span>}</>
                                                            ) : assignment.displayStatus === "submitted" || assignment.displayStatus === "late" ? (
                                                                <>Submitted: {formatDate(assignment.submission?.submittedAt)}</>
                                                            ) : assignment.displayStatus === 'graded' && assignment.submission?.grade !== null && assignment.submission?.grade !== undefined ? (
                                                                <>Grade: {assignment.submission.grade}/{assignment.pointsPossible}</>
                                                            ) : assignment.displayStatus === 'overdue' ? (
                                                                <>Overdue: {formatDate(assignment.dueDate)}</>
                                                            ) : null}
                                                        </span>
                                                    </>
                                                ) : isTeacherView(assignment) ? (
                                                    <>
                                                        <Badge variant="outline"> {assignment.totalSubmissions} Submitted </Badge>
                                                        <Badge variant="outline"> {assignment.gradedSubmissions} Graded </Badge>
                                                        <span className="text-muted-foreground"> Due: {formatDate(assignment.dueDate)} </span>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Right Side: Action Button */}
                                    <div className="flex-shrink-0 self-end sm:self-center">
                                        <DyraneButton variant="outline" size="sm" asChild>
                                            <Link href={`/assignments/${assignment.id}`}>
                                                {user.role === "student"
                                                    ? (isStudentView(assignment) && (assignment.displayStatus === "pending" || assignment.displayStatus === "due_soon" || assignment.displayStatus === "overdue") ? "Submit/View" : "View Details")
                                                    : (isTeacherView(assignment) && assignment.gradedSubmissions < assignment.totalSubmissions ? "Grade/View" : "View Details")}
                                            </Link>
                                        </DyraneButton>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="mx-auto h-10 w-10 mb-3 text-muted-foreground/50" />
                                {searchQuery || statusFilter ? "No assignments match your filters." : "No assignments found."}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
