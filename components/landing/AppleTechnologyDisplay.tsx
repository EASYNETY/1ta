"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Cpu, Server, Briefcase, Rocket, Brain,
  Database, Shield, Code, Award
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TechnologyCourseModal } from "@/components/modals/TechnologyCourseModal"
import { TechnologyMarquee } from "./TechnologyMarquee"
import { useMediaQuery } from "@/hooks/use-media-query"

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
    id: "1",
    name: "PMP® Certification Training",
    description: "35 Hours of Instructor-Led Training: Comprehensive live sessions delivered by PMI-certified instructors with industry expertise.",
    category: "current",
    waitlistCount: 0,
    imageUrl: "/placeholders/pmp-hero.png",
    tags: ["Project Management", "Certification", "Leadership"],
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
    gradientColors: {
      to: "to-violet-600",
      from: "from-purple-500"
    }
  }
];

// Fallback public course data
const fallbackPublicCourses: PublicCourse[] = [
  {
    id: "1",
    slug: "pmp-certification-training",
    title: "PMP® Certification Training",
    subtitle: "PMP® Certification Training",
    description: "<p>35 Hours of Instructor-Led Training: Comprehensive live sessions delivered by PMI-certified instructors with industry expertise.</p><p>Aligned with the Latest PMI Standards: Training based on the updated PMBOK® Guide and the latest PMP® exam content outline.</p>",
    category: "Project Management",
    image: "/placeholder.svg",
    previewVideoUrl: "https://vinsystech.s3.us-east-1.amazonaws.com/PMP-Videos/PMP+Training+Day+1-20241221_063337-Meeting+Recording+1.mp4",
    instructor: {
      name: "Expert Instructor",
      title: "Project Management"
    },
    level: "Advanced",
    tags: ["PMP® Certification Training"],
    priceUSD: 0,
    learningOutcomes: [
      "Gain a comprehensive understanding of project management principles and best practices.",
      "Learn all concepts and knowledge areas outlined in the PMBOK® Guide",
      "Develop skills in initiating, planning, executing, monitoring, controlling, and closing projects",
      "Acquire the knowledge needed to pass the PMP certification exam"
    ],
    prerequisites: [
      "Flexi Pass Enabled: Flexibility to reschedule your cohort within first 90 days of access.",
      "Live, online classroom training by top instructors and practitioners",
      "Lifetime access to high-quality self-paced eLearning content curated by industry experts",
      "Learner support and assistance available 24/7"
    ],
    modules: [
      {
        title: "Assessments & Quizzes",
        duration: "5 lessons",
        lessons: [
          {
            title: "Mock Test-1",
            duration: "(quiz)",
            isPreview: false
          },
          {
            title: "Mock Test-2",
            duration: "(quiz)",
            isPreview: false
          }
        ]
      },
      {
        title: "Core Training Modules",
        duration: "8 lessons",
        lessons: [
          {
            title: "PMP Training Day 1",
            duration: "04:00:00",
            isPreview: false
          },
          {
            title: "PMP Training Day 2",
            duration: "03:27:24",
            isPreview: false
          }
        ]
      }
    ],
    lessonCount: 14,
    moduleCount: 3,
    totalVideoDuration: "Approx. 29.2 hours",
    language: "English",
    certificate: true,
    accessType: "Lifetime",
    supportType: "Community"
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
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    borderColor: "rgba(var(--primary), 0.2)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
      ease: [0.22, 1, 0.36, 1] // Custom bezier curve for smooth animation
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  }
}

