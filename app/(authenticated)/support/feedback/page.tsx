// app/(authenticated)/support/feedback/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, MessageSquare, Search, Star } from "lucide-react"
import {
    fetchAllFeedback,
    selectAllFeedback,
    selectSupportStatus,
    selectSupportError,
    clearSupportError,
} from "@/features/support/store/supportSlice"
import type { FeedbackRecord, FeedbackType } from "@/features/support/types/support-types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { hasAdminAccess, isCustomerCare } from "@/types/user.types"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { PageHeader } from "@/components/layout/auth/page-header"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function AdminFeedbackPage() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { user } = useAppSelector((state) => state.auth)
    const feedback = useAppSelector(selectAllFeedback)
    const status = useAppSelector(selectSupportStatus)
    const error = useAppSelector(selectSupportError)
    const isLoading = status === "loading"

    const [typeFilter, setTypeFilter] = useState<FeedbackType | "all">("all")
    const [searchQuery, setSearchQuery] = useState("")

    // Redirect non-admin users
    useEffect(() => {
        if (user && (!hasAdminAccess(user) && !isCustomerCare(user))) {
            router.push("/dashboard")
        }
    }, [user, router])

    useEffect(() => {
        if (user && (hasAdminAccess(user) || isCustomerCare(user))) {
            // Fetch all feedback for admin and super_admin
            dispatch(
                fetchAllFeedback({
                    type: typeFilter === "all" ? undefined : typeFilter,
                }),
            )
        }

        // Clear errors on mount
        dispatch(clearSupportError())
    }, [dispatch, user, typeFilter])

    // Ensure feedback is always an array to prevent filter errors
    const feedbackArray = feedback || []

    // Filter feedback by search query
    const filteredFeedback = feedbackArray.filter((item) => {
        if (!searchQuery) return true

        const query = searchQuery.toLowerCase()
        return (
            item.comment.toLowerCase().includes(query) ||
            item.studentName?.toLowerCase().includes(query) ||
            item.id.toLowerCase().includes(query)
        )
    })

    // Count feedback by type
    const feedbackCounts = {
        all: feedbackArray.length,
        general: feedbackArray.filter((f) => f.type === "general").length,
        bug_report: feedbackArray.filter((f) => f.type === "bug_report").length,
        feature_request: feedbackArray.filter((f) => f.type === "feature_request").length,
        course_feedback: feedbackArray.filter((f) => f.type === "course_feedback").length,
    }

    // Helper to render stars based on rating
    const renderStars = (rating: number) => {
        return Array(5)
            .fill(0)
            .map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
            ))
    }

    // Helper to get badge variant based on feedback status
    const getFeedbackStatusVariant = (status: string) => {
        switch (status) {
            case "new":
                return "default"
            case "reviewed":
                return "secondary"
            case "actioned":
                return "outline"
            default:
                return "default"
        }
    }

    if (!user || (!hasAdminAccess(user) && !isCustomerCare(user))) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You don't have permission to access this page.</AlertDescription>
            </Alert>
        )
    }

    // Define tab items in an array for easier mapping
    const feedbackTabItems = [
        { value: "all" as const, label: "All", count: feedbackCounts.all },
        { value: "general" as const, label: "General", count: feedbackCounts.general },
        { value: "bug_report" as const, label: "Bugs", count: feedbackCounts.bug_report },
        { value: "feature_request" as const, label: "Features", count: feedbackCounts.feature_request },
        { value: "course_feedback" as const, label: "Courses", count: feedbackCounts.course_feedback },
    ];

    const handleValueChange = (value: string) => {
        setTypeFilter(value as FeedbackType | "all");
    };

    return (
        <div className="space-y-6">
            <PageHeader
                heading="Feedback Management"
                subheading="View and manage user feedback"
            />

            <div className="flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                {/* Apply the same pattern here */}
                <Tabs
                    value={typeFilter} // Make it controlled
                    className="w-full sm:max-w-2xl" // Constrain Tabs width on desktop
                    onValueChange={handleValueChange}
                >
                    <ScrollArea
                        className="w-full whitespace-nowrap" // Allow content to not wrap, enabling horizontal scroll
                    >
                        <TabsList
                            className={cn(
                                // --- Mobile First (Scrollable) ---
                                "inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground",
                                "gap-1", // Add a small gap between items for scrolling
                                // --- SM Breakpoint and Up (Grid) ---
                                "sm:grid sm:w-full sm:grid-cols-5 sm:justify-center sm:gap-2" // Override to grid, fill width, 5 cols, center items
                            )}
                        >
                            {/* Map over the defined tab items */}
                            {feedbackTabItems.map((item) => (
                                <TabsTrigger
                                    key={item.value} // Add key prop
                                    value={item.value}
                                    // On desktop, make triggers take equal width in the grid
                                    className="sm:flex-1"
                                >
                                    {item.label}
                                    <Badge variant="outline" className="ml-2 tabular-nums">
                                        {item.count}
                                    </Badge>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <ScrollBar orientation="horizontal" className="h-2 sm:hidden" /> {/* Show scrollbar only on mobile */}
                    </ScrollArea>
                </Tabs>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search feedback..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as FeedbackType | "all")}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Feedback</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="bug_report">Bug Reports</SelectItem>
                        <SelectItem value="feature_request">Feature Requests</SelectItem>
                        <SelectItem value="course_feedback">Course Feedback</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
            )}

            {status === "failed" && error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Feedback</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {status === "succeeded" && filteredFeedback.length === 0 && (
                <div className="text-center py-10 border rounded-lg bg-card">
                    <p className="text-muted-foreground">No feedback found matching your criteria.</p>
                </div>
            )}

            {status === "succeeded" && filteredFeedback.length > 0 && (
                <div className="space-y-4">
                    {filteredFeedback.map((item: FeedbackRecord, index: number) => (
                        <Card key={`${item.id}-${index}`} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex">{renderStars(item.rating)}</div>
                                            <Badge variant={getFeedbackStatusVariant(item.status)} className="capitalize">
                                                {item.status}
                                            </Badge>
                                            <Badge variant="outline" className="capitalize">
                                                {item.type.replace("_", " ")}
                                            </Badge>
                                        </div>

                                        <p className="text-sm whitespace-pre-wrap mb-2">{item.comment}</p>

                                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                                            <span>
                                                From: <strong>{item.studentName || item.studentId}</strong>
                                            </span>
                                            <span className="mx-2">•</span>
                                            <span>{format(parseISO(item.createdAt), "PPP")}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-row sm:flex-col gap-2 sm:w-32">
                                        <DyraneButton variant="outline" size="sm" className="w-full">
                                            Mark Reviewed
                                        </DyraneButton>
                                        <DyraneButton variant="outline" size="sm" className="w-full">
                                            Mark Actioned
                                        </DyraneButton>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
