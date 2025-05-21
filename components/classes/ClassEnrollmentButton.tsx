"use client"

import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button'
import { useToast } from '@/components/ui/use-toast'
import { addItem } from '@/features/cart/store/cart-slice'
import { useRouter } from 'next/navigation'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ClassEnrollmentButtonProps {
  classId: string
  courseId: string
  courseTitle: string
  courseImage?: string
  coursePrice?: number
  courseDiscountPrice?: number
  instructorName?: string
  maxSlots?: number
  availableSlots?: number
  enrollmentStartDate?: string
  startDate?: string
  endDate?: string
  schedule?: string
  location?: string
  isDisabled?: boolean
  disabledReason?: string
  buttonText?: string
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon'
  showDetails?: boolean
}

export function ClassEnrollmentButton({
  classId,
  courseId,
  courseTitle,
  courseImage,
  coursePrice,
  courseDiscountPrice,
  instructorName,
  maxSlots,
  availableSlots,
  enrollmentStartDate,
  startDate,
  endDate,
  schedule,
  location,
  isDisabled,
  disabledReason,
  buttonText = "Enroll Now",
  buttonVariant = "default",
  buttonSize = "default",
  showDetails = true
}: ClassEnrollmentButtonProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const cartItems = useAppSelector((state) => state.cart.items)
  
  // Check if this class is already in the cart
  const isAlreadyInCart = cartItems.some(item => 
    item.classId === classId || item.courseId === courseId
  )

  // Calculate enrollment status
  const hasAvailableSlots = availableSlots !== undefined && availableSlots > 0
  const enrollmentHasStarted = enrollmentStartDate 
    ? new Date(enrollmentStartDate) <= new Date() 
    : true
  
  const canEnroll = hasAvailableSlots && enrollmentHasStarted && !isDisabled
  
  // Format dates
  const formattedStartDate = startDate ? format(new Date(startDate), 'PPP') : undefined
  const formattedEndDate = endDate ? format(new Date(endDate), 'PPP') : undefined
  const formattedEnrollmentStartDate = enrollmentStartDate 
    ? format(new Date(enrollmentStartDate), 'PPP') 
    : undefined

  // Calculate slots percentage
  const slotsPercentage = maxSlots && availableSlots !== undefined
    ? ((maxSlots - availableSlots) / maxSlots) * 100
    : 0

  // Handle enrollment
  const handleEnroll = () => {
    if (isAlreadyInCart) {
      toast({
        title: "Already in Cart",
        description: `${courseTitle} is already in your cart.`,
        variant: "default"
      })
      router.push('/cart')
      setOpen(false)
      return
    }

    dispatch(addItem({
      courseId,
      classId,
      title: courseTitle,
      price: coursePrice,
      discountPrice: courseDiscountPrice,
      image: courseImage,
      instructor: instructorName,
    }))

    toast({
      title: "Added to Cart",
      description: `${courseTitle} has been added to your cart.`,
      variant: "success"
    })

    if (!isAuthenticated) {
      router.push("/signup")
    } else {
      router.push("/cart")
    }
    
    setOpen(false)
  }

  // Get status message
  const getStatusMessage = () => {
    if (!hasAvailableSlots) {
      return {
        type: "error",
        title: "No Available Slots",
        message: "This class is currently full. You can join the waitlist to be notified when a slot becomes available."
      }
    }
    
    if (!enrollmentHasStarted) {
      return {
        type: "warning",
        title: "Enrollment Not Yet Open",
        message: `Enrollment for this class will open on ${formattedEnrollmentStartDate}.`
      }
    }
    
    if (isDisabled && disabledReason) {
      return {
        type: "error",
        title: "Enrollment Unavailable",
        message: disabledReason
      }
    }
    
    return {
      type: "success",
      title: "Available for Enrollment",
      message: `This class has ${availableSlots} available slots. Enroll now to secure your spot!`
    }
  }

  const statusMessage = getStatusMessage()

  return (
    <>
      <DyraneButton
        onClick={() => setOpen(true)}
        disabled={isDisabled}
        variant={buttonVariant}
        size={buttonSize}
      >
        {buttonText}
      </DyraneButton>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Class Enrollment</DialogTitle>
            <DialogDescription>
              Review class details before enrolling
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <h3 className="font-medium text-lg">{courseTitle}</h3>
            
            {/* Status Alert */}
            <Alert variant={
              statusMessage.type === "error" ? "destructive" : 
              statusMessage.type === "warning" ? "default" :
              "success"
            }>
              {statusMessage.type === "error" && <AlertCircle className="h-4 w-4" />}
              {statusMessage.type === "warning" && <Info className="h-4 w-4" />}
              {statusMessage.type === "success" && <CheckCircle2 className="h-4 w-4" />}
              <AlertTitle>{statusMessage.title}</AlertTitle>
              <AlertDescription>{statusMessage.message}</AlertDescription>
            </Alert>
            
            {showDetails && (
              <>
                {/* Class Details */}
                <div className="space-y-3">
                  {schedule && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Schedule</p>
                        <p className="text-sm text-muted-foreground">{schedule}</p>
                      </div>
                    </div>
                  )}
                  
                  {(formattedStartDate || formattedEndDate) && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Dates</p>
                        <p className="text-sm text-muted-foreground">
                          {formattedStartDate && formattedEndDate 
                            ? `${formattedStartDate} to ${formattedEndDate}`
                            : formattedStartDate || formattedEndDate
                          }
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {location && (
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{location}</p>
                      </div>
                    </div>
                  )}
                  
                  {maxSlots && availableSlots !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Available Slots</span>
                        <span>{availableSlots} of {maxSlots}</span>
                      </div>
                      <Progress value={slotsPercentage} className="h-2" />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="flex space-x-2 sm:justify-between">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            
            {!hasAvailableSlots && (
              <Button variant="secondary" onClick={() => {
                toast({
                  title: "Added to Waitlist",
                  description: "You'll be notified when a slot becomes available.",
                  variant: "success"
                })
                setOpen(false)
              }}>
                Join Waitlist
              </Button>
            )}
            
            {canEnroll && (
              <Button onClick={handleEnroll}>
                {isAlreadyInCart ? "View Cart" : "Enroll Now"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
