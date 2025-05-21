"use client"

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  FileText, 
  GraduationCap, 
  BarChart3,
  Calendar,
  X,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isAfter, isBefore, parseISO, addDays } from 'date-fns'
import { selectAuthCourses } from '@/features/auth-course/store/auth-course-slice'
import { selectMyClasses } from '@/features/classes/store/classes-slice'
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button'
import Link from 'next/link'
import { ScrollArea } from '@/components/ui/scroll-area'

// Types for notifications
type NotificationType = 'assignment' | 'quiz' | 'grade' | 'class' | 'system'
type NotificationStatus = 'unread' | 'read'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  date: string
  status: NotificationStatus
  link?: string
  courseId?: string
  classId?: string
  itemId?: string
}

export function NotificationCenter() {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  // Get courses and classes from Redux store
  const courses = useAppSelector(selectAuthCourses)
  const classes = useAppSelector(selectMyClasses)
  
  // Generate notifications based on courses and classes
  useEffect(() => {
    if (courses.length === 0 && classes.length === 0) return
    
    const generatedNotifications: Notification[] = []
    const now = new Date()
    
    // Generate assignment notifications
    courses.forEach(course => {
      // This is a simplified implementation
      // In a real app, you would get assignments from the Redux store
      const assignments = course.assignments || []
      
      assignments.forEach(assignment => {
        const dueDate = parseISO(assignment.dueDate)
        
        // Assignment due soon (within 3 days)
        if (isAfter(dueDate, now) && isBefore(dueDate, addDays(now, 3))) {
          generatedNotifications.push({
            id: `assignment-${assignment.id}-due-soon`,
            type: 'assignment',
            title: 'Assignment Due Soon',
            message: `"${assignment.title}" for ${course.title} is due on ${format(dueDate, 'PPP')}`,
            date: new Date().toISOString(),
            status: 'unread',
            link: `/assignments/${assignment.id}`,
            courseId: course.id,
            itemId: assignment.id
          })
        }
        
        // Assignment overdue
        if (isBefore(dueDate, now) && !assignment.submitted) {
          generatedNotifications.push({
            id: `assignment-${assignment.id}-overdue`,
            type: 'assignment',
            title: 'Assignment Overdue',
            message: `"${assignment.title}" for ${course.title} was due on ${format(dueDate, 'PPP')}`,
            date: new Date().toISOString(),
            status: 'unread',
            link: `/assignments/${assignment.id}`,
            courseId: course.id,
            itemId: assignment.id
          })
        }
      })
      
      // Generate quiz notifications
      course.modules?.forEach(module => {
        const quizzes = module.lessons?.filter(lesson => lesson.type === 'quiz') || []
        
        quizzes.forEach(quiz => {
          // Quiz not taken yet
          if (!course.quizScores || !(quiz.id in course.quizScores)) {
            generatedNotifications.push({
              id: `quiz-${quiz.id}-not-taken`,
              type: 'quiz',
              title: 'Quiz Available',
              message: `"${quiz.title}" for ${course.title} is available to take`,
              date: new Date().toISOString(),
              status: 'unread',
              link: `/courses/${course.slug}?module=${module.id}&lesson=${quiz.id}`,
              courseId: course.id,
              itemId: quiz.id
            })
          }
        })
      })
    })
    
    // Generate class notifications
    classes.forEach(classItem => {
      const startDate = classItem.start_date ? parseISO(classItem.start_date) : null
      
      // Class starting soon (within 3 days)
      if (startDate && isAfter(startDate, now) && isBefore(startDate, addDays(now, 3))) {
        generatedNotifications.push({
          id: `class-${classItem.id}-starting-soon`,
          type: 'class',
          title: 'Class Starting Soon',
          message: `"${classItem.name || classItem.courseTitle}" starts on ${format(startDate, 'PPP')}`,
          date: new Date().toISOString(),
          status: 'unread',
          link: `/classes/${classItem.id}`,
          classId: classItem.id
        })
      }
    })
    
    // Add some system notifications
    generatedNotifications.push({
      id: 'system-welcome',
      type: 'system',
      title: 'Welcome to 1Tech Academy',
      message: 'Thank you for joining our platform. Start exploring courses and enhance your skills!',
      date: new Date().toISOString(),
      status: 'unread'
    })
    
    // Sort notifications by date (newest first)
    generatedNotifications.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    setNotifications(generatedNotifications)
  }, [courses, classes])
  
  // Get unread notifications count
  const unreadCount = notifications.filter(notification => notification.status === 'unread').length
  
  // Filter notifications by type
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'assignments':
        return notifications.filter(notification => notification.type === 'assignment')
      case 'quizzes':
        return notifications.filter(notification => notification.type === 'quiz')
      case 'grades':
        return notifications.filter(notification => notification.type === 'grade')
      case 'classes':
        return notifications.filter(notification => notification.type === 'class')
      case 'system':
        return notifications.filter(notification => notification.type === 'system')
      case 'all':
      default:
        return notifications
    }
  }
  
  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, status: 'read' } 
          : notification
      )
    )
  }
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, status: 'read' }))
    )
  }
  
  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'assignment':
        return <FileText className="h-4 w-4" />
      case 'quiz':
        return <GraduationCap className="h-4 w-4" />
      case 'grade':
        return <BarChart3 className="h-4 w-4" />
      case 'class':
        return <Calendar className="h-4 w-4" />
      case 'system':
        return <Bell className="h-4 w-4" />
    }
  }
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground"
              variant="default"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs h-8"
                >
                  Mark all as read
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/settings/notifications">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="grades">Grades</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
          </Tabs>
        </SheetHeader>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {getFilteredNotifications().length > 0 ? (
              getFilteredNotifications().map(notification => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-3 border rounded-lg",
                    notification.status === 'unread' ? "bg-muted/50 border-primary/20" : "bg-background"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 p-1.5 rounded-md",
                        notification.status === 'unread' ? "bg-primary/10" : "bg-muted"
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {notification.status === 'unread' && (
                            <Badge variant="default" className="h-1.5 w-1.5 p-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(notification.date), 'PPp')}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {notification.link && (
                    <div className="mt-2 ml-9">
                      <SheetClose asChild>
                        <DyraneButton 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-7" 
                          asChild
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Link href={notification.link}>
                            View Details
                          </Link>
                        </DyraneButton>
                      </SheetClose>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No notifications to display</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <SheetFooter className="p-4 border-t">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
