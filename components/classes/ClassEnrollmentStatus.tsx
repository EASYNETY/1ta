"use client"

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { AlertCircle, Calendar, Clock, Users } from 'lucide-react'
import { ClassEnrollmentButton } from './ClassEnrollmentButton'
import { ClassWaitlistButton } from './ClassWaitlistButton'
import { ClassAvailabilityNotification } from './ClassAvailabilityNotification'
import { selectWaitlistByClassId } from '@/features/classes/store/classes-slice'

interface ClassEnrollmentStatusProps {
  classId: string
  courseId: string
  courseTitle: string
  courseImage?: string
  coursePrice?: number
  courseDiscountPrice?: number
  instructorName?: string
  maxSlots?: number
  studentCount?: number
  enrollmentStartDate?: string
  startDate?: string
  endDate?: string
  schedule?: string
  location?: string
  status?: string
}

export function ClassEnrollmentStatus({
  classId,
  courseId,
  courseTitle,
  courseImage,
  coursePrice,
  courseDiscountPrice,
  instructorName,
  maxSlots,
  studentCount = 0,
  enrollmentStartDate,
  startDate,
  endDate,
  schedule,
  location,
  status = 'active'
}: ClassEnrollmentStatusProps) {
  // Calculate available slots
  const availableSlots = maxSlots ? maxSlots - studentCount : undefined

  // Check if enrolment has started
  const enrollmentHasStarted = enrollmentStartDate
    ? new Date(enrollmentStartDate) <= new Date()
    : true

  // Format dates
  const formattedStartDate = startDate ? format(new Date(startDate), 'PPP') : undefined
  const formattedEndDate = endDate ? format(new Date(endDate), 'PPP') : undefined
  const formattedEnrollmentStartDate = enrollmentStartDate
    ? format(new Date(enrollmentStartDate), 'PPP')
    : undefined

  // Calculate slots percentage
  const slotsPercentage = maxSlots && studentCount
    ? (studentCount / maxSlots) * 100
    : 0

  // Get waitlist entries for this class
  const waitlistEntries = useAppSelector(selectWaitlistByClassId(classId))
  const pendingWaitlistCount = waitlistEntries.filter(entry =>
    entry.status === 'pending' || entry.status === 'notified'
  ).length

  // Determine enrolment status
  const getEnrollmentStatus = () => {
    if (status === 'inactive' || status === 'cancelled') {
      return {
        label: 'Unavailable',
        color: 'destructive'
      }
    }

    if (status === 'archived') {
      return {
        label: 'Archived',
        color: 'outline'
      }
    }

    if (!enrollmentHasStarted) {
      return {
        label: 'Coming Soon',
        color: 'secondary'
      }
    }

    if (availableSlots !== undefined && availableSlots <= 0) {
      return {
        label: 'Full',
        color: 'destructive'
      }
    }

    if (status === 'upcoming') {
      return {
        label: 'Open for Enrolment',
        color: 'success'
      }
    }

    return {
      label: 'Open',
      color: 'success'
    }
  }

  const enrollmentStatus = getEnrollmentStatus()

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle>Enrolment Status</CardTitle>
            <Badge variant={
              enrollmentStatus.color as 'default' | 'secondary' | 'destructive' | 'outline'
            }>
              {enrollmentStatus.label}
            </Badge>
          </div>
          <CardDescription>
            {!enrollmentHasStarted && formattedEnrollmentStartDate
              ? `Enrolment opens on ${formattedEnrollmentStartDate}`
              : availableSlots !== undefined && availableSlots <= 0
                ? 'This class is currently full'
                : 'Enrol in this class to secure your spot'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="space-y-4">
            {/* Class details */}
            <div className="space-y-2">
              {schedule && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{schedule}</span>
                </div>
              )}

              {(formattedStartDate || formattedEndDate) && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formattedStartDate && formattedEndDate
                      ? `${formattedStartDate} to ${formattedEndDate}`
                      : formattedStartDate || formattedEndDate
                    }
                  </span>
                </div>
              )}

              {location && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span>{location}</span>
                </div>
              )}
            </div>

            {/* Slots information */}
            {maxSlots && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Available Slots</span>
                  </div>
                  <span className="font-medium">
                    {availableSlots !== undefined ? availableSlots : '?'} of {maxSlots}
                  </span>
                </div>

                <Progress value={slotsPercentage} className="h-2" />

                {pendingWaitlistCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {pendingWaitlistCount} {pendingWaitlistCount === 1 ? 'person' : 'people'} on waitlist
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pt-3">
          {availableSlots !== undefined && availableSlots <= 0 ? (
            <ClassWaitlistButton
              classId={classId}
              courseId={courseId}
              courseTitle={courseTitle}
              maxSlots={maxSlots}
              startDate={startDate}
              endDate={endDate}
              schedule={schedule}
              location={location}
              buttonVariant="secondary"
              buttonSize="default"
              buttonText="Join Waitlist"
            />
          ) : (
            <ClassEnrollmentButton
              classId={classId}
              courseId={courseId}
              courseTitle={courseTitle}
              courseImage={courseImage}
              coursePrice={coursePrice}
              courseDiscountPrice={courseDiscountPrice}
              instructorName={instructorName}
              maxSlots={maxSlots}
              availableSlots={availableSlots}
              enrollmentStartDate={enrollmentStartDate}
              startDate={startDate}
              endDate={endDate}
              schedule={schedule}
              location={location}
              isDisabled={!enrollmentHasStarted || status === 'inactive' || status === 'cancelled' || status === 'archived'}
              disabledReason={
                !enrollmentHasStarted
                  ? `Enrolment opens on ${formattedEnrollmentStartDate}`
                  : 'This class is not available for enrolment'
              }
              buttonText="Enrol now"
              buttonVariant="default"
              buttonSize="default"
              showDetails={true}
            />
          )}
        </CardFooter>
      </Card>

      {/* Notification for waitlisted users when slots become available */}
      <ClassAvailabilityNotification
        classId={classId}
        courseId={courseId}
        courseTitle={courseTitle}
        availableSlots={availableSlots}
      />
    </>
  )
}
