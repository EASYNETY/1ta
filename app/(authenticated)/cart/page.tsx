// app/(auth)/cart/page.tsx

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

export default function CartPage() {
    const router = useRouter()
    const { items, total } = useAppSelector((state) => state.cart)
    const { isAuthenticated } = useAppSelector((state) => state.auth)

    // If authenticated, redirect to dashboard
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard")
        }
    }, [isAuthenticated, router])

    if (items.length === 0) {
        return (
            <DyraneCard className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Your Cart
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-6">Your cart is empty</p>
                    <DyraneButton asChild>
                        <Link href="/courses">Browse Courses</Link>
                    </DyraneButton>
                </CardContent>
            </DyraneCard>
        )
    }

    return (
        <DyraneCard className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Your Cart ({items.length} {items.length === 1 ? "item" : "items"})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.courseId} className="flex items-start space-x-4">
                            <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                                {item.image ? (
                                    <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                        <span className="text-xs text-muted-foreground">No image</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.instructor}</p>
                                <div className="mt-1 flex items-center text-sm">
                                    <span className="font-medium text-primary">{item.price}</span>
                                </div>
                            </div>
                            <button
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                aria-label={`Remove ${item.title} from cart`}
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-1.5">
                    <div className="flex justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">{formatCurrency(total)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <DyraneButton className="w-full" asChild>
                    <Link href="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </DyraneButton>
                <DyraneButton variant="outline" className="w-full" asChild>
                    <Link href="/courses">Continue Shopping</Link>
                </DyraneButton>
            </CardFooter>
        </DyraneCard>
    )
}
