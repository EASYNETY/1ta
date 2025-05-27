// app/(authenticated)/assignments/[assignmentId]/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchAssignmentById,
    fetchSubmissions,
    selectCurrentAssignment,
    selectCurrentSubmissions, // Keep if needed for teacher view, but SubmissionsList fetches its own
    selectAssignmentStatus,
    selectAssignmentError,
    clearAssignmentError, // Import clear error
    clearCurrentAssignment // Import clear current assignment
} from "@/features/assignments/store/assignment-slice";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage, // Use BreadcrumbPage for the current page
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator"; // Unused
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Clock, Edit, FileText, Home } from "lucide-react";
import Link from "next/link";
import { format, parseISO, isValid } from "date-fns"; // Keep date-fns
import SubmissionForm from "@/features/assignments/components/SubmissionForm"; // Corrected import path
import SubmissionsList from "@/features/assignments/components/SubmissionsList"; // Corrected import path
import type { StudentAssignmentView, TeacherAssignmentView } from "@/features/assignments/types/assignment-types";
import { ArrowLeft } from "phosphor-react";

// Helper: Format Date (handles potential invalid dates)
const formatDateDisplay = (dateString?: string | null, formatString = "MMMM d, yyyy 'at' h:mm a") => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, formatString) : 'Invalid Date';
    } catch { return 'Invalid Date'; }
};

// Helper: Status Badge (copied from tab, can be moved to utils)
const getStudentDisplayStatusBadge = (status?: StudentAssignmentView['displayStatus']) => {
    switch (status) {
        case "pending": case "due_soon": return <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-200"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
        case "submitted": return <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-200"><CheckCircle className="mr-1 h-3 w-3" />Submitted</Badge>;
        case "graded": return <Badge variant="outline" className="border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/50 dark:text-green-100"><CheckCircle className="mr-1 h-3 w-3" />Graded</Badge>;
        case "late": case "overdue": return <Badge variant="destructive" className="border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/50 dark:text-red-100"><AlertCircle className="mr-1 h-3 w-3" />Late/Overdue</Badge>;
        default: return <Badge variant="outline">Unknown</Badge>;
    }
};


