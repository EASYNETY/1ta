// features/grades/components/GradeForm.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
    createGradeItem,
    updateGradeItem,
    selectCurrentGradeItem,
    selectGradeOperationStatus,
    selectGradeError,
    resetGradeOperationStatus,
} from "../store/grade-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { GradeItemType, GradeScale, GradeStatus } from "../types/grade-types"

// Define the form schema with Zod
const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    courseId: z.string().min(1, "Course is required"),
    dueDate: z.date().optional(),
    pointsPossible: z.coerce.number().min(1, "Points must be at least 1").max(1000, "Points cannot exceed 1000"),
    weight: z.coerce.number().min(0, "Weight cannot be negative").max(1, "Weight cannot exceed 1 (100%)"),
    type: z.enum(["assignment", "quiz", "exam", "project", "participation", "other"] as const),
    status: z.enum(["published", "archived", 'pending'] as const),
    gradeScale: z.enum(["percentage", "letter", "points", "pass_fail"] as const),
})

type FormValues = z.infer<typeof formSchema>

interface GradeFormProps {
    isEditing?: boolean
    gradeItemId?: string
}

export default function GradeForm({ isEditing = false, gradeItemId }: GradeFormProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const currentGradeItem = useAppSelector(selectCurrentGradeItem)
    const operationStatus = useAppSelector(selectGradeOperationStatus)
    const error = useAppSelector(selectGradeError)
    const { user } = useAppSelector((state) => state.auth)
    const [courses, setCourses] = useState<{ id: string; title: string }[]>([
        { id: "1", title: "PMP® Certification Training" },
        { id: "webdev_101", title: "Web Development Bootcamp" },
        { id: "data_science", title: "Data Science Fundamentals" },
    ])

    // Initialize form with default values or current grade item data
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            courseId: "",
            dueDate: undefined,
            pointsPossible: 100,
            weight: 0.1,
            type: "assignment" as GradeItemType,
            status: "draft" as GradeStatus,
            gradeScale: "percentage" as GradeScale,
        },
    })

    // Populate form when editing an existing grade item
    useEffect(() => {
        if (isEditing && currentGradeItem) {
            form.reset({
                title: currentGradeItem.title,
                description: currentGradeItem.description || "",
                courseId: currentGradeItem.courseId,
                dueDate: currentGradeItem.dueDate ? new Date(currentGradeItem.dueDate) : undefined,
                pointsPossible: currentGradeItem.pointsPossible,
                weight: currentGradeItem.weight,
                type: currentGradeItem.type as GradeItemType,
                status: currentGradeItem.status as GradeStatus,
                gradeScale: currentGradeItem.gradeScale as GradeScale,
            })
        }
    }, [isEditing, currentGradeItem, form])

    // Reset operation status when component unmounts
    useEffect(() => {
        return () => {
            dispatch(resetGradeOperationStatus())
        }
    }, [dispatch])

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        if (!user?.id) return

        console.log("Grade form data before processing:", data);

        // Ensure we have a valid date object before converting to ISO string
        const dueDateISO = data.dueDate instanceof Date && !isNaN(data.dueDate.getTime())
            ? data.dueDate.toISOString()
            : null;

        console.log("Processed grade due date:", dueDateISO);

        if (isEditing && gradeItemId) {
            await dispatch(
                updateGradeItem({
                    gradeItemId,
                    gradeItem: {
                        ...data,
                        dueDate: dueDateISO,
                    },
                }),
            )
        } else {
            await dispatch(
                createGradeItem({
                    gradeItem: {
                        ...data,
                        dueDate: dueDateISO,
                        createdBy: user.id,
                    },
                }),
            )
        }

        if (operationStatus === "succeeded") {
            router.push("/grades")
        }
    }

    return (
        <Card className="w-full">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">{isEditing ? "Edit Grade Item" : "Create New Grade Item"}</h2>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter grade item title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter grade item description" className="min-h-[120px]" {...field} />
                                        </FormControl>
                                        <FormDescription>Provide clear information about this grade item.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="courseId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a course" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {courses.map((course) => (
                                                        <SelectItem key={course.id} value={course.id}>
                                                            {course.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Due Date (Optional)</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                                                        >
                                                            {field.value ? format(field.value, "EEE, d MMM yyyy") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={(date) => {
                                                            console.log("Setting due date:", date);
                                                            if (date) {
                                                                // Create a new Date object to ensure we have all date components
                                                                const fullDate = new Date(date);
                                                                console.log("Full due date to be set:", fullDate);
                                                                field.onChange(fullDate);
                                                            } else {
                                                                field.onChange(undefined);
                                                            }
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>
                                                {field.value ? `Selected: ${field.value.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}` : "No date selected"}
                                            </FormDescription>
                                            <FormDescription>Leave empty if there is no specific due date.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="pointsPossible"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Points Possible</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} max={1000} placeholder="100" {...field} />
                                            </FormControl>
                                            <FormDescription>The maximum number of points a student can earn.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight in Course Grade</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={0} max={1} step={0.01} placeholder="0.1" {...field} />
                                            </FormControl>
                                            <FormDescription>Enter as decimal (e.g., 0.25 for 25% of final grade)</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="assignment">Assignment</SelectItem>
                                                    <SelectItem value="quiz">Quiz</SelectItem>
                                                    <SelectItem value="exam">Exam</SelectItem>
                                                    <SelectItem value="project">Project</SelectItem>
                                                    <SelectItem value="participation">Participation</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gradeScale"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Grade Scale</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select scale" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="percentage">Percentage</SelectItem>
                                                    <SelectItem value="letter">Letter Grade</SelectItem>
                                                    <SelectItem value="points">Points Only</SelectItem>
                                                    <SelectItem value="pass_fail">Pass/Fail</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="published">Published</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                    <SelectItem value="pending">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Only published items are visible to students.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => router.push("/grades")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={operationStatus === "loading"} className="min-w-[120px]">
                                {operationStatus === "loading" ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isEditing ? "Updating..." : "Creating..."}
                                    </>
                                ) : isEditing ? (
                                    "Update Grade Item"
                                ) : (
                                    "Create Grade Item"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
