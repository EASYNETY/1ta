// components/landing/public-course-section.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PublicCourseCard } from "@/components/cards/PublicCourseCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { AlertCircle } from "lucide-react"
import { MotionTokens } from "@/lib/motion.tokens"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
// --- Import Redux hooks and selectors ---
import { useAppSelector } from "@/store/hooks"
import {
    selectAllCourses,
    selectCoursesByCategory,
    selectCourseCategories,
    selectCoursesStatus,
    selectCoursesError,
} from "@/features/public-course/store/public-course-slice"
import { SectionHeader } from "../layout/section-header"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import { PublicCourse } from "@/features/public-course/types/public-course-interface"

export function CoursesSection() {
    const featuredRef = useRef(null)
    const categoryRef = useRef(null)

    // --- Redux State Access ---
    const allCourses = useAppSelector(selectAllCourses)
    const coursesByCategory = useAppSelector(selectCoursesByCategory)
    const courseCategories = useAppSelector(selectCourseCategories)
    const coursesStatus = useAppSelector(selectCoursesStatus)
    const coursesError = useAppSelector(selectCoursesError)

    // --- Local UI State ---
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null) // Initialize as null
    const [selectedCourse, setSelectedCourse] = useState<PublicCourse | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // --- Set default category when categories load ---
    useEffect(() => {
        if (coursesStatus === "succeeded" && !selectedCategory && courseCategories.length > 0) {
            setSelectedCategory(courseCategories[0])
        }
    }, [coursesStatus, courseCategories, selectedCategory])

    const handleViewCourse = (course: PublicCourse) => {
        setSelectedCourse(course)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedCourse(null)
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

    // 1. Loading State
    if (coursesStatus === "loading" || coursesStatus === "idle") {
        // Use the same Skeleton structure as provided before
        return (
            <section className="container py-16 md:py-24 space-y-12">
                <SectionHeader
                    title="Explore Our Available Courses"
                    description="Unlock your potential with industry-leading tech courses taught by experts."
                />
                <div>
                    {" "}
                    <Skeleton className="h-8 w-48 mb-10 rounded-md" />{" "}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {" "}
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={`feat-skel-${i}`} className="h-[380px] rounded-xl" />
                        ))}{" "}
                    </div>{" "}
                </div>
                <div className="mt-16 space-y-8">
                    {" "}
                    <Skeleton className="h-8 w-64 mb-10 rounded-md" />{" "}
                    <Skeleton className="h-12 w-full max-w-xl mb-4 rounded-md" />{" "}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
                        {" "}
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={`cat-skel-${i}`} className="h-20 rounded-lg" />
                        ))}{" "}
                    </div>{" "}
                </div>
            </section>
        )
    }

    // 2. Error State
    if (coursesStatus === "failed") {
        return (
            <section className="container py-16 md:py-24">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Courses</AlertTitle>
                    <AlertDescription>
                        {coursesError || "Could not load course data. Please try refreshing the page."}
                    </AlertDescription>
                </Alert>
            </section>
        )
    }

    // 3. No Data Success State
    if (coursesStatus === "succeeded" && allCourses.length === 0) {
        return (
            <section className="container py-16 md:py-24">
                <SectionHeader
                    title="Explore Our Available Courses"
                    description="Unlock your potential with industry-leading tech courses taught by experts."
                />
                <p className="text-center text-muted-foreground mt-10">No courses available at this time.</p>
            </section>
        )
    }

    // --- 4. Success State ---
    // Use featuredCourses, courseCategories, coursesByCategory from useAppSelector

    // Split courses into current and future based on category
    const currentCourses = allCourses.filter(course =>
        course.category === 'current' || course.category === 'Current' ||
        course.category === 'available' || course.category === 'Available'
    )
    const futureCourses = allCourses.filter(course =>
        course.category === 'future' || course.category === 'Future' ||
        course.category === 'upcoming' || course.category === 'Upcoming'
    )

    return (
        <div className="space-y-16 pb-16">
            {/* Current Courses Section */}
            {currentCourses.length > 0 && (
                <motion.div
                    ref={categoryRef}
                    variants={containerVariants}
                    initial="hidden"
                    animate={'visible'}
                >
                    <SectionHeader
                        title="Current Courses"
                        description="Courses currently available for enrolment"
                    />
                    {/* Mobile label for clarity */}
                    <div className="block md:hidden text-center text-primary font-semibold mb-2 text-base">Tap a course to view details</div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-6 pb-4"
                    >
                        {currentCourses.map((course, index) => (
                            <motion.div
                                key={`current-${course.id}-${index}`}
                                variants={itemVariants}
                                className="pb-2 cursor-pointer rounded-xl shadow-md border border-primary/10 bg-white dark:bg-slate-900 transition-transform duration-200 hover:scale-[1.03] active:scale-95 focus-within:ring-2 focus-within:ring-primary/40"
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleViewCourse(course)}
                                tabIndex={0}
                                role="button"
                                aria-label={`View details for ${course.title}`}
                            >
                                <PublicCourseCard course={course} onClick={() => handleViewCourse(course)} onClose={handleCloseModal} />
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            )}

            {/* Future Courses Section */}
            {futureCourses.length > 0 && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={'visible'}
                >
                    <SectionHeader
                        title="Future Courses"
                        description="Upcoming courses that will be available soon"
                    />
                    {/* Mobile label for clarity */}
                    <div className="block md:hidden text-center text-primary font-semibold mb-2 text-base">Tap a course to view details</div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-6 pb-4"
                    >
                        {futureCourses.map((course, index) => (
                            <motion.div
                                key={`future-${course.id}-${index}`}
                                variants={itemVariants}
                                className="pb-2 cursor-pointer rounded-xl shadow-md border border-primary/10 bg-white dark:bg-slate-900 transition-transform duration-200 hover:scale-[1.03] active:scale-95 focus-within:ring-2 focus-within:ring-primary/40"
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleViewCourse(course)}
                                tabIndex={0}
                                role="button"
                                aria-label={`View details for ${course.title}`}
                            >
                                <PublicCourseCard course={course} onClick={() => handleViewCourse(course)} onClose={handleCloseModal} />
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            )}

            {/* Fallback: Show all courses if no current/future categorization */}
            {currentCourses.length === 0 && futureCourses.length === 0 && allCourses.length > 0 && (
                <motion.div
                    ref={categoryRef}
                    variants={containerVariants}
                    initial="hidden"
                    animate={'visible'}
                >
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 pb-4" // Add pb-8 to grid
                    >
                        {allCourses.map((course, index) => (
                            <motion.div key={`all-${course.id}-${index}`} variants={itemVariants} className="pb-2"> {/* Add pb-2 to each card */}
                                <PublicCourseCard course={course} onClick={() => handleViewCourse(course)} onClose={handleCloseModal} />
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            )}

            {/* Commented out "Explore Our Category" section as requested
            {courseCategories.length > 0 && (
                <motion.div
                    ref={categoryRef}
                    variants={containerVariants}
                    initial="hidden"
                    animate={'visible'}
                >
                    <Badge variant="outline" className="flex p-2 justify-self-center mb-4 backdrop-blur-sm">
                        {selectedCategory} Courses
                    </Badge>
                    <SectionHeader
                        title="Explore Courses by Category"
                        description="Browse through our extensive library of courses tailored to your needs."
                    />
                    <Tabs value={selectedCategory ?? courseCategories[0]} onValueChange={setSelectedCategory} className="w-full">
                        <ScrollArea className="w-full whitespace-nowrap pb-4">
                            <TabsList className="inline-flex h-auto w-full justify-start">
                                {courseCategories.map((category) => (
                                    <TabsTrigger
                                        key={category}
                                        value={category}
                                        className="px-4 py-2 cursor-pointer transition-colors duration-200 ease-out hover:bg-background/35 hover:backdrop-blur-md rounded-md"
                                    >
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
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                >
                                    {coursesByCategory[category]?.map((course, index) => (
                                        <motion.div key={`${category}-${course.id}-${index}`} variants={itemVariants}>
                                            <PublicCourseCard course={course} onClick={() => handleViewCourse(course)} onClose={handleCloseModal} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </motion.div>
            )}
            */}

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
                                <PublicCourseCard course={selectedCourse} isModal={true} onClose={handleCloseModal} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </div>
    )
}
