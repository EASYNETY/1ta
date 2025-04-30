// app/(authenticated)/pricing/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Check, X, GraduationCap } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { clearCart } from "@/features/cart/store/cart-slice"
import { useToast } from "@/hooks/use-toast"
import {
    individualPlans,
    corporatePlans,
    selectPlan,
    skipPricingSelection,
    setPaymentDetails,
    selectSelectedPlan,
    selectSkipPricing,
} from "@/features/pricing/store/pricing-slice"

export default function PricingPage() {
    const { user } = useAppSelector((state) => state.auth)
    const cart = useAppSelector((state) => state.cart)
    const selectedPlan = useAppSelector(selectSelectedPlan)
    const skipPricing = useAppSelector(selectSkipPricing)
    const router = useRouter()
    const searchParams = useSearchParams()
    const dispatch = useAppDispatch()
    const { toast } = useToast()

    // Get account type from URL or default to individual
    const defaultType = searchParams.get("type") || "individual"
    const [billingType, setBillingType] = useState<"individual" | "corporate">(
        defaultType === "corporate" ? "corporate" : "individual",
    )

    const plans = billingType === "individual" ? individualPlans : corporatePlans
    const hasItemsInCart = cart.items.length > 0
    const [isProcessing, setIsProcessing] = useState(false)

    // If user has skipped pricing, redirect to dashboard
    // useEffect(() => {
    //     if (skipPricing) {
    //         router.push("/dashboard")
    //     }
    // }, [skipPricing, router])

    const handleSelectPlan = (plan: (typeof plans)[0]) => {
        // Select the plan in the state
        dispatch(selectPlan(plan))

        if (plan.priceValue === null) {
            // For custom pricing (Enterprise plan)
            toast({
                title: "Contact Sales",
                description: "Our team will reach out to discuss custom pricing options.",
                variant: "default",
            })
            return
        }

        // Simulate payment processing
        setIsProcessing(true)
        toast({
            title: "Processing Payment",
            description: "Please wait while we process your payment...",
            variant: "default",
        })

        // Simulate successful payment after 2 seconds
        setTimeout(() => {
            // Set payment details
            dispatch(
                setPaymentDetails({
                    planId: plan.id,
                    planName: plan.name,
                    amount: plan.priceValue || 0,
                    currency: "NGN",
                    status: "completed",
                    transactionId: `tx-${Date.now()}`,
                    paymentMethod: "card",
                    paymentDate: new Date().toISOString(),
                }),
            )

            // Clear cart after successful payment
            dispatch(clearCart())

            toast({
                title: "Payment Successful",
                description: `You have successfully subscribed to the ${plan.name} plan.`,
                variant: "success",
            })

            // Redirect to dashboard
            router.push("/dashboard")
        }, 2000)
    }

    const handleSkipPricing = () => {
        dispatch(skipPricingSelection())
        toast({
            title: "Pricing Skipped",
            description: "You can select a plan later from your dashboard.",
            variant: "default",
        })
        router.push("/dashboard")
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    }

    return (
        <div className="mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Select the plan that best fits your needs. You can upgrade or downgrade at any time.
                </p>
            </div>

            {hasItemsInCart && (
                <Alert className="mb-8 bg-primary/10 border-primary/20">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <AlertTitle>Course Selected</AlertTitle>
                    <AlertDescription className="flex flex-col">
                        <div>
                            You have {cart.items.length} course{cart.items.length > 1 ? "s" : ""} in your cart:
                        </div>
                        <ul className="mt-2 space-y-1">
                            {cart.items.map((item) => (
                                <li key={item.courseId} className="flex items-center">
                                    <Badge variant="outline" className="mr-2">
                                        {item.discountPrice ? (
                                            <>
                                                <span className="line-through text-muted-foreground mr-1">₦{item.price}</span>₦
                                                {item.discountPrice}
                                            </>
                                        ) : (
                                            <>₦{item.price}</>
                                        )}
                                    </Badge>
                                    {item.title}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-2 font-medium">Total: ₦{cart.total}</div>
                    </AlertDescription>
                </Alert>
            )}

            <Tabs
                defaultValue={billingType}
                value={billingType}
                onValueChange={(value) => setBillingType(value as "individual" | "corporate")}
                className="w-full max-w-3xl mx-auto mb-8"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="individual">Individual</TabsTrigger>
                    <TabsTrigger value="corporate">Corporate</TabsTrigger>
                </TabsList>
            </Tabs>

            <motion.div
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {plans.map((plan) => (
                    <motion.div key={plan.id} variants={item}>
                        <DyraneCard className={`h-full flex flex-col ${plan.popular ? "border-primary" : ""}`}>
                            <div className="p-6 flex-1 flex flex-col">
                                {plan.popular && (
                                    <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full w-fit mb-4">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold">{plan.name}</h3>
                                <div className="mt-2 mb-4">
                                    <span className="text-3xl font-bold">{plan.price}</span>
                                    {plan.price !== "Custom" && <span className="text-muted-foreground ml-1">/course</span>}
                                </div>
                                <p className="text-muted-foreground mb-6">{plan.description}</p>

                                <div className="space-y-3 mb-6 flex-1">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}

                                    {plan.notIncluded.map((feature) => (
                                        <div key={feature} className="flex items-start text-muted-foreground">
                                            <X className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 pt-0">
                                <DyraneButton
                                    onClick={() => handleSelectPlan(plan)}
                                    className="w-full"
                                    variant={plan.popular ? "default" : "outline"}
                                    disabled={isProcessing}
                                >
                                    {isProcessing && selectedPlan?.id === plan.id
                                        ? "Processing..."
                                        : plan.price === "Custom"
                                            ? "Contact Sales"
                                            : "Select Plan"}
                                </DyraneButton>
                            </div>
                        </DyraneCard>
                    </motion.div>
                ))}
            </motion.div>

            <div className="text-center mt-12">
                <p className="text-muted-foreground mb-4">
                    Not ready to commit? <span className="font-medium text-foreground">Skip for now</span> to continue exploring.
                </p>
                <DyraneButton variant="outline" onClick={handleSkipPricing} disabled={isProcessing}>
                    Skip for now
                </DyraneButton>
            </div>
        </div>
    )
}
