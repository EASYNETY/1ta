// app/(authenticated)/payments/callback/page.tsx
"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';

import {
    verifyPayment,
    selectVerificationStatus,
    selectPaymentHistoryError, // Using general error selector as per your types
    resetPaymentState,
    selectCurrentPayment
} from '@/features/payment/store/payment-slice';
import type { PaymentRecord } from '@/features/payment/types/payment-types';

import {
    enrolCoursesAfterPayment,
} from '@/features/checkout/store/checkoutSlice';
import type { EnrolCoursesPayload } from "@/features/checkout/types/checkout-types";
import { clearCart } from '@/features/cart/store/cart-slice';

import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Helper function to parse metadata string from PaymentRecord
const getMetadataFromPaymentRecord = (record: PaymentRecord | null): Record<string, any> => {
    if (!record) return {};
    // Prioritize gatewayRef, then description, for storing stringified metadata
    // This is a workaround due to PaymentRecord not having a dedicated metadata field.
    const potentialJson = record.gatewayRef || record.description;
    if (typeof potentialJson === 'string' && potentialJson.startsWith('{') && potentialJson.endsWith('}')) {
        try {
            return JSON.parse(potentialJson);
        } catch (e) {
            console.warn("Callback: Could not parse metadata from PaymentRecord field:", potentialJson, e);
        }
    }
    // If not found or not parsable, return an empty object.
    // Consider logging this scenario more formally if metadata is critical.
    console.warn("Callback: Metadata not found or not in expected stringified JSON format in gatewayRef or description.");
    return {};
};

