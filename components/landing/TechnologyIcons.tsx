"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Types
export interface CourseListing {
  id: string
  name: string
  description?: string
  category: "current" | "future"
  isIsoCertification?: boolean
  waitlistCount: number
  imageUrl?: string
  iconUrl?: string
  tags?: string[]
  gradientColors?: {
    from: string
    to: string
  }
}

// API endpoint for course listings
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/publiclistings`
  : "http://34.249.241.206:5000/api/publiclistings"

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.4
    }
  },
  hover: {
    scale: 1.15,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { scale: 0.95 }
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.3
    }
  }
}

export function TechnologyIcons() {
  const [courses, setCourses] = useState<CourseListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<CourseListing | null>(null)

  // Fetch course data from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(API_ENDPOINT)

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (data.success && Array.isArray(data.data)) {
          // Set courses directly - we'll handle sorting in the grouping logic
          setCourses(data.data)
        } else {
          throw new Error('Invalid API response format')
        }
      } catch (err) {
        console.error('Error fetching courses:', err)
        setFetchError(err instanceof Error ? err.message : 'Failed to fetch courses')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleIconClick = (course: CourseListing) => {
    setSelectedCourse(course)
    // Lock body scroll when modal is open
    document.body.style.overflow = "hidden"
  }

  const handleCloseModal = () => {
    setSelectedCourse(null)
    // Restore body scroll when modal is closed
    document.body.style.overflow = "auto"
  }

  // Group courses by category
  const currentCourses = courses.filter(course => course.category === "current" && !course.isIsoCertification)

  // Combine future courses and ISO certifications, with ISO certifications sorted in the specified order
  const futureCourses = [
    ...courses.filter(course => course.category === "future" && !course.isIsoCertification),
    ...courses.filter(course => course.isIsoCertification).sort((a, b) => {
      // Sort ISO certifications in the specified order
      const isoOrder = {
        "ISO 9001": 1,
        "ISO 27001": 2,
        "ISO 20000": 3
      }

      // Extract ISO number from name
      const aIsoNumber = a.name.match(/ISO\s+(\d+)/)?.[0] || ""
      const bIsoNumber = b.name.match(/ISO\s+(\d+)/)?.[0] || ""

      return (isoOrder[aIsoNumber as keyof typeof isoOrder] || 999) -
             (isoOrder[bIsoNumber as keyof typeof isoOrder] || 999)
    })
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading technologies: {fetchError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Current Technologies */}
      {currentCourses.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-6">Current Courses</h3>
          <motion.div
            className="flex flex-wrap gap-8 justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {currentCourses.map((course) => (
              <TechnologyIcon
                key={course.id}
                course={course}
                onClick={() => handleIconClick(course)}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Future Technologies */}
      {futureCourses.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-6">Future Courses & ISO Certifications</h3>
          <motion.div
            className="flex flex-wrap gap-8 justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {futureCourses.map((course) => (
              <TechnologyIcon
                key={course.id}
                course={course}
                onClick={() => handleIconClick(course)}
              />
            ))}
          </motion.div>
        </div>
      )}



      {/* Course Details Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 relative shrink-0">
                      {selectedCourse.iconUrl ? (
                        <Image
                          src={selectedCourse.iconUrl}
                          alt={selectedCourse.name}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold">{selectedCourse.name}</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Course Overview */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Course Overview</h3>
                    <p className="text-muted-foreground">
                      {selectedCourse.description || "No overview available for this course."}
                    </p>
                  </div>

                  {/* Prerequisites */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Prerequisites</h3>
                    <p className="text-muted-foreground">
                      {selectedCourse.tags && selectedCourse.tags.length > 0
                        ? `Knowledge of ${selectedCourse.tags.join(", ")} is recommended.`
                        : "No specific prerequisites required."}
                    </p>
                  </div>

                  {/* Curriculum */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Curriculum</h3>
                    <p className="text-muted-foreground">
                      Detailed curriculum will be available upon course launch.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface TechnologyIconProps {
  course: CourseListing
  onClick: () => void
}

function TechnologyIcon({ course, onClick }: TechnologyIconProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="w-20 h-20 relative cursor-pointer bg-card/50 rounded-xl p-3 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={onClick}
          >
            {course.iconUrl ? (
              <Image
                src={course.iconUrl}
                alt={course.name}
                fill
                className="object-contain p-2"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 rounded-md flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{course.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
