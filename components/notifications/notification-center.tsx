"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  FileText,
  GraduationCap,
  BarChart3,
  X,
  Settings,
  MessageSquare,
  CreditCard,
  Megaphone,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  Award,
  BookOpen,
  CheckCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button'
import Link from 'next/link'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

// Import notification types and Redux actions/selectors
import type { Notification, NotificationType } from '@/features/notifications/types/notification-types'
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  selectNotifications,
  selectNotificationsStatus
} from '@/features/notifications/store/notifications-slice'
import { selectAuthCourses } from '@/features/auth-course/store/auth-course-slice'
import { selectMyClasses } from '@/features/classes/store/classes-slice'

export function NotificationCenter() {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [allNotifications, setAllNotifications] = useState<Notification[]>([])
  const [rateLimited, setRateLimited] = useState(false)
  const [lastFetchAttempt, setLastFetchAttempt] = useState(0)
  const [errorDismissed, setErrorDismissed] = useState(false)

  // Get notifications from Redux store
  const apiNotifications = useAppSelector(selectNotifications)
  const status = useAppSelector(selectNotificationsStatus)
  const error = useAppSelector(state => state.notifications?.error)

  // Get courses and classes from Redux store for dynamic notifications
  const courses = useAppSelector(selectAuthCourses)
  const classes = useAppSelector(selectMyClasses)

  // Check for rate limiting errors
  useEffect(() => {
    if (error) {
      // Reset error dismissed state when a new error occurs
      setErrorDismissed(false)

      // Handle rate limiting specifically
      if (typeof error === 'string' && error.includes('429')) {
        setRateLimited(true)
        // Set a timeout to allow fetching again after 30 seconds
        const timeoutId = setTimeout(() => {
          setRateLimited(false)
        }, 30000) // 30 seconds cooldown

        return () => clearTimeout(timeoutId)
      }
    }
  }, [error])

  // Fetch notifications when component mounts or when sheet is opened
  useEffect(() => {
    const now = Date.now()
    // Only fetch if:
    // 1. The sheet is open
    // 2. We're not already in a succeeded state
    // 3. We're not rate limited
    // 4. It's been at least 5 seconds since our last fetch attempt
    if (open && status !== 'succeeded' && !rateLimited && (now - lastFetchAttempt > 5000)) {
      setLastFetchAttempt(now)
      dispatch(fetchNotifications({ limit: 20 }))
    }
  }, [dispatch, open, status, rateLimited, lastFetchAttempt])

  // Generate dynamic notifications based on courses and classes
  // Use a ref to track if we've already generated notifications
  const hasGeneratedNotifications = useRef(false)

  // Function to generate dynamic notifications
  const generateDynamicNotifications = useCallback(() => {
    if (courses.length === 0 && classes.length === 0) return []

    const dynamicNotifications: Notification[] = []
    const now = new Date()
    const userId = "current" // This would be the actual user ID in a real app

    // Generate assignment notifications
    courses.forEach((course: any) => {
      const assignments = course.assignments || []

      assignments.forEach((assignment: any) => {
        if (!assignment.dueDate) return

        const dueDate = parseISO(assignment.dueDate)

        // Assignment due soon (within 3 days)
        if (
          dueDate > now &&
          dueDate < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        ) {
          dynamicNotifications.push({
            id: `dynamic-assignment-${assignment.id}-due-soon`,
            userId,
            type: "assignment",
            title: "Assignment Due Soon",
            message: `"${assignment.title}" for ${course.title} is due on ${format(dueDate, 'PPP')}`,
            read: false,
            createdAt: new Date().toISOString(),
            href: `/assignments/${assignment.id}`,
            metadata: {
              courseId: course.id,
              itemId: assignment.id
            }
          })
        }

        // Assignment overdue
        if (dueDate < now && assignment.status !== 'submitted') {
          dynamicNotifications.push({
            id: `dynamic-assignment-${assignment.id}-overdue`,
            userId,
            type: "assignment",
            title: "Assignment Overdue",
            message: `"${assignment.title}" for ${course.title} was due on ${format(dueDate, 'PPP')}`,
            read: false,
            createdAt: new Date().toISOString(),
            href: `/assignments/${assignment.id}`,
            metadata: {
              courseId: course.id,
              itemId: assignment.id
            }
          })
        }
      })

      // Generate quiz notifications
      course.modules?.forEach((module: any) => {
        const quizzes = module.lessons?.filter((lesson: any) => lesson.type === 'quiz') || []

        quizzes.forEach((quiz: any) => {
          // Quiz not taken yet
          if (!course.quizScores || !(quiz.id in course.quizScores)) {
            dynamicNotifications.push({
              id: `dynamic-quiz-${quiz.id}-not-taken`,
              userId,
              type: "course", // Map to existing notification type
              title: "Quiz Available",
              message: `"${quiz.title}" for ${course.title} is available to take`,
              read: false,
              createdAt: new Date().toISOString(),
              href: `/courses/${course.slug}?module=${module.id}&lesson=${quiz.id}`,
              metadata: {
                courseId: course.id,
                itemId: quiz.id,
                quizId: quiz.id
              }
            })
          }
        })
      })
    })

    // Generate class notifications
    classes.forEach((classItem: any) => {
      if (!classItem.start_date) return

      const startDate = parseISO(classItem.start_date)

      // Class starting soon (within 3 days)
      if (
        startDate > now &&
        startDate < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      ) {
        dynamicNotifications.push({
          id: `dynamic-class-${classItem.id}-starting-soon`,
          userId,
          type: "course", // Map to existing notification type
          title: "Class Starting Soon",
          message: `"${classItem.name || classItem.courseTitle}" starts on ${format(startDate, 'PPP')}`,
          read: false,
          createdAt: new Date().toISOString(),
          href: `/classes/${classItem.id}`,
          metadata: {
            classId: classItem.id
          }
        })
      }
    })

    return dynamicNotifications
  }, [courses, classes])

  // Combine API notifications with dynamic notifications
  useEffect(() => {
    // Always generate dynamic notifications when the component mounts
    // or when courses/classes/API notifications change
    const dynamicNotifications = generateDynamicNotifications()

    // Combine API notifications with dynamic notifications
    const combined = [...apiNotifications, ...dynamicNotifications]

    // Sort by date (newest first)
    combined.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    setAllNotifications(combined)
    hasGeneratedNotifications.current = true
  }, [apiNotifications, generateDynamicNotifications])

  // Debug effect to log state
  useEffect(() => {
    console.log('Notification Center State:', {
      status,
      apiNotificationsCount: apiNotifications.length,
      allNotificationsCount: allNotifications.length,
      open
    })
  }, [status, apiNotifications.length, allNotifications.length, open])

  // Calculate total unread count
  const unreadCount = allNotifications.filter(notification => !notification.read).length

  // Filter notifications by type
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'assignments':
        return allNotifications.filter(notification => notification.type === 'assignment')
      case 'announcements':
        return allNotifications.filter(notification => notification.type === 'announcement')
      case 'grades':
        return allNotifications.filter(notification => notification.type === 'grade')
      case 'courses':
        return allNotifications.filter(notification => notification.type === 'course')
      case 'messages':
        return allNotifications.filter(notification => notification.type === 'message')
      case 'payments':
        return allNotifications.filter(notification => notification.type === 'payment')
      case 'system':
        return allNotifications.filter(notification => notification.type === 'system')
      case 'all':
      default:
        return allNotifications
    }
  }

  // Mark notification as read
  const handleMarkAsRead = (id: string) => {
    // Check if it's a dynamic notification (starts with 'dynamic-')
    if (id.startsWith('dynamic-')) {
      setAllNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      )
    } else {
      // It's an API notification, use the Redux action
      dispatch(markNotificationAsRead({ notificationId: id }))
    }
  }

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    // Mark API notifications as read
    dispatch(markAllNotificationsAsRead({ userId: 'current' }))

    // Mark dynamic notifications as read
    setAllNotifications(prev =>
      prev.map(notification =>
        notification.id.startsWith('dynamic-')
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'assignment':
        return <FileText className="h-4 w-4" />
      case 'grade':
        return <BarChart3 className="h-4 w-4" />
      case 'course':
        return <GraduationCap className="h-4 w-4" />
      case 'announcement':
        return <Megaphone className="h-4 w-4" />
      case 'message':
        return <MessageSquare className="h-4 w-4" />
      case 'payment':
        return <CreditCard className="h-4 w-4" />
      case 'system':
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  // Get context-specific icon for dynamic notifications
  const getDynamicNotificationIcon = (notification: Notification) => {
    // Check metadata for specific context
    if (notification.id.startsWith('dynamic-assignment')) {
      if (notification.id.includes('overdue')) {
        return <AlertCircle className="h-4 w-4 text-red-500" />
      } else if (notification.id.includes('due-soon')) {
        return <Clock className="h-4 w-4 text-amber-500" />
      }
      return <FileText className="h-4 w-4" />
    }

    if (notification.id.startsWith('dynamic-quiz')) {
      return <BookOpen className="h-4 w-4" />
    }

    if (notification.id.startsWith('dynamic-class')) {
      return <Calendar className="h-4 w-4" />
    }

    // Fall back to standard icon
    return getNotificationIcon(notification.type)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground",
                unreadCount > 0 && "glow-border"
              )}
              variant="default"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side='right' className="w-[400px] flex flex-col gap-0 rounded-l-3xl border-0 bg-background/65 backdrop-blur-md h-full border-none">
        <SheetHeader className="p-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs h-8"
                >
                  Mark all as read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (!rateLimited) {
                    setLastFetchAttempt(Date.now())
                    dispatch(fetchNotifications({ limit: 20 }))
                  }
                }}
                disabled={status === 'loading' || rateLimited}
                title={rateLimited ? "Rate limited. Please wait." : "Refresh notifications"}
              >
                <Loader2 className={cn(
                  "h-4 w-4",
                  status === 'loading' ? "animate-spin" : "",
                  rateLimited ? "text-amber-500" : ""
                )} />
              </Button>
              <Button variant="ghost" size="icon" asChild className='mr-8'>
                <Link href="/settings?id=notifications">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="relative w-full overflow-hidden">
              <ScrollArea className="w-full">
                <div className="flex p-1 w-max min-w-full">
                  <TabsList className="flex gap-1 h-9">
                    <TabsTrigger value="all" className="px-3">All</TabsTrigger>
                    <TabsTrigger value="assignments" className="px-3">Assignments</TabsTrigger>
                    <TabsTrigger value="announcements" className="px-3">Announcements</TabsTrigger>
                    <TabsTrigger value="grades" className="px-3">Grades</TabsTrigger>
                    <TabsTrigger value="courses" className="px-3">Courses</TabsTrigger>
                    <TabsTrigger value="messages" className="px-3">Messages</TabsTrigger>
                    <TabsTrigger value="payments" className="px-3">Payments</TabsTrigger>
                    <TabsTrigger value="system" className="px-3">System</TabsTrigger>
                  </TabsList>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
          </Tabs>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-100px)]">
          <div className="pb-8">
            {
              status === 'loading' && allNotifications.length === 0 && apiNotifications.length === 0 ?
                (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Loading notifications...</p>
                  </div>
                ) : status === 'failed' && apiNotifications.length === 0 && !errorDismissed ?
                  (
                    <div className="flex flex-col items-center justify-center py-6 mb-4 bg-muted/30 rounded-lg mx-4 border border-muted">
                      <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                      <p className="text-muted-foreground mb-2 text-center px-4">
                        {rateLimited
                          ? "Too many requests. Please wait a moment."
                          : "Failed to load notifications from server."}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!rateLimited) {
                              setLastFetchAttempt(Date.now())
                              dispatch(fetchNotifications({ limit: 20 }))
                            }
                          }}
                          disabled={rateLimited}
                        >
                          {rateLimited
                            ? "Please wait..."
                            : "Try Again"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setErrorDismissed(true)}
                        >
                          Show Dynamic Notifications
                        </Button>
                      </div>
                    </div>
                  ) : null}

            {getFilteredNotifications().length > 0 ? (
              <div className="p-4 space-y-4">
                {getFilteredNotifications().map(notification => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 border rounded-lg transition-all hover:shadow-sm backdrop-blur-sm",
                      !notification.read ? "bg-muted/25 border-primary/20" : "bg-background/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "mt-0.5 p-1.5 rounded-md",
                          !notification.read ? "bg-primary/10" : "bg-muted"
                        )}>
                          {notification.id.startsWith('dynamic-')
                            ? getDynamicNotificationIcon(notification)
                            : getNotificationIcon(notification.type)
                          }
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            {!notification.read && (
                              <Badge variant="default" className="h-1.5 w-1.5 p-0 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
                            </p>
                            {notification.id.startsWith('dynamic-') && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">Dynamic</Badge>
                            )}
                            {notification.type === 'assignment' && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-blue-50 text-blue-600 border-blue-200">Assignment</Badge>
                            )}
                            {notification.type === 'grade' && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-green-50 text-green-600 border-green-200">Grade</Badge>
                            )}
                            {notification.type === 'payment' && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-amber-50 text-amber-600 border-amber-200">Payment</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {notification.href && (
                      <div className="mt-2 ml-9">
                        <SheetClose asChild>
                          <DyraneButton
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            asChild
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Link href={notification.href}>
                              View Details
                            </Link>
                          </DyraneButton>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No notifications to display</p>
                {status === 'failed' && errorDismissed && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      Note: Server notifications couldn't be loaded.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setErrorDismissed(false)
                        if (!rateLimited) {
                          setLastFetchAttempt(Date.now())
                          dispatch(fetchNotifications({ limit: 20 }))
                        }
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        {/* Footer content can be added here if needed in the future */}
      </SheetContent>
    </Sheet>
  )
}
