"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, BookOpen, Clock, Layers, PlayCircle, FileQuestion, 
  CheckCircle, Users, Database, Shield, Cpu, Code, 
  Server, Award, Briefcase, Rocket, Brain
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AbstractBackground } from "@/components/layout/abstract-background"

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

export interface PublicCourse {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  image: string;
  previewVideoUrl?: string;
  instructor: {
    name: string;
    title?: string;
  };
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  tags?: string[];
  priceUSD: number;
  discountPriceUSD?: number;
  learningOutcomes?: string[];
  prerequisites?: string[];
  modules?: {
    title: string;
    duration: string;
    lessons?: {
      title: string;
      duration: string;
      isPreview?: boolean;
    }[];
  }[];
  lessonCount: number;
  moduleCount: number;
  totalVideoDuration?: string | null;
  language?: string;
  certificate?: boolean;
  accessType?: "Lifetime" | "Limited";
  supportType?: "Instructor" | "Community" | "Both" | "None";
}

// API endpoints
const LISTINGS_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/publiclistings`
  : "http://34.249.241.206:5000/api/publiclistings"

const COURSES_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/public_courses`
  : "http://34.249.241.206:5000/api/public_courses"

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
    scale: 1.1,
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

const infoVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 25 
    }
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { 
      duration: 0.2 
    }
  }
}

// Map technology names to appropriate icons
const getTechnologyIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('data') || lowerName.includes('sql')) return Database;
  if (lowerName.includes('security') || lowerName.includes('cyber')) return Shield;
  if (lowerName.includes('ai') || lowerName.includes('machine')) return Brain;
  if (lowerName.includes('cloud') || lowerName.includes('aws') || lowerName.includes('azure')) return Server;
  if (lowerName.includes('web') || lowerName.includes('javascript') || lowerName.includes('react')) return Code;
  if (lowerName.includes('iso')) return Award;
  if (lowerName.includes('project') || lowerName.includes('pmp')) return Briefcase;
  if (lowerName.includes('devops')) return Rocket;
  
  // Default icon
  return Cpu;
};

