// app/(authenticated)/courses/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { fetchAuthCourses } from "@/features/auth-course/store/auth-course-slice"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Search, Plus, Filter, BookOpen, GraduationCap, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CourseCard } from "@/components/dashboard/course-card"
import { Badge } from "@/components/ui/badge"

export default function CoursesPage() {
  const { user } = useAppSelector((state) => state.auth)
  const { courses, categories, status } = useAppSelector((state) => state.auth_courses)
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all")
  const [levelFilter, setLevelFilter] = useState<string | "all">("all")
  const [activeTab, setActiveTab] = useState("all-courses")

  // Fetch courses on mount
  useEffect(() => {
    if (user) {
      dispatch(fetchAuthCourses())
    }
  }, [dispatch, user])

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Authentication Required</h2>
          <p className="text-muted-foreground mt-2">Please log in to access courses.</p>
          <DyraneButton asChild className="mt-4">
            <Link href="/login">Go to Login</Link>
          </DyraneButton>
        </div>
      </div>
    )
  }

  // Filter courses based on search query and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.tags && course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter
    const matchesLevel = levelFilter === "all" || course.level === levelFilter

    return matchesSearch && matchesCategory && matchesLevel
  })

  // Get role-specific tabs
  const getRoleTabs = () => {
    const commonTabs = <TabsTrigger value="all-courses">All Courses</TabsTrigger>

    switch (user.role) {
      case "admin":
        return (
          <>
            {commonTabs}
            <TabsTrigger value="manage-courses">Manage Courses</TabsTrigger>
            <TabsTrigger value="course-analytics">Analytics</TabsTrigger>
          </>
        )
      case "teacher":
        return (
          <>
            {commonTabs}
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="course-requests">Course Requests</TabsTrigger>
          </>
        )
      case "student":
      default:
        return (
          <>
            {commonTabs}
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </>
        )
    }
  }

  // Get role-specific actions
  const getRoleActions = () => {
    switch (user.role) {
      case "admin":
        return (
          <DyraneButton asChild>
            <Link href="/courses/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Link>
          </DyraneButton>
        )
      case "teacher":
        return (
          <DyraneButton asChild>
            <Link href="/courses/create">
              <Plus className="mr-2 h-4 w-4" />
              Request New Course
            </Link>
          </DyraneButton>
        )
      default:
        return null
    }
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Courses</h1>
        {getRoleActions()}
      </div>

      <Tabs defaultValue="all-courses" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 overflow-x-auto">{getRoleTabs()}</TabsList>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <span>Category</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <GraduationCap className="mr-2 h-4 w-4" />
                <span>Level</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="All Levels">All Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all-courses">
          {status === "loading" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-[300px] rounded-xl bg-muted animate-pulse" />
                ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <motion.div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </motion.div>
          ) : (
            <DyraneCard>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No courses found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  We couldn't find any courses matching your search criteria. Try adjusting your filters or search
                  query.
                </p>
                <DyraneButton
                  onClick={() => {
                    setSearchQuery("")
                    setCategoryFilter("all")
                    setLevelFilter("all")
                  }}
                >
                  Clear Filters
                </DyraneButton>
              </CardContent>
            </DyraneCard>
          )}
        </TabsContent>

        <TabsContent value="my-courses">
          {status === "loading" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-[300px] rounded-xl bg-muted animate-pulse" />
                ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <motion.div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </motion.div>
          ) : (
            <DyraneCard>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No enrolled courses</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you.
                </p>
                <DyraneButton asChild>
                  <Link href="/courses">Browse Courses</Link>
                </DyraneButton>
              </CardContent>
            </DyraneCard>
          )}
        </TabsContent>

        {user.role === "admin" && (
          <TabsContent value="manage-courses">
            <DyraneCard>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Course Management</h2>
                  <DyraneButton asChild>
                    <Link href="/courses/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Course
                    </Link>
                  </DyraneButton>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Course</th>
                        <th className="text-left py-3 px-4">Category</th>
                        <th className="text-left py-3 px-4">Instructor</th>
                        <th className="text-left py-3 px-4">Students</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map((course) => (
                        <tr key={course.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                                <img
                                  src={course.image || "/placeholder.svg?height=40&width=40"}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium">{course.title}</div>
                                <div className="text-xs text-muted-foreground">{course.level}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{course.category}</td>
                          <td className="py-3 px-4">{course.instructor.name}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{Math.floor(Math.random() * 100) + 10}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              Active
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <DyraneButton variant="outline" size="sm" asChild>
                                <Link href={`/courses/${course.slug}`}>View</Link>
                              </DyraneButton>
                              <DyraneButton variant="outline" size="sm" asChild>
                                <Link href={`/courses/${course.slug}/edit`}>Edit</Link>
                              </DyraneButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </DyraneCard>
          </TabsContent>
        )}

        {user.role === "teacher" && (
          <TabsContent value="course-requests">
            <DyraneCard>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Course Requests</h2>
                  <DyraneButton asChild>
                    <Link href="/courses/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Request New Course
                    </Link>
                  </DyraneButton>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Course Title</th>
                        <th className="text-left py-3 px-4">Category</th>
                        <th className="text-left py-3 px-4">Submitted</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-medium">Advanced React Patterns</div>
                        </td>
                        <td className="py-3 px-4">Web Development</td>
                        <td className="py-3 px-4">Dec 10, 2023</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            Pending Review
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <DyraneButton variant="outline" size="sm">
                            View Details
                          </DyraneButton>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-medium">Node.js Microservices</div>
                        </td>
                        <td className="py-3 px-4">Backend Development</td>
                        <td className="py-3 px-4">Nov 28, 2023</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            Approved
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <DyraneButton variant="outline" size="sm">
                            Start Creating
                          </DyraneButton>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </DyraneCard>
          </TabsContent>
        )}

        {/* Other tabs content would go here */}
      </Tabs>
    </div>
  )
}
