// components/payment/paystack-checkout.tsx

"use client";
import React, { useState, useEffect } from "react";
import { usePaystackPayment } from "react-paystack";
import type { PaystackProps } from "react-paystack/dist/types";

import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2, CheckCircle, XCircle } from "lucide-react"; // Added icons
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { IS_LIVE_API } from "@/lib/api-client"; // <-- Import the flag

interface PaystackCheckoutProps {
    courseId: string;
    courseTitle: string;
    amount: number;
    email: string;
    onSuccess?: (reference: any) => void;
    onCancel?: () => void;
    userId?: string;
}

interface InitializePaymentOptions {
    onSuccess?: (reference: any) => void;
    onClose?: () => void;
}

export function PaystackCheckout({
    courseId,
    courseTitle,
    amount,
    email,
    onSuccess,
    onCancel,
    userId,
}: PaystackCheckoutProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false); // Used for both real and mock
    const [isPublicKeyAvailable, setIsPublicKeyAvailable] = useState(false);
    const [paystackBaseConfig, setPaystackBaseConfig] = useState<Omit<PaystackProps, 'onSuccess' | 'onClose'> | null>(null);

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    // Callbacks (used by both real and mock)
    const handleSuccess = (reference: any) => {
        console.log(`Payment Success (Mock=${!IS_LIVE_API}), Reference:`, reference);
        setIsLoading(false);
        toast({ title: "Payment Received", description: "Verifying...", variant: "success" });
        if (onSuccess) onSuccess(reference);
    };

    const handleCloseOrCancel = () => {
        console.log(`Payment Closed/Cancelled (Mock=${!IS_LIVE_API})`);
        setIsLoading(false);
        if (onCancel) {
            onCancel();
        } else {
            toast({ title: "Payment Cancelled", variant: "default" });
        }
    };

    // Effect for real Paystack setup
    useEffect(() => {
        // Only run setup if LIVE
        if (IS_LIVE_API) {
            if (publicKey) {
                setIsPublicKeyAvailable(true);
                const generateReference = () => `dyrane_${userId ? userId + '_' : ''}${courseId}_${Date.now()}`;
                const baseConfig: Omit<PaystackProps, 'onSuccess' | 'onClose'> = {
                    reference: generateReference(),
                    email: email,
                    amount: Math.round(amount * 100),
                    publicKey: publicKey,
                    metadata: {
                        user_id: userId || "", item_id: courseId, item_name: courseTitle,
                        custom_fields: [
                            { display_name: "Course Title", variable_name: "course_title", value: courseTitle },
                            { display_name: "User ID", variable_name: "user_id", value: userId || "" },
                            { display_name: "Course ID", variable_name: "course_id", value: courseId },
                        ],
                    },
                };
                setPaystackBaseConfig(baseConfig);
            } else {
                console.error("Paystack Public Key is not defined for LIVE mode.");
                setIsPublicKeyAvailable(false);
                setPaystackBaseConfig(null);
            }
        } else {
            // In MOCK mode, we don't need the public key or base config for the hook
            setIsPublicKeyAvailable(true); // Assume mock is always "available"
            setPaystackBaseConfig(null);
        }
    }, [IS_LIVE_API, publicKey, userId, courseId, courseTitle, email, amount]); // Rerun if mode changes

    // Initialize real Paystack hook (only if config is set - i.e., in LIVE mode)
    const initializePayment = usePaystackPayment(paystackBaseConfig!); // Hook needs a valid config or throws error

    const handleRealPaymentInitiation = () => {
        if (!IS_LIVE_API || !isPublicKeyAvailable || !paystackBaseConfig) return; // Should not happen if button enabled
        if (!email || amount <= 0) {
            toast({ title: "Error", description: "Invalid email or amount.", variant: "destructive" }); return;
        }
        setIsLoading(true);
        const paymentOptions: InitializePaymentOptions = {
            onSuccess: handleSuccess,
            onClose: handleCloseOrCancel,
        };
        initializePayment(paymentOptions);
    };

    // --- Mock Handlers ---
    const handleMockSuccess = () => {
        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            const mockReference = {
                message: 'Mock Payment Approved',
                reference: `mock_tx_${Date.now()}`,
                status: 'success',
                trans: `mock_trans_${Date.now()}`,
                transaction: `mock_trxref_${Date.now()}`,
                trxref: `mock_trxref_${Date.now()}`
            };
            handleSuccess(mockReference); // Call the common success handler
        }, 1500); // 1.5 second delay
    };

    const handleMockCancel = () => {
        setIsLoading(true);
        setTimeout(() => {
            handleCloseOrCancel(); // Call the common close handler
        }, 500);
    };


    // --- Conditional Rendering ---

    // Render error if config failed in LIVE mode
    if (IS_LIVE_API && !isPublicKeyAvailable) {
        return (
            <Alert variant="destructive">
                <AlertDescription>LIVE Payment configuration error. Please contact support.</AlertDescription>
            </Alert>
        );
    }

    // Common Card Structure
    const renderCardContent = () => (
        <CardContent className="pt-0">
            <div className="mb-6 space-y-2">
                <h3 className="text-lg font-semibold">{courseTitle}</h3>
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                    <span>Total:</span>
                    <span>₦{amount.toLocaleString()}</span>
                </div>
            </div>
            {/* Render real button or mock buttons */}
            {IS_LIVE_API ? renderRealButton() : renderMockButtons()}
        </CardContent>
    );

    const renderRealButton = () => (
        <div className="pt-2">
            <DyraneButton
                onClick={handleRealPaymentInitiation}
                className="w-full"
                disabled={isLoading || !isPublicKeyAvailable || !paystackBaseConfig}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Processing..." : `Pay ₦${amount.toLocaleString()} Now`}
            </DyraneButton>
        </div>
    );

    const renderMockButtons = () => (
        <div className="pt-2 space-y-3">
            <Alert variant="default" className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
                <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                    <span className="font-semibold">MOCK MODE:</span> Simulate payment outcome.
                </AlertDescription>
            </Alert>
            <DyraneButton
                onClick={handleMockSuccess}
                className="w-full bg-green-600 hover:bg-green-700" // Success color
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Simulate Success
            </DyraneButton>
            <DyraneButton
                onClick={handleMockCancel}
                className="w-full"
                variant="outline" // Cancel style
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Simulate Cancel/Close
            </DyraneButton>
        </div>
    );

    return (
        <DyraneCard className="w-full max-w-md mx-auto border-none shadow-none">
            <CardHeader>
                {/* Use VisuallyHidden for accessibility if title provided by Dialog */}
                {/* <VisuallyHidden><CardTitle>Payment Checkout</CardTitle></VisuallyHidden> */}
                {/* Or display a title if needed within the component */}
                <CardTitle className="flex items-center gap-2">
                    <Image src="/paystack.png" alt="Paystack Logo" width={20} height={20} />
                    Secure Checkout
                </CardTitle>
            </CardHeader>
            {renderCardContent()}
            <CardFooter className="flex flex-col items-center text-center pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Image src="/paystack.png" alt="Paystack Logo" width={20} height={20} />
                    <span>Secured by {IS_LIVE_API ? 'Paystack' : 'Mock Interface'}</span>
                </div>
            </CardFooter>
        </DyraneCard>
    );
}