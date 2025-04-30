// app/(authenticated)/courses/create/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { post } from "@/lib/api-client"
import { useAppSelector } from "@/store/hooks"
import { useToast } from "@/hooks/use-toast"

const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
})

type CourseFormValues = z.infer<typeof courseSchema>

export default function CreateCoursePage() {
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
  })

  // Redirect if not admin or teacher
  if (user && user.role !== "admin" && user.role !== "teacher") {
    router.push("/dashboard")
    return null
  }

  const onSubmit = async (data: CourseFormValues) => {
    try {
      setIsSubmitting(true)

      // Make API request to create course
      await post("/courses", data)

      toast({
        title: "Course created",
        description: "Your course has been created successfully",
      })

      router.push("/courses")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create course"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>

      <DyraneCard>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="create-course-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Mathematics"
                {...register("title")}
                aria-invalid={errors.title ? "true" : "false"}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the course..."
                rows={5}
                {...register("description")}
                aria-invalid={errors.description ? "true" : "false"}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <DyraneButton variant="outline" onClick={() => router.back()}>
            Cancel
          </DyraneButton>
          <DyraneButton type="submit" form="create-course-form" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Course"}
          </DyraneButton>
        </CardFooter>
      </DyraneCard>
    </div>
  )
}
