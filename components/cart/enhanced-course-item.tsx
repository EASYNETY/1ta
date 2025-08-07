"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  ChevronDown,
  ChevronUp,
  Play,
  Clock,
  BookOpen,
  Award,
  Trash2,
  CheckCircle
} from "lucide-react"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card" // Assuming DyraneCard is a styled Card
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { CartItem } from "@/features/cart/store/cart-slice"
import { PublicCourse } from "@/features/public-course/types/public-course-interface"
import { Card } from "../ui/card" // Using shadcn Card as fallback if DyraneCard is similar
import { getProxiedImageUrl } from "@/utils/imageProxy"

interface EnhancedCourseItemProps {
  cartItem: CartItem
  courseDetails?: PublicCourse
  onRemove: (courseId: string) => void
  isExpanded?: boolean
  onToggleExpand?: () => void
  className?: string
}

// Convert PublicCourse to display format, fallback to cart item data
const getCourseDisplayData = (cartItem: CartItem, courseDetails?: PublicCourse) => {
  if (courseDetails) {
    return {
      id: courseDetails.id,
      title: courseDetails.title,
      subtitle: courseDetails.subtitle,
      description: courseDetails.description,
      instructor: {
        name: courseDetails.instructor.name,
        title: courseDetails.instructor.title,
        avatar: undefined
      },
      image: courseDetails.image || courseDetails.iconUrl || cartItem.image || "/placeholder.svg",
      previewVideoUrl: courseDetails.previewVideoUrl,
      level: courseDetails.level,
      duration: courseDetails.totalVideoDuration,
      moduleCount: courseDetails.moduleCount,
      lessonCount: courseDetails.lessonCount,
      learningOutcomes: courseDetails.learningOutcomes,
      prerequisites: courseDetails.prerequisites,
      certificate: courseDetails.certificate,
      priceNaira: cartItem.priceNaira,
      discountPriceNaira: cartItem.discountPriceNaira,
      tags: courseDetails.tags,
      studentsEnroled: courseDetails.studentsEnroled,
      rating: courseDetails.rating
    }
  }

  // Fallback to cart item data when course details not available
  return {
    id: cartItem.courseId,
    title: cartItem.title,
    subtitle: undefined,
    description: "Course details will be loaded shortly...",
    instructor: {
      name: cartItem.instructor || "Expert Instructor",
      title: undefined,
      avatar: undefined
    },
    image: cartItem.image || "/placeholder.svg",
    previewVideoUrl: undefined,
    level: undefined,
    duration: undefined,
    moduleCount: undefined,
    lessonCount: undefined,
    learningOutcomes: undefined,
    prerequisites: undefined,
    certificate: undefined,
    priceNaira: cartItem.priceNaira,
    discountPriceNaira: cartItem.discountPriceNaira,
    tags: undefined,
    studentsEnroled: undefined,
    rating: undefined
  }
}

