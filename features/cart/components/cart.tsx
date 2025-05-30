"use client"

import { useState } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { removeItem, clearCart } from "@/features/cart/store/cart-slice"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, X, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap } from "phosphor-react"

interface CartProps {
    onClose?: () => void
}

export function Cart({ onClose }: CartProps) {
    const cart = useAppSelector((state) => state.cart)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    const handleRemoveItem = (courseId: string) => {
        dispatch(removeItem({ id: courseId }))
    }

    const handleClearCart = () => {
        dispatch(clearCart())
    }

    const handleCheckout = () => {
        setIsCheckingOut(true)
        router.push("/signup")
    }

    if (cart.items.length === 0) {
        return (
            <DyraneCard className="w-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Your cart is empty</p>
                    <p className="text-muted-foreground mb-6">Add courses to your cart to get started</p>
                    <DyraneButton asChild>
                        <Link href="/courses">Browse Courses</Link>
                    </DyraneButton>
                </CardContent>
            </DyraneCard>
        )
    }

    return (
        <DyraneCard className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Cart ({cart.items.length})</CardTitle>
                {onClose && (
                    <DyraneButton variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </DyraneButton>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {cart.items.map((item) => (
                    <div key={item.courseId} className="flex items-center space-x-4">
                        <div className="h-16 w-24 relative flex-shrink-0 rounded-md overflow-hidden">
                            {item.image ? (
                                <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                            ) : (
                                <div className="h-full w-full bg-muted flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">No image</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{item.title}</h4>
                            <div className="flex items-center mt-1">
                                {item.discountPriceNaira ? (
                                    <>
                                        <span className="text-sm font-bold text-primary">₦{item.discountPriceNaira}</span>
                                        <span className="text-xs text-muted-foreground line-through ml-2">₦{item.priceNaira}</span>
                                    </>
                                ) : (
                                    <span className="text-sm font-bold text-primary">₦{item.priceNaira}</span>
                                )}
                            </div>
                        </div>
                        <DyraneButton
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.courseId)}
                            className="flex-shrink-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                            aria-label="Remove item"
                        >
                            <Trash2 className="h-4 w-4" />
                        </DyraneButton>
                    </div>
                ))}

                <Separator />

                <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg text-primary">₦{cart.total.toFixed(2)}</span>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <DyraneButton className="w-full" onClick={handleCheckout} disabled={isCheckingOut}>
                    {isCheckingOut ? "Processing..." : "Checkout"}
                </DyraneButton>
                <DyraneButton variant="outline" className="w-full" onClick={handleClearCart} disabled={isCheckingOut}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                </DyraneButton>
            </CardFooter>
        </DyraneCard>
    )
}
