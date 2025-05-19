"use client"

import { useState, useEffect } from "react"
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
import { Separator } from "@/components/ui/separator"

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

// Fallback data in case API fails
const fallbackListings: CourseListing[] = [
  {
    id: "pmp",
    name: "PMP® Project Management",
    description: "Lead projects to success with globally recognized PMP certification. Master the art of efficient project delivery.",
    category: "current",
    waitlistCount: 0,
    imageUrl: "/placeholders/pmp-hero.png",
    iconUrl: "/icons/rocket.svg",
    tags: ["Management", "Certification", "Leadership"],
    gradientColors: {
      to: "to-green-600",
      from: "from-emerald-500"
    }
  },
  {
    id: "iso-9001",
    name: "ISO 9001 Quality Management",
    description: "Master Quality Management Systems (QMS) to enhance customer satisfaction and operational efficiency.",
    category: "future",
    isIsoCertification: true,
    waitlistCount: 0,
    iconUrl: "/icons/award.svg",
    gradientColors: {
      to: "to-gray-600",
      from: "from-slate-500"
    }
  },
  {
    id: "iso-27001",
    name: "ISO 27001 Information Security",
    description: "Implement and manage an Information Security Management System (ISMS) based on the ISO 27001 standard.",
    category: "future",
    isIsoCertification: true,
    waitlistCount: 0,
    iconUrl: "/icons/award.svg",
    gradientColors: {
      to: "to-gray-600",
      from: "from-slate-500"
    }
  },
  {
    id: "iso-20000",
    name: "ISO 20000 IT Service Management",
    description: "Establish and improve IT service management systems following international best practices.",
    category: "future",
    isIsoCertification: true,
    waitlistCount: 0,
    iconUrl: "/icons/award.svg",
    gradientColors: {
      to: "to-gray-600",
      from: "from-slate-500"
    }
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    description: "Explore the frontiers of Artificial Intelligence. Build intelligent systems with advanced ML algorithms and neural networks.",
    category: "future",
    waitlistCount: 0,
    iconUrl: "/icons/brain.svg",
    gradientColors: {
      to: "to-violet-600",
      from: "from-purple-500"
    }
  }
];

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
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
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

export function AppleTechnologyDisplay() {
  const [listings, setListings] = useState<CourseListing[]>(fallbackListings)
  const [publicCourses, setPublicCourses] = useState<PublicCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<CourseListing | null>(null)
  const [selectedPublicCourse, setSelectedPublicCourse] = useState<PublicCourse | null>(null)
  const [activeTab, setActiveTab] = useState<'current' | 'future'>('current')

  // Fetch course data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch listings with timeout and error handling
        const listingsPromise = fetch(LISTINGS_ENDPOINT)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Listings API request failed with status ${response.status}`)
            }
            return response.json()
          })
          .then(data => {
            if (data.success && Array.isArray(data.data)) {
              return data.data
            }
            throw new Error('Invalid listings API response format')
          })

        // Fetch public courses with timeout and error handling
        const coursesPromise = fetch(COURSES_ENDPOINT)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Courses API request failed with status ${response.status}`)
            }
            return response.json()
          })
          .then(data => {
            if (data.success && Array.isArray(data.data)) {
              return data.data
            }
            throw new Error('Invalid courses API response format')
          })

        // Add timeout to both promises
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )

        // Race against timeout
        const [listingsData, coursesData] = await Promise.all([
          Promise.race([listingsPromise, timeoutPromise]).catch(err => {
            console.warn('Listings fetch error:', err)
            return null
          }),
          Promise.race([coursesPromise, timeoutPromise]).catch(err => {
            console.warn('Courses fetch error:', err)
            return null
          })
        ])

        // Use data if available, otherwise keep fallback
        if (listingsData) {
          setListings(listingsData)
        }

        if (coursesData) {
          setPublicCourses(coursesData)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        // Fallback data is already set as initial state
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

  return (
    <div className="space-y-8">
      {/* Apple-style segmented control */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-card/50 backdrop-blur-sm rounded-full p-1 border border-border/50">
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'current'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('current')}
          >
            Current Technologies
          </button>
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'future'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('future')}
          >
            Future Technologies
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Technology grid with Apple-style layout */}
      <AnimatePresence mode="wait">
        {activeTab === 'current' ? (
          <motion.div
            key="current"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center"
          >
            {currentCourses.map((course) => (
              <TechnologyCard
                key={course.id}
                course={course}
                onClick={() => handleIconClick(course)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="future"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center"
          >
            {futureCourses.map((course) => (
              <TechnologyCard
                key={course.id}
                course={course}
                onClick={() => handleIconClick(course)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

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

interface TechnologyCardProps {
  course: CourseListing
  onClick: () => void
}

function TechnologyCard({ course, onClick }: TechnologyCardProps) {
  // Generate gradient class based on course data or use default
  const gradientClass = course.gradientColors
    ? `${course.gradientColors.from} ${course.gradientColors.to}`
    : 'from-primary/20 to-primary/10'

  return (
    <motion.div
      className="w-full max-w-[180px]"
      variants={iconVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      <div
        onClick={onClick}
        className="flex flex-col items-center cursor-pointer group"
      >
        {/* Icon */}
        <div className={`w-20 h-20 mb-3 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300`}>
          {course.iconUrl ? (
            <Image
              src={course.iconUrl}
              alt={course.name}
              width={40}
              height={40}
              className="object-contain"
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center">
              {React.createElement(getTechnologyIcon(course.name), { className: "w-10 h-10 text-primary" })}
            </div>
          )}
        </div>

        {/* Name */}
        <h4 className="text-sm font-medium text-center line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {course.name}
        </h4>

        {/* Status Badge */}
        <div className="mt-1.5">
          {course.category === "current" ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs">
              Enrolling Now
            </Badge>
          ) : course.isIsoCertification ? (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 text-xs">
              ISO Certification
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 text-xs">
              Coming Soon
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  )
}
