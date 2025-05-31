// components/payment/paystack-checkout.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    initiatePayment,
    resetPaymentState,
    selectVerificationStatus,
    selectPaymentHistoryError,
} from "@/features/payment/store/payment-slice";
import type { PaymentResponse } from "@/features/payment/types/payment-types";
import { DyraneButton } from "@/components/dyrane-ui/dyrane-button";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { GraduationCap } from "phosphor-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added AlertTitle
import Image from "next/image";
import { IS_LIVE_API } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface PaystackCheckoutProps {
    invoiceId: string;
    courseTitle: string;
    amount: number;
    email: string;
    onSuccess?: (referenceData: { reference: string;[key: string]: any }) => void;
    onCancel?: () => void;
    userId?: string;
}

export function PaystackCheckout({
    invoiceId,
    courseTitle,
    amount,
    email,
    onSuccess: onComponentSuccess,
    onCancel: onComponentCancel,
    userId,
}: PaystackCheckoutProps) {
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const [isProcessingPayment, setIsProcessingPayment] = useState(false); // For initiatePayment thunk
    const [initError, setInitError] = useState<string | null>(null); // Local error from initiatePayment

    // Global states from Redux store
    const verificationStatus = useAppSelector(selectVerificationStatus); // e.g., 'idle', 'loading', 'succeeded', 'failed'
    const globalPaymentError = useAppSelector(selectPaymentHistoryError); // Global error message

    useEffect(() => {
        setInitError(null);
        // Reset global payment state when this component mounts or key props change,
        // ensuring a clean slate for this payment attempt.
        dispatch(resetPaymentState());
    }, [dispatch, invoiceId, amount, email]);

    const handlePaymentAttempt = async () => {
        setInitError(null);
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

        if (!invoiceId) {
            setInitError("Invoice ID is missing. Cannot proceed.");
            toast({ title: "Configuration Error", description: "Invoice ID is required.", variant: "destructive" });
            setIsProcessingPayment(false);
            return;
        }

        try {
            const result: PaymentResponse = await dispatch(initiatePayment({
                invoiceId: invoiceId,
                amount,
                paymentMethod: "paystack"
            })).unwrap();

            if (IS_LIVE_API) {
                if (result.authorizationUrl) {
                    window.location.href = result.authorizationUrl;
                    // Note: setIsProcessingPayment(false) might not be hit if redirect is fast.
                } else {
                    console.error("Live payment initialization failed: No authorization URL returned from backend.");
                    const errMsg = "Could not get payment link. Please try again or contact support.";
                    setInitError(errMsg);
                    toast({ title: "Payment Setup Failed", description: errMsg, variant: "destructive" });
                    setIsProcessingPayment(false);
                }
            } else {
                console.log("MOCK MODE: Payment initiated, backend returned (mocked) data:", result);
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
            setInitError(errMsg); // Set local error for this component's direct action
            toast({ title: "Payment Failed", description: errMsg, variant: "destructive" });
            setIsProcessingPayment(false);
        }
    };

    const handleMockCancel = () => {
        if (IS_LIVE_API) return;
        setIsProcessingPayment(false);
        if (onComponentCancel) {
            onComponentCancel();
        } else {
            toast({ title: "Mock Payment Cancelled", variant: "default" });
        }
    };

    const amountInNaira = amount;
    const accentColor = "bg-primary hover:bg-primary/90";

    // Determine if action buttons should be shown
    // Hide buttons if:
    // 1. Initiating payment (isProcessingPayment is true)
    // 2. Global verification is loading, succeeded, or failed (unless it's idle)
    const showActionButtons = !isProcessingPayment && verificationStatus === 'idle';

    return (
        <div className="w-full max-w-sm mx-auto p-6 sm:p-8 bg-background rounded-xl shadow-2xl dark:bg-card/5 backdrop-blur-sm border border-primary/25">
            <div className="text-center mb-6">
                <Image src="/paystack.png" alt="Paystack Logo" width={64} height={64} className="mx-auto mb-3 rounded-xl" />
                <h1 className="text-2xl font-semibold text-foreground dark:text-neutral-100">
                    {amount === 0 ? "Complete Your Order" : "Secure Payment"}
                </h1>
                {amount > 0 && email && (
                    <p className="text-sm text-muted-foreground mt-1 dark:text-neutral-400">
                        Paying as <span className="font-medium text-foreground dark:text-neutral-200">{email}</span>
                    </p>
                )}
            </div>

            <div className="mb-6 p-4 bg-muted dark:bg-accent/50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground dark:text-neutral-300 flex items-center">
                        <GraduationCap weight="fill" className="w-4 h-4 mr-2 text-muted-foreground dark:text-neutral-400" />
                        {courseTitle}
                    </span>
                    <span className="text-sm font-medium text-foreground dark:text-neutral-200">
                        {amount === 0 ? 'FREE' : `₦${amountInNaira.toLocaleString()}`}
                    </span>
                </div>
                <Separator className="my-3 bg-border dark:bg-neutral-600" />
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground dark:text-neutral-100">Total</span>
                    <span className="text-xl font-bold text-foreground dark:text-neutral-50">
                        {amount === 0 ? 'FREE' : `₦${amountInNaira.toLocaleString()}`}
                    </span>
                </div>
            </div>

            {/* --- UI based on local and global states --- */}

            {/* 1. Local Initialization Error (takes precedence for this component's actions) */}
            {initError && (
                <Alert variant="destructive" className="mb-4 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Payment Initiation Failed</AlertTitle>
                    <AlertDescription>{initError}</AlertDescription>
                </Alert>
            )}

            {/* 2. Global Payment Error (if no local error) */}
            {!initError && globalPaymentError && (
                <Alert variant="destructive" className="mb-4 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Payment Error</AlertTitle>
                    <AlertDescription>{globalPaymentError}</AlertDescription>
                </Alert>
            )}

            {/* 3. Loader for `initiatePayment` thunk */}
            {isProcessingPayment && (
                <div className="py-6 flex flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary dark:text-blue-400 mb-3" />
                    <p className="text-center text-md text-muted-foreground dark:text-neutral-300">
                        {amount === 0 ? "Processing..." :
                            IS_LIVE_API ? "Redirecting to secure payment..." :
                                "Processing mock payment..."}
                    </p>
                    <p className="text-xs text-muted-foreground/70 dark:text-neutral-400 mt-1">Please wait...</p>
                </div>
            )}

            {/* 4. UI for Global Verification Status (when not processing initiation) */}
            {!isProcessingPayment && verificationStatus === 'loading' && (
                <Alert variant="default" className="mb-4 text-sm bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-700 dark:text-blue-300">Verification In Progress</AlertTitle>
                    <AlertDescription className="text-blue-600 dark:text-blue-400">
                        We are currently verifying your payment. Please wait a moment.
                    </AlertDescription>
                </Alert>
            )}
            {!isProcessingPayment && verificationStatus === 'succeeded' && (
                <Alert variant="default" className="mb-4 text-sm bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle className="text-green-700 dark:text-green-300">Payment Successful!</AlertTitle>
                    <AlertDescription className="text-green-600 dark:text-green-400">
                        Your payment has been confirmed. {onComponentSuccess ? "You will be redirected shortly." : ""}
                    </AlertDescription>
                </Alert>
            )}
            {!isProcessingPayment && verificationStatus === 'failed' && !globalPaymentError && ( // Avoid double error if globalPaymentError is also set
                <Alert variant="destructive" className="mb-4 text-sm">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Payment Verification Failed</AlertTitle>
                    <AlertDescription>
                        There was an issue verifying your payment. Please try again or contact support.
                    </AlertDescription>
                </Alert>
            )}

            {/* Payment Action Buttons - Shown only if not processing and global status is idle */}
            {showActionButtons && (
                <div className="space-y-4">
                    {amount === 0 ? (
                        <DyraneButton
                            onClick={handlePaymentAttempt}
                            className={cn("w-full text-white py-3 text-base font-medium", "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600")}
                        >
                            <CheckCircle className="mr-2 h-5 w-5" /> Get For Free
                        </DyraneButton>
                    ) : (
                        <>
                            {IS_LIVE_API ? (
                                <Button
                                    onClick={handlePaymentAttempt}
                                    className={cn("w-full text-white py-3 text-base font-medium cursor-pointer", accentColor)}
                                >
                                    <Lock className="mr-2 h-5 w-5" /> Pay ₦{amountInNaira.toLocaleString()} Securely
                                </Button>
                            ) : (
                                <div className="space-y-3 pt-2">
                                    <Alert variant="default" className="bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700 mb-3">
                                        <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                                        <AlertDescription className="text-yellow-700 dark:text-yellow-200 text-xs">
                                            This is a <span className="font-bold">MOCK MODE</span> demonstration.
                                        </AlertDescription>
                                    </Alert>
                                    <DyraneButton
                                        onClick={handlePaymentAttempt}
                                        className={cn("w-full text-white py-3 text-base font-medium", "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600")}
                                    >
                                        <CheckCircle className="mr-2 h-5 w-5" /> Simulate Successful Payment
                                    </DyraneButton>
                                    <DyraneButton
                                        onClick={handleMockCancel}
                                        className="w-full py-3 text-base font-medium border-border dark:border-neutral-600 text-foreground dark:text-neutral-300 hover:bg-muted dark:hover:bg-neutral-700"
                                        variant="outline"
                                    >
                                        <XCircle className="mr-2 h-5 w-5" /> Simulate Cancel
                                    </DyraneButton>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            <div className="mt-8 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground dark:text-neutral-400">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Payments secured by</span>
                    <Image src="/paystack.png" alt="Paystack Logo" width={16} height={16} className="inline-block" />
                    <span className="font-medium text-foreground dark:text-neutral-300">{IS_LIVE_API ? 'Paystack' : 'Mock Interface'}</span>
                </div>
            </div>
        </div>
    );
}