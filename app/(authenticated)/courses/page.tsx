// app/(authenticated)/courses/page.tsx

"use client"

import { useState } from "react"
import { useAppSelector } from "@/store/hooks"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus, BookOpen } from "lucide-react"
import Link from "next/link"

export default function CoursesPage() {
  const { user } = useAppSelector((state) => state.auth)
  const [searchQuery, setSearchQuery] = useState("")

  // Mock courses data - would be fetched from API in a real implementation
  const mockCourses = [
    {
      id: "1",
      title: "Introduction to Mathematics",
      description: "Learn the fundamentals of mathematics including algebra, geometry, and calculus.",
      instructor: "Dr. Jane Smith",
      enrolled: true,
    },
    {
      id: "2",
      title: "Advanced Physics",
      description: "Explore the laws of physics and their applications in the real world.",
      instructor: "Prof. John Doe",
      enrolled: false,
    },
    {
      id: "3",
      title: "World History",
      description: "A comprehensive overview of major historical events and their impact on society.",
      instructor: "Dr. Robert Johnson",
      enrolled: true,
    },
    {
      id: "4",
      title: "Introduction to Computer Science",
      description: "Learn the basics of programming, algorithms, and data structures.",
      instructor: "Prof. Sarah Williams",
      enrolled: false,
    },
  ]

  const filteredCourses = mockCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Courses</h1>

        {(user?.role === "admin" || user?.role === "teacher") && (
          <DyraneButton asChild>
            <Link href="/courses/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Link>
          </DyraneButton>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCourses.map((course) => (
          <DyraneCard key={course.id}>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{course.description}</p>
              <p className="text-sm mt-2">Instructor: {course.instructor}</p>
            </CardContent>
            <CardFooter>
              {user?.role === "student" ? (
                course.enrolled ? (
                  <DyraneButton variant="outline" className="w-full">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Continue Learning
                  </DyraneButton>
                ) : (
                  <DyraneButton className="w-full">Enroll Now</DyraneButton>
                )
              ) : (
                <DyraneButton variant="outline" className="w-full" asChild>
                  <Link href={`/courses/${course.id}`}>View Details</Link>
                </DyraneButton>
              )}
            </CardFooter>
          </DyraneCard>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No courses found</h3>
          <p className="text-muted-foreground">Try adjusting your search query</p>
        </div>
      )}
    </div>
  )
}
