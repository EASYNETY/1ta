// components/payment/paystack-checkout.tsx

"use client";
import React, { useState, useEffect } from "react";
import { usePaystackPayment } from "react-paystack";
import type { PaystackProps } from "react-paystack/dist/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    initiatePayment,
    verifyPayment,
    selectCurrentPayment,
    selectPaymentInitialization,
    selectVerificationStatus,
    selectPaymentHistoryError,
    resetPaymentState
} from "@/features/payment/store/payment-slice";

import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { IS_LIVE_API } from "@/lib/api-client";

interface PaystackCheckoutProps {
    invoiceId?: string;
    courseId?: string;
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
    invoiceId,
    courseId,
    courseTitle,
    amount,
    email,
    onSuccess,
    onCancel,
    userId,
}: PaystackCheckoutProps) {
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Get payment state from Redux
    const verificationStatus = useAppSelector(selectVerificationStatus);
    const paymentError = useAppSelector(selectPaymentHistoryError);


    // Reset payment state on unmount
    useEffect(() => {
        return () => {
            dispatch(resetPaymentState());
        };
    }, [dispatch]);

    // Handle payment initialization
    const handleInitiatePayment = async () => {
        if (!email) {
            toast({ title: "Error", description: "Email is required.", variant: "destructive" });
            return;
        }

        // Handle zero amount payments differently
        if (amount === 0) {
            setIsLoading(true);
            // For zero amount, we can skip the payment gateway and directly mark as successful
            setTimeout(() => {
                const mockReference = {
                    message: 'Free Item Processed',
                    reference: `free_item_${Date.now()}`,
                    status: 'success',
                    trans: `free_trans_${Date.now()}`,
                    transaction: `free_trxref_${Date.now()}`,
                    trxref: `free_trxref_${Date.now()}`
                };
                handleSuccess(mockReference);
            }, 1000);
            return;
        }

        // Handle negative amounts (shouldn't happen, but just in case)
        if (amount < 0) {
            toast({ title: "Error", description: "Invalid amount.", variant: "destructive" });
            return;
        }

        try {
            setIsLoading(true);

        if (!invoiceId) {
            toast({ title: "Error", description: "Invoice ID is required.", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        // Use the passed invoiceId directly
        const paymentInvoiceId = invoiceId;

        // Dispatch the initiatePayment action
        const result = await dispatch(initiatePayment({
            invoiceId: paymentInvoiceId,
            amount,
            paymentMethod: 'card'
        })).unwrap();

            // If we're in LIVE mode, redirect to Paystack's authorization URL
            if (IS_LIVE_API && result.authorizationUrl) {
                window.location.href = result.authorizationUrl;
            } else {
                // For mock mode, simulate a successful payment
                handleMockSuccess();
            }
        } catch (error: any) {
            toast({
                title: "Payment Initialization Failed",
                description: error.message || "Could not initialize payment",
                variant: "destructive"
            });
            setIsLoading(false);
        }
    };

    // Callbacks (used by both real and mock)
    const handleSuccess = (reference: any) => {
        console.log(`Payment Success (Mock=${!IS_LIVE_API}), Reference:`, reference);
        setIsLoading(false);
        toast({ title: "Payment Received", description: "Verifying...", variant: "success" });

        // Verify the payment
        dispatch(verifyPayment({ reference: reference.reference }));

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
    // Render error if there was a payment error
    if (paymentError) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{paymentError}</AlertDescription>
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
                    <span>{amount === 0 ? 'Free' : `₦${amount.toLocaleString()}`}</span>
                </div>
            </div>

            {/* Loading or verification in progress */}
            {(isLoading || verificationStatus === "loading") && (
                <div className="pt-2 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-center text-sm text-muted-foreground">
                        {amount === 0 ? "Processing free item..." : "Processing payment..."}
                    </p>
                </div>
            )}

            {/* Ready to pay - not loading */}
            {!isLoading && verificationStatus !== "loading" && (
                <>
                    {/* Free item (zero amount) */}
                    {amount === 0 ? (
                        <div className="pt-2">
                            <DyraneButton
                                onClick={handleInitiatePayment}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Get Free Item
                            </DyraneButton>
                        </div>
                    ) : (
                        <>
                            {/* Paid item - Live mode */}
                            {IS_LIVE_API ? (
                                <div className="pt-2">
                                    <DyraneButton
                                        onClick={handleInitiatePayment}
                                        className="w-full"
                                    >
                                        Pay ₦{amount.toLocaleString()} Now
                                    </DyraneButton>
                                </div>
                            ) : (
                                /* Paid item - Mock mode */
                                <div className="pt-2 space-y-3">
                                    <Alert variant="default" className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
                                        <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                                            <span className="font-semibold">MOCK MODE:</span> Simulate payment outcome.
                                        </AlertDescription>
                                    </Alert>
                                    <DyraneButton
                                        onClick={handleInitiatePayment}
                                        className="w-full bg-green-600 hover:bg-green-700" // Success color
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Simulate Success
                                    </DyraneButton>
                                    <DyraneButton
                                        onClick={handleMockCancel}
                                        className="w-full"
                                        variant="outline" // Cancel style
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Simulate Cancel/Close
                                    </DyraneButton>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </CardContent>
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