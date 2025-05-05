// features/assignments/components/AssignmentForm.tsx

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
  createAssignment,
  updateAssignment,
  selectCurrentAssignment,
  selectAssignmentOperationStatus,
  selectAssignmentError,
  resetAssignmentOperationStatus,
} from "../store/assignment-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  courseId: z.string().min(1, "Course is required"),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  pointsPossible: z.coerce.number().min(1, "Points must be at least 1").max(1000, "Points cannot exceed 1000"),
  status: z.enum(["draft", "published", "archived"]),
  allowLateSubmissions: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface AssignmentFormProps {
  isEditing?: boolean
  assignmentId?: string
}

export default function AssignmentForm({ isEditing = false, assignmentId }: AssignmentFormProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const currentAssignment = useAppSelector(selectCurrentAssignment)
  const operationStatus = useAppSelector(selectAssignmentOperationStatus)
  const error = useAppSelector(selectAssignmentError)
  const { user } = useAppSelector((state) => state.auth)
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([
    { id: "1", title: "PMP® Certification Training" },
    { id: "webdev_101", title: "Web Development Bootcamp" },
    { id: "data_science", title: "Data Science Fundamentals" },
  ])

  // Initialize form with default values or current assignment data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      courseId: "",
      dueDate: new Date(),
      pointsPossible: 100,
      status: "draft" as const,
      allowLateSubmissions: false,
    },
  })

  // Populate form when editing an existing assignment
  useEffect(() => {
    if (isEditing && currentAssignment) {
      form.reset({
        title: currentAssignment.title,
        description: currentAssignment.description || "",
        courseId: currentAssignment.courseId,
        dueDate: new Date(currentAssignment.dueDate),
        pointsPossible: currentAssignment.pointsPossible,
        status: currentAssignment.status as "draft" | "published" | "archived",
        allowLateSubmissions: currentAssignment.allowLateSubmissions,
      })
    }
  }, [isEditing, currentAssignment, form])

  // Reset operation status when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetAssignmentOperationStatus())
    }
  }, [dispatch])

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!user?.id) return

    if (isEditing && assignmentId) {
      await dispatch(
        updateAssignment({
          assignmentId,
          assignment: {
            ...data,
            dueDate: data.dueDate.toISOString(),
          },
        }),
      )
    } else {
      await dispatch(
        createAssignment({
          assignment: {
            ...data,
            dueDate: data.dueDate.toISOString(),
            createdBy: user.id,
          },
        }),
      )
    }

    if (operationStatus === "succeeded") {
      router.push("/assignments")
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{isEditing ? "Edit Assignment" : "Create New Assignment"}</h2>

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
                    <FormLabel>Assignment Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter assignment title" {...field} />
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
                      <Textarea
                        placeholder="Enter assignment instructions and details"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide clear instructions for students to complete the assignment.
                    </FormDescription>
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
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""
                                }`}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
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
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Only published assignments are visible to students.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="allowLateSubmissions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Late Submissions</FormLabel>
                      <FormDescription>Students can submit after the due date has passed.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/assignments")}>
                Cancel
              </Button>
              <Button type="submit" disabled={operationStatus === "loading"} className="min-w-[120px]">
                {operationStatus === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Update Assignment"
                ) : (
                  "Create Assignment"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
