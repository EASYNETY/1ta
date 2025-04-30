// components/dashboard/grades-tab.tsx

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { useAppSelector } from "@/store/hooks"
import { CalendarIcon, Clock, Video, Users, MapPin, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, isToday } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { UpcomingEvents } from "./upcoming-events"

// Mock schedule data
const mockSchedule = [
    {
        id: "1",
        title: "PMP Training Day 3",
        courseTitle: "PMP® Certification Training",
        startTime: "2023-12-20T09:00:00.000Z",
        endTime: "2023-12-20T13:00:00.000Z",
        type: "lecture", // lecture, lab, exam, office-hours
        location: "Virtual Classroom",
        instructor: "Dr. Sarah Johnson",
        meetingLink: "https://zoom.us/j/123456789",
        description: "Core concepts of project management and PMBOK framework",
    },
    {
        id: "2",
        title: "JavaScript Fundamentals",
        courseTitle: "Web Development Bootcamp",
        startTime: "2023-12-20T14:00:00.000Z",
        endTime: "2023-12-20T16:00:00.000Z",
        type: "lecture",
        location: "Room 301",
        instructor: "Michael Chen",
        description: "Introduction to JavaScript variables, functions, and control flow",
    },
    {
        id: "3",
        title: "Project Management Quiz",
        courseTitle: "PMP® Certification Training",
        startTime: "2023-12-21T10:00:00.000Z",
        endTime: "2023-12-21T11:00:00.000Z",
        type: "exam",
        location: "Virtual Classroom",
        instructor: "Dr. Sarah Johnson",
        meetingLink: "https://zoom.us/j/123456789",
        description: "Quiz covering project initiation and planning",
    },
    {
        id: "4",
        title: "Web Development Lab",
        courseTitle: "Web Development Bootcamp",
        startTime: "2023-12-22T13:00:00.000Z",
        endTime: "2023-12-22T15:00:00.000Z",
        type: "lab",
        location: "Computer Lab 2",
        instructor: "Michael Chen",
        description: "Hands-on practice with HTML, CSS, and JavaScript",
    },
    {
        id: "5",
        title: "Office Hours",
        courseTitle: "Web Development Bootcamp",
        startTime: "2023-12-22T16:00:00.000Z",
        endTime: "2023-12-22T17:00:00.000Z",
        type: "office-hours",
        location: "Room 305",
        instructor: "Michael Chen",
        description: "Drop-in session for questions and assistance",
    },
]

export function ScheduleTab() {
    const { user } = useAppSelector((state) => state.auth)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

    if (!user) return null

    // Format time
    const formatTime = (dateString: string) => {
        return format(new Date(dateString), "h:mm a")
    }

    // Get event type badge
    const getEventTypeBadge = (type: string) => {
        switch (type) {
            case "lecture":
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                        <BookOpen className="mr-1 h-3 w-3" />
                        Lecture
                    </Badge>
                )
            case "lab":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        <Users className="mr-1 h-3 w-3" />
                        Lab
                    </Badge>
                )
            case "exam":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                        <Clock className="mr-1 h-3 w-3" />
                        Exam
                    </Badge>
                )
            case "office-hours":
                return (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                        <Users className="mr-1 h-3 w-3" />
                        Office Hours
                    </Badge>
                )
            default:
                return null
        }
    }

    // Generate week days
    const weekDays = Array.from({ length: 7 }).map((_, index) => {
        return addDays(currentWeekStart, index)
    })

    // Filter events for the current week
    const weekEvents = mockSchedule.filter(event => {
        const eventDate = new Date(event.startTime)
        return eventDate >= currentWeekStart && eventDate < addDays(currentWeekStart, 7)
    })

    // Group events by day
    const eventsByDay = weekDays.map(day => {
        return {
            date: day,
            events: weekEvents.filter(event => isSameDay(new Date(event.startTime), day))
        }
    })

    // Navigate to previous week
    const goToPreviousWeek = () => {
        setCurrentWeekStart(subWeeks(currentWeekStart, 1))
    }

    // Navigate to next week
    const goToNextWeek = () => {
        setCurrentWeekStart(addWeeks(currentWeekStart, 1))
    }

    // Go to current week
    const goToCurrentWeek = () => {
        setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
    }

    return (
        <div className="space-y-6">
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    <span>
                        {format(currentWeekStart, "MMMM d")} - {format(addDays(currentWeekStart, 6), "MMMM d, yyyy")}
                    </span>
                </h2>
                <div className="flex items-center gap-2">
                    <DyraneButton variant="outline" size="sm" onClick={goToPreviousWeek}>
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </DyraneButton>
                    <DyraneButton variant="outline" size="sm" onClick={goToCurrentWeek}>
                        Today
                    </DyraneButton>
                    <DyraneButton variant="outline" size="sm" onClick={goToNextWeek}>
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </DyraneButton>
                </div>
            </div>

            {/* Weekly Calendar */}
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => (
                    <div
                        key={index}
                        className={cn(
                            "text-center p-2 rounded-md",
                            isToday(day) ? "bg-primary/10 font-medium" : ""
                        )}
                    >
                        <div className="text-sm font-medium">{format(day, "EEE")}</div>
                        <div className={cn(
                            "text-2xl",
                            isToday(day) ? "text-primary font-bold" : ""
                        )}>
                            {format(day, "d")}
                        </div>
                    </div>
                ))}
            </div>

            {/* Events List */}
            <div className="space-y-6">
                {eventsByDay.map((day, index) => (
                    <div key={index}>
                        {day.events.length > 0 && (
                            <>
                                <h3 className="text-md font-medium mb-3">
                                    {format(day.date, "EEEE, MMMM d")}
                                    {isToday(day.date) && <span className="ml-2 text-primary">(Today)</span>}
                                </h3>
                                <div className="space-y-3">
                                    {day.events.map(event => (
                                        <motion.div
                                            key={event.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="flex items-start gap-3 mb-3 sm:mb-0">
                                                <div className="bg-primary/10 p-2 rounded-md">
                                                    {event.type === "lecture" ? (
                                                        <Video className="h-5 w-5 text-primary" />
                                                    ) : event.type === "exam" ? (
                                                        <Clock className="h-5 w-5 text-primary" />
                                                    ) : (
                                                        <Users className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{event.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{event.courseTitle}</p>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        {getEventTypeBadge(event.type)}
                                                        <span className="text-xs text-muted-foreground flex items-center">
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground flex items-center">
                                                            <MapPin className="mr-1 h-3 w-3" />
                                                            {event.location}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                {event.meetingLink ? (
                                                    <DyraneButton
                                                        variant="outline"
                                                        size="sm"
                                                        className="whitespace-nowrap"
                                                        asChild
                                                    >
                                                        <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                                                            Join Meeting
                                                        </a>
                                                    </DyraneButton>
                                                ) : (
                                                    <DyraneButton
                                                        variant="outline"
                                                        size="sm"
                                                        className="whitespace-nowrap"
                                                        asChild
                                                    >
                                                        <Link href={`/courses/${event.courseTitle.toLowerCase().replace(/\s+/g, '-')}`}>
                                                            View Details
                                                        </Link>
                                                    </DyraneButton>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}

                <UpcomingEvents />
                {/* Schedule content would go here */}

                {weekEvents.length === 0 && (
                    <DyraneCard>
                        <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">No events scheduled for this week.</p>
                        </CardContent>
                    </DyraneCard>
                )}
            </div>
        </div>
    )
}
