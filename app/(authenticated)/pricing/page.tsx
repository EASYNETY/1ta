// app/(authenticated)/pricing/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { Check, X, GraduationCap, AlertCircle, Calendar } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { clearCart } from "@/features/cart/store/cart-slice"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { PaystackCheckout } from "@/components/payment/paystack-checkout"
import {
    selectPlan,
    skipPricingSelection,
    setPaymentDetails,
    selectSelectedPlan,
    selectSkipPricing,
    selectPricingState,
    selectUserSubscription,
    setShowPaymentModal,
    selectShowPaymentModal,
    fetchPlans,
    fetchUserSubscription,
    createUserSubscription,
} from "@/features/pricing/store/pricing-slice"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function PricingPage() {
    const { user } = useAppSelector((state) => state.auth)
    const cart = useAppSelector((state) => state.cart)
    const pricingState = useAppSelector(selectPricingState)
    const selectedPlan = useAppSelector(selectSelectedPlan)
    const skipPricing = useAppSelector(selectSkipPricing)
    const userSubscription = useAppSelector(selectUserSubscription)
    const showPaymentModal = useAppSelector(selectShowPaymentModal)
    const router = useRouter()
    const searchParams = useSearchParams()
    const dispatch = useAppDispatch()
    const { toast } = useToast()

    // Example if role determines corporate context
    const isPotentiallyCorporate = user?.role === 'admin'; // Or some other check
    const defaultType = searchParams.get("type") || (isPotentiallyCorporate ? "corporate" : "individual");
    const [billingType, setBillingType] = useState<"individual" | "corporate">(
        defaultType === "corporate" ? "corporate" : "individual",
    );
    const plans = (billingType === "individual" ? pricingState.individualPlans : pricingState.corporatePlans) || [];

    const hasItemsInCart = cart.items.length > 0
    const [isProcessing, setIsProcessing] = useState(false)

    // Fetch plans on component mount
    useEffect(() => {
        dispatch(fetchPlans())
    }, [dispatch])

    // Fetch user subscription on component mount
    useEffect(() => {
        if (user && user.id) {
            dispatch(fetchUserSubscription(user.id))
        }
    }, [user, dispatch])

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

        // Show payment modal
        dispatch(setShowPaymentModal(true))
    }

    const handlePaymentSuccess = async () => {
        if (!selectedPlan || !user) return

        setIsProcessing(true)

        try {
            // Create subscription using thunk
            await dispatch(createUserSubscription({ userId: user.id, planId: selectedPlan.id })).unwrap()

            // Set payment details
            dispatch(
                setPaymentDetails({
                    planId: selectedPlan.id,
                    planName: selectedPlan.name,
                    amount: selectedPlan.priceValue || 0,
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
                description: `You have successfully subscribed to the ${selectedPlan.name} plan.`,
                variant: "success",
            })

            // Close payment modal
            dispatch(setShowPaymentModal(false))

            // Redirect to dashboard
            router.push("/dashboard")
        } catch (error) {
            toast({
                title: "Payment Failed",
                description: "There was an error processing your payment. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
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

    // If user is admin, redirect to admin pricing page
    if (user?.role === "admin") {
        router.push("/admin/pricing")
        return null
    }

    // If user already has an active subscription, show subscription details
    if (userSubscription && userSubscription.status === "active") {
        return (
            <div className="mx-auto w-full">
                <div className="text-center sm:text-left mb-10 w-full">
                    <h1 className="text-3xl font-bold mb-4">Your Subscription</h1>
                    <p className="text-muted-foreground">
                        You are currently subscribed to the {userSubscription.planName} plan.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <DyraneCard className="border-primary">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">{userSubscription.planName} Plan</h2>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                    Active
                                </Badge>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Subscription Period</p>
                                        <p className="font-medium">
                                            {format(new Date(userSubscription.startDate), "PPP")} -{" "}
                                            {format(new Date(userSubscription.expiryDate), "PPP")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Auto-Renewal</p>
                                        <p className="font-medium">{userSubscription.autoRenew ? "Enabled" : "Disabled"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <DyraneButton variant="outline" className="flex-1" onClick={() => router.push("/subscription/manage")}>
                                    Manage Subscription
                                </DyraneButton>
                                <DyraneButton className="flex-1" onClick={() => router.push("/subscription/upgrade")}>
                                    Upgrade Plan
                                </DyraneButton>
                            </div>
                        </div>
                    </DyraneCard>

                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">Payment History</h3>
                        <DyraneCard>
                            <div className="p-4">
                                <div className="space-y-4">
                                    {userSubscription.paymentHistory.map((payment, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 border-b last:border-0">
                                            <div>
                                                <p className="font-medium">{payment.planName} Plan</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {payment.paymentDate ? format(new Date(payment.paymentDate), "PPP") : "N/A"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">₦{payment.amount.toLocaleString()}</p>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    {payment.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </DyraneCard>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto">
            <div className="text-center sm:text-left mb-10">
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
                {plans
                    .filter((plan) => plan.active !== false)
                    .map((plan) => (
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
                                        disabled={isProcessing || pricingState.isLoading}
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
                <DyraneButton variant="outline" onClick={handleSkipPricing} disabled={isProcessing || pricingState.isLoading}>
                    Skip for now
                </DyraneButton>
            </div>

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onOpenChange={(open) => dispatch(setShowPaymentModal(open))}>
                <DialogContent className="sm:max-w-md">
                    <DialogTitle>
                        <VisuallyHidden>Payment Modal</VisuallyHidden>
                    </DialogTitle>
                    {selectedPlan && (
                        <PaystackCheckout
                            courseId={selectedPlan.id}
                            courseTitle={`${selectedPlan.name} Plan Subscription`}
                            amount={selectedPlan.priceValue || 0}
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
