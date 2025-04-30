"use client"

import { motion } from "framer-motion"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Calendar } from "lucide-react"
import { useAppSelector } from "@/store/hooks"

// Mock events data - in a real app, this would come from an API
const mockEvents = [
    {
        id: 1,
        title: "Mathematics Quiz",
        datetime: "Today, 2:00 PM - 3:00 PM",
        type: "quiz",
    },
    {
        id: 2,
        title: "Physics Lab Session",
        datetime: "Tomorrow, 10:00 AM - 12:00 PM",
        type: "lab",
    },
    {
        id: 3,
        title: "History Assignment Due",
        datetime: "Friday, 11:59 PM",
        type: "assignment",
    },
    {
        id: 4,
        title: "Group Project Meeting",
        datetime: "Saturday, 3:00 PM - 5:00 PM",
        type: "meeting",
    },
]

export function UpcomingEvents() {
    const { user } = useAppSelector((state) => state.auth)

    if (!user) return null

    // Animation variants
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
                                    {user.role === "student"
                                        ? event.type === "assignment"
                                            ? "Submit"
                                            : "Join"
                                        : event.type === "assignment"
                                            ? "Review"
                                            : "Manage"}
                                </DyraneButton>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </CardContent>
        </DyraneCard>
    )
}
