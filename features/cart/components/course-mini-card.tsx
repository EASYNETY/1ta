// features/cart/components/course-mini-card.tsx

"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { CartItem } from "@/features/cart/store/cart-slice"
import { useAppSelector } from "@/store/hooks"
import { useCurrencyConversion } from "@/hooks/use-currency-conversion"
import { Skeleton } from "@/components/ui/skeleton"

interface CourseMiniCardProps {
    item: CartItem
    onClick?: () => void
    className?: string
}

export function CourseMiniCard({ item, onClick, className }: CourseMiniCardProps) {
    const { isAuthenticated } = useAppSelector((state) => state.auth)
    const router = useRouter()
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

    return (
        <div
            className={cn(
                "flex items-center gap-3 p-2 rounded-md bg-muted/50 hover:bg-primary/15 cursor-pointer transition-colors ease-[cubic-bezier(0.77,0,0.175,1)]",
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
        </div>
    )
}
