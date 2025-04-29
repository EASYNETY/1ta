// app/(authenticated)/cart/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Card } from "@/components/ui/card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { removeItem } from "@/features/cart/store/cart-slice"
import { isProfileComplete } from "@/features/auth/utils/profile-completeness"
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react"
import Image from "next/image"
import { motion, type Variants } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function CartPage() {
    const { user } = useAppSelector((state) => state.auth)
    const cart = useAppSelector((state) => state.cart)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)

    const profileComplete = user ? isProfileComplete(user) : false
    const hasItems = cart.items.length > 0

    const handleRemoveItem = (courseId: string) => {
        dispatch(removeItem(courseId))
    }

    const handleCheckout = () => {
        setIsProcessing(true)

        // If profile is not complete, redirect to profile page
        if (!profileComplete) {
            router.push("/profile")
            return
        }

        // If profile is complete, redirect to pricing
        router.push("/pricing")
    }

    // Define proper motion variants
    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const item: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    }

    if (!hasItems) {
        return (
            <div className="container mx-auto py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
                <Card className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center py-12">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                        <p className="text-muted-foreground mb-6">Browse our courses and add some to your cart.</p>
                        <DyraneButton asChild>
                            <a href="/#courses">Browse Courses</a>
                        </DyraneButton>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

            {!profileComplete && (
                <Alert className="mb-6">
                    <AlertTitle>Complete Your Profile</AlertTitle>
                    <AlertDescription>Please complete your profile before proceeding to checkout.</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                        {cart.items.map((item) => (
                            <motion.div key={item.courseId}>
                                <Card className="p-4">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-16 relative bg-muted rounded-md overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                    <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{item.title}</h3>
                                            {item.instructor && (
                                                <p className="text-sm text-muted-foreground">Instructor: {item.instructor}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <div className="text-right">
                                                {item.discountPrice ? (
                                                    <>
                                                        <p className="line-through text-sm text-muted-foreground">₦{item.price}</p>
                                                        <p className="font-medium">₦{item.discountPrice}</p>
                                                    </>
                                                ) : (
                                                    <p className="font-medium">₦{item.price}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.courseId)}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <div>
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₦{cart.total}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span>₦0</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>₦{cart.total}</span>
                            </div>
                        </div>
                        <DyraneButton className="w-full mt-4" onClick={handleCheckout} disabled={isProcessing}>
                            {isProcessing ? (
                                "Processing..."
                            ) : (
                                <>
                                    Proceed to Checkout
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </DyraneButton>
                    </Card>
                </div>
            </div>
        </div>
    )
}