export function EnhancedTechnologyIcons() {
  const [listings, setListings] = useState<CourseListing[]>([])
  const [publicCourses, setPublicCourses] = useState<PublicCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<CourseListing | null>(null)
  const [selectedPublicCourse, setSelectedPublicCourse] = useState<PublicCourse | null>(null)

  // Fetch course data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch listings
        const listingsResponse = await fetch(LISTINGS_ENDPOINT)
        if (!listingsResponse.ok) {
          throw new Error(`Listings API request failed with status ${listingsResponse.status}`)
        }
        const listingsData = await listingsResponse.json()
        
        // Fetch public courses
        const coursesResponse = await fetch(COURSES_ENDPOINT)
        if (!coursesResponse.ok) {
          throw new Error(`Courses API request failed with status ${coursesResponse.status}`)
        }
        const coursesData = await coursesResponse.json()
        
        if (listingsData.success && Array.isArray(listingsData.data)) {
          setListings(listingsData.data)
        } else {
          console.warn('Invalid listings API response format')
        }
        
        if (coursesData.success && Array.isArray(coursesData.data)) {
          setPublicCourses(coursesData.data)
        } else {
          console.warn('Invalid courses API response format')
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setFetchError(err instanceof Error ? err.message : 'Failed to fetch course data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleIconClick = (course: CourseListing) => {
    setSelectedCourse(course)
    
    // Find matching public course if available
    const matchingPublicCourse = publicCourses.find(pc => 
      pc.title.toLowerCase().includes(course.name.toLowerCase()) || 
      course.name.toLowerCase().includes(pc.title.toLowerCase())
    )
    
    setSelectedPublicCourse(matchingPublicCourse || null)
    
    // Lock body scroll when modal is open
    document.body.style.overflow = "hidden"
  }

  const handleCloseModal = () => {
    setSelectedCourse(null)
    setSelectedPublicCourse(null)
    // Restore body scroll when modal is closed
    document.body.style.overflow = "auto"
  }

  // Group courses by category
  const currentCourses = listings.filter(course => course.category === "current" && !course.isIsoCertification)

  // Combine future courses and ISO certifications, with ISO certifications sorted in the specified order
  const futureCourses = [
    ...listings.filter(course => course.category === "future" && !course.isIsoCertification),
    ...listings.filter(course => course.isIsoCertification).sort((a, b) => {
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
          <h3 className="text-2xl font-bold mb-6">Current Technologies</h3>
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
          <h3 className="text-2xl font-bold mb-6">Future Technologies & ISO Certifications</h3>
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
              className="bg-card rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <AbstractBackground className="opacity-90 dark:opacity-80" />
                <div className="relative z-10 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 relative shrink-0 bg-primary/10 rounded-md flex items-center justify-center">
                        {selectedCourse.iconUrl ? (
                          <Image
                            src={selectedCourse.iconUrl}
                            alt={selectedCourse.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                            {React.createElement(getTechnologyIcon(selectedCourse.name), { className: "w-6 h-6 text-primary" })}
                          </div>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold">{selectedCourse.name}</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {selectedPublicCourse ? (
                    // Detailed course information from public course data
                    <div className="space-y-6">
                      {/* Preview Image/Video */}
                      {(selectedPublicCourse.image || selectedPublicCourse.previewVideoUrl) && (
                        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                          {selectedPublicCourse.previewVideoUrl ? (
                            <video
                              src={selectedPublicCourse.previewVideoUrl}
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={selectedPublicCourse.image || "/placeholder.svg"}
                              alt={selectedPublicCourse.title}
                              fill
                              className="object-cover"
                            />
                          )}
                          {selectedPublicCourse.level && (
                            <Badge className="absolute top-4 right-4 bg-primary/20 backdrop-blur-sm">
                              {selectedPublicCourse.level}
                            </Badge>
                          )}
                        </div>
                      )}

                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="mb-4 grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
                          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Course Description</h3>
                            <div 
                              className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                              dangerouslySetInnerHTML={{ __html: selectedPublicCourse.description }}
                            />
                          </div>

                          {selectedPublicCourse.learningOutcomes && selectedPublicCourse.learningOutcomes.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold mb-2">What You'll Learn</h3>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                {selectedPublicCourse.learningOutcomes.map((outcome, index) => (
                                  <li key={index} className="flex items-start">
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{outcome}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </TabsContent>

                        {/* Prerequisites Tab */}
                        <TabsContent value="prerequisites">
                          {selectedPublicCourse.prerequisites && selectedPublicCourse.prerequisites.length > 0 ? (
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Course Prerequisites</h3>
                              <ul className="space-y-2">
                                {selectedPublicCourse.prerequisites.map((prereq, index) => (
                                  <li key={index} className="flex items-start">
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{prereq}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No specific prerequisites required for this course.</p>
                          )}
                        </TabsContent>

                        {/* Curriculum Tab */}
                        <TabsContent value="curriculum">
                          {selectedPublicCourse.modules && selectedPublicCourse.modules.length > 0 ? (
                            <div className="space-y-4">
                              {selectedPublicCourse.modules.map((module, index) => (
                                <div key={index} className="border rounded-md overflow-hidden">
                                  <div className="p-3 bg-muted/50 flex justify-between items-center border-b">
                                    <h4 className="font-medium text-sm">{module.title}</h4>
                                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-4">{module.duration}</span>
                                  </div>
                                  {module.lessons && module.lessons.length > 0 && (
                                    <ul className="p-3 text-sm space-y-1.5">
                                      {module.lessons.map((lesson, lessonIndex) => (
                                        <li key={lessonIndex} className="flex items-center text-muted-foreground text-xs">
                                          {lesson.duration.includes('quiz') ? (
                                            <FileQuestion className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-blue-500" />
                                          ) : (
                                            <PlayCircle className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-green-500" />
                                          )}
                                          <span>{lesson.title}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">Curriculum details will be available upon course launch.</p>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  ) : (
                    // Basic course information when no public course data is available
                    <div className="space-y-6">
                      {/* Course Overview */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Course Overview</h3>
                        <p className="text-muted-foreground">
                          {selectedCourse.description || `${selectedCourse.name} is a comprehensive course designed to help you master this technology. More details will be available soon.`}
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
                  )}

                  {/* Footer with action button */}
                  <div className="mt-6 pt-6 border-t border-border flex justify-end">
                    {selectedCourse.category === "current" ? (
                      <DyraneButton asChild>
                        <Link href="/signup">
                          Enroll Now
                          <span className="ml-2">→</span>
                        </Link>
                      </DyraneButton>
                    ) : (
                      <DyraneButton variant="outline">
                        Join Waitlist
                        <span className="ml-2">→</span>
                      </DyraneButton>
                    )}
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
  const [isHovered, setIsHovered] = useState(false)
  
  // Generate gradient class based on course data or use default
  const gradientClass = course.gradientColors
    ? `${course.gradientColors.from} ${course.gradientColors.to}`
    : 'from-primary/20 to-primary/10'

  return (
    <div className="relative">
      <motion.div
        className={`w-24 h-24 relative cursor-pointer bg-card/50 rounded-xl p-3 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br ${gradientClass}`}
        variants={iconVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {course.iconUrl ? (
          <Image
            src={course.iconUrl}
            alt={course.name}
            fill
            className="object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {React.createElement(getTechnologyIcon(course.name), { className: "w-10 h-10 text-primary" })}
          </div>
        )}
      </motion.div>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg min-w-max z-10 border border-border/50"
            variants={infoVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="text-center">
              <p className="font-medium text-sm whitespace-nowrap">{course.name}</p>
              {course.category === "current" ? (
                <Badge variant="outline" className="mt-1 bg-green-500/10 text-green-600 text-xs">
                  Enrolling Now
                </Badge>
              ) : course.isIsoCertification ? (
                <Badge variant="outline" className="mt-1 bg-blue-500/10 text-blue-600 text-xs">
                  ISO Certification
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-1 bg-amber-500/10 text-amber-600 text-xs">
                  Coming Soon
                </Badge>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
