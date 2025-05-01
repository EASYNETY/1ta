// component/payment/paystack-checkout.tsx

"use client";
import { useState, useEffect } from "react";
import { usePaystackPayment } from "react-paystack";
// Import the specific type for the initialize options if available, otherwise infer or define
import type { PaystackProps } from "react-paystack/dist/types";

import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

interface PaystackCheckoutProps {
    courseId: string;
    courseTitle: string;
    amount: number;
    email: string;
    onSuccess?: (reference: any) => void;
    onCancel?: () => void; // Renaming to onClose to match Paystack's convention might be clearer
    userId?: string;
}

// Define the type for the argument expected by initializePayment based on the error
interface InitializePaymentOptions {
    onSuccess?: (reference: any) => void;
    onClose?: () => void;
    // config?: Omit<PaystackProps, "publicKey">; // This part from the error seems less common, focus on onSuccess/onClose first
}


export function PaystackCheckout({
    courseId,
    courseTitle,
    amount,
    email,
    onSuccess,
    onCancel, // Use this prop for the onClose callback
    userId,
}: PaystackCheckoutProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isPublicKeyAvailable, setIsPublicKeyAvailable] = useState(false);
    // Store only the base config needed by the hook itself
    const [paystackBaseConfig, setPaystackBaseConfig] = useState<Omit<PaystackProps, 'onSuccess' | 'onClose'> | null>(null);

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    // --- Callbacks defined outside config ---
    const handlePaystackSuccess = (reference: any) => {
        console.log("Paystack Payment Successful, Reference:", reference);
        setIsLoading(false);
        toast({
            title: "Payment Received",
            description: "Verifying your subscription...",
            variant: "success",
        });
        if (onSuccess) {
            onSuccess(reference);
        }
    };

    // Use the passed 'onCancel' prop for the onClose behavior
    const handlePaystackClose = () => {
        console.log("Paystack Modal Closed");
        setIsLoading(false);
        if (onCancel) {
            onCancel(); // Call the prop directly
        } else {
            // Default behavior if onCancel prop isn't provided
            toast({
                title: "Payment Cancelled",
                description: "You have closed the payment window.",
                variant: "default",
            });
        }
    };
    // --- End Callbacks ---

    useEffect(() => {
        if (publicKey) {
            setIsPublicKeyAvailable(true);

            const generateReference = () => {
                const prefix = "dyrane";
                const userPart = userId ? `_${userId}` : "";
                const planPart = courseId ? `_${courseId}` : "";
                const timePart = `_${Date.now()}`;
                return `${prefix}${userPart}${planPart}${timePart}`.replace(/[^a-zA-Z0-9_]/g, "_");
            };

            // --- Define the BASE config (without onSuccess/onClose) ---
            const baseConfig: Omit<PaystackProps, 'onSuccess' | 'onClose'> = {
                reference: generateReference(),
                email: email,
                amount: Math.round(amount * 100),
                publicKey: publicKey, // publicKey is guaranteed here
                metadata: {
                    user_id: userId || "",
                    item_id: courseId,
                    item_name: courseTitle,
                    custom_fields: [
                        {
                            display_name: "Description",
                            variable_name: "item_description",
                            value: `Subscription to ${courseTitle}`
                        }
                    ]
                },
                // channel: ['card', 'bank'], // Optional
                // label: courseTitle // Optional label for Paystack form
            };
            setPaystackBaseConfig(baseConfig);

        } else {
            console.error("Paystack Public Key is not defined.");
            setIsPublicKeyAvailable(false);
            setPaystackBaseConfig(null);
        }
    }, [publicKey, userId, courseId, courseTitle, email, amount]); // Dependencies for BASE config


    // Initialize Paystack hook with the BASE config
    // The hook itself doesn't take onSuccess/onClose in its config argument
    const initializePayment = usePaystackPayment(paystackBaseConfig!);

    const handlePaymentInitiation = () => {
        if (!isPublicKeyAvailable || !paystackBaseConfig) {
            toast({ title: "Configuration Error", description: "Payment cannot be initiated.", variant: "destructive" });
            return;
        }
        if (!email) {
            toast({ title: "Error", description: "User email is missing.", variant: "destructive" });
            return;
        }
        if (amount <= 0) {
            toast({ title: "Error", description: "Invalid amount.", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        // *** Call initializePayment WITH the options object argument ***
        const paymentOptions: InitializePaymentOptions = {
            onSuccess: handlePaystackSuccess,
            onClose: handlePaystackClose,
            // config: {} // Add this only if you need to override parts of the base config for this specific call
        };
        initializePayment(paymentOptions); // Pass the options object
    };

    if (!isPublicKeyAvailable) {
        return (
            <Alert variant="destructive">
                <AlertDescription>Payment configuration error. Please contact support.</AlertDescription>
            </Alert>
        );
    }

    return (
        <DyraneCard className="w-full max-w-md mx-auto border-none shadow-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Image src="/images/paystack.png" alt="Paystack Logo" width={20} height={20} />
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

                <div className="pt-2">
                    <DyraneButton
                        onClick={handlePaymentInitiation}
                        className="w-full"
                        disabled={isLoading || !isPublicKeyAvailable || !paystackBaseConfig}
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
                    <Image src="/images/paystack.png" alt="Paystack Logo" width={20} height={20} />
                    <span>Secured by Paystack</span>
                </div>
            </CardFooter>
        </DyraneCard>
    );
}