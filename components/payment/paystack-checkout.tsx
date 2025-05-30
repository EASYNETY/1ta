// components/payment/paystack-checkout.tsx
"use client";
import React, { useState, useEffect } from "react";
// NO: import { usePaystackPayment } from "react-paystack";
// NO: import type { PaystackProps } from "react-paystack/dist/types";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    initiatePayment, // Your thunk that calls backend to get authorization_url
    verifyPayment,   // This will be used on the callback page, not directly here for live
    selectVerificationStatus, // To show loading if verification is somehow tracked here (less likely for redirect)
    selectPaymentHistoryError,
    resetPaymentState
} from "@/features/payment/store/payment-slice";
import type { PaymentResponse } from "@/features/payment/types/payment-types"; // Ensure this is the redirect one

import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { DyraneCard } from "@/components/dyrane-ui/dyrane-card";
import { CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { IS_LIVE_API } from "@/lib/api-client"; // To distinguish live from mock

interface PaystackCheckoutProps {
    invoiceId: string; // Make it non-optional if always required for paid items
    courseTitle: string;
    amount: number; // Expecting amount in KOBO
    email: string;
    /**
     * Called after successful zero-amount or MOCK transaction from *this component*.
     * For LIVE redirect flow, success is confirmed on the callback page.
     */
    onSuccess?: (referenceData: { reference: string;[key: string]: any }) => void;
    /**
     * Called after MOCK cancellation from *this component*.
     * For LIVE redirect flow, if user cancels on Paystack, they are redirected to callback_url,
     * and verification will likely fail or show a specific status if Paystack indicates cancellation.
     */
    onCancel?: () => void;
    userId?: string; // Useful for metadata in initiatePayment payload
    // No specific Paystack config props like publicKey needed here for redirect
}

export function PaystackCheckout({
    invoiceId,
    courseTitle,
    amount, // Expecting KOBO
    email,
    onSuccess: onComponentSuccess, // For zero-amount or mock
    onCancel: onComponentCancel,   // For mock
    userId,
}: PaystackCheckoutProps) {
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const [isProcessingPayment, setIsProcessingPayment] = useState(false); // For the button click action
    const [initError, setInitError] = useState<string | null>(null);

    // This verificationStatus is from the global payment slice.
    // For redirect, actual verification happens on callback page.
    // We might not see 'loading' here unless some other part of app triggers it.
    const verificationStatus = useAppSelector(selectVerificationStatus);
    const paymentError = useAppSelector(selectPaymentHistoryError); // Global payment error

    useEffect(() => {
        // Reset local error when component mounts or relevant props change
        setInitError(null);
        // Reset payment state of the slice when this modal/component is used
        // This ensures a clean state for each payment attempt through the modal.
        dispatch(resetPaymentState());
        return () => {
            // Optional: dispatch(resetPaymentState()) again on unmount if modal always unmounts after use.
        };
    }, [dispatch, invoiceId, amount, email]); // Key props that define a new payment attempt

    const handlePaymentAttempt = async () => {
        setInitError(null); // Clear previous errors
        if (!email) {
            setInitError("Email is required to proceed with payment.");
            toast({ title: "Input Error", description: "Email is required.", variant: "destructive" });
            return;
        }
        if (amount < 0) {
            setInitError("Invalid payment amount.");
            toast({ title: "Input Error", description: "Invalid amount.", variant: "destructive" });
            return;
        }

        setIsProcessingPayment(true);

        // --- Zero Amount Flow (Free Item) ---
        if (amount === 0) {
            console.log("Processing free item from PaystackCheckout component...");
            setTimeout(() => {
                const mockReference = {
                    message: 'Free Item Processed',
                    reference: `ZERO_AMT_${invoiceId || 'ITEM'}_${Date.now()}`,
                    status: 'success',
                    trans: `ZERO_TRANS_${Date.now()}`,
                    transaction: `ZERO_TRX_${Date.now()}`,
                    trxref: `ZERO_TRXREF_${Date.now()}`
                };
                setIsProcessingPayment(false);
                if (onComponentSuccess) onComponentSuccess(mockReference);
            }, 1000);
            return;
        }

        // --- Paid Item Flow ---
        if (!invoiceId) { // Should always have invoiceId for paid items
            setInitError("Invoice ID is missing. Cannot proceed.");
            toast({ title: "Configuration Error", description: "Invoice ID is required.", variant: "destructive" });
            setIsProcessingPayment(false);
            return;
        }

        try {
            // Dispatch the initiatePayment action (which talks to YOUR backend)
            // Backend constructs callback_url and sends it to Paystack
            const result: PaymentResponse = await dispatch(initiatePayment({
                invoiceId: invoiceId,
                amount,
            })).unwrap(); // result is of type PaymentResponse (with authorizationUrl)

            if (IS_LIVE_API) {
                if (result.authorizationUrl) {
                    // For LIVE: Redirect to Paystack's payment page.
                    // Success/failure will be handled on your configured callback_url page.
                    window.location.href = result.authorizationUrl;
                    // setIsLoading(false) might not be hit if redirect is fast.
                    // The page will navigate away.
                    // No toast here as user is leaving.
                } else {
                    console.error("Live payment initialization failed: No authorization URL returned from backend.");
                    const errMsg = "Could not get payment link. Please try again or contact support.";
                    setInitError(errMsg);
                    toast({ title: "Payment Setup Failed", description: errMsg, variant: "destructive" });
                    setIsProcessingPayment(false);
                }
            } else {
                // MOCK Flow (when IS_LIVE_API is false)
                // Simulate a successful redirect and immediate "callback" with mock data.
                console.log("MOCK MODE: Payment initiated, backend returned (mocked) data:", result);
                console.log("MOCK MODE: Simulating successful payment after 'redirect'.");
                setTimeout(() => {
                    const mockSuccessReference = {
                        message: 'Mock Payment Successful',
                        reference: result.payment?.providerReference || `MOCK_REF_${invoiceId}_${Date.now()}`,
                        status: 'success',
                        trans: `MOCK_TRANS_${Date.now()}`,
                        transaction: `MOCK_TRX_${Date.now()}`,
                        trxref: result.payment?.providerReference || `MOCK_TRXREF_${invoiceId}_${Date.now()}`
                    };
                    setIsProcessingPayment(false);
                    if (onComponentSuccess) onComponentSuccess(mockSuccessReference);
                }, 1500);
            }
        } catch (error: any) {
            console.error("Payment Initialization Failed (Thunk Rejected):", error);
            const errMsg = typeof error === 'string' ? error : error.message || "Could not initialize payment. Please try again.";
            setInitError(errMsg);
            toast({ title: "Payment Failed", description: errMsg, variant: "destructive" });
            setIsProcessingPayment(false);
        }
    };

    const handleMockCancel = () => { // Only for the explicit mock cancel button
        if (IS_LIVE_API) return; // Not for live flow
        setIsProcessingPayment(false);
        if (onComponentCancel) {
            onComponentCancel();
        } else {
            toast({ title: "Mock Payment Cancelled", variant: "default" });
        }
    };

    const amountInNaira = amount;

    return (
        <DyraneCard className="w-full max-w-md mx-auto border-none shadow-none bg-transparent">
            <CardHeader className="pb-2 pt-0">
                <CardTitle className="flex items-center justify-center gap-2 text-lg font-medium">
                    <Image src="/paystack.png" alt="Paystack Logo" width={24} height={24} />
                    Secure Payment
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <div className="mb-4 space-y-1 text-center">
                    <p className="text-sm text-muted-foreground">{courseTitle}</p>
                    <p className="font-semibold text-2xl">
                        {amount === 0 ? 'FREE' : `₦${amountInNaira.toLocaleString()}`}
                    </p>
                </div>
                <Separator className="my-4" />

                {initError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{initError}</AlertDescription>
                    </Alert>
                )}

                {isProcessingPayment && (
                    <div className="py-4 flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-center text-sm text-muted-foreground">
                            {amount === 0 ? "Processing free item..." :
                                IS_LIVE_API ? "Redirecting to secure payment..." :
                                    "Processing mock payment..."}
                        </p>
                    </div>
                )}

                {!isProcessingPayment && (
                    <>
                        {amount === 0 ? (
                            <DyraneButton
                                onClick={handlePaymentAttempt}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                size="lg"
                            >
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Get For Free
                            </DyraneButton>
                        ) : (
                            <>
                                {IS_LIVE_API ? (
                                    <DyraneButton
                                        onClick={handlePaymentAttempt}
                                        className="w-full"
                                        size="lg"
                                    >
                                        <Lock className="mr-2 h-5 w-5" />
                                        Pay ₦{amountInNaira.toLocaleString()} Securely
                                    </DyraneButton>
                                ) : (
                                    /* MOCK UI Buttons */
                                    <div className="space-y-3">
                                        <Alert variant="default" className="bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700">
                                            <AlertDescription className="text-yellow-700 dark:text-yellow-200 text-sm text-center">
                                                <span className="font-bold">MOCK MODE</span>
                                            </AlertDescription>
                                        </Alert>
                                        <DyraneButton
                                            onClick={handlePaymentAttempt} // Triggers mock success path
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            size="lg"
                                        >
                                            <CheckCircle className="mr-2 h-5 w-5" />
                                            Simulate Successful Payment
                                        </DyraneButton>
                                        <DyraneButton
                                            onClick={handleMockCancel}
                                            className="w-full"
                                            variant="outline"
                                            size="lg"
                                        >
                                            <XCircle className="mr-2 h-5 w-5" />
                                            Simulate Cancel
                                        </DyraneButton>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </CardContent>
            <CardFooter className="flex flex-col items-center text-center pt-4 mt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Image src="/paystack.png" alt="Paystack Logo" width={16} height={16} />
                    <span>Secured by {IS_LIVE_API ? 'Paystack' : 'Mock Interface'}</span>
                </div>
            </CardFooter>
        </DyraneCard>
    );
}