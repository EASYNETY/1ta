"use client"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
// Removed motion import if not used directly for internal elements
import { Clock, Users, Star, UsersRound, CheckCircle } from "lucide-react" // Adjusted icons
import {
    DyraneCard, // Use the main DyraneCard component
    DyraneCardContent,
    DyraneCardFooter,
} from "@/components/dyrane-ui/dyrane-card" // Import DyraneCard and its parts
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { useCurrencyConversion } from "@/hooks/use-currency-conversion"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Keep Tabs for Modal view
import { cn } from "@/lib/utils"
import type { Course } from "@/data/mock-course-data"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addItem } from "@/features/cart/store/cart-slice"
import { useToast } from "@/hooks/use-toast"
import { AbstractBackground } from "../layout/abstract-background"
import { getCourseIcon } from "@/utils/course-icon-mapping"

interface CourseCardProps {
    course: Course
    className?: string
    onClick?: () => void // For triggering modal
    isModal?: boolean // To differentiate view
}

export function CourseCard({ course, className, onClick, isModal = false }: CourseCardProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { isAuthenticated } = useAppSelector((state) => state.auth)
    const cartItems = useAppSelector((state) => state.cart.items)
    const isAlreadyInCart = cartItems.some((item) => item.courseId === course.id)

    const { toast } = useToast()

    const {
        isLoading: isRateLoading,
        convert,
        formatTargetCurrency,
        formatBaseCurrency,
    } = useCurrencyConversion("USD", "NGN")

    const nairaAmount = convert(course.priceUSD)
    const discountedNairaAmount = course.discountPriceUSD ? convert(course.discountPriceUSD) : null

    const renderNairaPrice = (amount: number | null) => {
        if (isRateLoading) return <Skeleton className="h-4 w-16 mt-0.5 inline-block" />
        if (amount === null) return <span className="h-4 inline-block"></span>
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

    const displayPriceUSD = course.discountPriceUSD ?? course.priceUSD
    const displayNairaAmount = discountedNairaAmount ?? nairaAmount

    const handleEnrollNow = () => {
        if (isAlreadyInCart) {
            toast({
                title: "Already Selected",
                description: `${course.title} is already in your list.`,
                variant: "default",
            })
        } else {
            dispatch(
                addItem({
                    courseId: course.id,
                    title: course.title,
                    price: course.priceUSD,
                    discountPrice: course.discountPriceUSD,
                    image: course.image,
                    instructor: course.instructor.name,
                }),
            )

            toast({
                title: "Course Selected",
                description: `${course.title} has been added to your list.`,
                variant: "success",
            })
        }

        // Redirect to signup if not authenticated, otherwise to cart
        if (!isAuthenticated) {
            router.push("/signup")
        } else {
            router.push("/cart") // maybe eventually rename to /my-courses ?
        }
    }

    // --- MODAL VIEW ---
    if (isModal) {
        return (
            <div className="relative">
                <AbstractBackground className="opacity-90 dark:opacity-80" />

                <div className="relative z-10 max-h-[90vh] overflow-y-auto bg-background/85 backdrop-blur-sm rounded-xl xl:max-h-[80vh]">
                    {/* Left: Image */}
                    <div className="relative w-full aspect-video">
                        {/* ... Image and Badges for Modal ... */}
                        <Image
                            src={course.iconUrl || course.image || getCourseIcon(course.title, course.id)}
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
                    {/* Right: Content */}
                    <div className="w-full flex flex-col h-full">
                        <div className="p-6 overflow-y-auto flex-grow">
                            {/* ... Title, Subtitle, Stats ... */}
                            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                            {course.subtitle && <p className="text-muted-foreground mb-4">{course.subtitle}</p>}
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm">
                                <span className="inline-flex items-center">
                                    <Clock className="size-4 mr-2 text-muted-foreground" />
                                    {course.duration}
                                </span>
                                <span className="inline-flex items-center">
                                    <Users className="size-4 mr-2 text-muted-foreground" />
                                    {course.studentsEnrolled.toLocaleString()} students
                                </span>
                                {course.rating && (
                                    <span className="inline-flex items-center text-amber-500">
                                        <Star className="size-4 mr-1 fill-current" />
                                        {course.rating.toFixed(1)}
                                        {course.reviewsCount && (
                                            <span className="ml-1.5 text-xs text-muted-foreground">({course.reviewsCount})</span>
                                        )}
                                    </span>
                                )}
                            </div>

                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="mb-4 grid w-full grid-cols-3">
                                    <TabsTrigger value="overview" className="hover:bg-background/50 cursor-pointer">
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger value="curriculum" className="hover:bg-background/50 cursor-pointer">
                                        Curriculum
                                    </TabsTrigger>
                                    <TabsTrigger value="instructor" className="hover:bg-background/50 cursor-pointer">
                                        Instructor
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview" className="space-y-6 text-sm">
                                    <div>
                                        <h3 className="font-semibold mb-2 text-base">Description</h3>
                                        <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                                    </div>
                                    {course.learningOutcomes && (
                                        <div>
                                            <h3 className="font-semibold mb-2 text-base">What You'll Learn</h3>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                                {course.learningOutcomes.map((outcome, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <CheckCircle className="size-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>{outcome}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {course.prerequisites && (
                                        <div>
                                            <h3 className="font-semibold mb-2 text-base">Prerequisites</h3>
                                            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
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
                                                <div key={index} className="p-3 border rounded-md flex justify-between items-center">
                                                    <h4 className="font-medium text-sm">{module.title}</h4>
                                                    <span className="text-xs text-muted-foreground">{module.duration}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">Curriculum details will be available soon.</p>
                                    )}
                                </TabsContent>
                                <TabsContent value="instructor">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                            {course.instructor.avatar ? (
                                                <Image
                                                    src={course.instructor.avatar || "/placeholder.svg"}
                                                    alt={course.instructor.name}
                                                    width={64}
                                                    height={64}
                                                    className="object-cover"
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

                        <div className="p-6 border-t flex justify-between items-center mt-auto">
                            {isAuthenticated &&
                                <div>
                                    {course.discountPriceUSD && (
                                        <span className="text-sm text-muted-foreground line-through mr-2">
                                            {renderNairaPrice(nairaAmount)}
                                        </span>
                                    )}
                                    <div className="text-xl font-bold text-primary h-5">
                                        {renderNairaPrice(displayNairaAmount)}
                                    </div>
                                </div>
                            }
                            <DyraneButton size="lg" onClick={handleEnrollNow}>
                                {isAlreadyInCart ? (
                                    <span className="text-sm">Selected</span>
                                ) : (
                                    <span className="text-sm">Enrol now</span>
                                )}
                            </DyraneButton>

                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // --- REGULAR CARD VIEW (Compact) ---
    return (
        // Use DyraneCard as the root element
        // It provides the 'group' class and hover animations internally
        <DyraneCard
            className={cn(
                "flex flex-col h-full",
                isAlreadyInCart && "border border-primary rounded-xl shadow-xl", // Add a glow effect
                className
            )}
            // Base styles for flex layout
            cardClassName="flex flex-col h-full" // Ensure inner BaseCard is also flex col full height
            layout // Animate layout changes if size differs
            onClick={onClick} // Pass onClick for modal trigger
            style={{ cursor: onClick ? "pointer" : "default" }} // Indicate clickability
        // Optional: Pass down specific motion props for staggering if needed
        // initial={{ opacity: 0, y: 20 }}
        // animate={{ opacity: 1, y: 0 }}
        // exit={{ opacity: 0 }}
        // transition={{ /* ... */ }}
        >
            {/* Image Container */}
            <div className="aspect-[16/10] relative overflow-hidden">
                {" "}
                {/* Consistent aspect ratio */}
                <Image
                    src={course.iconUrl || course.image || getCourseIcon(course.title, course.id)}
                    alt={course.title}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.77, 0, 0.175, 1)] group-hover:scale-105" // Zoom on hover using group
                />
                {/* Badges */}
                {course.level && (
                    <Badge
                        variant="outline"
                        className={cn(
                            "absolute top-2 right-2 backdrop-blur-sm bg-background/70 text-xs px-1.5 py-0.5",
                            levelBadgeColor(course.level),
                        )}
                    >
                        {course.level}
                    </Badge>
                )}
                {course.discountPriceUSD && (
                    <Badge className="absolute top-2 left-2 text-xs px-1.5 py-0.5" variant="destructive">
                        -{Math.round(((course.priceUSD - course.discountPriceUSD) / course.priceUSD) * 100)}%
                    </Badge>
                )}
            </div>

            {/* Use Dyrane Card structure for content */}
            {/* No Header needed for compact view usually */}

            {/* Use flex-1 to push footer down */}
            <DyraneCardContent className="flex-1 p-4 space-y-2">
                {/* Reduced padding */}
                {/* Title - Link within */}
                <h3 className="font-semibold text-base leading-snug line-clamp-2 mb-1">
                    {/* <Link href={`/signup`} onClick={(e) => e.stopPropagation()} className="hover:text-primary transition-colors">
                        {course.title}
                    </Link> */}
                    <span className="hover:text-primary transition-colors">
                        {course.title}
                    </span>
                </h3>
                {/* Info Icons Row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center">
                        <Clock className="size-3.5 mr-1" />
                        {course.duration}
                    </span>
                    <span className="inline-flex items-center">
                        <UsersRound className="size-3.5 mr-1" />
                        {course.studentsEnrolled.toLocaleString()}
                    </span>
                    {course.rating && (
                        <span className="inline-flex items-center text-amber-500">
                            <Star className="size-3.5 mr-0.5 fill-current" />
                            {course.rating.toFixed(1)}
                            {/* Optional: Hide review count on small card */}
                            {/* {course.reviewsCount && <span className="ml-1">({course.reviewsCount})</span>} */}
                        </span>
                    )}
                </div>
            </DyraneCardContent>

            <DyraneCardFooter className="p-4 pt-3 mt-auto border-t border-border/30 hidden group-hover:inline transition-all duration-700 ease-[cubic-bezier(0.77, 0, 0.175, 1)]"> {/* Reduced padding */}
                <div className="flex justify-between items-end w-full gap-2">
                    {/* Price */}
                    {isAuthenticated &&
                        <div className="flex flex-col text-left">
                            {course.discountPriceUSD && (
                                <span className="text-xs text-muted-foreground line-through h-4">{renderNairaPrice(nairaAmount)}</span>
                            )}
                            <span className="text-sm font-bold text-primary">
                                {" "}
                                {/* Slightly smaller price */}
                                {renderNairaPrice(displayNairaAmount)}
                            </span>
                        </div>}

                    {/* Button always visible */}
                    <DyraneButton
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                            if (!onClick) {
                                e.stopPropagation()
                            } else {
                                onClick()
                            }
                        }} // Prevent card click if linking
                    >
                        {onClick ? (
                            // If onClick is provided (for modal), button text is "View Details"
                            <span>View Details</span>
                        ) : (
                            // Otherwise, it's a link to the course page
                            <Link href={`/signup`}>View Details</Link>
                        )}
                    </DyraneButton>
                </div>
            </DyraneCardFooter>
        </DyraneCard>
    )
}
