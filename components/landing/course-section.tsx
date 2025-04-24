"use client"

import { useRef, useState } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { CourseCard } from "@/components/cards/CourseCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { AlertCircle } from "lucide-react"
import { MotionTokens } from "@/lib/motion.tokens"
import { useCurrencyConversion } from "@/hooks/use-currency-conversion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { mockCourseData, courseCategories, featuredCourses, type Course } from "@/data/mock-course-data"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export function CoursesSection() {
    const featuredRef = useRef(null)
    const categoryRef = useRef(null)
    const featuredInView = useInView(featuredRef, { once: true, margin: "-100px 0px" })
    const categoryInView = useInView(categoryRef, { once: true, margin: "-150px 0px" })

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Fetch currency rate once for the entire section
    const { isLoading: isRateLoading, error: rateError } = useCurrencyConversion("USD", "NGN")

    const handleViewCourse = (course: Course) => {
        setSelectedCourse(course)
        setIsModalOpen(true)
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: MotionTokens.ease.easeOut },
        },
    }

    // Group courses by category
    const coursesByCategory = mockCourseData.reduce(
        (acc, course) => {
            ; (acc[course.category] = acc[course.category] || []).push(course)
            return acc
        },
        {} as Record<string, Course[]>,
    )

    return (
        <div className="space-y-16">
            {/* Error Display for Currency Rate */}
            {rateError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Currency Error</AlertTitle>
                    <AlertDescription>
                        Could not load current exchange rates. Prices in Naira may be unavailable.
                    </AlertDescription>
                </Alert>
            )}

            {/* Featured Courses Section */}
            <motion.div
                ref={featuredRef}
                initial="hidden"
                variants={containerVariants}
                animate={featuredInView ? "visible" : "hidden"}
                className="mb-16"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredCourses.map((course) => (
                        <motion.div key={`featured-${course.id}`} variants={itemVariants}>
                            <CourseCard course={course} onClick={() => handleViewCourse(course)} />
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* All Courses by Category Section */}
            <motion.div
                ref={categoryRef}
                variants={containerVariants}
                initial="hidden"
                animate={categoryInView ? "visible" : "hidden"}
            >
                <Tabs defaultValue={courseCategories[0]} className="w-full">
                    <ScrollArea className="w-full whitespace-nowrap pb-4">
                        <TabsList className="inline-flex h-auto w-full justify-start">
                            {courseCategories.map((category) => (
                                <TabsTrigger key={category} value={category} className="px-4 py-2">
                                    {category}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    {courseCategories.map((category) => (
                        <TabsContent key={category} value={category} className="mt-6">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {coursesByCategory[category]?.map((course) => (
                                    <motion.div key={course.id} variants={itemVariants}>
                                        <CourseCard course={course} onClick={() => handleViewCourse(course)} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </TabsContent>
                    ))}
                </Tabs>
            </motion.div>

            {/* Course Detail Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden">
                    <DialogTitle>
                        <VisuallyHidden>Course Detail Modal</VisuallyHidden>
                    </DialogTitle>
                    {/* AnimatePresence for smooth transition if selectedCourse changes */}
                    <AnimatePresence mode="wait">
                        {selectedCourse && (
                            <motion.div
                                key={selectedCourse.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <CourseCard course={selectedCourse} isModal={true} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </div>
    )
}
