"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, ArrowRight, CheckCircle, X, Loader2, BookOpen } from "lucide-react"
import Link from "next/link"

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

export function CourseCards() {
  const [courses] = useState<CourseListing[]>(mockCourseListingsData)
  const [selectedCourse, setSelectedCourse] = useState<CourseListing | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to handle card click
  const handleCardClick = (course: CourseListing) => {
    setSelectedCourse(course)
    setShowEmailForm(false)
    setIsSuccess(false)
    setError(null)
  }

  // Function to close details
  const handleCloseDetails = () => {
    setSelectedCourse(null)
    setShowEmailForm(false)
    setEmail("")
    setIsSuccess(false)
    setError(null)
  }

  // Function to handle join waitlist
  const handleJoinWaitlist = () => {
    setShowEmailForm(true)
  }

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For live API, uncomment this code:
      /*
      const response = await fetch('/api/join-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: selectedCourse?.id,
          email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }
      */

      setIsSuccess(true)
      setShowEmailForm(false)
    } catch (err) {
      setError("Failed to join waitlist. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Group courses by category
  const currentCourses = courses.filter((course) => course.category === "current")
  const futureCourses = courses.filter((course) => course.category === "future" && !course.isIsoCertification)
  const isoCourses = courses.filter((course) => course.isIsoCertification)

  return (
    <div className="p-4 md:p-6">
      {/* Current Courses Section */}
      {currentCourses.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Currently Enrolling</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentCourses.map((course) => (
              <CourseCard key={course.id} course={course} onClick={() => handleCardClick(course)} />
            ))}
          </div>
        </div>
      )}

      {/* Future Courses Section */}
      {futureCourses.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Future Courses</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {futureCourses.map((course) => (
              <CourseCard key={course.id} course={course} onClick={() => handleCardClick(course)} />
            ))}
          </div>
        </div>
      )}

      {/* ISO Certification Courses Section */}
      {isoCourses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">ISO Certifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isoCourses.map((course) => (
              <CourseCard key={course.id} course={course} onClick={() => handleCardClick(course)} isIso />
            ))}
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 relative mr-3">
                    {selectedCourse.iconUrl ? (
                      <Image
                        src={selectedCourse.iconUrl || "/placeholder.svg"}
                        alt={selectedCourse.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{selectedCourse.name}</h3>
                </div>
                <button onClick={handleCloseDetails} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedCourse.imageUrl && (
                <div className="relative h-40 w-full mb-4 rounded-md overflow-hidden">
                  <Image
                    src={selectedCourse.imageUrl || "/placeholder.svg"}
                    alt={selectedCourse.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <p className="text-muted-foreground mb-4">{selectedCourse.description}</p>

              {selectedCourse.tags && selectedCourse.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCourse.tags.map((tag) => (
                    <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {selectedCourse.category === "future" && (
                <div className="flex items-center text-sm text-muted-foreground mb-6">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{selectedCourse.waitlistCount} people on waitlist</span>
                </div>
              )}

              {selectedCourse.category === "current" ? (
                <Button className="w-full" asChild onClick={handleCloseDetails}>
                  <Link href='/#courses' className="flex items-center">
                    Enroll Now <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              ) : isSuccess ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-500">Successfully joined the waitlist!</span>
                </div>
              ) : showEmailForm ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                  {error && <p className="text-destructive text-sm">{error}</p>}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <Button onClick={handleJoinWaitlist} className="w-full">
                  Join Waitlist <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface CourseCardProps {
  course: CourseListing
  onClick: () => void
  isIso?: boolean
}

function CourseCard({ course, onClick, isIso = false }: CourseCardProps) {
  return (
    <div
      onClick={onClick}
      className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow flex flex-col bg-card/5 backdrop-blur-sm"
    >
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 relative mr-3">
          {course.iconUrl ? (
            <Image src={course.iconUrl || "/placeholder.svg"} alt={course.name} fill className="object-contain" />
          ) : (
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        <h3 className="font-medium text-base">{course.name}</h3>
      </div>

      {course.tags && course.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {course.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      {course.category === "future" && (
        <div className="flex items-center text-xs text-muted-foreground mt-auto">
          <Users className="w-3 h-3 mr-1" />
          <span>{course.waitlistCount}</span>
        </div>
      )}

      {course.category === "current" && (
        <div className="mt-auto">
          <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">Enrolling Now</span>
        </div>
      )}

      {isIso && (
        <div className="mt-auto">
          <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">ISO Certification</span>
        </div>
      )}
    </div>
  )
}
