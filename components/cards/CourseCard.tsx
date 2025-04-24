"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Users, Star, CheckCircle } from "lucide-react"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { useCurrencyConversion } from "@/hooks/use-currency-conversion"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Course } from "@/data/mock-course-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CourseCardProps {
    course: Course
    className?: string
    onClick?: () => void
    isModal?: boolean
}

export function CourseCard({ course, className, onClick, isModal = false }: CourseCardProps) {
    const {
        isLoading: isRateLoading,
        convert,
        formatTargetCurrency,
        formatBaseCurrency,
    } = useCurrencyConversion("USD", "NGN")
    const [showDetails, setShowDetails] = React.useState(false)

    const nairaAmount = convert(course.priceUSD)
    const discountedNairaAmount = course.discountPriceUSD ? convert(course.discountPriceUSD) : null

    const renderNairaPrice = (amount: number | null) => {
        if (isRateLoading) return <Skeleton className="h-4 w-16 inline-block" />
        if (amount === null) return null
        return formatTargetCurrency(amount)
    }

    const levelBadgeColor = (level?: string) => {
        switch (level) {
            case "Beginner":
                return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50 dark:border-green-700/50"
            case "Intermediate":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300/50 dark:border-yellow-700/50"
            case "Advanced":
                return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300/50 dark:border-red-700/50"
            default:
                return "bg-muted text-muted-foreground border-border"
        }
    }

    // Determine price to display (discount or regular)
    const displayPriceUSD = course.discountPriceUSD ?? course.priceUSD
    const displayNairaAmount = discountedNairaAmount ?? nairaAmount

    // If this is a modal view, show the detailed version
    if (isModal) {
        return (
            <div className="max-h-[80vh] overflow-y-auto">
                <div className="relative aspect-video w-full">
                    <Image
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {course.level && (
                        <Badge
                            variant="outline"
                            className={cn("absolute top-4 right-4 backdrop-blur-sm bg-background/70", levelBadgeColor(course.level))}
                        >
                            {course.level}
                        </Badge>
                    )}
                    {course.discountPriceUSD && (
                        <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                            -{Math.round(((course.priceUSD - course.discountPriceUSD) / course.priceUSD) * 100)}%
                        </Badge>
                    )}
                </div>

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                    {course.subtitle && <p className="text-muted-foreground mb-4">{course.subtitle}</p>}

                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{course.studentsEnrolled.toLocaleString()} students</span>
                        </div>
                        {course.rating && (
                            <div className="flex items-center text-amber-500">
                                <Star className="h-4 w-4 mr-1 fill-current" />
                                <span>{course.rating.toFixed(1)}</span>
                                {course.reviewsCount && <span className="text-muted-foreground ml-1">({course.reviewsCount})</span>}
                            </div>
                        )}
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                            <TabsTrigger value="instructor">Instructor</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-muted-foreground">{course.description}</p>
                            </div>

                            {course.learningOutcomes && (
                                <div>
                                    <h3 className="font-semibold mb-2">What You'll Learn</h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {course.learningOutcomes.map((outcome, index) => (
                                            <li key={index} className="flex items-start">
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                                                <span>{outcome}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {course.prerequisites && (
                                <div>
                                    <h3 className="font-semibold mb-2">Prerequisites</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {course.prerequisites.map((prereq, index) => (
                                            <li key={index}>{prereq}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="curriculum">
                            {course.modules ? (
                                <div className="space-y-3">
                                    {course.modules.map((module, index) => (
                                        <div key={index} className="p-3 border rounded-md">
                                            <div className="flex justify-between">
                                                <h4 className="font-medium">{module.title}</h4>
                                                <span className="text-sm text-muted-foreground">{module.duration}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Curriculum details will be available soon.</p>
                            )}
                        </TabsContent>

                        <TabsContent value="instructor">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                    {course.instructor.avatar ? (
                                        <Image
                                            src={course.instructor.avatar || "/placeholder.svg"}
                                            alt={course.instructor.name}
                                            width={64}
                                            height={64}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{course.instructor.name}</h3>
                                    {course.instructor.title && (
                                        <p className="text-sm text-muted-foreground">{course.instructor.title}</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="p-6 border-t flex justify-between items-center">
                    <div>
                        {course.discountPriceUSD && (
                            <span className="text-sm text-muted-foreground line-through mr-2">
                                {formatBaseCurrency(course.priceUSD)}
                            </span>
                        )}
                        <span className="text-xl font-bold text-primary">{formatBaseCurrency(displayPriceUSD)}</span>
                        <div className="text-sm text-muted-foreground">{renderNairaPrice(displayNairaAmount)}</div>
                    </div>

                    <DyraneButton asChild>
                        <Link href={`/courses/${course.slug}/enroll`}>Enroll Now</Link>
                    </DyraneButton>
                </div>
            </div>
        )
    }

    // Regular card view (compact)
    return (
        <motion.div
            className={cn(
                "flex flex-col h-full rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden",
                className,
            )}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : "default" }}
        >
            <div className="relative h-48">
                <Image
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {course.level && (
                    <Badge
                        variant="outline"
                        className={cn("absolute top-2 right-2 backdrop-blur-sm bg-background/70", levelBadgeColor(course.level))}
                    >
                        {course.level}
                    </Badge>
                )}
                {course.discountPriceUSD && (
                    <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                        -{Math.round(((course.priceUSD - course.discountPriceUSD) / course.priceUSD) * 100)}%
                    </Badge>
                )}
            </div>

            <div className="flex flex-col flex-1 p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>

                <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="mr-3">{course.duration}</span>
                    <Users className="h-4 w-4 mr-1" />
                    <span>{course.studentsEnrolled.toLocaleString()}</span>
                    {course.rating && (
                        <div className="ml-auto flex items-center text-amber-500">
                            <Star className="h-4 w-4 mr-1 fill-current" />
                            <span>{course.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t flex justify-between items-center">
                    <div>
                        {course.discountPriceUSD && (
                            <div className="text-xs text-muted-foreground line-through">{formatBaseCurrency(course.priceUSD)}</div>
                        )}
                        <div className="font-bold text-primary">{formatBaseCurrency(displayPriceUSD)}</div>
                        <div className="text-xs text-muted-foreground">{renderNairaPrice(displayNairaAmount)}</div>
                    </div>

                    {!onClick && (
                        <DyraneButton size="sm" variant="outline" asChild onClick={(e) => e.stopPropagation()}>
                            <Link href={`/courses/${course.slug}`}>View</Link>
                        </DyraneButton>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
