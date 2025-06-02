"use client"

import { motion } from "framer-motion"
import {
  GraduationCap,
  BookOpen,
  Coffee,
  FileText,
  Award,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle
} from "lucide-react"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { CartItem, selectCartTaxAmount } from "@/features/cart/store/cart-slice"
import { BreakdownSection } from "@/features/payment/types/payment-types"
import { useState } from "react"
import { Card } from "../ui/card"
import { useAppSelector } from "@/store/hooks"
import { selectPublicCourseById } from "@/features/public-course/store/public-course-slice"
import { PublicCourse } from "@/features/public-course/types/public-course-interface"
import { Button } from "../ui/button"

interface PaymentBreakdownProps {
  cartItems: CartItem[]
  className?: string
}

// Generate breakdown data based on cart items and real course data
const generateBreakdownData = (cartItems: CartItem[], getCourseDetails: (id: string) => PublicCourse | undefined): BreakdownSection[] => {
  // Calculate tuition total from cart items
  const tuitionTotal = cartItems.reduce((sum, item) => {
    const courseDetails = getCourseDetails(item.courseId)

    // Use discountPriceNaira if available, otherwise priceNaira from course or cart
    let price = item.discountPriceNaira || item.priceNaira

    // If course details are available and have pricing, use those as fallback
    if (!price && courseDetails) {
      price = courseDetails.discountPriceNaira || courseDetails.priceNaira || 0
    }

    return sum + price
  }, 0)

  const sections: BreakdownSection[] = [
    {
      title: "Tuition Fees",
      icon: "GraduationCap",
      totalAmount: tuitionTotal,
      items: cartItems.map(item => {
        const courseDetails = getCourseDetails(item.courseId)
        let price = item.discountPriceNaira || item.priceNaira

        // Fallback to course details pricing if cart doesn't have price
        if (!price && courseDetails) {
          price = courseDetails.discountPriceNaira || courseDetails.priceNaira || 0
        }

        return {
          id: `tuition-${item.courseId}`,
          category: 'tuition' as const,
          description: item.title,
          amount: price,
          quantity: 1,
          isIncluded: false,
          details: courseDetails
            ? `Instructor: ${courseDetails.instructor.name}${courseDetails.level ? ` • Level: ${courseDetails.level}` : ''}`
            : `Instructor: ${item.instructor || 'TBD'}`
        }
      })
    }
  ]

  // Check if any courses have additional pricing information
  const hasAdditionalPricing = cartItems.some(item => {
    const courseDetails = getCourseDetails(item.courseId)
    return courseDetails?.pricing?.individual || courseDetails?.pricing?.corporate
  })

  // Only add additional sections if we have real data or if courses indicate additional services
  if (hasAdditionalPricing || cartItems.length > 0) {
    // For now, we'll show a notice that additional services are not available
    // This can be expanded when backend provides real additional service pricing
  }

  return sections
}

const getIconComponent = (iconName: string) => {
  const icons = {
    GraduationCap,
    BookOpen,
    Coffee,
    FileText,
    Award
  }
  return icons[iconName as keyof typeof icons] || GraduationCap
}

interface BreakdownSectionProps {
  section: BreakdownSection
  isOpen: boolean
  onToggle: () => void
}

function BreakdownSectionComponent({ section, isOpen, onToggle }: BreakdownSectionProps) {
  const IconComponent = getIconComponent(section.icon || "GraduationCap")

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-3 h-auto hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <IconComponent className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">{section.title}</p>
              <p className="text-xs text-muted-foreground">
                {section.items.length} item{section.items.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">₦{section.totalAmount.toLocaleString()}</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-3 pb-3 w-full mt-4"
        >
          <div className="space-y-2 ml-11">
            {section.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.description}</p>
                  {item.details && (
                    <p className="text-xs text-muted-foreground mt-1">{item.details}</p>
                  )}
                  {item.quantity && item.quantity > 1 && (
                    <Badge variant="outline" className="text-xs mt-1">
                      Qty: {item.quantity}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">₦{item.amount.toLocaleString()}</p>
                  {item.isIncluded && (
                    <Badge variant="secondary" className="text-xs">
                      Included
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function PaymentBreakdown({ cartItems, className }: PaymentBreakdownProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['Tuition Fees']))

  // Get tax information from cart slice
  const cartTaxAmount = useAppSelector(selectCartTaxAmount)

  // Function to get course details for each cart item
  const getCourseDetails = (courseId: string): PublicCourse | undefined => {
    return useAppSelector(selectPublicCourseById(courseId))
  }

  const sections = generateBreakdownData(cartItems, getCourseDetails)

  const subtotal = sections.reduce((sum, section) => sum + section.totalAmount, 0)

  // Use tax from cart slice if available, otherwise calculate 7.5% VAT
  const tax = cartTaxAmount > 0 ? cartTaxAmount : subtotal * 0
  const total = subtotal + tax

  const toggleSection = (sectionTitle: string) => {
    const newOpenSections = new Set(openSections)
    if (newOpenSections.has(sectionTitle)) {
      newOpenSections.delete(sectionTitle)
    } else {
      newOpenSections.add(sectionTitle)
    }
    setOpenSections(newOpenSections)
  }

  return (
    <Card className={cn("w-full border-none", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Payment Breakdown</h2>
          <Badge variant="outline" className="text-xs">
            {cartItems.length} course{cartItems.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Breakdown Sections */}
        <div className="space-y-2 mb-6 w-full">
          {sections.map((section) => (
            <BreakdownSectionComponent
              key={section.title}
              section={section}
              isOpen={openSections.has(section.title)}
              onToggle={() => toggleSection(section.title)}
            />
          ))}
        </div>

        <Separator className="my-4" />

        {/* Summary */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₦{subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              VAT (0%)
              <Info className="h-3 w-3" />
            </span>
            <span>₦{tax.toLocaleString()}</span>
          </div>

          <Separator />

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary">₦{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Course Data Availability Notice */}
        {cartItems.some(item => !getCourseDetails(item.courseId)) && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700 dark:text-amber-300">
                <p className="font-medium mb-1">Course Information:</p>
                <p>Some course details are not available. Pricing is based on cart data.</p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">What's included:</p>
              <ul className="space-y-1">
                <li>• Course access and materials</li>
                <li>• Instructor support</li>
                {cartItems.some(item => getCourseDetails(item.courseId)?.certificate) && (
                  <li>• Certificate of completion</li>
                )}
                {cartItems.some(item => getCourseDetails(item.courseId)?.accessType === "Lifetime") && (
                  <li>• Lifetime access</li>
                )}
              </ul>
              {tax > 0 && (
                <p className="mt-2 text-xs">
                  * VAT ({((tax / subtotal) * 100).toFixed(1)}%) is included in the total
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
