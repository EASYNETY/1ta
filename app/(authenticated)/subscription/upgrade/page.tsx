// app(authenticated)/subscription/upgrade/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Check, X, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { PaystackCheckout } from "@/components/payment/paystack-checkout"
import {
    selectPricingState,
    selectUserSubscription,
    setShowPaymentModal,
    selectShowPaymentModal,
    fetchPlans,
    createUserSubscription,
    selectPricingLoading,
} from "@/features/pricing/store/pricing-slice"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function UpgradeSubscriptionPage() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { toast } = useToast()
    const { user } = useAppSelector((state) => state.auth)
    const pricingState = useAppSelector(selectPricingState)
    const userSubscription = useAppSelector(selectUserSubscription)
    const showPaymentModal = useAppSelector(selectShowPaymentModal)
    const isLoading = useAppSelector(selectPricingLoading)
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

    // Fetch plans on component mount
    useEffect(() => {
        dispatch(fetchPlans())
    }, [dispatch])

    if (!userSubscription) {
        router.push("/pricing")
        return null
    }

    // Get all plans of the same type as the user's current subscription
    const currentPlanType = pricingState.allPlans.find((p) => p.id === userSubscription.planId)?.type || "individual"
    const availablePlans = currentPlanType === "individual" ? pricingState.individualPlans : pricingState.corporatePlans

    // Filter out plans that are not active or are the same as the current plan
    const upgradePlans = availablePlans.filter((plan) => plan.active !== false && plan.id !== userSubscription.planId)

    const handleSelectPlan = (planId: string) => {
        setSelectedPlanId(planId)
        dispatch(setShowPaymentModal(true))
    }

    const handlePaymentSuccess = async () => {
        if (!selectedPlanId || !user) return

        try {
            // Create new subscription using thunk
            await dispatch(
                createUserSubscription({
                    userId: user.id,
                    planId: selectedPlanId,
                }),
            ).unwrap()

            const selectedPlan = pricingState.allPlans.find((p) => p.id === selectedPlanId)

            toast({
                title: "Upgrade Successful",
                description: `You have successfully upgraded to the ${selectedPlan?.name || "new"} plan.`,
                variant: "success",
            })

            // Close payment modal
            dispatch(setShowPaymentModal(false))

            // Redirect to subscription management
            router.push("/subscription/manage")
        } catch (error) {
            toast({
                title: "Upgrade Failed",
                description: "There was an error processing your upgrade. Please try again.",
                variant: "destructive",
            })
        }
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

    const currentPlan = pricingState.allPlans.find((p) => p.id === userSubscription.planId)

    return (
        <div className="mx-auto">
            <div className="flex items-center gap-2 mb-8">
                <DyraneButton variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </DyraneButton>
                <h1 className="text-3xl font-bold">Upgrade Subscription</h1>
            </div>

            <div className="text-center mb-10">
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    You are currently on the <span className="font-medium">{userSubscription.planName}</span> plan. Choose a plan
                    below to upgrade your subscription.
                </p>
            </div>

            {currentPlan && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
                    <DyraneCard className="border-primary">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">{currentPlan.name}</h3>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                    Current
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mb-4">{currentPlan.description}</p>
                            <div className="text-xl font-bold mb-4">{currentPlan.price}</div>
                            <div className="space-y-2">
                                {currentPlan.features.slice(0, 3).map((feature) => (
                                    <div key={feature} className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                                {currentPlan.features.length > 3 && (
                                    <div className="text-sm text-muted-foreground">+{currentPlan.features.length - 3} more features</div>
                                )}
                            </div>
                        </div>
                    </DyraneCard>
                </div>
            )}

            <h2 className="text-xl font-semibold mb-4">Available Upgrades</h2>
            <motion.div
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {upgradePlans.map((plan) => (
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
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className="w-full"
                                    variant={plan.popular ? "default" : "outline"}
                                    disabled={isLoading}
                                >
                                    {isLoading && selectedPlanId === plan.id
                                        ? "Processing..."
                                        : plan.price === "Custom"
                                            ? "Contact Sales"
                                            : "Upgrade to This Plan"}
                                </DyraneButton>
                            </div>
                        </DyraneCard>
                    </motion.div>
                ))}
            </motion.div>

            <div className="text-center mt-12">
                <DyraneButton variant="outline" onClick={() => router.push("/subscription/manage")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Subscription
                </DyraneButton>
            </div>

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onOpenChange={(open) => dispatch(setShowPaymentModal(open))}>
                <DialogContent className="sm:max-w-md">
                    <DialogTitle>
                        <VisuallyHidden>Payment Modal</VisuallyHidden>
                    </DialogTitle>
                    {selectedPlanId && (
                        <PaystackCheckout
                            courseId={selectedPlanId}
                            courseTitle={`Plan Upgrade: ${pricingState.allPlans.find((p) => p.id === selectedPlanId)?.name || "Subscription"}`}
                            amount={pricingState.allPlans.find((p) => p.id === selectedPlanId)?.priceValue || 0}
                            email={user?.email || ""}
                            onSuccess={handlePaymentSuccess}
                            onCancel={() => dispatch(setShowPaymentModal(false))}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
