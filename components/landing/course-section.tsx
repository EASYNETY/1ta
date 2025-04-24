// src/components/sections/CoursesSection.tsx
"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { CourseCard } from "@/components/cards/CourseCard";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // Import Dialog for modal
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // For horizontal scroll on tabs if needed
import { AlertCircle, Loader2 } from "lucide-react"; // Icons
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { MotionTokens } from "@/lib/motion.tokens";
import { useCurrencyConversion } from "@/hooks/use-currency-conversion"; // Import hook globally here
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For error display
import {
    mockCourseData, // Import full data
    courseCategories, // Import categories
    featuredCourses, // Import featured courses
    Course // Import type
} from "@/data/mock-course-data";
import { cn } from "@/lib/utils";
import { SectionHeader } from "../layout/section-header";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


export function CoursesSection() {
    const featuredRef = useRef(null);
    const categoryRef = useRef(null);
    const featuredInView = useInView(featuredRef, { once: true, margin: "-100px 0px" });
    const categoryInView = useInView(categoryRef, { once: true, margin: "-150px 0px" });

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch currency rate once for the entire section
    const { isLoading: isRateLoading, error: rateError, formatTargetCurrency } = useCurrencyConversion('USD', 'NGN');

    const handleViewCourse = (course: Course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const renderNairaPrice = (amount: number | null) => {
        if (isRateLoading) return <Skeleton className="h-4 w-16 inline-block" />;
        if (amount === null) return <span className="text-muted-foreground/80"></span>; // Show nothing if no rate/discount
        return formatTargetCurrency(amount);
    };


    // Animation variants
    const containerVariants = { /* ... same as before ... */
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }, // Slightly faster stagger
        },
    };
    const itemVariants = { /* ... same as before ... */
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: MotionTokens.ease.easeOut }, // Faster duration
        },
    };

    // Group courses by category
    const coursesByCategory = mockCourseData.reduce((acc, course) => {
        (acc[course.category] = acc[course.category] || []).push(course);
        return acc;
    }, {} as Record<string, Course[]>);


    return (
        <section className="py-16 md:py-24 space-y-16 md:space-y-20"> {/* Increased spacing */}

            {/* --- Error Display for Currency Rate --- */}
            {rateError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Currency Error</AlertTitle>
                    <AlertDescription>
                        Could not load current exchange rates. Prices in Naira may be unavailable.
                    </AlertDescription>
                </Alert>
            )}

            {/* --- Featured Courses Section --- */}
            <motion.div
                ref={featuredRef}
                initial="hidden"
                variants={containerVariants} // Reuse container variant
                animate={featuredInView ? "visible" : "hidden"}
            >
                <SectionHeader
                    title="Featured Courses"
                    description="Get started with our most popular and highly-rated programs."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {/* Show only first 3 or 6 featured courses */}
                    {featuredCourses.slice(0, 4).map((course) => (
                        <motion.div key={`featured-${course.id}`} variants={itemVariants} className="flex">
                            {/* Pass rate loading state to card if needed, or rely on hook */}
                            <CourseCard course={course} onClick={() => handleViewCourse(course)} />
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* --- All Courses by Category Section --- */}
            <motion.div
                ref={categoryRef}
                variants={containerVariants} // Reuse container variant
                initial="hidden"
                animate={categoryInView ? "visible" : "hidden"}
            >
                <SectionHeader
                    title="Explore by Category"
                    description="Find the perfect course within your area of interest."
                />
                <Tabs defaultValue={courseCategories[0]} className="w-full">
                    {/* Optional: Wrap TabsList in ScrollArea for many categories */}
                    <ScrollArea className="w-full whitespace-nowrap pb-4">
                        <TabsList className="inline-flex h-auto w-full">
                            {courseCategories.map((category) => (
                                <TabsTrigger key={category} value={category} className="text-xs sm:text-sm px-3 py-1.5 h-auto">
                                    {category}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    {courseCategories.map((category) => (
                        <TabsContent key={category} value={category} className="mt-8">
                            <motion.ul // Animate the list itself
                                variants={containerVariants} // Reuse container variant for stagger
                                initial="hidden"
                                animate="visible" // Animate when tab becomes active
                                // Use list for semantic correctness
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4" // List view grid
                            >
                                {coursesByCategory[category]?.map((course) => (
                                    <motion.li key={course.id} variants={itemVariants} className="flex">
                                        {/* Simplified List Item View - Trigger for Modal */}
                                        <button
                                            onClick={() => handleViewCourse(course)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-md transition-colors hover:bg-muted/80 dark:hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center gap-3 group",
                                                // Add subtle border? border border-transparent hover:border-border/50
                                            )}
                                        >
                                            {/* Small Image */}
                                            <div className="relative w-12 h-10 rounded overflow-hidden flex-shrink-0">
                                                <Image src={course.image || '/placeholder-image.svg'} alt="" fill className="object-cover" />
                                            </div>
                                            {/* Text */}
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                                                    {course.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {course.instructor.name} · {course.duration}
                                                </p>
                                            </div>
                                            {/* Price */}
                                            <div className="flex flex-col text-right ml-auto pl-2">
                                                <span className="text-sm font-medium text-primary whitespace-nowrap">
                                                    {useCurrencyConversion().formatBaseCurrency(course.discountPriceUSD ?? course.priceUSD)}
                                                </span>
                                                <span className="text-xs text-muted-foreground h-4 whitespace-nowrap">
                                                    {renderNairaPrice((course.discountPriceUSD ?? course.priceUSD))}
                                                </span>
                                            </div>
                                        </button>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </TabsContent>
                    ))}
                </Tabs>
            </motion.div>

            {/* --- Course Detail Modal --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden">
                    <DialogTitle>
                        <VisuallyHidden>Course Detail Modal</VisuallyHidden>
                    </DialogTitle>
                    {/* AnimatePresence for smooth transition if selectedCourse changes */}
                    <AnimatePresence mode="wait">
                        {selectedCourse && (
                            <motion.div
                                key={selectedCourse.id} // Key for AnimatePresence
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Render the FULL CourseCard inside the modal */}
                                <CourseCard course={selectedCourse} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </section>
    );
}