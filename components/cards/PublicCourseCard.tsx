// components/cards/PublicCourseCard.tsx

"use client"
import Image from "next/image" // Keep Image for fallback
// import Link from "next/link" // Link might not be needed if button handles action
import { useRouter } from "next/navigation"
import { Clock, Layers, PlayCircle, FileQuestion, CheckCircle, Users } from "lucide-react"
import {
    DyraneCard,
    DyraneCardContent,
    DyraneCardFooter,
} from "@/components/dyrane-ui/dyrane-card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addItem } from "@/features/cart/store/cart-slice"
import { useToast } from "@/hooks/use-toast"
import { AbstractBackground } from "../layout/abstract-background"
import { PublicCourse } from "@/features/public-course/types/public-course-interface"
import { AuthCourse } from "@/features/auth-course/types/auth-course-interface"
import { getCourseIcon } from "@/utils/course-icon-mapping"
import { Tag } from "phosphor-react"
import { hasAdminAccess } from "@/types/user.types"

interface PublicCourseCardProps {
    course: PublicCourse | AuthCourse
    className?: string
    onClick?: () => void
    isModal?: boolean
    onClose?: () => void
}

// Component to render either Video or Fallback Image
const CourseMediaPreview = ({ course }: { course: PublicCourse | AuthCourse }) => {
    // Use video if URL exists, otherwise use placeholder image
    if (course.previewVideoUrl) {
        return (
            <video
                key={course.previewVideoUrl} // Add key to force re-render if URL changes
                src={course.previewVideoUrl}
                muted
                playsInline
                preload="metadata" // Attempt to load first frame info
                disablePictureInPicture
                // DO NOT ADD 'controls' or 'autoPlay'
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            // Optional: Add poster="/placeholder.svg" if you want placeholder while video loads metadata
            // poster={course.image}
            />
        );
    }

    // Fallback to course icon or placeholder image
    const imageSource = course.iconUrl || course.image || getCourseIcon(course.title, course.id);

    // Check if the image is from the future directory
    const isFutureImage = typeof imageSource === 'string' && imageSource.includes('/images/future/');

    return (
        <Image
            src={imageSource}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className={`transition-transform duration-300 group-hover:scale-105 ${isFutureImage ? 'object-contain' : 'object-cover'}`}
            priority={!course.previewVideoUrl} // Prioritize if it's the only thing showing
        />
    );
};


