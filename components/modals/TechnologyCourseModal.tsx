"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Note: scrollbar-hide class is defined in global CSS or via Tailwind plugin
import {
  PlayCircle, FileQuestion, CheckCircle,
  Layers, Clock, GraduationCap, BookOpen, Mail, X,
  ArrowRight, Share2, ExternalLink
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { AbstractBackground } from "@/components/layout/abstract-background"
import { CourseListing } from "@/components/landing/AppleTechnologyDisplay"
import { PublicCourse } from "@/features/public-course/types/public-course-interface"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addItem } from "@/features/cart/store/cart-slice"
import { useToast } from "@/hooks/use-toast"
import { getCourseIcon } from "@/utils/course-icon-mapping"

// Component to render either Video or Fallback Image
const CourseMediaPreview = ({ course }: { course: PublicCourse }) => {
  const [imageError, setImageError] = useState(false);

  // Use video if URL exists, otherwise use placeholder image
  if (course.previewVideoUrl) {
    return (
      <video
        key={course.previewVideoUrl}
        src={course.previewVideoUrl}
        muted
        playsInline
        preload="metadata"
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  // Fallback to placeholder image
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
      <div className="w-20 h-20 flex items-center justify-center">
        {course.iconUrl || course.image && course.image !== "/placeholder.svg" && !imageError ? (
          <img
            src={course.iconUrl || course.image || getCourseIcon(course.title, course.id)}
            alt={course.title}
            className="max-w-full max-h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <Layers className="w-16 h-16 text-primary/40" />
        )}
      </div>
    </div>
  );
};

interface TechnologyCourseModalProps {
  isOpen: boolean
  onClose: () => void
  techCourse?: CourseListing | null
  publicCourse: PublicCourse | null
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
}

const levelBadgeColor = (level?: string) => {
  switch (level) {
    case "Beginner":
      return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50 dark:border-green-700/50";
    case "Intermediate":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300/50 dark:border-yellow-700/50";
    case "Advanced":
      return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300/50 dark:border-red-700/50";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

// Helper function to find matching public course
const findMatchingPublicCourse = (techCourse: CourseListing | undefined, publicCourse: PublicCourse | null): PublicCourse | null => {
  if (publicCourse) return publicCourse;
  if (!techCourse) return null;

  // Try to match by name similarity
  const techName = techCourse.name.toLowerCase();

  // Special case for PMP
  if (techName.includes("pmp") || techName.includes("project management")) {
    return {
      id: "1",
      slug: "pmp-certification-training",
      title: "PMP® Certification Training",
      subtitle: "PMP® Certification Training",
      description: "<p>35 Hours of Instructor-Led Training: Comprehensive live sessions delivered by PMI-certified instructors with industry expertise.</p><p>Aligned with the Latest PMI Standards: Training based on the updated PMBOK® Guide and the latest PMP® exam content outline.</p>",
      category: "Project Management",
      image: techCourse.imageUrl || "/placeholder.svg",
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
          title: "Core Training Modules",
          duration: "8 lessons",
          lessons: [
            { title: "PMP Training Day 1", duration: "04:00:00", isPreview: false },
            { title: "PMP Training Day 2", duration: "03:27:24", isPreview: false },
            { title: "PMP Training Day 3", duration: "03:45:31", isPreview: false },
            { title: "PMP Training Day 4", duration: "02:55:19", isPreview: false }
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
    };
  }

  return null;
}

export function TechnologyCourseModal({ isOpen, onClose, techCourse, publicCourse }: TechnologyCourseModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);
  const { toast } = useToast();

  // State for waitlist form
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  // Find matching public course or use provided one
  const matchedPublicCourse = findMatchingPublicCourse(techCourse as CourseListing | undefined, publicCourse);

  // Ensure techCourse is not undefined
  const safeTechCourse = techCourse || {} as CourseListing;

  // Create a merged course object that uses publicCourse data when available, falling back to techCourse
  const mergedCourse: PublicCourse = {
    id: matchedPublicCourse?.id || safeTechCourse.id || "course-id",
    slug: matchedPublicCourse?.slug || (safeTechCourse.id ? safeTechCourse.id.toLowerCase().replace(/\s+/g, '-') : "course-slug"),
    title: matchedPublicCourse?.title || safeTechCourse.name || "Course Title",
    subtitle: matchedPublicCourse?.subtitle || "",
    description: matchedPublicCourse?.description || safeTechCourse.description || "",
    category: matchedPublicCourse?.category || safeTechCourse.category || "current",
    image: matchedPublicCourse?.image || safeTechCourse.imageUrl || "/placeholder.svg",
    previewVideoUrl: matchedPublicCourse?.previewVideoUrl || undefined,
    instructor: matchedPublicCourse?.instructor || {
      name: "Expert Instructor",
      title: safeTechCourse.category === "current" ? "Lead Instructor" : "Coming Soon"
    },
    level: matchedPublicCourse?.level || "All Levels",
    tags: matchedPublicCourse?.tags || safeTechCourse.tags || [],
    priceUSD: matchedPublicCourse?.priceUSD || 0,
    discountPriceUSD: matchedPublicCourse?.discountPriceUSD,
    learningOutcomes: matchedPublicCourse?.learningOutcomes || [],
    prerequisites: matchedPublicCourse?.prerequisites || [],
    modules: matchedPublicCourse?.modules || [],
    lessonCount: matchedPublicCourse?.lessonCount || 0,
    moduleCount: matchedPublicCourse?.moduleCount || 0,
    totalVideoDuration: matchedPublicCourse?.totalVideoDuration || null,
    language: matchedPublicCourse?.language || "English",
    certificate: matchedPublicCourse?.certificate || true,
    accessType: matchedPublicCourse?.accessType || "Lifetime",
    supportType: matchedPublicCourse?.supportType || "Community"
  }

  // Check if course is already in cart
  const isAlreadyInCart = cartItems.some((item) => item.courseId === mergedCourse.id);

  // Handle enrol now button click
  const handleEnrolNow = () => {
    if (isAlreadyInCart) {
      toast({
        title: "Already Selected",
        description: `${mergedCourse.title} is already in your list.`,
        variant: "default"
      });
    } else {
      dispatch(addItem({
        courseId: mergedCourse.id,
        title: mergedCourse.title,
        price: mergedCourse.priceUSD,
        discountPrice: mergedCourse.discountPriceUSD,
        image: mergedCourse.iconUrl || mergedCourse.image || getCourseIcon(mergedCourse.title, mergedCourse.id),
        instructor: mergedCourse.instructor.name,
      }));

      toast({
        title: "Course Selected",
        description: `${mergedCourse.title} has been added to your list.`,
        variant: "success"
      });
    }

    if (!isAuthenticated) {
      router.push("/signup");
    } else {
      router.push("/cart");
    }

    onClose();
  };

  // Handle waitlist submission
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!waitlistEmail || !waitlistName) {
      toast({
        title: "Missing Information",
        description: "Please provide both your name and email to join the waitlist.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingWaitlist(true);

    try {
      // Send email via the contact API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: waitlistName || 'Waitlist Request',
          email: waitlistEmail,
          inquiryType: '1TA Future Waitlist',
          message: `A user (${waitlistName || 'Unnamed'}) has requested to join the waitlist for the following course: ${mergedCourse.title}. Please notify them when this course becomes available.`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setWaitlistSubmitted(true);
        
        toast({
          title: "Waitlist Joined",
          description: `You'll be notified when ${mergedCourse.title} becomes available.`,
          variant: "success"
        });

        // Reset after showing success for a moment
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to join waitlist');
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-card/95 backdrop-blur-md rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-primary/10"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <AbstractBackground className="opacity-90 dark:opacity-80" />

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-20 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="relative z-10 max-h-[90vh] overflow-y-auto bg-background/85 backdrop-blur-sm rounded-xl scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Media Preview */}
                <div className="relative w-full aspect-video bg-muted">
                  <CourseMediaPreview course={mergedCourse} />
                  {mergedCourse.level && (
                    <Badge
                      className="absolute top-4 left-4 bg-primary/10 backdrop-blur-md border border-primary/20"
                      variant="outline"
                    >
                      {mergedCourse.level}
                    </Badge>
                  )}
                </div>

                <div className="w-full flex flex-col h-full">
                  <div className="p-6 flex-grow" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {/* Header with title */}
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold">{mergedCourse.title}</h2>
                      {mergedCourse.subtitle && <p className="text-muted-foreground mt-1">{mergedCourse.subtitle}</p>}
                    </div>

                    {/* Course stats */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm">
                      <span className="inline-flex items-center">
                        <Layers className="size-4 mr-2 text-muted-foreground" />
                        {mergedCourse.lessonCount || "Multiple"} lessons
                      </span>
                      {mergedCourse.totalVideoDuration && (
                        <span className="inline-flex items-center">
                          <Clock className="size-4 mr-2 text-muted-foreground" />
                          {mergedCourse.totalVideoDuration}
                        </span>
                      )}
                    </div>

                    {/* Tabs - Only the 3 requested sections */}
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="mb-4 grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
                        <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                      </TabsList>

                      {/* Overview Tab */}
                      <TabsContent value="overview" className="space-y-4 text-sm">
                        <div>
                          <div
                            className="text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: mergedCourse.description || "" }}
                          />
                        </div>

                        {mergedCourse.learningOutcomes && mergedCourse.learningOutcomes.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-border/30">
                            <h3 className="font-semibold mb-3 text-base flex items-center">
                              <BookOpen className="mr-2 h-4 w-4 text-primary" />
                              What You'll Learn
                            </h3>
                            <ul className="grid grid-cols-1 gap-y-2">
                              {mergedCourse.learningOutcomes.map((outcome, index) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle className="size-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{outcome}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Course Features */}
                        <div className="mt-6 pt-4 border-t border-border/30">
                          <h3 className="font-semibold mb-3 text-base">Course Features</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {mergedCourse.certificate && (
                              <div className="flex items-center gap-2 text-sm">
                                <GraduationCap className="w-4 h-4 text-primary" />
                                <span>Certificate of Completion</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-primary" />
                              <span>{mergedCourse.totalVideoDuration || "Self-paced learning"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Layers className="w-4 h-4 text-primary" />
                              <span>{mergedCourse.lessonCount || "Multiple"} lessons</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <FileQuestion className="w-4 h-4 text-primary" />
                              <span>{mergedCourse.language || "English"} language</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Prerequisites Tab */}
                      <TabsContent value="prerequisites">
                        {mergedCourse.prerequisites && mergedCourse.prerequisites.length > 0 ? (
                          <div className="space-y-6">
                            <div>
                              <h3 className="font-semibold mb-3 text-base flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                                Course Prerequisites
                              </h3>
                              <ul className="space-y-3">
                                {mergedCourse.prerequisites.map((prereq, index) => (
                                  <li key={index} className="flex items-start bg-card/5 p-3 rounded-md backdrop-blur-sm">
                                    <CheckCircle className="size-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{prereq}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Course Support */}
                            <div className="mt-6 pt-4 border-t border-border/30">
                              <h3 className="font-semibold mb-3 text-base">Support & Access</h3>
                              <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center gap-2 text-sm bg-card/5 p-3 rounded-md backdrop-blur-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>{mergedCourse.supportType || "Community"} Support</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm bg-card/5 p-3 rounded-md backdrop-blur-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>{mergedCourse.accessType || "Lifetime"} Access</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No specific prerequisites required for this course.</p>
                            <p className="text-sm text-muted-foreground mt-2">You can start learning right away!</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Curriculum Tab */}
                      <TabsContent value="curriculum">
                        {mergedCourse.modules && mergedCourse.modules.length > 0 ? (
                          <div className="space-y-4">
                            {/* Course Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                              <div className="bg-card/5 backdrop-blur-sm p-3 rounded-md border border-border/30 flex flex-col">
                                <span className="text-xs text-muted-foreground">Total Duration</span>
                                <span className="text-base font-medium">{mergedCourse.totalVideoDuration || "Self-paced"}</span>
                              </div>
                              <div className="bg-card/5 backdrop-blur-sm p-3 rounded-md border border-border/30 flex flex-col">
                                <span className="text-xs text-muted-foreground">Modules</span>
                                <span className="text-base font-medium">{mergedCourse.moduleCount || mergedCourse.modules.length} modules</span>
                              </div>
                            </div>

                            {/* Module List */}
                            {mergedCourse.modules
                              .filter(module => module.title !== "Section undefined")
                              .map((module, index) => (
                              <div key={index} className="border rounded-md overflow-hidden">
                                <div className="p-3 bg-muted/50 flex justify-between items-center border-b">
                                  <h4 className="font-medium text-sm">{module.title}</h4>
                                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-4">{module.duration}</span>
                                </div>
                                {module.lessons && module.lessons.length > 0 && (
                                  <ul className="p-3 text-sm space-y-1.5">
                                    {module.lessons
                                      .filter(lesson => lesson.title) // Filter out lessons without titles
                                      .map((lesson, lessonIndex) => (
                                      <li key={lessonIndex} className="flex items-center text-muted-foreground text-xs">
                                        {lesson.duration && lesson.duration.includes('quiz') ? (
                                          <FileQuestion className="size-3.5 mr-2 flex-shrink-0 text-blue-500" />
                                        ) : (
                                          <PlayCircle className="size-3.5 mr-2 flex-shrink-0 text-green-500" />
                                        )}
                                        <span className="flex-1">{lesson.title}</span>
                                        {lesson.duration && !lesson.duration.includes('undefined') && (
                                          <span className="text-xs text-muted-foreground ml-2">{lesson.duration}</span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Curriculum details will be available upon course launch.</p>
                            <p className="text-sm text-muted-foreground mt-2">Check back soon for updates!</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Footer with action buttons */}
                  <div className="p-4 border-t flex justify-between items-center mt-auto sticky bottom-0 bg-background/90 backdrop-blur-sm flex-wrap gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        // Share functionality
                        if (navigator.share) {
                          navigator.share({
                            title: mergedCourse.title,
                            text: mergedCourse.subtitle || `Learn about ${mergedCourse.title}`,
                            url: window.location.href,
                          });
                        } else {
                          // Fallback - copy to clipboard
                          navigator.clipboard.writeText(window.location.href);
                          toast({
                            title: "Link Copied",
                            description: "Course link copied to clipboard",
                            variant: "success"
                          });
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>

                    {/* Action button */}
                    {safeTechCourse.category === "current" ? (
                      mergedCourse.available_for_enrolment !== false ? (
                        <DyraneButton
                          onClick={handleEnrolNow}
                          className="gap-1.5"
                        >
                          {isAlreadyInCart ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>Selected</span>
                            </>
                          ) : (
                            <>
                              <GraduationCap className="h-4 w-4" />
                              <span>Enrol now</span>
                            </>
                          )}
                        </DyraneButton>
                      ) : (
                        <DyraneButton
                          disabled
                          className="gap-1.5 cursor-not-allowed opacity-70"
                        >
                          <span>Not Available for Enrolment</span>
                        </DyraneButton>
                      )
                    ) : (
                      <>
                        {waitlistSubmitted ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-3 py-4 text-center"
                          >
                            <div className="flex items-center gap-2 text-green-500">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">Waitlist Joined Successfully!</span>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-md">
                              Thank you for your interest in <span className="font-medium">{mergedCourse.title}</span>. 
                              We'll notify you at <span className="font-medium">{waitlistEmail}</span> when this course becomes available.
                            </p>
                          </motion.div>
                        ) : (
                          <form onSubmit={handleWaitlistSubmit} className="flex flex-col gap-3 w-full max-w-md">
                            <p className="text-sm text-muted-foreground">
                              Join the waitlist to be notified when this course becomes available.
                            </p>
                            
                            {isSubmittingWaitlist ? (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center gap-2 py-2"
                              >
                                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                <span>Processing your request...</span>
                              </motion.div>
                            ) : (
                              <div className="flex flex-col gap-3 w-full">
                                <div className="grid grid-cols-1 gap-3">
                                  <div>
                                    <Input
                                      type="text"
                                      placeholder="Your name"
                                      className="h-10 text-sm"
                                      value={waitlistName}
                                      onChange={(e) => setWaitlistName(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Input
                                      type="email"
                                      placeholder="Your email"
                                      className="h-10 text-sm"
                                      value={waitlistEmail}
                                      onChange={(e) => setWaitlistEmail(e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                                <DyraneButton
                                  type="submit"
                                  variant="outline"
                                  size="default"
                                  className="gap-1.5 w-full"
                                >
                                  <Mail className="h-4 w-4" />
                                  Join Waitlist for {mergedCourse.title}
                                </DyraneButton>
                              </div>
                            )}
                          </form>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