export function EnhancedCourseItem({
  cartItem,
  courseDetails,
  onRemove,
  isExpanded = false,
  onToggleExpand,
  className
}: EnhancedCourseItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const details = getCourseDisplayData(cartItem, courseDetails)

  const containerVariants = {
    collapsed: { height: "auto" },
    expanded: { height: "auto" }
  }

  const contentVariants = {
    collapsed: { opacity: 0, height: 0 },
    expanded: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  }

  // Use DyraneCard if it's meant to be the primary card component, otherwise Card
  const CardComponent = Card;


  return (
    <motion.div
      layout
      variants={containerVariants}
      animate={isExpanded ? "expanded" : "collapsed"}
      className={cn("group", className)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <CardComponent // Using CardComponent which could be DyraneCard or shadcn Card
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded && "ring-2 ring-primary/20",
          isHovered && !isExpanded && "shadow-lg" // Apply shadow only if not expanded for clarity
        )}
      >
        {/* Compact View */}
        <div className="p-3 sm:p-4"> {/* Slightly less padding on very small screens */}
          {/* Main layout: flex-col for mobile, sm:flex-row for larger */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Course Image/Video Preview */}
            {/* Mobile: full width, aspect-video. sm+: fixed width/height */}
            <div className="relative w-full aspect-video sm:w-20 sm:h-14 sm:aspect-auto md:w-40 md:h-24 lg:w-64 lg:h-auto rounded-lg overflow-hidden bg-muted sm:flex-shrink-0">
              {details.previewVideoUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={getProxiedImageUrl(details.image)}
                    alt={details.title}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 767px) 80px, (max-width: 1023px) 112px, 128px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="h-6 w-6 sm:h-4 sm:w-4 text-white" />
                  </div>
                </div>
              ) : (
                <Image
                  src={getProxiedImageUrl(details.image)}
                  alt={details.title}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 767px) 80px, (max-width: 1023px) 112px, 128px"
                  className="object-cover"
                />
              )}
              {details.level && (
                <Badge
                  variant="secondary"
                  className="absolute top-1.5 right-1.5 sm:-top-1 sm:-right-1 text-xs px-1 py-0"
                >
                  {details.level}
                </Badge>
              )}
            </div>

            {/* Course Info */}
            {/* mt-3 for spacing when stacked below image on mobile, sm:mt-0 */}
            <div className="flex-1 min-w-0 mt-3 sm:mt-0">
              {/* Inner layout: title/stats vs price/actions. flex-col for mobile, sm:flex-row for larger */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                {/* Left Block: Title, Instructor, Stats, Tags */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-sm md:text-base truncate"> {/* Slightly larger title on mobile */}
                    {details.title}
                  </h3>
                  <p className="text-sm sm:text-xs md:text-sm text-muted-foreground mt-1">
                    by {details.instructor.name}
                  </p>

                  {/* Quick Stats - with flex-wrap */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 md:gap-x-3 mt-2 text-xs text-muted-foreground">
                    {details.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{details.duration}</span>
                      </div>
                    )}
                    {details.lessonCount && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{details.lessonCount} lessons</span>
                      </div>
                    )}
                    {details.certificate && (
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        <span>Certificate</span>
                      </div>
                    )}
                  </div>

                  {/* Tags - with flex-wrap */}
                  {details.tags && details.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {details.tags.slice(0, 3).map((tag: string, index: number) => ( // Show 3 tags on mobile
                        <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Block: Price and Actions */}
                {/* mt-3 for spacing when stacked, sm:mt-0. sm:ml-4 for spacing when side-by-side. */}
                {/* items-start for mobile (aligns content left), sm:items-end for desktop. */}
                <div className="flex flex-col items-start sm:items-end gap-2 mt-3 sm:mt-0 sm:ml-0 md:ml-4">
                  {/* Price: text-left for mobile, sm:text-right for desktop */}
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    {details.discountPriceNaira ? (
                      <>
                        <p className="line-through text-xs text-muted-foreground">
                          ₦{details.priceNaira.toLocaleString()}
                        </p>
                        <p className="font-semibold text-base sm:text-sm md:text-base">
                          ₦{(details.priceNaira - details.discountPriceNaira).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <p className="font-semibold text-base sm:text-sm md:text-base">
                        ₦{details.priceNaira.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Action buttons: On mobile, take full width of this block and justify buttons to the end. On sm+, auto width. */}
                  <div className="flex items-center gap-2 w-full justify-end sm:w-auto sm:justify-start">
                    {onToggleExpand && (
                      <DyraneButton
                        variant="ghost"
                        size="lg"
                        onClick={onToggleExpand}
                        aria-label={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        {isExpanded ? (
                          <>
                            <span>
                              Collapse details
                            </span>
                            <ChevronUp className="h-4 w-4" /></>
                        ) : (
                          <>
                            <span>
                              Expand details
                            </span><ChevronDown className="h-4 w-4" /></>
                        )}
                      </DyraneButton>
                    )}

                    <DyraneButton
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(cartItem.courseId)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      aria-label="Remove course from cart"
                    >
                      <Trash2 className="h-4 w-4" />
                    </DyraneButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="border-t bg-muted/20"
            >
              <div className="p-3 sm:p-4 space-y-4"> {/* Consistent padding */}
                {/* Course Description */}
                <div>
                  <h4 className="font-medium text-sm mb-2">About this course</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {details.description}
                  </p>
                </div>

                <Separator />

                {/* Learning Outcomes */}
                {details.learningOutcomes && details.learningOutcomes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">What you'll learn</h4>
                    {/* Already responsive: 1 col on mobile, 2 on md+ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                      {details.learningOutcomes.map((outcome: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prerequisites */}
                {details.prerequisites && details.prerequisites.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Prerequisites</h4>
                    <ul className="space-y-1">
                      {details.prerequisites.map((prereq: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                          {prereq}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Course Stats (in expanded view) */}
                <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 pt-2 text-sm text-muted-foreground">
                  {details.moduleCount && (
                    <span>{details.moduleCount} modules</span>
                  )}
                  {details.lessonCount && (
                    <span>{details.lessonCount} lessons</span>
                  )}
                  {details.certificate && (
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Certificate included
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardComponent>
    </motion.div>
  )
}