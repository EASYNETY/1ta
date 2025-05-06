"use client"

import type React from "react"

import { useRef, useState, useEffect, type FormEvent } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Icons
import {
  Users,
  Rocket,
  ShieldCheck,
  Database,
  Brain,
  Wrench,
  CheckCircle,
  Info,
  Loader2,
  BookOpen,
  Award,
  Lightbulb,
  UsersRound,
  ArrowRight,
} from "lucide-react"

// Types
export interface CourseListing {
  id: string
  name: string
  description?: string
  category: "current" | "future"
  isIsoCertification?: boolean
  waitlistCount: number
  imageUrl?: string
  IconComponent?: React.ComponentType<{ className?: string }>
  tags?: string[]
}

// Mock Data
const courseListingsData = [
  {
    id: "pmp",
    name: "PMP® Project Management",
    description:
      "Lead projects to success with globally recognized PMP certification. Master the art of efficient project delivery.",
    category: "current",
    waitlistCount: 0,
    imageUrl: "/placeholder.svg?height=400&width=600",
    IconComponent: Rocket,
    tags: ["Management", "Certification", "Leadership"],
  },
  {
    id: "cybersecurity",
    name: "Advanced Cybersecurity Defense",
    description:
      "Become an expert in protecting digital assets. Dive deep into threat mitigation, ethical hacking, and security protocols.",
    category: "future",
    waitlistCount: 127,
    imageUrl: "/placeholder.svg?height=400&width=600",
    IconComponent: ShieldCheck,
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
    IconComponent: Wrench,
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
    IconComponent: Database,
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
    IconComponent: Brain,
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
    IconComponent: Award,
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
    IconComponent: Award,
    tags: ["ISO", "Quality", "Standards"],
  },
]

export function CourseOfferingsDisplay() {
  const futureCoursesRef = useRef<HTMLDivElement>(null)
  const isoCoursesRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  const isFutureCoursesInView = useInView(futureCoursesRef, { once: true, amount: 0.2 })
  const isIsoCoursesInView = useInView(isoCoursesRef, { once: true, amount: 0.2 })

  const [waitlistEmails, setWaitlistEmails] = useState<Record<string, string>>({})
  const [joinStatus, setJoinStatus] = useState<Record<string, "idle" | "submitting" | "success" | "error">>({})
  const [errorMessages, setErrorMessages] = useState<Record<string, string | null>>({})
  const [courses, setCourses] = useState(courseListingsData)

  // Initialize join status for all courses
  useEffect(() => {
    const initialStatus = courses.reduce<Record<string, "idle" | "submitting" | "success" | "error">>((acc, course) => {
      acc[course.id] = "idle"
      return acc
    }, {})
    setJoinStatus(initialStatus)
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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update waitlist count
    setCourses((prev) =>
      prev.map((course) => (course.id === courseId ? { ...course, waitlistCount: course.waitlistCount + 1 } : course)),
    )

    setJoinStatus((prev) => ({ ...prev, [courseId]: "success" }))
    setWaitlistEmails((prev) => ({ ...prev, [courseId]: "" }))
  }

  const currentCourse = courses.find((c) => c.category === "current")
  const futureTechCourses = courses.filter((c) => c.category === "future" && !c.isIsoCertification)
  const isoCourses = courses.filter((c) => c.category === "future" && c.isIsoCertification)

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  }

  return (
    <div className="py-16 md:py-24 text-white overflow-x-hidden">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Current Course Section */}
        {currentCourse && (
          <motion.section variants={sectionVariants} initial="hidden" animate="show" className="mb-20">
            <div className="text-center mb-10">
              <Lightbulb className="mx-auto text-amber-400 mb-3 h-12 w-12" />
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60 mb-2">
                Currently Enrolling
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Embark on your learning journey with our flagship program.
              </p>
            </div>

            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="rounded-xl overflow-hidden border border-border shadow-lg"
            >
              <div className="p-6 sm:p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={currentCourse.imageUrl || "/placeholder.svg"}
                      alt={`${currentCourse.name} illustration`}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-3xl font-bold text-white mb-3">{currentCourse.name}</h3>
                    <p className="text-muted-foreground mb-6">{currentCourse.description}</p>
                    <Button size="lg" className="font-medium" asChild>
                      <a href="/#courses">
                        Explore Program <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* Future Courses Section */}
        {futureTechCourses.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-10">
              <UsersRound className="mx-auto text-amber-400 mb-3 h-12 w-12" />
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 mb-2">
                Future Horizons
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get exclusive early access. Join the waitlist for our upcoming courses.
              </p>
            </div>

            <motion.div
              ref={futureCoursesRef}
              variants={container}
              initial="hidden"
              animate={isFutureCoursesInView ? "show" : "hidden"}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {futureTechCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course as CourseListing}
                  email={waitlistEmails[course.id] || ""}
                  onEmailChange={(email) => handleEmailChange(course.id, email)}
                  onJoinWaitlist={(e) => handleJoinWaitlist(e, course.id)}
                  status={joinStatus[course.id]}
                  errorMessage={errorMessages[course.id]}
                  variants={item}
                />
              ))}
            </motion.div>
          </section>
        )}

        {/* ISO Courses Section */}
        {isoCourses.length > 0 && (
          <section>
            <div className="text-center mb-10">
              <Award className="mx-auto text-amber-400 mb-3 h-12 w-12" />
              <h2 className="text-3xl font-bold text-white mb-2">ISO Certifications</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Industry-recognized certifications to advance your career.
              </p>
            </div>

            <motion.div
              ref={isoCoursesRef}
              variants={container}
              initial="hidden"
              animate={isIsoCoursesInView ? "show" : "hidden"}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {isoCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course as CourseListing}
                  email={waitlistEmails[course.id] || ""}
                  onEmailChange={(email) => handleEmailChange(course.id, email)}
                  onJoinWaitlist={(e) => handleJoinWaitlist(e, course.id)}
                  status={joinStatus[course.id]}
                  errorMessage={errorMessages[course.id]}
                  variants={item}
                  isIso
                />
              ))}
            </motion.div>
          </section>
        )}
      </div>
    </div>
  )
}