// No duplicate animation variants needed

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
  const [publicCourses, setPublicCourses] = useState<PublicCourse[]>(fallbackPublicCourses)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<CourseListing | null>(null)
  const [selectedPublicCourse, setSelectedPublicCourse] = useState<PublicCourse | null>(null)
  const [activeTab, setActiveTab] = useState<'current' | 'future'>('current')

  // Check if screen is small (mobile)
  const isSmallScreen = useMediaQuery("(max-width: 640px)")

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
    <div className={`space-y-8 ${isSmallScreen ? 'min-h-[20vh]' : 'min-h-[30vh]'}`}>
      {/* Apple-style segmented control */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-card/5 backdrop-blur-sm rounded-full p-1 border border-border/50">
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'current'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('current')}
          >
            Current Enrollment
          </button>
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'future'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('future')}
          >
            Future Courses
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Technology display - Marquee on small screens, grid on larger screens */}
      <AnimatePresence mode="wait">
        {activeTab === 'current' ? (
          <>
            {isSmallScreen ? (
              <motion.div
                key="current-marquee"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* <h3 className="text-xl font-semibold text-center">Current Technologies</h3> */}
                <TechnologyMarquee
                  courses={currentCourses}
                  onClick={handleIconClick}
                  getTechnologyIcon={getTechnologyIcon}
                  direction="left"
                  speed={20}
                />
                <div className="h-4"></div> {/* Spacer between marquees */}
                <TechnologyMarquee
                  courses={currentCourses.slice().reverse()}
                  onClick={handleIconClick}
                  getTechnologyIcon={getTechnologyIcon}
                  direction="right"
                  speed={15}
                />
              </motion.div>
            ) : (
              <motion.div
                key="current-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-stretch"
              >
                {currentCourses.map((course) => (
                  <TechnologyCard
                    key={course.id}
                    course={course}
                    onClick={() => handleIconClick(course)}
                  />
                ))}
              </motion.div>
            )}
          </>
        ) : (
          <>
            {isSmallScreen ? (
              <motion.div
                key="future-marquee"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* <h3 className="text-xl font-semibold text-center">Future Technologies</h3> */}
                <TechnologyMarquee
                  courses={futureCourses}
                  onClick={handleIconClick}
                  getTechnologyIcon={getTechnologyIcon}
                  direction="left"
                  speed={20}
                />
                <div className="h-4"></div> {/* Spacer between marquees */}
                <TechnologyMarquee
                  courses={futureCourses.slice().reverse()}
                  onClick={handleIconClick}
                  getTechnologyIcon={getTechnologyIcon}
                  direction="right"
                  speed={15}
                />
              </motion.div>
            ) : (
              <motion.div
                key="future-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-stretch"
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
          </>
        )}
      </AnimatePresence>

      {/* Course Details Modal */}
      <TechnologyCourseModal
        isOpen={!!selectedCourse}
        onClose={handleCloseModal}
        techCourse={selectedCourse}
        publicCourse={selectedPublicCourse}
      />
    </div>
  )
}

interface TechnologyCardProps {
  course: CourseListing
  onClick: () => void
}

function TechnologyCard({ course, onClick }: TechnologyCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Define animation variants for the reveal content
  const revealVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      marginTop: 12,
      transition: {
        height: {
          type: "spring",
          stiffness: 500,
          damping: 30,
          mass: 1,
        },
        opacity: {
          duration: 0.2,
          ease: [0.34, 1.56, 0.64, 1]
        }
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.1 },
        ease: [0.36, 0, 0.66, -0.56]
      }
    }
  }

  // Overlay animation that glides from top to bottom
  const overlayVariants = {
    hidden: { opacity: 0, backgroundPosition: "0% 0%" },
    visible: {
      opacity: 1,
      backgroundPosition: "0% 100%",
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  return (
    <motion.div
      className="w-full"
      initial="hidden"
      animate="visible"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative">
        <motion.div
          onClick={onClick}
          className="flex flex-col items-center cursor-pointer group w-full"
          variants={iconVariants}
          whileHover="hover"
        >
          {/* Icon Container with gliding overlay - Responsive width */}
          <div className="relative overflow-hidden rounded-xl w-full">
            <div className={`w-full h-24 px-4 backdrop-blur-sm bg-card/5 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300`}>
              <div className="w-12 h-12 flex items-center justify-center">
                {React.createElement(getTechnologyIcon(course.name), { className: "w-12 h-12 text-primary" })}
              </div>
            </div>

            {/* Gliding overlay effect */}
            {isHovered && (
              <>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20 backdrop-blur-sm"
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                />

                {/* View icon */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 15
                    }
                  }}
                >
                  <div className="bg-primary/10 backdrop-blur-md p-3 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Progressive Disclosure Content - Reveals below with auto width */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="overflow-hidden mt-0"
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="text-center w-full px-2 py-3">
                  <p className="font-medium text-sm break-words hyphens-auto">{course.name}</p>
                  {course.category === "current" ? (
                    <Badge variant="outline" className="mt-2 bg-green-500/5 text-green-600 border-green-500/20 text-xs">
                      Enrolling Now
                    </Badge>
                  ) : course.isIsoCertification ? (
                    <Badge variant="outline" className="mt-2 bg-blue-500/5 text-blue-600 border-blue-500/20 text-xs">
                      ISO Certification
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2 bg-amber-500/5 text-amber-600 border-amber-500/20 text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}
