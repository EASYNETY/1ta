// features/cart/components/course-mini-card.tsx

"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { removeItem, type CartItem } from "@/features/cart/store/cart-slice"
import { useAppSelector } from "@/store/hooks"
import { useCurrencyConversion } from "@/hooks/use-currency-conversion"
import { Skeleton } from "@/components/ui/skeleton"
import { useDispatch } from "react-redux"
import { Minus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CourseMiniCardProps {
    item: CartItem
    onClick?: () => void
    className?: string
}

export function CourseMiniCard({ item, onClick, className }: CourseMiniCardProps) {
    const { isAuthenticated } = useAppSelector((state) => state.auth)
    const router = useRouter()
    const dispatch = useDispatch()
    const { toast } = useToast()

    const {
        isLoading: isRateLoading,
        formatTargetCurrency,
        convert,
    } = useCurrencyConversion("USD", "NGN")

    const renderNairaPrice = (amount: number | null) => {
        if (isRateLoading) return <Skeleton className="h-4 w-16 mt-0.5 inline-block" />
        if (amount === null) return <span className="h-4 inline-block"></span>
        return formatTargetCurrency(amount)
    }

    const handleClick = () => {
        if (onClick) {
            onClick()
        } else {
            if (!isAuthenticated) {
                router.push("/signup")
            } else {
                router.push("/cart")
            }
        }
    }

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        dispatch(removeItem(item.courseId))

        toast({
            title: "Course Removed",
            description: `${item.title} has been removed from your list.`,
            variant: "destructive",
        })
    }

    return (
        <div
            className={cn(
                "flex items-center gap-3 p-2 group rounded-md bg-muted/50 hover:bg-primary/15 cursor-pointer transition-colors ease-[cubic-bezier(0.77,0,0.175,1)] relative",
                className,
            )}
            onClick={handleClick}
        >
            {/* Course Image */}
            <div className="h-12 w-16 relative flex-shrink-0 rounded-md overflow-hidden">
                {item.image ? (
                    <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover shadow-inner"
                        priority
                    />
                ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No image</span>
                    </div>
                )}
            </div>

            {/* Course Info */}
            <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium truncate">{item.title}</h4>
                {item.instructor && (
                    <p className="text-xs text-muted-foreground truncate">{item.instructor}</p>
                )}
                <div className="flex items-center gap-1 mt-0.5">
                    {item.discountPrice ? (
                        <>
                            <span className="text-xs font-medium">
                                {renderNairaPrice(convert(item.discountPrice))}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                                {renderNairaPrice(convert(item.price))}
                            </span>
                        </>
                    ) : (
                        <span className="text-xs font-medium">${item.price.toFixed(2)}</span>
                    )}
                </div>
            </div>
            {/* Remove Button */}
            <button
                onClick={handleRemove}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full bg-destructive/50 text-white 
                opacity-100 md:opacity-0 md:group-hover:opacity-100
                transition-opacity duration-200 ease-[cubic-bezier(0.77,0,0.175,1)]
                cursor-pointer hover:bg-destructive"
            >
                <Minus className="h-4 w-3" />
            </button>

        </div>
    )
}
