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
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { CartItem } from "@/features/cart/store/cart-slice"
import { PublicCourse } from "@/features/public-course/types/public-course-interface"
import { Card } from "../ui/card"

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

  return (
    <motion.div
      layout
      variants={containerVariants}
      animate={isExpanded ? "expanded" : "collapsed"}
      className={cn("group", className)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded && "ring-2 ring-primary/20",
          isHovered && "shadow-lg"
        )}
      >
        {/* Compact View */}
        <div className="p-4">
          <div className="flex gap-4">
            {/* Course Image/Video Preview */}
            <div className="relative w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {details.previewVideoUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={details.image}
                    alt={details.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : (
                <Image
                  src={details.image}
                  alt={details.title}
                  fill
                  className="object-cover"
                />
              )}
              {details.level && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 text-xs px-1 py-0"
                >
                  {details.level}
                </Badge>
              )}
            </div>

            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base truncate">
                    {details.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    by {details.instructor.name}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
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

                  {/* Tags */}
                  {details.tags && details.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {details.tags.slice(0, 2).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price and Actions */}
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="text-right">
                    {details.discountPriceNaira ? (
                      <>
                        <p className="line-through text-xs text-muted-foreground">
                          ₦{details.priceNaira.toLocaleString()}
                        </p>
                        <p className="font-semibold text-sm md:text-base">
                          ₦{details.discountPriceNaira.toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <p className="font-semibold text-sm md:text-base">
                        ₦{details.priceNaira.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {onToggleExpand && (
                      <DyraneButton
                        variant="ghost"
                        size="sm"
                        onClick={onToggleExpand}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </DyraneButton>
                    )}

                    <DyraneButton
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(cartItem.courseId)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
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
              <div className="p-4 space-y-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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

                {/* Course Stats */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
