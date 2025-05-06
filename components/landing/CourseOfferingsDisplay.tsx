"use client"

import { useRef, useState, useEffect, type FormEvent } from "react"
import Image from "next/image"
import { useMobile } from "@/hooks/use-mobile"

// UI Components
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Icons
import { Users, CheckCircle, Info, Loader2, ArrowRight, ExternalLink } from "lucide-react"
import { DyraneButton } from "../dyrane-ui/dyrane-button"

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
}

// API Service

const courseApiService = {
  fetchCourses: async (): Promise<CourseListing[]> => {
    if (false) {
      try {
        const response = await fetch("/course-listings/courses")
        if (!response.ok) throw new Error("Failed to fetch courses")
        return await response.json()
      } catch (error) {
        console.error("Error fetching courses:", error)
        return mockCourseListingsData
      }
    }

    // Mock API response
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("[MOCK API] Courses fetched.")
        resolve([...mockCourseListingsData])
      }, 800)
    })
  },

  joinWaitlist: async (payload: { email: string; courseId: string }): Promise<{
    success: boolean
    message: string
    newWaitlistCount?: number
  }> => {
    if (false) {
      try {
        const response = await fetch("/course-listings/waitlist/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!response.ok) throw new Error("Failed to join waitlist")
        return await response.json()
      } catch (error) {
        console.error("Error joining waitlist:", error)
        throw error
      }
    }

    // Mock API response
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("[MOCK API] Joining waitlist:", payload)
        resolve({
          success: true,
          message: "Successfully joined the waitlist! We'll keep you updated.",
          newWaitlistCount: Math.floor(Math.random() * 50) + 100, // Random number for demo
        })
      }, 1000)
    })
  },
}

// Mock Data
const mockCourseListingsData: CourseListing[] = [
  {
    id: "pmp",
    name: "PMP® Project Management",
    description:
      "Lead projects to success with globally recognized PMP certification. Master the art of efficient project delivery.",
    category: "current",
    waitlistCount: 0,
    imageUrl: "/placeholder.svg?height=400&width=600",
    iconUrl: "/placeholder.svg?height=64&width=64",
    tags: ["Management", "Certification", "Leadership"],
  },
  {
    id: "agile",
    name: "Agile & Scrum Mastery",
    description:
      "Learn to implement agile methodologies and lead scrum teams effectively in modern development environments.",
    category: "current",
    waitlistCount: 0,
    imageUrl: "/placeholder.svg?height=400&width=600",
    iconUrl: "/placeholder.svg?height=64&width=64",
    tags: ["Agile", "Scrum", "Leadership"],
  },
  {
    id: "cybersecurity",
    name: "Advanced Cybersecurity Defense",
    description:
      "Become an expert in protecting digital assets. Dive deep into threat mitigation, ethical hacking, and security protocols.",
    category: "future",
    waitlistCount: 127,
    imageUrl: "/placeholder.svg?height=400&width=600",
    iconUrl: "/placeholder.svg?height=64&width=64",
    tags: ["Security", "Hacking", "Defense"],
  },
  {
    id: "devops",
    name: "DevOps Engineering & Automation",
    description:
      "Bridge development and operations. Master CI/CD pipelines, infrastructure as code, and cloud-native practices.",
    category: "future",
    waitlistCount: 98,
    imageUrl: "/placeholder.svg?height=400&width=600",
    iconUrl: "/placeholder.svg?height=64&width=64",
    tags: ["CI/CD", "Automation", "Cloud"],
  },
  {
    id: "data-science",
    name: "Data Science & Big Data Analytics",
    description:
      "Unlock insights from data. Learn machine learning, statistical modeling, and data visualization techniques.",
    category: "future",
    waitlistCount: 215,
    imageUrl: "/placeholder.svg?height=400&width=600",
    iconUrl: "/placeholder.svg?height=64&width=64",
    tags: ["Analytics", "ML", "Big Data"],
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning Mastery",
    description:
      "Explore the frontiers of Artificial Intelligence. Build intelligent systems with advanced ML algorithms and neural networks.",
    category: "future",
    waitlistCount: 183,
    imageUrl: "/placeholder.svg?height=400&width=600",
    iconUrl: "/placeholder.svg?height=64&width=64",
    tags: ["AI", "Deep Learning", "NLP"],
  },
  {
    id: "iso-27001",
    name: "ISO 27001 Information Security",
    description:
      "Implement and manage an Information Security Management System (ISMS) based on the ISO 27001 standard.",
    category: "future",
    isIsoCertification: true,
    waitlistCount: 76,
    imageUrl: "/placeholder.svg?height=400&width=600",
    iconUrl: "/placeholder.svg?height=64&width=64",
    tags: ["ISO", "Security", "Compliance"],
  },
  {
    id: "iso-9001",
    name: "ISO 9001 Quality Management",
    description: "Master Quality Management Systems (QMS) to enhance customer satisfaction and operational efficiency.",
    category: "future",
    isIsoCertification: true,
    waitlistCount: 43,
    imageUrl: "/placeholder.svg?height=400&width=600",
    iconUrl: "/placeholder.svg?height=64&width=64",
    tags: ["ISO", "Quality", "Standards"],
  },
]

