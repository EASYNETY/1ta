"use client"

import { motion } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Calendar } from "lucide-react"
import { useAppSelector } from "@/store/hooks"

// Tech-course-based events
const mockEvents = [
    {
        id: 1,
        title: "React Workshop",
        datetime: "Today, 4:00 PM - 6:00 PM",
        type: "workshop",
    },
    {
        id: 2,
        title: "Backend API Assessment",
        datetime: "Tomorrow, 1:00 PM - 2:30 PM",
        type: "assessment",
    },
    {
        id: 3,
        title: "DevOps Lab",
        datetime: "Friday, 10:00 AM - 12:00 PM",
        type: "lab",
    },
    {
        id: 4,
        title: "UI/UX Group Review",
        datetime: "Saturday, 3:00 PM - 4:00 PM",
        type: "meeting",
    },
]

// Role-based action labels
const roleBasedActions: Record<string, Record<string, string>> = {
    student: {
        workshop: "Join",
        assessment: "Attempt",
        lab: "Attend",
        meeting: "Join",
    },
    teacher: {
        workshop: "Host",
        assessment: "Grade",
        lab: "Lead",
        meeting: "Moderate",
    },
    staff: {
        workshop: "Assist",
        assessment: "Support",
        lab: "Setup",
        meeting: "Coordinate",
    },
    admin: {
        workshop: "Manage",
        assessment: "Oversee",
        lab: "Audit",
        meeting: "Review",
    },
}

export function UpcomingEvents() {
    const { user } = useAppSelector((state) => state.auth)

    if (!user) return null

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
    }

    const getActionLabel = (role: string, type: string) =>
        roleBasedActions[role]?.[type] ?? "View"

    return (
        <DyraneCard>
            <CardHeader>
                <CardTitle>Upcoming Schedule</CardTitle>
            </CardHeader>
            <CardContent>
                <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                    {mockEvents.map((event) => (
                        <motion.div
                            key={event.id}
                            className="flex items-start space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                            variants={item}
                        >
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div className="space-y-1 flex-grow">
                                <p className="font-medium">{event.title}</p>
                                <p className="text-sm text-muted-foreground">{event.datetime}</p>
                            </div>
                            <div className="ml-auto">
                                <DyraneButton variant="outline" size="sm">
                                    {getActionLabel(user.role, event.type)}
                                </DyraneButton>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </CardContent>
        </DyraneCard>
    )
}
