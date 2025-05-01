"use client"
import { useState, useEffect } from "react"
import { usePaystackPayment } from "react-paystack"
import type { PaystackProps } from "react-paystack/dist/types"

import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Lock, Loader2 } from "lucide-react" // Added Loader2
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert" // For potential errors

interface PaystackCheckoutProps {
    // Keep these props
    courseId: string // Or PlanId in your case
    courseTitle: string // Or PlanTitle
    amount: number // Amount in Major Currency (e.g., NGN). We convert to Kobo here.
    email: string

    // Callbacks remain the same conceptually
    onSuccess?: (reference: any) => void // Pass reference back
    onCancel?: () => void

    // Optional: Pass user ID for reference/metadata
    userId?: string
}

export function PaystackCheckout({
    courseId, // Renaming for clarity: planId
    courseTitle, // Renaming for clarity: planName
    amount,
    email,
    onSuccess,
    onCancel,
    userId,
}: PaystackCheckoutProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false) // Loading state for the button click itself
    const [isPublicKeyAvailable, setIsPublicKeyAvailable] = useState(false)

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

    useEffect(() => {
        if (publicKey) {
            setIsPublicKeyAvailable(true)
        } else {
            console.error("Paystack Public Key is not defined in environment variables.")
            setIsPublicKeyAvailable(false)
        }
    }, [publicKey])

    // Generate a unique reference for each transaction attempt
    const generateReference = () => {
        // Example: Combine identifiers and timestamp for uniqueness
        const prefix = "dyrane"
        const userPart = userId ? `_${userId}` : ""
        const planPart = courseId ? `_${courseId}` : ""
        const timePart = `_${Date.now()}`
        return `${prefix}${userPart}${planPart}${timePart}`.replace(/[^a-zA-Z0-9_]/g, "_") // Ensure valid characters
    }

    const config: PaystackProps = {
        reference: generateReference(),
        email: email,
        amount: Math.round(amount * 100), // Convert Amount to Kobo (or cents) and ensure integer
        publicKey: publicKey || "", // Ensure publicKey is not undefined when passed to PaystackProps
        metadata: {
            // Pass relevant info that you might need later (on webhook, dashboard, etc.)
            user_id: userId || "",
            item_id: courseId, // Keep consistent naming if possible (plan_id)
            item_name: courseTitle, // (plan_name)
            // custom_fields: [ // Example structure
            //   {
            //     display_name: "Description",
            //     variable_name: "item_description",
            //     value: `Subscription to ${courseTitle}`
            //   }
            // ]
        },
        // channel: ['card', 'bank'], // Optional: Specify allowed channels
    }

    const initializePayment = usePaystackPayment(config)

    const handlePaystackSuccess = (reference: any) => {
        // This function is called by react-paystack when payment is successful
        console.log("Paystack Payment Successful, Reference:", reference)
        setIsLoading(false) // Stop button loading
        toast({
            title: "Payment Received",
            description: "Verifying your subscription...",
            variant: "success",
        })
        // Call the onSuccess prop passed from the parent component
        // This will trigger the logic to create the subscription in the backend
        if (onSuccess) {
            onSuccess(reference)
        }
    }

    const handlePaystackClose = () => {
        // This function is called by react-paystack when the modal is closed
        console.log("Paystack Modal Closed")
        setIsLoading(false) // Stop button loading
        // Call the onCancel prop passed from the parent component
        if (onCancel) {
            onCancel()
        } else {
            toast({
                title: "Payment Cancelled",
                description: "You have closed the payment window.",
                variant: "default",
            })
        }
    }

    const handlePaymentInitiation = () => {
        if (!email) {
            toast({
                title: "Error",
                description: "User email is missing. Cannot initiate payment.",
                variant: "destructive",
            })
            return
        }
        if (amount <= 0) {
            toast({
                title: "Error",
                description: "Invalid amount. Cannot initiate payment for zero or negative value.",
                variant: "destructive",
            })
            return
        }
        setIsLoading(true) // Start loading when button is clicked
        initializePayment(handlePaystackSuccess, handlePaystackClose)
    }

    if (!isPublicKeyAvailable) {
        return (
            <Alert variant="destructive">
                <AlertDescription>Payment configuration error. Please contact support.</AlertDescription>
            </Alert>
        )
    }

    return (
        <DyraneCard className="w-full max-w-md mx-auto border-none shadow-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Secure Checkout
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="mb-6 space-y-2">
                    <h3 className="text-lg font-semibold">{courseTitle}</h3>
                    <Separator />
                    <div className="flex justify-between font-bold text-xl">
                        <span>Total:</span>
                        <span>₦{amount.toLocaleString()}</span>
                    </div>
                </div>

                {/* Add the Paystack Button */}
                <div className="pt-2">
                    <DyraneButton
                        onClick={handlePaymentInitiation}
                        className="w-full"
                        disabled={isLoading || !publicKey} // Disable if loading or key missing
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>Pay ₦{amount.toLocaleString()} Now</>
                        )}
                    </DyraneButton>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center text-center pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Secured by Paystack</span>
                </div>
            </CardFooter>
        </DyraneCard>
    )
}