export function PublicCourseCard({ course, className, onClick, isModal = false, onClose }: PublicCourseCardProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { isAuthenticated } = useAppSelector((state) => state.auth)
    const cartItems = useAppSelector((state) => state.cart.items)
    const isAlreadyInCart = cartItems.some((item) => item.courseId === course.id)
    const { toast } = useToast()

    const levelBadgeColor = (level?: string) => { /* ... color logic ... */
        switch (level) { case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50 dark:border-green-700/50"; case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300/50 dark:border-yellow-700/50"; case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300/50 dark:border-red-700/50"; default: return "bg-muted text-muted-foreground border-border"; }
    }

    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = hasAdminAccess(user);
    const isTeacher = user?.role === 'teacher';
    const isAdminOrTeacher = isAdmin || isTeacher;

    // Determine which price to use based on user role
    const getPrice = () => {
        // For students, always use Naira price
        if (!isAdminOrTeacher) {
            return course.priceNaira ?? (course.priceUSD ? course.priceUSD * 1500 : 0);
        }
        // For admin/teacher, use USD price
        return course.priceUSD ?? 0;
    };

    const getDiscountPrice = () => {
        // For students, always use Naira discount price
        if (!isAdminOrTeacher) {
            return course.discountPriceNaira ?? (course.discountPriceUSD ? course.discountPriceUSD * 1500 : undefined);
        }
        // For admin/teacher, use USD discount price
        return course.discountPriceUSD;
    };

    const handleEnrolNow = () => {
        if (isAlreadyInCart) {
            toast({
                title: "Already Selected",
                description: `${course.title} is already in your list.`,
                variant: "default"
            });
        } else {
            dispatch(addItem({
                courseId: course.id,
                title: course.title,
                priceNaira: course.priceNaira as number,
                discountPriceNaira: course.discountPriceNaira,
                image: course.iconUrl || course.image || getCourseIcon(course.title, course.id),
                instructor: course.instructor.name,
            }));
            toast({
                title: "Course Selected",
                description: `${course.title} has been added to your list.`,
                variant: "success"
            });
        }

        if (!isAuthenticated) {
            router.push("/signup");
        } else {
            router.push("/cart");
        }
    }

    // --- MODAL VIEW ---
    if (isModal) {
        // Get price and currency for modal display
        // const price = course.priceNaira || 0
        // const discountPrice = course.discountPriceNaira || 0
        const price = getPrice();
        const discountPrice = getDiscountPrice();
        const currencySymbol = "₦";
        return (
            <div className="relative">
                <AbstractBackground className="opacity-90 dark:opacity-80" />
                <div className="relative z-10 max-h-[90vh] overflow-y-auto bg-background/85 backdrop-blur-sm rounded-xl xl:max-h-[80vh]">
                    {/* *** MODIFIED: Use CourseMediaPreview for video/image *** */}
                    <div className="relative w-full aspect-video bg-muted"> {/* Added bg-muted as backdrop */}
                        <CourseMediaPreview course={course} />
                        {course.level && (<Badge variant="outline" className={cn("absolute top-4 right-4 backdrop-blur-sm bg-background/70", levelBadgeColor(course.level))}>{course.level}</Badge>)}
                    </div>
                    {/* *** END MODIFICATION *** */}

                    <div className="w-full flex flex-col h-full">
                        <div className="p-6 overflow-y-auto flex-grow">
                            {/* ... Rest of Modal Content (Title, Stats, Tabs, etc.) ... */}
                            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                            {course.subtitle && <p className="text-muted-foreground mb-4">{course.subtitle}</p>}
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm">
                                <span className="inline-flex items-center">
                                    <Layers className="size-4 mr-2 text-muted-foreground" />
                                    {course.lessonCount} lessons
                                </span>
                                {course.totalVideoDuration && (
                                    <span className="inline-flex items-center">
                                        <Clock className="size-4 mr-2 text-muted-foreground" />
                                        {course.totalVideoDuration}
                                    </span>
                                )}
                            </div>
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="mb-4 grid w-full grid-cols-3"> <TabsTrigger value="overview" className="hover:bg-background/50 cursor-pointer">Overview</TabsTrigger> <TabsTrigger value="curriculum" className="hover:bg-background/50 cursor-pointer">Curriculum</TabsTrigger> <TabsTrigger value="instructor" className="hover:bg-background/50 cursor-pointer">Instructor</TabsTrigger> </TabsList>
                                <TabsContent value="overview" className="space-y-6 text-sm"> <div> <h3 className="font-semibold mb-2 text-base">Description</h3> <div className="text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: course.description || "" }} /> </div> {course.learningOutcomes && course.learningOutcomes.length > 0 && (<div><h3 className="font-semibold mb-2 text-base">What You'll Learn</h3><ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">{course.learningOutcomes.map((outcome, index) => (<li key={index} className="flex items-start"><CheckCircle className="size-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" /><span>{outcome}</span></li>))}</ul></div>)} {course.prerequisites && course.prerequisites.length > 0 && (<div><h3 className="font-semibold mb-2 text-base">Prerequisites</h3><ul className="list-disc pl-5 space-y-1 text-muted-foreground">{course.prerequisites.map((prereq, index) => (<li key={index}>{prereq}</li>))}</ul></div>)} </TabsContent>
                                <TabsContent value="curriculum"> {course.modules && course.modules.length > 0 ? (<div className="space-y-4"> {course.modules.map((module, index) => (<div key={index} className="border rounded-md overflow-hidden"> <div className="p-3 bg-muted/50 flex justify-between items-center border-b"><h4 className="font-medium text-sm">{module.title}</h4><span className="text-xs text-muted-foreground flex-shrink-0 ml-4">{module.duration}</span></div> {module.lessons && module.lessons.length > 0 && (<ul className="p-3 text-sm space-y-1.5"> {module.lessons.map((lesson, lessonIndex) => (<li key={lessonIndex} className="flex items-center text-muted-foreground text-xs"> {lesson.duration.includes('quiz') ? (<FileQuestion className="size-3.5 mr-2 flex-shrink-0 text-blue-500" />) : (<PlayCircle className="size-3.5 mr-2 flex-shrink-0 text-green-500" />)} <span>{lesson.title}</span> </li>))} </ul>)} </div>))} </div>) : (<p className="text-muted-foreground text-sm">Curriculum details not available.</p>)} </TabsContent>
                                <TabsContent value="instructor"> <div className="flex items-center space-x-4"> <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden"><Users className="h-8 w-8 text-muted-foreground" /></div> <div><h3 className="font-semibold">{course.instructor.name}</h3>{course.instructor.title && (<p className="text-sm text-muted-foreground">{course.instructor.title}</p>)}</div> </div> </TabsContent>
                            </Tabs>
                        </div>
                        {/* Modal Footer */}
                        <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto sticky bottom-0 bg-background/90 backdrop-blur-sm">
                            {/* === NEW: PRICE DISPLAY FOR MODAL FOOTER === */}
                            <div className="text-center sm:text-left order-2 sm:order-1">
                                {(() => {
                                    if (typeof discountPrice === 'number' && discountPrice > 0 && discountPrice < price) {
                                        return (
                                            <div className="flex items-baseline gap-x-2 justify-center sm:justify-start">
                                                <Tag className="size-5 text-primary flex-shrink-0 relative top-[-2px]" weight="fill" />
                                                <span className="text-2xl font-bold text-primary">
                                                    {currencySymbol}{discountPrice.toLocaleString()}
                                                </span>
                                                <span className="text-base text-muted-foreground line-through">
                                                    {currencySymbol}{price.toLocaleString()}
                                                </span>
                                            </div>
                                        );
                                    }

                                    if (price > 0) {
                                        return (
                                            <div className="flex items-center gap-x-2 justify-center sm:justify-start">
                                                <Tag className="size-5 text-muted-foreground flex-shrink-0 relative top-[-2px]" />
                                                <span className="text-2xl font-bold text-foreground">
                                                    {currencySymbol}{price.toLocaleString()}
                                                </span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="flex items-center gap-x-2 justify-center sm:justify-start">
                                            <Tag className="size-5 text-green-600 flex-shrink-0 relative top-[-2px]" />
                                            <span className="text-2xl font-bold text-green-600">
                                                Free
                                            </span>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* === END: PRICE DISPLAY === */}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-x-3 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-end">
                                {onClose && (
                                    <DyraneButton variant="ghost" onClick={() => onClose?.()} className="flex-shrink-0">
                                        Close
                                    </DyraneButton>
                                )}
                                {('available_for_enrolment' in course ? course.available_for_enrolment !== false : true) ? (
                                    <DyraneButton size="lg" onClick={handleEnrolNow} className="flex-grow sm:flex-grow-0">
                                        {isAlreadyInCart ? (<span className="text-sm flex items-center"><CheckCircle className="size-4 mr-2" /> Selected</span>) : (<span className="text-sm">Enrol now</span>)}
                                    </DyraneButton>
                                ) : (
                                    <DyraneButton size="lg" disabled className="cursor-not-allowed opacity-70 flex-grow sm:flex-grow-0">
                                        <span className="text-sm">Not Available for Enrolment</span>
                                    </DyraneButton>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // --- REGULAR CARD VIEW ---
    return (
        <DyraneCard
            className={cn("flex flex-col h-full overflow-hidden group", className)}
            cardClassName="flex flex-col h-full"
            layout
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : "default" }}
        >
            {/* *** MODIFIED: Use CourseMediaPreview for video/image *** */}
            <div className="aspect-[16/10] relative overflow-hidden bg-muted"> {/* Added bg-muted as backdrop */}
                <CourseMediaPreview course={course} />
                {course.level && (<Badge variant="outline" className={cn("absolute top-2 right-2 backdrop-blur-sm bg-background/70 text-xs px-1.5 py-0.5", levelBadgeColor(course.level))}>{course.level}</Badge>)}
            </div>
            {/* *** END MODIFICATION *** */}

            {/* Card Content */}
            <DyraneCardContent className="flex-1 p-4 space-y-2">
                <h3 className="font-semibold text-base leading-snug line-clamp-2 mb-1"><span className={onClick ? "group-hover:text-primary transition-colors" : ""}>{course.title}</span></h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"> <span className="inline-flex items-center"><Layers className="size-3.5 mr-1" />{course.lessonCount} lessons</span> {course.totalVideoDuration && (<span className="inline-flex items-center"><Clock className="size-3.5 mr-1" />{course.totalVideoDuration}</span>)} </div>
                <div className="text-sm mt-1">
                    {discountPrice && discountPrice < price ? (
                        <div className="flex items-baseline gap-x-2">
                            <span className="font-semibold text-primary">
                                {currencySymbol}{discountPrice.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground line-through">
                                {currencySymbol}{price.toLocaleString()}
                            </span>
                        </div>
                    ) : price > 0 ? (
                        <div className="text-foreground font-semibold">
                            {currencySymbol}{price.toLocaleString()}
                        </div>
                    ) : (
                        <div className="text-green-600 font-semibold">
                            Free
                        </div>
                    )}
                </div>

            </DyraneCardContent>

            {/* Card Footer */}
            <DyraneCardFooter className="p-4 pt-3 mt-auto border-t border-border/30 hidden group-hover:inline transition-all duration-500 ease-[cubic-bezier(0.77, 0, 0.175, 1)]">
                <div className="flex justify-end items-center w-full">
                    <DyraneButton size="sm" variant="secondary" onClick={(e) => { if (onClick) { e.stopPropagation(); onClick(); } else { router.push('/signup'); } }}>
                        <span>View Details</span>
                    </DyraneButton>
                </div>
            </DyraneCardFooter>
        </DyraneCard>
    )
}