function PaymentCallbackContent() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const verificationStatus = useAppSelector(selectVerificationStatus);
    const verificationError = useAppSelector(selectPaymentHistoryError);
    const verifiedPaymentDetails = useAppSelector(selectCurrentPayment);

    const { user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');
        const paymentReference = trxref || reference;

        if (paymentReference) {
            if (verificationStatus === 'idle' && (!verifiedPaymentDetails || verifiedPaymentDetails.providerReference !== paymentReference)) {
                dispatch(verifyPayment({ reference: paymentReference }));
            }
        } else {
            toast({ title: "Invalid Payment Link", description: "Redirecting to checkout.", variant: "destructive" });
            router.replace('/checkout');
        }
    }, [searchParams, dispatch, router, toast, verificationStatus, verifiedPaymentDetails]); // Removed resetPaymentState from cleanup here

    useEffect(() => {
        if (!user) {
            if (verificationStatus === 'succeeded' || verificationStatus === 'failed') {
                toast({ title: "User session lost", description: "Please log in.", variant: "destructive" });
                router.replace('/login');
            }
            return;
        }

        const paymentRefForUrl = verifiedPaymentDetails?.providerReference || searchParams.get('trxref') || searchParams.get('reference') || 'unknown';

        if (verificationStatus === 'succeeded' && verifiedPaymentDetails) {
            if (verifiedPaymentDetails.status === 'succeeded') {
                toast({ title: "Payment Verified!", description: "Finalizing enrolment...", variant: "success" });

                const metadata = getMetadataFromPaymentRecord(verifiedPaymentDetails);
                const courseIdsToEnrol: string[] = metadata.course_ids || [];
                const originalInvoiceId: string = metadata.invoice_id || verifiedPaymentDetails.providerReference;
                const isCorporate: boolean = metadata.is_corporate_purchase || false;
                const studentCount: number | undefined = metadata.corporate_student_count;

                if (courseIdsToEnrol.length === 0 && !isCorporate) {
                    toast({ title: "Enrolment Issue", description: "Items for enrolment not found. Contact support.", variant: "destructive" });
                    dispatch(resetPaymentState());
                    // Redirect to receipt page indicating data missing
                    router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=enrolment_data_missing`);
                    return;
                }

                const enrolmentPayload: EnrolCoursesPayload = { /* ... as before ... */
                    userId: user.id, courseIds: courseIdsToEnrol,
                    paymentReference: { reference: verifiedPaymentDetails.providerReference, status: verifiedPaymentDetails.status, message: 'Payment verified' },
                    totalAmountPaid: verifiedPaymentDetails.amount, isCorporatePurchase: isCorporate, corporateStudentCount: studentCount,
                    // invoiceId: originalInvoiceId, // Ensure EnrolCoursesPayload has this if needed
                };

                if (courseIdsToEnrol.length > 0 || isCorporate) {
                    dispatch(enrolCoursesAfterPayment(enrolmentPayload))
                        .unwrap()
                        .then((enrolmentResponse) => {
                            toast({ variant: "success", title: "Enrolment Successful!", description: enrolmentResponse.message || `You're now enroled!` });
                            dispatch(clearCart());
                            // Option 1: Go to dashboard
                            router.replace(`/dashboard?payment_success=true&ref=${paymentRefForUrl}`);
                            // Option 2: Go to receipt page (if verifiedPaymentDetails.id is your internal DB ID)
                            // router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=success`);
                        })
                        .catch((enrolmentErrorMsg) => {
                            toast({ variant: "destructive", title: "Enrolment Failed After Payment", description: typeof enrolmentErrorMsg === 'string' ? enrolmentErrorMsg : "Contact support." });
                            // Redirect to receipt page indicating enrolment failure
                            router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=enrolment_failed`);
                        })
                        .finally(() => {
                            dispatch(resetPaymentState());
                        });
                } else { // Successful payment but nothing specific to enrol (e.g. wallet top-up - not current scenario)
                    toast({ title: "Payment Successful!", description: "Transaction complete.", variant: "success" });
                    dispatch(clearCart()); // If cart was involved
                    dispatch(resetPaymentState());
                    router.replace(`/dashboard?payment_success=true&ref=${paymentRefForUrl}`);
                }
            } else { // Paystack verified, but transaction status was not 'succeeded'
                toast({ title: "Payment Not Successful", description: `Status: ${verifiedPaymentDetails.status}. Try again or contact support.`, variant: "destructive" });
                dispatch(resetPaymentState());
                router.replace(`/checkout?payment_status=declined&ref=${paymentRefForUrl}`);
            }
        } else if (verificationStatus === 'failed') {
            toast({ title: "Payment Verification Failed", description: verificationError || "Could not confirm payment. If charged, contact support.", variant: "destructive" });
            dispatch(resetPaymentState());
            router.replace(`/checkout?payment_status=verification_failed&ref=${paymentRefForUrl}`);
        }
    }, [verificationStatus, dispatch, router, toast, user, verifiedPaymentDetails, verificationError, searchParams]);

    // --- UI Rendering based on status ---
    if (verificationStatus === 'loading' || (verificationStatus === 'idle' && (searchParams.get('reference') || searchParams.get('trxref')))) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <div className="w-full max-w-md space-y-4">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-full mx-auto" />
                    <Skeleton className="h-4 w-5/6 mx-auto" />
                    <div className="flex justify-center pt-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                    <Skeleton className="h-10 w-1/2 mx-auto mt-6" />
                </div>
                <h1 className="text-2xl font-semibold mb-2 mt-8">Verifying Your Payment</h1>
                <p className="text-muted-foreground">Please wait, we're confirming your transaction...</p>
            </div>
        );
    }

    if (verificationStatus === 'succeeded' && verifiedPaymentDetails?.status === 'succeeded') {
        // This state is usually brief due to redirection in useEffect.
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
                <h1 className="text-2xl font-semibold mb-2">Payment Verified!</h1>
                <p className="text-muted-foreground">Finalizing your enrolment and redirecting...</p>
                <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
            </div>
        );
    }

    // Handles both verification communication failure and Paystack-reported transaction failure
    if (verificationStatus === 'failed' || (verificationStatus === 'succeeded' && verifiedPaymentDetails && verifiedPaymentDetails.status !== 'succeeded')) {
        const isVerificationCommFailure = verificationStatus === 'failed';
        const paymentAttemptStatus = verifiedPaymentDetails?.status || 'Unknown';
        const displayError = verificationError || (isVerificationCommFailure ? "Could not communicate with payment provider." : `Payment was not successful (Status: ${paymentAttemptStatus}).`);
        const displayRef = verifiedPaymentDetails?.providerReference || searchParams.get('trxref') || searchParams.get('reference');

        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <XCircle className="h-16 w-16 text-destructive mb-6" />
                <h1 className="text-2xl font-semibold mb-2">
                    {isVerificationCommFailure ? "Payment Verification Problem" : "Payment Not Successful"}
                </h1>
                <Alert variant="destructive" className="max-w-md text-left my-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Issue Detected</AlertTitle>
                    <AlertDescription>{displayError} <br /> If you believe you were charged or need assistance, please contact support.</AlertDescription>
                </Alert>
                {displayRef && <p className="text-sm text-muted-foreground mt-1">Reference: {displayRef}</p>}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <DyraneButton variant="outline" asChild className="w-full sm:w-auto">
                        <Link href="/checkout">Try Checkout Again</Link>
                    </DyraneButton>
                    <DyraneButton asChild className="w-full sm:w-auto">
                        <Link href="/support">Contact Support</Link>
                    </DyraneButton>
                </div>
            </div>
        );
    }

    // Fallback for initial load if no reference in URL (e.g., direct navigation)
    if (!searchParams.get('reference') && !searchParams.get('trxref') && verificationStatus === 'idle') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Invalid Page Access</AlertTitle>
                    <AlertDescription>This page should be accessed via a payment redirect. Please start your checkout process again.</AlertDescription>
                </Alert>
                <DyraneButton className="mt-6" asChild>
                    <Link href="/checkout">Go to Checkout</Link>
                </DyraneButton>
            </div>
        );
    }

    // Default fallback / Catch-all (should ideally not be reached if logic above is complete)
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-3/4" />
            <p className="mt-6 text-muted-foreground">Processing payment information...</p>
        </div>
    );
}

// Main component using Suspense for useSearchParams
export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={ // This is the fallback for the entire page while useSearchParams resolves
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
                <div className="w-full max-w-sm space-y-4">
                    <Skeleton className="h-10 w-3/4 mx-auto" /> {/* Simulating Page Title */}
                    <Skeleton className="h-24 w-full" /> {/* Simulating a content block */}
                    <Skeleton className="h-6 w-5/6 mx-auto" /> {/* Simulating a paragraph */}
                    <Skeleton className="h-6 w-1/2 mx-auto" /> {/* Simulating another paragraph */}
                    <div className="pt-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    </div>
                </div>
            </div>
        }>
            <PaymentCallbackContent />
        </Suspense>
    );
}