"use client"

import { useState, useEffect, useMemo } from "react"
import { PublicCourse } from "@/features/public-course/types/public-course-interface"
import { DyraneCard, DyraneCardContent, DyraneCardHeader, DyraneCardTitle, DyraneCardDescription } from "@/components/dyrane-ui/dyrane-card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PublicCourseCard } from "@/components/cards/PublicCourseCard"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { motion, AnimatePresence } from "framer-motion"
import { Search, GraduationCap, AlertCircle, ArrowRight, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

// Sample course data structure
interface CourseCategory {
  [category: string]: PublicCourse[]
}

// Sample course data in case API fails
const sampleCourses: PublicCourse[] = [
  {
    id: "1",
    slug: "introduction-to-web-development",
    title: "Introduction to Web Development",
    description: "Learn the basics of HTML, CSS, and JavaScript to build modern websites.",
    category: "Web Development",
    level: "Beginner",
    image: "/images/courses/web-dev.jpg",
    tags: ["HTML", "CSS", "JavaScript"],
    instructor: {
      name: "John Doe",
      title: "Senior Web Developer"
    },
    priceUSD: 49.99,
    rating: 4.7,
    studentsEnroled: 1250,
    lessonCount: 24,
    moduleCount: 6,
    totalVideoDuration: "12.5 hours",
    language: "English",
    certificate: true,
    accessType: "Lifetime",
    supportType: "Instructor"
  },
  {
    id: "2",
    slug: "python-programming-fundamentals",
    title: "Python Programming Fundamentals",
    description: "Master the basics of Python programming language and its applications.",
    category: "Programming",
    level: "Beginner",
    image: "/images/courses/python.jpg",
    tags: ["Python", "Programming", "Data Science"],
    instructor: {
      name: "Jane Smith",
      title: "Python Expert"
    },
    priceUSD: 59.99,
    rating: 4.8,
    studentsEnroled: 1850,
    lessonCount: 32,
    moduleCount: 8,
    totalVideoDuration: "15 hours",
    language: "English",
    certificate: true,
    accessType: "Lifetime",
    supportType: "Both"
  },
  {
    id: "3",
    slug: "advanced-react-development",
    title: "Advanced React Development",
    description: "Take your React skills to the next level with advanced patterns and techniques.",
    category: "Web Development",
    level: "Advanced",
    image: "/images/courses/react.jpg",
    tags: ["React", "JavaScript", "Frontend"],
    instructor: {
      name: "Alex Johnson",
      title: "Frontend Architect"
    },
    priceUSD: 79.99,
    rating: 4.9,
    studentsEnroled: 980,
    lessonCount: 40,
    moduleCount: 10,
    totalVideoDuration: "18 hours",
    language: "English",
    certificate: true,
    accessType: "Lifetime",
    supportType: "Instructor"
  },
  {
    id: "4",
    slug: "data-science-with-python",
    title: "Data Science with Python",
    description: "Learn how to analyze and visualize data using Python libraries like Pandas and Matplotlib.",
    category: "Data Science",
    level: "Intermediate",
    image: "/images/courses/data-science.jpg",
    tags: ["Python", "Data Science", "Machine Learning"],
    instructor: {
      name: "Sarah Williams",
      title: "Data Scientist"
    },
    priceUSD: 69.99,
    rating: 4.6,
    studentsEnroled: 1450,
    lessonCount: 36,
    moduleCount: 9,
    totalVideoDuration: "16.5 hours",
    language: "English",
    certificate: true,
    accessType: "Lifetime",
    supportType: "Community"
  }
]

export default function PublicCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all")
  const [levelFilter, setLevelFilter] = useState<string | "all">("all")
  const [selectedCourse, setSelectedCourse] = useState<PublicCourse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coursesByCategory, setCoursesByCategory] = useState<CourseCategory>({})
  const [courseCategories, setCourseCategories] = useState<string[]>([])

  // Fetch courses on component mount
  useEffect(() => {
    const fetchPublicCourses = async () => {
      try {
        setIsLoading(true)
        setError(null)

        let data: PublicCourse[] = []

        try {
          // Try to fetch from API
          const response = await fetch('/api/public/courses')

          if (response.ok) {
            data = await response.json()
          } else {
            // If API fails, use sample data
            console.log('Using sample course data')
            data = sampleCourses
          }
        } catch (fetchError) {
          // If fetch fails completely, use sample data
          console.log('API fetch failed, using sample course data')
          data = sampleCourses
        }

        // Process the data
        const categorizedCourses: CourseCategory = {}
        const categories = new Set<string>()

        // Organize courses by category
        data.forEach((course: PublicCourse) => {
          if (course.category) {
            categories.add(course.category)

            if (!categorizedCourses[course.category]) {
              categorizedCourses[course.category] = []
            }

            categorizedCourses[course.category].push(course)
          }
        })

        setCoursesByCategory(categorizedCourses)
        setCourseCategories(Array.from(categories))
        setIsLoading(false)
      } catch (err) {
        console.error('Error processing courses:', err)

        // Use sample data as fallback
        const categorizedCourses: CourseCategory = {}
        const categories = new Set<string>()

        sampleCourses.forEach(course => {
          if (course.category) {
            categories.add(course.category)

            if (!categorizedCourses[course.category]) {
              categorizedCourses[course.category] = []
            }

            categorizedCourses[course.category].push(course)
          }
        })

        setCoursesByCategory(categorizedCourses)
        setCourseCategories(Array.from(categories))
        setIsLoading(false)
      }
    }

    fetchPublicCourses()
  }, [])

  // Get all courses from all categories
  const allCourses = useMemo(() => {
    return Object.values(coursesByCategory).flat()
  }, [coursesByCategory])

  // Filter courses based on search query and filters
  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.tags && course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

      const matchesCategory = categoryFilter === "all" || course.category === categoryFilter
      const matchesLevel = levelFilter === "all" || course.level === levelFilter

      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [allCourses, searchQuery, categoryFilter, levelFilter])

  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setLevelFilter("all")
  }

  const handleViewCourse = (course: PublicCourse) => {
    setSelectedCourse(course)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="py-12">
        <div className="flex flex-col items-center mb-8">
          <GraduationCap className="h-10 w-10 text-primary mb-3" />
          <h1 className="text-3xl font-bold text-center">Explore Our Courses</h1>
          <p className="text-muted-foreground text-center mt-4 max-w-2xl">
            Browse through our comprehensive catalog of tech courses designed to help you advance your career.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-[300px] rounded-xl bg-muted/50 animate-pulse" />
            ))}
        </div>

        {/* Sign Up CTA */}
        <Card className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <CardTitle className="text-2xl font-bold mb-2">Ready to start learning?</CardTitle>
              <CardDescription className="text-base">
                Sign up to track your progress, earn certificates, and access exclusive content.
              </CardDescription>
            </div>
            <DyraneButton asChild size="lg" className="gap-2">
              <Link href="/signup">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </DyraneButton>
          </div>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="py-12">
        <div className="flex flex-col items-center mb-8">
          <GraduationCap className="h-10 w-10 text-primary mb-3" />
          <h1 className="text-3xl font-bold text-center">Explore Our Courses</h1>
          <p className="text-muted-foreground text-center mt-4 max-w-2xl">
            Browse through our comprehensive catalog of tech courses designed to help you advance your career.
          </p>
        </div>

        <Alert variant="destructive" className="mb-8 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "There was an error loading the courses. Please try again later."}
          </AlertDescription>
        </Alert>

        <div className="flex justify-center mb-12">
          <DyraneButton onClick={() => window.location.reload()} size="lg">
            Try Again
          </DyraneButton>
        </div>

        {/* Sign Up CTA */}
        <Card className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <CardTitle className="text-2xl font-bold mb-2">Ready to start learning?</CardTitle>
              <CardDescription className="text-base">
                Sign up to track your progress, earn certificates, and access exclusive content.
              </CardDescription>
            </div>
            <DyraneButton asChild size="lg" className="gap-2">
              <Link href="/signup">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </DyraneButton>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="flex flex-col items-center mb-8">
        <GraduationCap className="h-10 w-10 text-primary mb-3" />
        <h1 className="text-3xl font-bold text-center">Explore Our Courses</h1>
        <p className="text-muted-foreground text-center mt-4 max-w-2xl">
          Browse through our comprehensive catalog of tech courses designed to help you advance your career.
          Sign up to track your progress and access exclusive content.
        </p>
      </div>

      {/* Tabs and Filters */}
      <div className="mb-8">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <TabsList className="mb-4 md:mb-0">
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
              <TabsTrigger value="new">Newly Added</TabsTrigger>
              <TabsTrigger value="certification">Certifications</TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 sm:w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {courseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Level" />
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
          </div>

          <TabsContent value="all" className="mt-0">
            {/* Course Grid */}
            {filteredCourses.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {filteredCourses.map((course, index) => (
                  <motion.div key={`${course.id}-${index}`} variants={itemVariants}>
                    <PublicCourseCard
                      course={course}
                      onClick={() => handleViewCourse(course)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <DyraneCard className="p-6 text-center">
                <DyraneCardHeader>
                  <DyraneCardTitle>No courses found</DyraneCardTitle>
                  <DyraneCardDescription>
                    Try adjusting your filters or search query.
                  </DyraneCardDescription>
                </DyraneCardHeader>
                <DyraneCardContent>
                  <DyraneButton onClick={clearFilters}>
                    Clear Filters
                  </DyraneButton>
                </DyraneCardContent>
              </DyraneCard>
            )}
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">Sign in to view our most popular courses.</p>
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-0">
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">Sign in to view our newest courses.</p>
            </div>
          </TabsContent>

          <TabsContent value="certification" className="mt-0">
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">Sign in to view our certification courses.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sign Up CTA */}
      <Card className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <CardTitle className="text-2xl font-bold mb-2">Ready to start learning?</CardTitle>
            <CardDescription className="text-base">
              Sign up to track your progress, earn certificates, and access exclusive content.
            </CardDescription>
          </div>
          <DyraneButton asChild size="lg" className="gap-2">
            <Link href="/signup">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </DyraneButton>
        </div>
      </Card>

      {/* Course Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogTitle>
            <VisuallyHidden>Course Detail</VisuallyHidden>
          </DialogTitle>
          <AnimatePresence mode="wait">
            {selectedCourse && (
              <motion.div
                key={selectedCourse.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PublicCourseCard
                  course={selectedCourse}
                  isModal={true}
                  onClose={handleCloseModal}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  )
}