interface CourseCardProps {
  course: CourseListing
  email: string
  onEmailChange: (email: string) => void
  onJoinWaitlist: (e: FormEvent<HTMLFormElement>) => void
  status: "idle" | "submitting" | "success" | "error"
  errorMessage: string | null
  variants?: any
  isIso?: boolean
}

function CourseCard({
  course,
  email,
  onEmailChange,
  onJoinWaitlist,
  status,
  errorMessage,
  variants,
  isIso = false,
}: CourseCardProps) {
  const IconComponent = course.IconComponent || BookOpen
  const iconColor = isIso ? "text-indigo-400" : "text-primary"

  return (
    <motion.div
      variants={variants}
      className="rounded-xl border border-border overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-card/5 backdrop-blur-sm"
      whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 15 } }}
    >
      {course.imageUrl && (
        <div className="relative h-40 w-full overflow-hidden">
          <Image src={course.imageUrl || "/placeholder.svg"} alt={course.name} fill className="object-cover" />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg mr-3 bg-muted/50">
            <IconComponent className={cn("h-6 w-6", iconColor)} />
          </div>
          <h3 className="text-xl font-bold text-white">{course.name}</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4 min-h-[60px]">{course.description}</p>

        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Users className="w-4 h-4 mr-2 text-primary" />
          <span className="font-medium text-white">{course.waitlistCount}</span>
          <span className="ml-1">{course.waitlistCount === 1 ? "person" : "people"} on waitlist</span>
        </div>

        {course.tags && course.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {course.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center text-center py-3 px-3 rounded-md bg-green-500/10 border border-green-500/30"
              >
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                <span className="text-sm font-medium text-green-300">Joined Successfully!</span>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={onJoinWaitlist}
                className="space-y-3"
              >
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  disabled={status === "submitting"}
                  className="bg-muted/50"
                  required
                />
                <Button type="submit" disabled={status === "submitting" || !email} className="w-full">
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    "Join Waitlist"
                  )}
                </Button>
                {status === "error" && errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-destructive flex items-center"
                  >
                    <Info className="mr-1.5 h-3.5 w-3.5" /> {errorMessage}
                  </motion.p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