export default function AssignmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const assignmentId = params.assignmentId as string;
    const { user, isInitialized } = useAppSelector((state) => state.auth); // Include isInitialized
    const currentAssignment = useAppSelector(selectCurrentAssignment);
    // Submissions are now fetched by SubmissionsList component if needed
    // const submissions = useAppSelector(selectCurrentSubmissions);
    const status = useAppSelector(selectAssignmentStatus); // Fetch status for assignment details
    const error = useAppSelector(selectAssignmentError);
    const [activeTab, setActiveTab] = useState("details");

    const justSubmitted = searchParams.get("submitted") === "true";
    const justGraded = searchParams.get("graded") === "true";

    // Fetch assignment details
    useEffect(() => {
        // Only fetch if ID and user context are available
        if (assignmentId && user?.id && user?.role && isInitialized) {
            dispatch(clearAssignmentError()); // Clear previous errors
            dispatch(clearCurrentAssignment()); // Clear previous assignment data
            dispatch(
                fetchAssignmentById({
                    assignmentId,
                    role: user.role, // Pass the user's role
                    userId: user.id, // Pass the user's ID
                }),
            );
            // Submissions are fetched within the SubmissionsList component now
        }
        // Cleanup on unmount
        return () => { dispatch(clearCurrentAssignment()); };
    }, [dispatch, assignmentId, user?.id, user?.role, isInitialized]); // Add isInitialized

    // Redirect to login if not authenticated AFTER initialization check
    useEffect(() => {
        if (isInitialized && !user) {
            router.push('/login');
        }
    }, [isInitialized, user, router]);

    // --- Derived State & Type Guards ---
    const isLoading = status === "loading";
    // const isFetchFailed = status === "failed"; // Unused

    // Safely determine views (check if currentAssignment exists first)
    const studentAssignment = useMemo(() => (
        currentAssignment && ('submission' in currentAssignment || 'displayStatus' in currentAssignment)
            ? currentAssignment as StudentAssignmentView
            : null
    ), [currentAssignment]);

    const teacherAssignment = useMemo(() => (
        currentAssignment && ('totalSubmissions' in currentAssignment)
            ? currentAssignment as TeacherAssignmentView
            : null
    ), [currentAssignment]);

    const canSubmit = useMemo(() => (
        !!studentAssignment && // Must be a student view
        (
            studentAssignment.displayStatus === "pending" ||
            studentAssignment.displayStatus === "due_soon" ||
            (studentAssignment.displayStatus === "overdue" && studentAssignment.allowLateSubmissions)
        )
    ), [studentAssignment]);
    // --- End Derived State & Type Guards ---


    // --- Loading State ---
    if (!isInitialized || (isLoading && !currentAssignment)) { // Show loading if not initialized OR loading initial data
        return (
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-3/4 max-w-lg" />
                    <Skeleton className="h-9 w-32" />
                </div>
                <Skeleton className="h-6 w-1/2 max-w-sm" />
                <Skeleton className="h-10 w-full max-w-md" /> {/* Tabs Skeleton */}
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        );
    }

    // --- Not Found/Error State (after loading attempt) ---
    if (!isLoading && !currentAssignment) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <Button variant="outline" size="sm" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error || "Assignment not found or could not be loaded."}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!currentAssignment) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                <Button variant="outline" size="sm" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Assignment not found.</AlertDescription>
                </Alert>
            </div>
        );
    }


    // --- Render Main Content (currentAssignment is guaranteed non-null here) ---
    const formattedDueDate = formatDateDisplay(currentAssignment.dueDate);

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard"><Home className="h-4 w-4" /></Link></BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink asChild><Link href="/assignments">Assignments</Link></BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    {/* Use BreadcrumbPage for the current non-link item */}
                    <BreadcrumbItem><BreadcrumbPage>{currentAssignment.title ?? 'Details'}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{currentAssignment.title ?? 'Assignment'}</h1>
                    <p className="text-muted-foreground">{currentAssignment.courseTitle || "Course not specified"}</p>
                </div>
                {/* Show Edit button only to teachers/admins/super_admins */}
                {(user?.role === "teacher" || user?.role === "admin" || user?.role === "super_admin") && (
                    <Button asChild size="sm">
                        <Link href={`/assignments/${assignmentId}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Assignment
                        </Link>
                    </Button>
                )}
            </div>

            {/* Success messages */}
            {justSubmitted && (<Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"> <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> <AlertTitle className="text-green-800 dark:text-green-300">Submission Successful</AlertTitle> <AlertDescription className="text-green-700 dark:text-green-400">Your work has been submitted.</AlertDescription> </Alert>)}
            {justGraded && (<Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"> <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> <AlertTitle className="text-green-800 dark:text-green-300">Grading Successful</AlertTitle> <AlertDescription className="text-green-700 dark:text-green-400">The submission was graded.</AlertDescription> </Alert>)}


            {/* Main content Tabs */}
            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="mb-4">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        {/* Show "My Submission" tab only if student AND there IS a submission */}
                        {studentAssignment?.submission && (
                            <TabsTrigger value="submission">My Submission</TabsTrigger>
                        )}
                        {/* Show "Submit" tab only if student CAN submit */}
                        {canSubmit && <TabsTrigger value="submit">Submit Work</TabsTrigger>}
                        {/* Show "Submissions" tab only for teacher/admin view */}
                        {teacherAssignment && (
                            <TabsTrigger value="submissions">Submissions ({teacherAssignment.totalSubmissions ?? 0})</TabsTrigger>
                        )}
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                {/* Details Tab Content */}
                <TabsContent value="details" className="mt-0">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between flex-wrap gap-2"> {/* Added flex-wrap */}
                                <CardTitle>Assignment Details</CardTitle>
                                <div className="flex items-center gap-2 flex-wrap"> {/* Added flex-wrap */}
                                    {/* Safely access displayStatus for badge */}
                                    {studentAssignment && getStudentDisplayStatusBadge(studentAssignment.displayStatus)}
                                    <Badge variant="outline">{currentAssignment.pointsPossible ?? 0} Points</Badge>
                                </div>
                            </div>
                            <CardDescription>
                                Due: {formattedDueDate}
                                {currentAssignment.allowLateSubmissions && (
                                    <span className="ml-2 text-xs text-muted-foreground">(Late submissions allowed)</span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Description */}
                            <div className="prose dark:prose-invert max-w-none text-sm">
                                {currentAssignment.description ? (
                                    <div className="whitespace-pre-wrap">{currentAssignment.description}</div>
                                ) : (
                                    <p className="italic text-muted-foreground">No description provided.</p>
                                )}
                            </div>

                            {/* Grade/Feedback Display (if student and graded) */}
                            {studentAssignment?.submission?.status === "graded" && (
                                <div className="mt-6 rounded-lg border p-4 bg-muted/30">
                                    <h3 className="text-lg font-semibold mb-2">Your Grade</h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Score: {studentAssignment.submission.grade ?? 'N/A'} / {currentAssignment.pointsPossible ?? 'N/A'}</span>
                                        {/* Calculate percentage safely */}
                                        {typeof studentAssignment.submission.grade === 'number' && typeof currentAssignment.pointsPossible === 'number' && currentAssignment.pointsPossible > 0 && (
                                            <span className={`font-medium ${(studentAssignment.submission.grade / currentAssignment.pointsPossible) * 100 >= 70 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                {Math.round((studentAssignment.submission.grade / currentAssignment.pointsPossible) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                    {studentAssignment.submission.feedback && (
                                        <div className="mt-4">
                                            <h4 className="font-medium mb-1 text-sm">Feedback:</h4>
                                            <p className="text-sm whitespace-pre-wrap">{studentAssignment.submission.feedback}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            {/* Footer content if needed */}
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* My Submission Tab Content */}
                {studentAssignment?.submission && (
                    <TabsContent value="submission" className="mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Submission</CardTitle>
                                <CardDescription>
                                    Submitted: {formatDateDisplay(studentAssignment.submission.submittedAt)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Display Submitted Files */}
                                {studentAssignment.submission.submissionFiles && studentAssignment.submission.submissionFiles.length > 0 ? (
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Submitted Files:</h3>
                                        <ul className="space-y-2">
                                            {studentAssignment.submission.submissionFiles.map((file, index) => (
                                                <li key={index} className="flex items-center rounded-md border p-2 text-sm">
                                                    <FileText className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                                                    <span className="flex-1 truncate mr-2">{file.name ?? 'file'}</span>
                                                    <Button variant="ghost" size="sm" asChild className="h-auto px-2 py-1 text-xs">
                                                        {/* Ensure file.url is present and valid */}
                                                        <a href={file.url ?? '#'} target="_blank" rel="noopener noreferrer" className={!file.url ? 'pointer-events-none opacity-50' : ''}>View</a>
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No files were submitted.</p>
                                )}


                                {/* Display Grade/Feedback if already graded */}
                                {studentAssignment.submission.status === 'graded' && (
                                    <div className="mt-4 rounded-lg border p-4 bg-muted/30">
                                        <h3 className="text-lg font-semibold mb-2">Grade & Feedback</h3>
                                        {/* ... (Grade/Feedback display from Details tab can be reused here) ... */}
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Submitted: {formatDateDisplay(studentAssignment.submission.submittedAt)}</span>
                                            <span>{studentAssignment.submission.status}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Score: {studentAssignment.submission.grade ?? 'N/A'} / {currentAssignment.pointsPossible ?? 'N/A'}</span>
                                            {/* ... Percentage calculation ... */}
                                            {typeof studentAssignment.submission.grade === 'number' && typeof currentAssignment.pointsPossible === 'number' && currentAssignment.pointsPossible > 0 && (
                                                <span className={`font-medium ${(studentAssignment.submission.grade / currentAssignment.pointsPossible) * 100 >= 70 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                    {Math.round((studentAssignment.submission.grade / currentAssignment.pointsPossible) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                        {studentAssignment.submission.feedback && (
                                            /* ... Feedback ... */
                                            <div className="mt-4">
                                                <h4 className="font-medium mb-1 text-sm">Feedback:</h4>
                                                <p className="text-sm whitespace-pre-wrap">{studentAssignment.submission.feedback}</p>
                                            </div>

                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* Teacher/Admin Submissions List Tab */}
                {teacherAssignment && (
                    <TabsContent value="submissions" className="mt-0">
                        {/* Pass the base assignment data to SubmissionsList */}
                        <SubmissionsList assignment={currentAssignment} />
                    </TabsContent>
                )}

                {/* Student Submission Form Tab */}
                {canSubmit && (
                    <TabsContent value="submit" className="mt-0">
                        {/* Pass assignmentId and existing submission (if any) */}
                        <SubmissionForm
                            assignment={studentAssignment as StudentAssignmentView}
                        />
                    </TabsContent>
                )}

            </Tabs>
        </div>
    );
}