// components/payment/paystack-checkout.tsx

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button"
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card"
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CreditCard, Lock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { post } from "@/lib/api-client"

interface PaystackCheckoutProps {
    courseId: string
    courseTitle: string
    amount: number
    email: string
    onSuccess?: () => void
    onCancel?: () => void
}

export function PaystackCheckout({ courseId, courseTitle, amount, email, onSuccess, onCancel }: PaystackCheckoutProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isProcessing, setIsProcessing] = useState(false)
    const [cardNumber, setCardNumber] = useState("")
    const [expiryDate, setExpiryDate] = useState("")
    const [cvv, setCvv] = useState("")
    const [cardName, setCardName] = useState("")

    // Format card number with spaces
    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
        const matches = v.match(/\d{4,16}/g)
        const match = (matches && matches[0]) || ""
        const parts = []

        for (let i = 0; i < match.length; i += 4) {
            parts.push(match.substring(i, i + 4))
        }

        if (parts.length) {
            return parts.join(" ")
        } else {
            return value
        }
    }

    // Format expiry date
    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")

        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`
        }

        return v
    }

    // Handle payment submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!cardNumber || !expiryDate || !cvv || !cardName) {
            toast({
                title: "Missing Information",
                description: "Please fill in all card details",
                variant: "destructive",
            })
            return
        }

        try {
            setIsProcessing(true)

            // Mock API call to create checkout session
            const response = await post("/payments/create-checkout-session", {
                courseId,
                amount,
                email,
                cardDetails: {
                    number: cardNumber.replace(/\s+/g, ""),
                    expiry: expiryDate,
                    cvv,
                    name: cardName,
                },
            })

            // Simulate processing delay
            await new Promise((resolve) => setTimeout(resolve, 2000))

            toast({
                title: "Payment Successful",
                description: `You have successfully enrolled in ${courseTitle}`,
                variant: "success",
            })

            if (onSuccess) {
                onSuccess()
            } else {
                router.push(`/courses/${courseId}`)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Payment processing failed"

            toast({
                title: "Payment Failed",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <DyraneCard className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Secure Checkout
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{courseTitle}</h3>
                    <div className="flex justify-between">
                        <span>Course Price:</span>
                        <span>₦{amount.toLocaleString()}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₦{amount.toLocaleString()}</span>
                    </div>
                </div>

                <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300 font-medium">Test Mode</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                        <p className="mb-2">This is a test payment. Use the following test card details:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Card Number: 4084 0840 8408 4081</li>
                            <li>Expiry Date: Any future date</li>
                            <li>CVV: Any 3 digits</li>
                        </ul>
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                            id="cardName"
                            placeholder="John Doe"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <div className="relative">
                            <Input
                                id="cardNumber"
                                placeholder="4084 0840 8408 4081"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                                required
                            />
                            <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                                id="expiryDate"
                                placeholder="MM/YY"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                                maxLength={5}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                                id="cvv"
                                placeholder="123"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                                maxLength={3}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <DyraneButton type="submit" className="w-full" disabled={isProcessing}>
                            {isProcessing ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                                    Processing...
                                </>
                            ) : (
                                <>Pay ₦{amount.toLocaleString()}</>
                            )}
                        </DyraneButton>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center text-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Secured by Paystack</span>
                </div>
            </CardFooter>
        </DyraneCard>
    )
}
