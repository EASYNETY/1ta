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
  AlertTriangle,
  AlertCircle,
  Info
} from "lucide-react"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { CartItem, selectCartTaxAmount } from "@/features/cart/store/cart-slice"
import { BreakdownSection, PaymentBreakdownItem } from "@/features/payment/types/payment-types"
import { useState } from "react"
import { Card } from "../ui/card"
import { useAppSelector } from "@/store/hooks"
import { selectAllCourses } from "@/features/public-course/store/public-course-slice"
import { PublicCourse } from "@/features/public-course/types/public-course-interface"
import { Button } from "../ui/button"

interface PaymentBreakdownProps {
  cartItems: CartItem[]
  className?: string
}

const generateBreakdownData = (
  cartItems: CartItem[],
  getCourseDetails: (id: string) => PublicCourse | undefined
): BreakdownSection[] => {
  const tuitionItems = cartItems.map(item => {
    const courseDetails = getCourseDetails(item.courseId)

    // Priority order for pricing:
    // 1. If there's a discountPriceNaira in cart item, use it as final price
    // 2. Otherwise use priceNaira from cart item
    // 3. Fall back to course details pricing
    
    let finalPrice: number;
    let originalPrice: number;
    let discountAmount: number = 0;

    if (item.discountPriceNaira && item.discountPriceNaira > 0) {
      // Cart item has discount price - use it as final price
      finalPrice = item.discountPriceNaira;
      originalPrice = item.priceNaira || courseDetails?.priceNaira || item.discountPriceNaira;
      discountAmount = Math.max(originalPrice - finalPrice, 0);
    } else if (item.priceNaira) {
      // Cart item has regular price
      finalPrice = item.priceNaira;
      originalPrice = courseDetails?.priceNaira || item.priceNaira;
      // Check if course details has a discount
      if (courseDetails?.discountPriceNaira && courseDetails.discountPriceNaira < originalPrice) {
        finalPrice = courseDetails.discountPriceNaira;
        discountAmount = originalPrice - finalPrice;
      }
    } else {
      // Fall back to course details
      originalPrice = courseDetails?.priceNaira || 0;
      if (courseDetails?.discountPriceNaira && courseDetails.discountPriceNaira > 0) {
        finalPrice = courseDetails.discountPriceNaira;
        discountAmount = originalPrice - finalPrice;
      } else {
        finalPrice = originalPrice;
      }
    }

    // Ensure prices are never negative
    finalPrice = Math.max(finalPrice, 0);
    originalPrice = Math.max(originalPrice, 0);
    discountAmount = Math.max(discountAmount, 0);

    return {
      id: `tuition-${item.courseId}`,
      category: 'tuition' as const,
      description: item.title,
      amount: finalPrice, // This is the actual amount that should be charged
      quantity: 1,
      isIncluded: false,
      details: courseDetails
        ? `Instructor: ${courseDetails.instructor.name}${courseDetails.level ? ` • Level: ${courseDetails.level}` : ''}`
        : `Instructor: ${item.instructor || 'TBD'}`,
      originalAmount: discountAmount > 0 ? originalPrice : undefined, // Only show original if there's a discount
      discountAmount: discountAmount > 0 ? discountAmount : undefined // Only show discount if there is one
    }
  })

  const tuitionTotal = tuitionItems.reduce((sum, item) => sum + item.amount, 0)

  return [
    {
      title: "Tuition Fees",
      icon: "GraduationCap",
      totalAmount: tuitionTotal,
      items: tuitionItems
    }
  ]
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
                  {item.originalAmount && item.discountAmount && item.discountAmount > 0 ? (
                    <div className="text-sm text-right">
                      <p className="font-medium text-muted-foreground line-through text-xs">
                        ₦{item.originalAmount.toLocaleString()}
                      </p>
                      <p className="font-semibold text-green-600">
                        ₦{item.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        Save ₦{item.discountAmount.toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-medium">
                      ₦{item.amount.toLocaleString()}
                    </p>
                  )}
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

  // Select all public courses once at top-level to avoid calling hooks inside loops or helper functions
  const publicCourses = useAppSelector(selectAllCourses)

  // Function to get course details for each cart item (lookup from the array)
  const getCourseDetails = (courseId: string): PublicCourse | undefined => {
    return publicCourses.find(c => c.id === courseId)
  }

  const sections = generateBreakdownData(cartItems, getCourseDetails)

  // Calculate totals using the corrected amounts (with discounts applied)
  const subtotal = sections.reduce((sum, section) => sum + section.totalAmount, 0)
  
  // Use tax from cart slice if available, otherwise calculate 7.5% VAT
  const tax = cartTaxAmount > 0 ? cartTaxAmount : subtotal * 0
  const total = subtotal + tax

  // Calculate total savings for display
  const totalSavings = sections.reduce((totalSaving, section) => {
    return totalSaving + section.items.reduce((sectionSaving, item) => {
      return sectionSaving + (item.discountAmount || 0)
    }, 0)
  }, 0)

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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {cartItems.length} course{cartItems.length !== 1 ? 's' : ''}
            </Badge>
            {totalSavings > 0 && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Save ₦{totalSavings.toLocaleString()}
              </Badge>
            )}
          </div>
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

          {totalSavings > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Savings</span>
              <span className="text-green-600 font-medium">-₦{totalSavings.toLocaleString()}</span>
            </div>
          )}

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
              <p className="font-medium mb-1">Missing Course Information</p>
                <p>Some course details are not available. Pricing is based on cart data.</p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">What's included:</p>
              <ul className="space-y-1">
                <li>• Tuition Fee</li>
                <li>• Exam Fee</li>
                <li>• Course access and materials</li>
                <li>• Instructor support</li>
                {cartItems.some(item => getCourseDetails(item.courseId)?.certificate) && (
                  <li>• International certificate of completion</li>
                )}
                <li>• 3 Refreshments daily</li>
                {cartItems.some(item => getCourseDetails(item.courseId)?.accessType === "Lifetime") && (
                  <li>• 1 month post training material access</li>
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
