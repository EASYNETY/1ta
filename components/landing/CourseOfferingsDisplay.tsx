"use client"

import type React from "react"
import { useState, useEffect } from "react" // Added useEffect for potential body scroll lock
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, ArrowRight, CheckCircle, X, Loader2, BookOpen } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion" // Import framer-motion

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

// API response interface
interface ApiResponse {
  success: boolean
  data: CourseListing[]
}

// Animation Variants
const sectionContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Stagger animation for sections
    },
  },
}

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger animation for cards in a grid
      delayChildren: 0.2, // Delay grid animation slightly after title
    },
  },
}

const cardItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3, delay: 0.3 } }, // Delay exit to allow modal to animate out
}

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.9, y: "5%" },
  visible: { opacity: 1, scale: 1, y: "0%", transition: { type: "spring", stiffness: 300, damping: 30, duration: 0.4 } },
  exit: { opacity: 0, scale: 0.9, y: "5%", transition: { duration: 0.3, ease: "easeIn" } },
}

export function CourseCards() {
  const [courses, setCourses] = useState<CourseListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<CourseListing | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch course data from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(API_ENDPOINT)

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data: ApiResponse = await response.json()

        if (data.success && Array.isArray(data.data)) {
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedCourse) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto" // Cleanup on component unmount
    }
  }, [selectedCourse])

  const handleCardClick = (course: CourseListing) => {
    setSelectedCourse(course)
    setShowEmailForm(false)
    setIsSuccess(false)
    setError(null)
  }

  const handleCloseDetails = () => {
    setSelectedCourse(null)
    // Reset states after a short delay to allow exit animation
    setTimeout(() => {
      setShowEmailForm(false)
      setEmail("")
      setIsSuccess(false)
      setError(null)
    }, 300) // Match modal exit animation duration
  }

  const handleJoinWaitlist = () => setShowEmailForm(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API
      setIsSuccess(true)
      setShowEmailForm(false)
    } catch (err) {
      setError("Failed to join waitlist. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentCourses = courses.filter((course) => course.category === "current")
  // Combine all future courses including ISO certifications
  const futureCourses = courses.filter((course) => course.category === "future" || course.isIsoCertification)

  const renderCourseSection = (title: string, courseList: CourseListing[]) => {
    if (courseList.length === 0) return null
    return (
      <motion.div className="mb-12" variants={sectionTitleVariants}> {/* Use sectionTitleVariants for the whole section block */}
        <motion.h2 className="text-3xl font-bold mb-6 text-foreground">
          {title}
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={gridVariants} // Apply gridVariants here for staggering cards
        >
          {courseList.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => handleCardClick(course)}
              isIso={course.isIsoCertification}
            />
          ))}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-background/5 text-foreground max-w-7xl mx-auto" // Centered content
      variants={sectionContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      ) : fetchError ? (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 my-8 text-center">
          <h3 className="text-xl font-semibold text-destructive mb-2">Error Loading Courses</h3>
          <p className="text-muted-foreground mb-4">{fetchError}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mx-auto"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {renderCourseSection("Current Enrolment", currentCourses)}
          {renderCourseSection("Future Courses", futureCourses)}
        </>
      )}

      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            key="modal-backdrop"
            className="fixed inset-0 bg-black/15 flex items-center justify-center p-4 z-50 backdrop-blur-xs"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleCloseDetails} // Close on backdrop click
          >
            <motion.div
              // This layoutId is key for the "rolling card" (morphing) effect
              layoutId={`card-container-${selectedCourse.id}`}
              className={`bg-gradient-to-br ${
                selectedCourse.gradientColors
                  ? `${selectedCourse.gradientColors.from} ${selectedCourse.gradientColors.to}`
                  : 'from-primary/20 to-primary/10'
              } bg-card/35 rounded-xl shadow-2xl backdrop-blur-sm max-w-lg w-full max-h-[90vh] overflow-y-auto`}
              variants={modalContentVariants} // Separate animation for content appearance within the morph
              // initial="hidden" // Handled by layout animation or AnimatePresence
              // animate="visible"
              // exit="exit"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              {/* Modal Content starts here, will be part of the layout animation */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <motion.div layoutId={`card-header-${selectedCourse.id}`} className="flex items-center">
                    <motion.div layoutId={`card-icon-${selectedCourse.id}`} className="w-12 h-12 relative mr-4 shrink-0">
                      {selectedCourse.iconUrl ? (
                        <Image
                          src={selectedCourse.iconUrl}
                          alt={selectedCourse.name}
                          fill
                          className="object-contain rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </motion.div>
                    <motion.h3 layoutId={`card-title-${selectedCourse.id}`} className="text-2xl font-bold text-foreground">
                      {selectedCourse.name}
                    </motion.h3>
                  </motion.div>
                  <Button variant="ghost" size="icon" onClick={handleCloseDetails} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <AnimatePresence mode="wait"> {/* For animating content changes within the modal */}
                  <motion.div
                    key={selectedCourse.id + "-details"} // Ensure key change for re-animation
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.3 } }} // Content fade in after morph
                    exit={{ opacity: 0 }}
                  >
                    {selectedCourse.imageUrl && (
                      <motion.div
                        layoutId={`card-image-${selectedCourse.id}`} // If card had a small image, this could morph
                        className="relative h-48 md:h-60 w-full mb-6 rounded-lg overflow-hidden shadow-lg"
                      >
                        <Image
                          src={selectedCourse.imageUrl}
                          alt={selectedCourse.name}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                    )}

                    <p className="text-muted-foreground mb-5 text-sm leading-relaxed">{selectedCourse.description}</p>

                    {selectedCourse.tags && selectedCourse.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {selectedCourse.tags.map((tag) => (
                          <motion.span
                            key={tag}
                            className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 + Math.random() * 0.2 } }}
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </div>
                    )}

                    {selectedCourse.category === "future" && (
                      <div className="flex items-center text-sm text-muted-foreground mb-6">
                        <Users className="w-4 h-4 mr-2 text-primary" />
                        <span className="font-semibold">{selectedCourse.waitlistCount}</span>
                        <span className="ml-1">people on waitlist</span>
                      </div>
                    )}

                    {/* Form / Enroll Button Area */}
                    <div className="mt-auto border-t border-border pt-5">
                      <AnimatePresence mode="wait">
                        {selectedCourse.category === "current" ? (
                          <motion.div key="enroll-button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Button className="w-full text-base py-3" size="lg" asChild onClick={handleCloseDetails}>
                              <Link href='/#courses' className="flex items-center justify-center">
                                Enroll Now <ArrowRight className="ml-2 w-5 h-5" />
                              </Link>
                            </Button>
                          </motion.div>
                        ) : isSuccess ? (
                          <motion.div
                            key="success-message"
                            className="bg-green-500/10 border border-green-500/30 rounded-md p-4 flex items-center text-green-600"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <CheckCircle className="w-6 h-6 mr-3 shrink-0" />
                            <span className="font-medium">Successfully joined the waitlist!</span>
                          </motion.div>
                        ) : showEmailForm ? (
                          <motion.form
                            key="email-form"
                            onSubmit={handleSubmit}
                            className="space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isSubmitting}
                              className="w-full text-base p-3"
                            />
                            {error && <p className="text-destructive text-sm flex items-center"><X className="w-3 h-3 mr-1" />{error}</p>}
                            <div className="flex gap-3">
                              <Button type="submit" disabled={isSubmitting} className="flex-1 text-base py-3" size="lg">
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Joining...
                                  </>
                                ) : (
                                  "Join Waitlist"
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowEmailForm(false)}
                                disabled={isSubmitting}
                                className="text-base py-3"
                                size="lg"
                              >
                                Cancel
                              </Button>
                            </div>
                          </motion.form>
                        ) : (
                          <motion.div key="join-button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Button onClick={handleJoinWaitlist} className="w-full text-base py-3" size="lg">
                              Join Waitlist <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface CourseCardProps {
  course: CourseListing
  onClick: () => void
  isIso?: boolean
}

function CourseCard({ course, onClick, isIso = false }: CourseCardProps) {
  // Generate gradient class based on course data or use default
  const gradientClass = course.gradientColors
    ? `${course.gradientColors.from} ${course.gradientColors.to}`
    : 'from-primary/20 to-primary/10';

  return (
    <motion.div
      // Key for the "rolling card" (morphing) effect. Matches layoutId in modal.
      layoutId={`card-container-${course.id}`}
      variants={cardItemVariants} // From grid's staggerChildren
      className={`border border-border-10 hover:border-primary/50 rounded-xl p-4 cursor-pointer hover:shadow-xl
        transition-shadow duration-300 flex flex-col bg-gradient-to-br ${gradientClass} bg-card/5 backdrop-blur-sm group`}
      onClick={onClick}
      whileHover={{ y: -5, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 15 } }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div layoutId={`card-header-${course.id}`} className="flex items-center mb-3">
        <motion.div layoutId={`card-icon-${course.id}`} className="w-10 h-10 relative mr-3 shrink-0">
          {course.iconUrl ? (
            <Image
              src={course.iconUrl}
              alt={course.name}
              fill
              className="object-contain rounded-sm"
              title={course.name} // Add tooltip on hover
            />
          ) : (
            <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
          )}
        </motion.div>
        <motion.h3 layoutId={`card-title-${course.id}`} className="font-semibold text-base text-foreground leading-tight">
          {course.name}
        </motion.h3>
      </motion.div>

      {/* Optional: A small placeholder for an image if you want it to morph */}
      <motion.div layoutId={`card-image-${course.id}`} className="h-0 w-0 opacity-0"></motion.div>


      {course.tags && course.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {course.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex justify-between items-center pt-2 border-t border-border/50">
        {course.category === "future" && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Users className="w-3 h-3 mr-1.5 text-primary" />
            <span className="font-medium">{course.waitlistCount}{' '} interested</span>
          </div>
        )}

        {course.category === "current" && (
          <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium">Enrolling Now</span>
        )}

        {isIso && course.category !== "current" && ( // Show ISO only if not also current
          <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-medium">ISO Cert</span>
        )}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1 rounded-full bg-primary/50 p-1">
          <ArrowRight className="w-4 h-4 text-muted-foreground " />
        </div>
      </div>
    </motion.div>
  )
}