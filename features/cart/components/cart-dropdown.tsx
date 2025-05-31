// features/cart/components/cart-dropdown.tsx

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useAppSelector } from "@/store/hooks"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GraduationCap } from "lucide-react"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { CourseMiniCard } from "./course-mini-card"
import Link from "next/link"
import { useCurrencyConversion } from "@/hooks/use-currency-conversion"
import { Skeleton } from "@/components/ui/skeleton"

interface CartDropdownProps {
    isOpen: boolean
    onClose: () => void
    setIsDropdownOpen: (isOpen: boolean) => void
}

export function CartDropdown({ isOpen, onClose, setIsDropdownOpen }: CartDropdownProps) {
    const cart = useAppSelector((state) => state.cart)
    const { isAuthenticated } = useAppSelector((state) => state.auth)
    const {
        isLoading: isRateLoading,
        formatTargetCurrency,
        convert,
    } = useCurrencyConversion("USD", "NGN")

    // const renderNairaPrice = (amount: number | null) => {
    //     if (isRateLoading) return <Skeleton className="h-4 w-16 mt-0.5 inline-block" />
    //     if (amount === null) return <span className="h-4 inline-block"></span>
    //     return formatTargetCurrency(amount)
    // }

    // Animation variants
    const dropdownVariants = {
        hidden: { opacity: 0, y: -5, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
            },
        },
        exit: {
            opacity: 0,
            y: -5,
            scale: 0.95,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
            },
        },
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="absolute right-0 top-full mt-2 w-auto z-50"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                    variants={dropdownVariants}
                >
                    <div className="bg-background/85 backdrop-blur-md rounded-md shadow-lg border border-border/50 overflow-hidden">
                        <div className="p-3 border-b border-border/30">
                            <h3 className="font-medium text-sm">Your Selected Courses ({cart.items.length})</h3>
                        </div>

                        {cart.items.length === 0 ? (
                            <div className="p-6 flex flex-col items-center justify-center">
                                <GraduationCap className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium mb-1">No courses selected</p>
                                <p className="text-xs text-muted-foreground mb-4 text-center">
                                    Add courses to your learning cart to get started.
                                </p>
                                <DyraneButton asChild size="sm" onClick={onClose}>
                                    <Link href="#courses">Browse Courses</Link> {/* Better to link directly to landing courses */}
                                </DyraneButton>
                            </div>
                        ) : (
                            <>
                                <ScrollArea className="max-h-[240px]">
                                    <div className="p-2 space-y-1">
                                        {cart.items.map((item) => (
                                            <CourseMiniCard key={item.courseId} item={item} onClick={onClose} />
                                        ))}
                                    </div>
                                </ScrollArea>

                                <div className="p-3 border-t border-border/30 bg-muted/30">
                                    {isAuthenticated && <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-medium">Total</span>
                                        <span className="text-sm font-medium">₦{cart.total.toLocaleString()}</span>
                                    </div>}
                                    <DyraneButton asChild className="w-full" size="sm" onClick={onClose}>
                                        {isAuthenticated ? (
                                            <Link href="/cart">View Cart</Link>
                                        ) : (
                                            <Link href="/signup">Sign Up to Enrol</Link>
                                        )}
                                    </DyraneButton>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