export function CourseOfferingsDisplay() {
  const currentCoursesRef = useRef<HTMLDivElement>(null)
  const futureCoursesRef = useRef<HTMLDivElement>(null)
  const isoCoursesRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  const [waitlistEmails, setWaitlistEmails] = useState<Record<string, string>>({})
  const [joinStatus, setJoinStatus] = useState<Record<string, "idle" | "submitting" | "success" | "error">>({})
  const [errorMessages, setErrorMessages] = useState<Record<string, string | null>>({})
  const [courses, setCourses] = useState<CourseListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleSections, setVisibleSections] = useState({
    current: false,
    future: false,
    iso: false,
  })

  // Intersection Observer for section visibility
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.2,
    }

    const handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === currentCoursesRef.current) {
            setVisibleSections((prev) => ({ ...prev, current: true }))
          } else if (entry.target === futureCoursesRef.current) {
            setVisibleSections((prev) => ({ ...prev, future: true }))
          } else if (entry.target === isoCoursesRef.current) {
            setVisibleSections((prev) => ({ ...prev, iso: true }))
          }
        }
      })
    }

    const observer = new IntersectionObserver(handleIntersect, observerOptions)

    if (currentCoursesRef.current) observer.observe(currentCoursesRef.current)
    if (futureCoursesRef.current) observer.observe(futureCoursesRef.current)
    if (isoCoursesRef.current) observer.observe(isoCoursesRef.current)

    return () => {
      if (currentCoursesRef.current) observer.unobserve(currentCoursesRef.current)
      if (futureCoursesRef.current) observer.unobserve(futureCoursesRef.current)
      if (isoCoursesRef.current) observer.unobserve(isoCoursesRef.current)
    }
  }, [currentCoursesRef.current, futureCoursesRef.current, isoCoursesRef.current])

  // Fetch courses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await courseApiService.fetchCourses()
        setCourses(data)

        // Initialize join status for all courses
        const initialStatus = data.reduce<Record<string, "idle" | "submitting" | "success" | "error">>(
          (acc, course) => {
            acc[course.id] = "idle"
            return acc
          },
          {},
        )
        setJoinStatus(initialStatus)
      } catch (err) {
        setError("Failed to load courses. Please try again later.")
        console.error("Error fetching courses:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleEmailChange = (courseId: string, email: string) => {
    setWaitlistEmails((prev) => ({ ...prev, [courseId]: email }))
    if (joinStatus[courseId] === "success" || joinStatus[courseId] === "error") {
      setJoinStatus((prev) => ({ ...prev, [courseId]: "idle" }))
      setErrorMessages((prev) => ({ ...prev, [courseId]: null }))
    }
  }

  const handleJoinWaitlist = async (e: FormEvent<HTMLFormElement>, courseId: string) => {
    e.preventDefault()
    const email = waitlistEmails[courseId]

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessages((prev) => ({ ...prev, [courseId]: "Please enter a valid email address." }))
      setJoinStatus((prev) => ({ ...prev, [courseId]: "error" }))
      return
    }

    setJoinStatus((prev) => ({ ...prev, [courseId]: "submitting" }))
    setErrorMessages((prev) => ({ ...prev, [courseId]: null }))

    try {
      const result = await courseApiService.joinWaitlist({ email, courseId })

      if (result.success) {
        // Update waitlist count
        setCourses((prev) =>
          prev.map((course) =>
            course.id === courseId
              ? { ...course, waitlistCount: result.newWaitlistCount || course.waitlistCount + 1 }
              : course,
          ),
        )

        setJoinStatus((prev) => ({ ...prev, [courseId]: "success" }))
        setWaitlistEmails((prev) => ({ ...prev, [courseId]: "" }))
      } else {
        throw new Error(result.message || "Failed to join waitlist")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to join waitlist. Please try again."
      setErrorMessages((prev) => ({ ...prev, [courseId]: errorMessage }))
      setJoinStatus((prev) => ({ ...prev, [courseId]: "error" }))
    }
  }

  const currentCourses = courses.filter((c) => c.category === "current")
  const futureTechCourses = courses.filter((c) => c.category === "future" && !c.isIsoCertification)
  const isoCourses = courses.filter((c) => c.category === "future" && c.isIsoCertification)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Loading courses...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center text-center">
          <Info className="h-12 w-12 text-destructive mb-4" />
          <p className="text-lg font-medium mb-2">Something went wrong</p>
          <p className="text-muted-foreground">{error}</p>
          <DyraneButton variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </DyraneButton>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 md:py-24 text-white overflow-x-hidden">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Current Courses Section */}
        {currentCourses.length > 0 && (
          <section
            ref={currentCoursesRef}
            className={`mb-20 transition-all duration-1000 ease-out ${visibleSections.current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            <div className="text-center mb-10">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60 mb-2">
                Currently Enrolling
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Embark on your learning journey with our flagship programs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentCourses.map((course, index) => (
                <div
                  key={course.id}
                  className={`transition-all duration-700 ease-out delay-${index * 100} ${visibleSections.current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CurrentCourseCard course={course} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Future Courses Section */}
        {futureTechCourses.length > 0 && (
          <section
            ref={futureCoursesRef}
            className={`mb-20 transition-all duration-1000 ease-out ${visibleSections.future ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            <div className="text-center mb-10">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 mb-2">
                Future Horizons
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get exclusive early access. Join the waitlist for our upcoming courses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {futureTechCourses.map((course, index) => (
                <div
                  key={course.id}
                  className={`transition-all duration-700 ease-out`}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                    opacity: visibleSections.future ? 1 : 0,
                    transform: visibleSections.future ? "translateY(0)" : "translateY(20px)",
                  }}
                >
                  <FutureCourseCard
                    course={course}
                    email={waitlistEmails[course.id] || ""}
                    onEmailChange={(email) => handleEmailChange(course.id, email)}
                    onJoinWaitlist={(e) => handleJoinWaitlist(e, course.id)}
                    status={joinStatus[course.id] || "idle"}
                    errorMessage={errorMessages[course.id]}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ISO Courses Section */}
        {isoCourses.length > 0 && (
          <section
            ref={isoCoursesRef}
            className={`transition-all duration-1000 ease-out ${visibleSections.iso ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">ISO Certifications</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Industry-recognized certifications to advance your career.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isoCourses.map((course, index) => (
                <div
                  key={course.id}
                  className={`transition-all duration-700 ease-out`}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                    opacity: visibleSections.iso ? 1 : 0,
                    transform: visibleSections.iso ? "translateY(0)" : "translateY(20px)",
                  }}
                >
                  <FutureCourseCard
                    course={course}
                    email={waitlistEmails[course.id] || ""}
                    onEmailChange={(email) => handleEmailChange(course.id, email)}
                    onJoinWaitlist={(e) => handleJoinWaitlist(e, course.id)}
                    status={joinStatus[course.id] || "idle"}
                    errorMessage={errorMessages[course.id]}
                    isIso
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

interface CurrentCourseCardProps {
  course: CourseListing
}

function CurrentCourseCard({ course }: CurrentCourseCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDyraneButtonHovered, setIsDyraneButtonHovered] = useState(false)

  return (
    <div
      className="rounded-xl border border-border overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-card/5 backdrop-blur-sm relative group hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {course.imageUrl && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={course.imageUrl || "/placeholder.svg"}
              alt={course.name}
              fill
              className={`object-cover transition-all duration-700 ${isHovered ? "scale-110" : "scale-100"}`}
              priority
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t  from-primary
                 opacity-30 to-transparent transition-opacity duration-500 ${isHovered ? "opacity-50" : "opacity-30"}`}
            ></div>
          </div>
        )}

        {/* Apple-style hover overlay with action DyraneButton */}
        <div
          className={`absolute inset-0 bg-black/0 flex items-center justify-center transition-all duration-500 ${isHovered ? "bg-black/60" : "bg-black/0 pointer-events-none"
            }`}
        >
          <div
            className={`transform transition-all duration-500 ${isHovered ? "scale-100 opacity-100" : "scale-90 opacity-0"
              }`}
            onMouseEnter={() => setIsDyraneButtonHovered(true)}
            onMouseLeave={() => setIsDyraneButtonHovered(false)}
          >
            <DyraneButton
              size="lg"
              className={`font-medium relative overflow-hidden transition-all duration-300 ${isDyraneButtonHovered ? "bg-primary/90 ring-4 ring-primary/20" : ""
                }`}
              asChild
            >
              <a href={`/courses/${course.id}`} className="flex items-center">
                <span>Explore Program</span>
                <ArrowRight
                  className={`ml-2 h-4 w-4 transition-all duration-300 ${isDyraneButtonHovered ? "translate-x-1" : "translate-x-0"
                    }`}
                />
                <span
                  className={`absolute inset-0 bg-white/10 transition-transform duration-500 ${isDyraneButtonHovered ? "-translate-y-full" : "translate-y-full"
                    }`}
                ></span>
              </a>
            </DyraneButton>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center mb-4">
          {course.iconUrl && (
            <div
              className={`p-2 rounded-lg mr-3 bg-muted/50 h-10 w-10 flex items-center justify-center transition-all duration-300 ${isHovered ? "bg-primary/20" : "bg-muted/50"
                }`}
            >
              <Image
                src={course.iconUrl || "/placeholder.svg"}
                alt=""
                width={24}
                height={24}
                className={`object-contain transition-all duration-300 ${isHovered ? "scale-110" : "scale-100"}`}
              />
            </div>
          )}
          <h3 className="text-xl font-bold text-white">{course.name}</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{course.description}</p>

        {course.tags && course.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {course.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={tag}
                variant="outline"
                className={`text-xs transition-all duration-300 delay-${index * 50} ${isHovered ? "bg-primary/10 border-primary/30" : ""
                  }`}
                style={{ transitionDelay: isHovered ? `${index * 50}ms` : "0ms" }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface FutureCourseCardProps {
  course: CourseListing
  email: string
  onEmailChange: (email: string) => void
  onJoinWaitlist: (e: FormEvent<HTMLFormElement>) => void
  status: "idle" | "submitting" | "success" | "error"
  errorMessage: string | null
  isIso?: boolean
}

function FutureCourseCard({
  course,
  email,
  onEmailChange,
  onJoinWaitlist,
  status,
  errorMessage,
  isIso = false,
}: FutureCourseCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isDyraneButtonHovered, setIsDyraneButtonHovered] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Handle click outside to close form
  useEffect(() => {
    if (!showForm) return

    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node) && status !== "submitting") {
        setShowForm(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showForm, status])

  return (
    <div
      className={`rounded-xl border border-border overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-card/5 backdrop-blur-sm relative group hover:-translate-y-2 ${isIso ? "iso-card" : ""
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {course.imageUrl && (
          <div className="relative h-40 w-full overflow-hidden">
            <Image
              src={course.imageUrl || "/placeholder.svg"}
              alt={course.name}
              fill
              className={`object-cover transition-all duration-700 ${isHovered ? "scale-110" : "scale-100"}`}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t from-primary
                 opacity-30 to-transparent transition-opacity duration-500 ${isHovered ? "opacity-50" : "opacity-30"}`}
            ></div>
          </div>
        )}

        {/* Apple-style hover overlay with action DyraneButton */}
        {!showForm && status !== "success" && (
          <div
            className={`absolute inset-0 bg-black/0 flex items-center justify-center transition-all duration-500 ${isHovered ? "bg-black/60" : "bg-black/0 pointer-events-none"
              }`}
          >
            <div
              className={`transform transition-all duration-500 ${isHovered ? "scale-100 opacity-100" : "scale-90 opacity-0"
                }`}
              onMouseEnter={() => setIsDyraneButtonHovered(true)}
              onMouseLeave={() => setIsDyraneButtonHovered(false)}
            >
              <DyraneButton
                size="lg"
                className={`font-medium relative overflow-hidden transition-all duration-300 ${isDyraneButtonHovered ? "bg-primary/90 ring-4 ring-primary/20" : ""
                  }`}
                onClick={() => setShowForm(true)}
              >
                <span>Join Waitlist</span>
                <ExternalLink
                  className={`ml-2 h-4 w-4 transition-all duration-300 ${isDyraneButtonHovered ? "rotate-12" : "rotate-0"}`}
                />
                <span
                  className={`absolute inset-0 bg-white/10 transition-transform duration-500 ${isDyraneButtonHovered ? "-translate-y-full" : "translate-y-full"
                    }`}
                ></span>
              </DyraneButton>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center mb-4">
          {course.iconUrl && (
            <div
              className={`p-2 rounded-lg mr-3 bg-muted/50 h-10 w-10 flex items-center justify-center transition-all duration-300 ${isHovered ? (isIso ? "bg-indigo-400/20" : "bg-primary/20") : "bg-muted/50"
                }`}
            >
              <Image
                src={course.iconUrl || "/placeholder.svg"}
                alt=""
                width={24}
                height={24}
                className={`object-contain transition-all duration-300 ${isHovered ? "scale-110" : "scale-100"}`}
              />
            </div>
          )}
          <h3 className="text-xl font-bold text-white">{course.name}</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4 min-h-[60px]">{course.description}</p>

        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Users
            className={`w-4 h-4 mr-2 ${isIso ? "text-indigo-400" : "text-primary"} transition-all duration-300 ${isHovered ? "scale-110" : "scale-100"
              }`}
          />
          <span className="font-medium text-white">{course.waitlistCount}</span>
          <span className="ml-1">{course.waitlistCount === 1 ? "person" : "people"} on waitlist</span>
        </div>

        {course.tags && course.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {course.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={tag}
                variant="outline"
                className={`text-xs transition-all duration-300 delay-${index * 50} ${isHovered ? (isIso ? "bg-indigo-400/10 border-indigo-400/30" : "bg-primary/10 border-primary/30") : ""
                  }`}
                style={{ transitionDelay: isHovered ? `${index * 50}ms` : "0ms" }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-border">
          {status === "success" ? (
            <div className="flex items-center justify-center text-center py-3 px-3 rounded-md bg-green-500/10 border border-green-500/30 transition-all duration-300 animate-fadeIn">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              <span className="text-sm font-medium text-green-300">Joined Successfully!</span>
            </div>
          ) : showForm ? (
            <form
              ref={formRef}
              onSubmit={onJoinWaitlist}
              className="space-y-3 transition-all duration-300 animate-slideUp"
            >
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                disabled={status === "submitting"}
                className="bg-muted/50 focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                required
              />
              <div className="flex gap-2">
                <DyraneButton
                  type="submit"
                  disabled={status === "submitting" || !email}
                  className="flex-1 transition-all duration-300 hover:bg-primary/90"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    "Join Waitlist"
                  )}
                </DyraneButton>
                <DyraneButton
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={status === "submitting"}
                  className="transition-all duration-300 hover:bg-muted/50"
                >
                  Cancel
                </DyraneButton>
              </div>
              {status === "error" && errorMessage && (
                <p className="text-xs text-destructive flex items-center animate-fadeIn">
                  <Info className="mr-1.5 h-3.5 w-3.5" /> {errorMessage}
                </p>
              )}
            </form>
          ) : (
            <DyraneButton
              onClick={() => setShowForm(true)}
              variant="outline"
              className={`w-full transition-all duration-300 ${isHovered
                ? isIso
                  ? "bg-indigo-400/10 border-indigo-400/30 text-indigo-300"
                  : "bg-primary/10 border-primary/30 text-primary-foreground"
                : ""
                }`}
            >
              Join Waitlist
            </DyraneButton>
          )}
        </div>
      </div>
    </div>
  )
}
