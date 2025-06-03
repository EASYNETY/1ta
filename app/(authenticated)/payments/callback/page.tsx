// app/(authenticated)/payments/callback/page.tsx
"use client";

import { useEffect, Suspense, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';

import {
    verifyPayment,
    selectVerificationStatus,
    selectPaymentHistoryError, // General error selector
    resetPaymentState,
    selectCurrentPayment,
    getInvoiceById,
    selectCurrentInvoice,
    selectInvoiceFetchStatus,
    selectCourseIdsFromCurrentInvoice, // Memoized selector
    selectInvoiceFetchError // Specific invoice fetch error
} from '@/features/payment/store/payment-slice';
import type { PaymentRecord, Invoice } from '@/features/payment/types/payment-types';

import {
    enrolCoursesAfterPayment,
    resetCheckout // Import resetCheckout
} from '@/features/checkout/store/checkoutSlice';
import type { EnrolCoursesPayload } from "@/features/checkout/types/checkout-types";
import { clearCart } from '@/features/cart/store/cart-slice';

import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Helper: Get metadata from PaymentRecord
const getMetadataFromPaymentRecord = (record: PaymentRecord | null): Record<string, any> => {
    if (!record) return {};
    // Prioritize direct metadata if the backend structures it this way
    if (typeof record.metadata === 'object' && record.metadata !== null) {
        return record.metadata;
    }
    // Fallback to other potential stringified JSON sources
    const metadataSources = [
        record.gatewayRef, // Often contains metadata from Paystack if passed as metadata to Paystack
        record.description, // Less likely for structured metadata
        (record as any).providerMetadata,
        (record as any).transactionMetadata,
    ];
    for (const source of metadataSources) {
        if (!source) continue;
        // If it's already an object (though less likely if not record.metadata)
        if (typeof source === 'object' && source !== null) return source;
        // If it's a string, try to parse as JSON
        if (typeof source === 'string') {
            try {
                const parsed = JSON.parse(source);
                if (typeof parsed === 'object' && parsed !== null) return parsed;
            } catch (e) { /* Ignore parse errors, try next source */ }
        }
    }
    return {}; // No valid metadata found
};

function PaymentCallbackContent() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // --- Redux State Selectors ---
    const verificationStatus = useAppSelector(selectVerificationStatus); // Status of verifyPayment thunk
    const paymentVerificationApiError = useAppSelector(selectPaymentHistoryError); // Error from verifyPayment thunk
    const verifiedPaymentDetails = useAppSelector(selectCurrentPayment); // Result of verifyPayment (PaymentRecord)

    const currentInvoice = useAppSelector(selectCurrentInvoice); // Result of getInvoiceById
    const invoiceFetchStatus = useAppSelector(selectInvoiceFetchStatus); // Status of getInvoiceById thunk
    const invoiceFetchApiError = useAppSelector(selectInvoiceFetchError); // Error from getInvoiceById thunk
    const courseIdsFromInvoice = useAppSelector(selectCourseIdsFromCurrentInvoice); // Memoized

    const { user } = useAppSelector((state) => state.auth);

    // --- Local State for Flow Control ---
    const [processingAttemptedForCurrentPaymentRef, setProcessingAttemptedForCurrentPaymentRef] = useState(false);
    const [lastProcessedPaymentRefFromUrl, setLastProcessedPaymentRefFromUrl] = useState<string | null>(null);

    // --- Effect 1: Initial Payment Verification ---
    // Purpose: Trigger payment verification based on URL parameters.
    // Resets flags and state if it's a genuinely new payment reference from the URL.
    useEffect(() => {
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');
        const paymentReferenceFromUrl = trxref || reference;

        console.log(
            "EFFECT 1 (Verify Payment) - CHECKING. URL Ref:", paymentReferenceFromUrl,
            "LastProcessedRef:", lastProcessedPaymentRefFromUrl,
            "VerificationStatus:", verificationStatus,
            "ProcessingAttempted:", processingAttemptedForCurrentPaymentRef
        );

        if (paymentReferenceFromUrl) {
            const isNewUrlReference = lastProcessedPaymentRefFromUrl !== paymentReferenceFromUrl;

            // Start a new verification cycle if:
            // 1. The URL reference is different from the last one we started processing.
            // OR
            // 2. The URL reference is the same, but the verification process is 'idle' (e.g., after a reset)
            //    AND we haven't already attempted to fully process this specific reference in its current lifecycle.
            const shouldStartNewCycle = isNewUrlReference ||
                (verificationStatus === 'idle' && !processingAttemptedForCurrentPaymentRef && lastProcessedPaymentRefFromUrl === paymentReferenceFromUrl);

            if (shouldStartNewCycle) {
                console.log(`EFFECT 1: ==> INITIATING NEW VERIFICATION CYCLE for URL ref: ${paymentReferenceFromUrl}.`);
                dispatch(resetPaymentState());       // Clear previous payment/invoice Redux states
                dispatch(resetCheckout());          // Clear previous checkout Redux states
                setProcessingAttemptedForCurrentPaymentRef(false); // Reset local flag for this new/fresh URL reference
                setLastProcessedPaymentRefFromUrl(paymentReferenceFromUrl); // Mark this URL ref as being initiated
                dispatch(verifyPayment({ reference: paymentReferenceFromUrl }));
            } else {
                console.log("EFFECT 1: No new verification cycle needed for URL ref:", paymentReferenceFromUrl, "(already processing or completed and URL ref matches last processed).");
            }
        } else {
            console.log("EFFECT 1: No payment reference found in URL.");
            toast({ title: "Invalid Payment Link", description: "No payment reference found. Please try the checkout process again.", variant: "destructive" });
            router.replace('/checkout');
        }
    }, [searchParams, dispatch, verificationStatus, lastProcessedPaymentRefFromUrl, processingAttemptedForCurrentPaymentRef, router, toast]);


    // --- Effect 2: Fetch Invoice (if needed after successful payment verification from gateway) ---
    // Purpose: If payment is verified AND successful at the gateway, and has an invoiceId, fetch the invoice.
    // Guarded by `processingAttemptedForCurrentPaymentRef`.
    useEffect(() => {
        console.log("EFFECT 2 (Fetch Invoice) - CHECKING. verificationStatus:", verificationStatus, "processingAttempted:", processingAttemptedForCurrentPaymentRef, "invoiceFetchStatus:", invoiceFetchStatus, "verifiedPaymentDetails:", !!verifiedPaymentDetails);

        if (processingAttemptedForCurrentPaymentRef) {
            console.log("EFFECT 2: Processing already initiated/completed for current payment ref, skipping invoice fetch.");
            return; // Main processing (Effect 3) has taken over or completed for this URL ref.
        }

        // Only proceed if verifyPayment API call was successful AND we have payment details
        if (verificationStatus !== 'succeeded' || !verifiedPaymentDetails) {
            console.log("EFFECT 2: Payment verification not yet 'succeeded' or no payment details available. Skipping invoice fetch.");
            return;
        }

        // Now, check the actual status of the payment as reported by the payment gateway
        if (verifiedPaymentDetails.status === 'succeeded') {
            const paymentInvoiceId = (verifiedPaymentDetails as any).invoiceId || (verifiedPaymentDetails as any).invoice_id ||
                getMetadataFromPaymentRecord(verifiedPaymentDetails).invoiceId ||
                getMetadataFromPaymentRecord(verifiedPaymentDetails).invoice_id;

            console.log("EFFECT 2: Payment gateway status is 'succeeded'. PaymentInvoiceId:", paymentInvoiceId, "CurrentInvoiceId in state:", currentInvoice?.id);

            if (paymentInvoiceId) {
                const isDifferentInvoiceNeeded = currentInvoice?.id !== paymentInvoiceId;
                const isReadyForNewFetch = invoiceFetchStatus === 'idle';

                if ((isReadyForNewFetch || isDifferentInvoiceNeeded) && invoiceFetchStatus !== 'loading') {
                    console.log('EFFECT 2: ==> DISPATCHING getInvoiceById for paymentInvoiceId:', paymentInvoiceId);
                    toast({ title: "Payment Verified", description: "Fetching invoice details..." });
                    dispatch(getInvoiceById(paymentInvoiceId));
                } else {
                    console.log("EFFECT 2: Conditions to fetch invoice NOT met. isReadyForNewFetch:", isReadyForNewFetch, "isDifferentInvoiceNeeded:", isDifferentInvoiceNeeded, "invoiceFetchStatus:", invoiceFetchStatus);
                }
            } else {
                console.log("EFFECT 2: No paymentInvoiceId found on payment. Effect 3 will proceed with metadata path if applicable.");
                // If no invoice ID, this step is effectively "done" by doing nothing.
                // Effect 3 will evaluate based on this outcome.
            }
        } else {
            console.log("EFFECT 2: Payment gateway status is NOT 'succeeded' (it's " + verifiedPaymentDetails.status + "). Invoice fetch will be skipped. Effect 3 will handle this payment status.");
            // No invoice fetch if payment itself isn't successful at gateway. Effect 3 will take over.
        }
    }, [
        verificationStatus,
        verifiedPaymentDetails,
        invoiceFetchStatus,
        currentInvoice,
        processingAttemptedForCurrentPaymentRef,
        dispatch,
        toast
    ]);


    // --- Effect 3: Handle Enrolment (Main Processing Logic) ---
    // Purpose: After payment verification and (optional) invoice fetching, handle course enrolment.
    // Sets `processingAttemptedForCurrentPaymentRef` to true once a main path is entered.
    useEffect(() => {
        console.log("EFFECT 3 (Handle Enrolment) - CHECKING. verificationStatus:", verificationStatus, "invoiceFetchStatus:", invoiceFetchStatus, "processingAttempted:", processingAttemptedForCurrentPaymentRef, "verifiedPaymentDetails:", !!verifiedPaymentDetails, "User:", !!user);

        if (processingAttemptedForCurrentPaymentRef) {
            console.log("EFFECT 3: Main processing already attempted/completed for current payment ref. Exiting.");
            return;
        }

        // Ensure payment verification thunk has completed.
        if (verificationStatus !== 'succeeded' && verificationStatus !== 'failed') {
            console.log("EFFECT 3: Waiting for payment verification thunk to complete (current status:", verificationStatus + "). Exiting.");
            return;
        }

        // If verification succeeded, we must have payment details. If not, it's an inconsistent state.
        if (verificationStatus === 'succeeded' && !verifiedPaymentDetails) {
            console.error("EFFECT 3: CRITICAL INCONSISTENCY! Verification status is 'succeeded' but verifiedPaymentDetails is null. This should not happen. Check verifyPayment thunk/reducer.");
            // This is a safeguard. If this happens, something is wrong with how verifyPayment populates currentPayment.
            // To prevent loops, mark as processed and show an error.
            setProcessingAttemptedForCurrentPaymentRef(true);
            toast({ title: "Processing Error", description: "An unexpected issue occurred while retrieving payment details. Please contact support.", variant: "destructive" });
            dispatch(resetCheckout());
            dispatch(resetPaymentState());
            router.replace('/checkout?payment_status=internal_error');
            return;
        }

        const paymentRefForUrl = verifiedPaymentDetails?.providerReference || searchParams.get('trxref') || searchParams.get('reference') || 'unknown';

        if (!user) {
            if (verificationStatus === 'succeeded' || verificationStatus === 'failed') { // Only if verification has attempted
                console.log("EFFECT 3: User session lost after payment verification attempt.");
                toast({ title: "User session lost", description: "Please log in to complete your enrolment.", variant: "destructive" });
                setProcessingAttemptedForCurrentPaymentRef(true); // Mark as processed to prevent loops
                dispatch(resetCheckout());
                dispatch(resetPaymentState());
                router.replace('/login?redirect=/dashboard'); // Or a more specific redirect
            }
            return;
        }

        const paymentHasInvoiceId = !!((verifiedPaymentDetails as any)?.invoiceId || (verifiedPaymentDetails as any)?.invoice_id ||
            getMetadataFromPaymentRecord(verifiedPaymentDetails).invoiceId ||
            getMetadataFromPaymentRecord(verifiedPaymentDetails).invoice_id);

        // --- Path 1: Payment Gateway Succeeded AND Invoice was Expected & Fetched Successfully ---
        if (verificationStatus === 'succeeded' && verifiedPaymentDetails?.status === 'succeeded' &&
            paymentHasInvoiceId && invoiceFetchStatus === 'succeeded' && currentInvoice) {
            console.log("EFFECT 3: ==> Path 1 - Invoice Success. Enrolling with invoice items. Invoice ID:", currentInvoice.id);
            setProcessingAttemptedForCurrentPaymentRef(true); // Crucial: Mark this attempt as processed

            if (courseIdsFromInvoice.length > 0) {
                toast({ title: "Invoice Details Fetched!", description: "Finalizing enrolment with items from invoice...", variant: "success" });
                const enrolmentPayload: EnrolCoursesPayload = {
                    userId: user.id,
                    courseIds: courseIdsFromInvoice,
                    paymentReference: { reference: verifiedPaymentDetails.providerReference, status: verifiedPaymentDetails.status, message: 'Payment verified, invoice processed' },
                    totalAmountPaid: verifiedPaymentDetails.amount, // Assumed to be number from thunk transformation
                    isCorporatePurchase: currentInvoice.metadata?.isCorporate || getMetadataFromPaymentRecord(verifiedPaymentDetails).isCorporate || false,
                    corporateStudentCount: currentInvoice.metadata?.studentCount || getMetadataFromPaymentRecord(verifiedPaymentDetails).studentCount,
                };
                dispatch(enrolCoursesAfterPayment(enrolmentPayload))
                    .unwrap()
                    .then((enrolmentResponse) => {
                        toast({ variant: "success", title: "Enrolment Successful!", description: enrolmentResponse.message || `You're now enroled!` });
                        dispatch(clearCart());
                        dispatch(resetCheckout());
                        router.replace(`/dashboard?payment_success=true&ref=${paymentRefForUrl}&invoice=${currentInvoice.id}`);
                    })
                    .catch((enrolmentErrorMsg) => {
                        toast({ variant: "destructive", title: "Enrolment Failed After Payment", description: typeof enrolmentErrorMsg === 'string' ? enrolmentErrorMsg : "Contact support for assistance." });
                        dispatch(resetCheckout());
                        router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=enrolment_failed&invoice=${currentInvoice.id}`);
                    })
                    .finally(() => {
                        console.log("EFFECT 3: Path 1 - Enrolment promise finally. Resetting payment state.");
                        dispatch(resetPaymentState());
                    });
            } else {
                toast({ title: "Enrolment Issue", description: "No course items found in the fetched invoice. Please contact support.", variant: "destructive" });
                console.log("EFFECT 3: Path 1 - No course IDs in invoice. Resetting states.");
                dispatch(resetCheckout());
                dispatch(resetPaymentState());
                router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=invoice_items_missing&invoice=${currentInvoice.id}`);
            }
        }
        // --- Path 2: Payment Gateway Succeeded BUT (Invoice Fetch Failed OR No Invoice ID was ever present) -> Metadata Fallback ---
        else if (verificationStatus === 'succeeded' && verifiedPaymentDetails?.status === 'succeeded' &&
            ((paymentHasInvoiceId && invoiceFetchStatus === 'failed') || // Invoice was expected but fetch failed
                (!paymentHasInvoiceId && !['loading'].includes(invoiceFetchStatus)) // No invoice expected, and invoice fetch not stuck loading
            )
        ) {
            console.log("EFFECT 3: ==> Path 2 - Metadata Fallback. PaymentHasInvoiceId:", paymentHasInvoiceId, "InvoiceFetchStatus:", invoiceFetchStatus);
            setProcessingAttemptedForCurrentPaymentRef(true); // Crucial: Mark this attempt as processed

            const reason = (paymentHasInvoiceId && invoiceFetchStatus === 'failed')
                ? `Invoice fetch failed: ${invoiceFetchApiError || 'Unknown error'}.` // Use specific invoice fetch error
                : "No specific invoice linked to this payment.";
            toast({ title: "Proceeding with Payment Metadata", description: `${reason} Attempting enrolment with available payment data.` });

            const metadata = getMetadataFromPaymentRecord(verifiedPaymentDetails);
            const courseIdsFromMetadata = metadata.course_ids || metadata.courseIds || metadata.courses ||
                (metadata.items && Array.isArray(metadata.items) ?
                    metadata.items.map((item: any) => item.courseId || item.course_id).filter(Boolean) :
                    []);

            if (courseIdsFromMetadata.length === 0 && !metadata.isCorporate) {
                toast({ title: "Enrolment Issue", description: "Course items for enrolment not found in payment metadata. Contact support.", variant: "destructive" });
                console.log("EFFECT 3: Path 2 - No course IDs in metadata. Resetting states.");
                dispatch(resetCheckout());
                dispatch(resetPaymentState());
                router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=enrolment_data_missing`);
                return;
            }

            const enrolmentPayload: EnrolCoursesPayload = {
                userId: user.id,
                courseIds: courseIdsFromMetadata,
                paymentReference: { reference: verifiedPaymentDetails.providerReference, status: verifiedPaymentDetails.status, message: 'Payment verified, metadata used' },
                totalAmountPaid: verifiedPaymentDetails.amount,
                isCorporatePurchase: metadata.isCorporate || false,
                corporateStudentCount: metadata.studentCount,
            };

            if (courseIdsFromMetadata.length > 0 || metadata.isCorporate) {
                dispatch(enrolCoursesAfterPayment(enrolmentPayload))
                    .unwrap()
                    .then((enrolmentResponse) => {
                        toast({ variant: "success", title: "Enrolment Successful (from metadata)!", description: enrolmentResponse.message || `You're now enroled!` });
                        dispatch(clearCart());
                        dispatch(resetCheckout());
                        router.replace(`/dashboard?payment_success=true&ref=${paymentRefForUrl}`);
                    })
                    .catch((enrolmentErrorMsg) => {
                        toast({ variant: "destructive", title: "Enrolment Failed (from metadata)", description: typeof enrolmentErrorMsg === 'string' ? enrolmentErrorMsg : "Contact support." });
                        dispatch(resetCheckout());
                        router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=enrolment_failed`);
                    })
                    .finally(() => {
                        console.log("EFFECT 3: Path 2 - Enrolment promise finally. Resetting payment state.");
                        dispatch(resetPaymentState());
                    });
            } else {
                toast({ title: "Payment Successful (Metadata)", description: "Transaction complete. No courses in metadata.", variant: "success" });
                dispatch(clearCart());
                dispatch(resetCheckout());
                console.log("EFFECT 3: Path 2 - No courses in metadata. Resetting states.");
                dispatch(resetPaymentState());
                router.replace(`/dashboard?payment_success=true&ref=${paymentRefForUrl}`);
            }
        }
        // --- Path 3: Payment Gateway reported status OTHER THAN 'succeeded' (e.g. 'pending', 'failed by gateway')
        // OR initial `verifyPayment` API call itself failed.
        else if ((verificationStatus === 'succeeded' && verifiedPaymentDetails && verifiedPaymentDetails.status !== 'succeeded') ||
            verificationStatus === 'failed') {
            console.log("EFFECT 3: ==> Path 3 - Handling non-succeeded gateway status or verification API failure. Gateway Status:", verifiedPaymentDetails?.status, "Verification API Status:", verificationStatus);
            setProcessingAttemptedForCurrentPaymentRef(true); // Crucial: Mark this attempt as processed

            let statusParam = 'declined'; // Default for redirect
            let toastVariant: "destructive" | "warning" | "default" = "destructive";
            let toastTitle = "Payment Not Successful";
            let toastDescription = `An issue occurred with your payment. Ref: ${paymentRefForUrl}`;

            if (verificationStatus === 'failed') {
                toastDescription = paymentVerificationApiError || "Could not confirm payment with payment provider.";
                statusParam = 'verification_failed';
            } else if (verifiedPaymentDetails) { // This implies verificationStatus === 'succeeded'
                toastDescription = `Payment status from provider: ${verifiedPaymentDetails.status}. Please try again or contact support. Ref: ${paymentRefForUrl}`;
                if (verifiedPaymentDetails.status === 'pending') {
                    statusParam = 'pending_confirmation';
                    toastVariant = "default"; // Use "default" or "warning" for pending
                    toastTitle = "Payment Pending";
                    toastDescription = `Your payment is currently ${verifiedPaymentDetails.status}. We will notify you once confirmed. Ref: ${paymentRefForUrl}`;
                } else { // Other non-succeeded statuses like 'failed' by gateway
                    statusParam = 'gateway_declined'; // More specific than just 'declined'
                }
            }

            toast({ title: toastTitle, description: toastDescription, variant: toastVariant });
            console.log("EFFECT 3: Path 3 - Resetting states and redirecting to checkout.");
            dispatch(resetCheckout());
            dispatch(resetPaymentState());
            router.replace(`/checkout?payment_status=${statusParam}&ref=${paymentRefForUrl}`);
        } else {
            // This block is reached if none of the above conditions are met.
            // Typically means we are waiting for an async operation to complete (e.g., invoice is still loading).
            if (verificationStatus === 'succeeded' && verifiedPaymentDetails?.status === 'succeeded' &&
                paymentHasInvoiceId && invoiceFetchStatus === 'loading') {
                console.log("EFFECT 3: Waiting for invoice fetch to complete...");
            } else if (verificationStatus === 'loading' as "idle" | "loading" | "succeeded" | "failed") {
                console.log("EFFECT 3: Waiting for payment verification to complete...");
            }
            else {
                console.log("EFFECT 3: Conditions for active processing not yet fully met. Current states - verificationStatus:", verificationStatus, "paymentStatus:", verifiedPaymentDetails?.status, "invoiceFetchStatus:", invoiceFetchStatus, "paymentHasInvoiceId:", paymentHasInvoiceId);
            }
        }
    }, [
        verificationStatus,
        verifiedPaymentDetails,
        invoiceFetchStatus,
        currentInvoice,
        courseIdsFromInvoice,
        processingAttemptedForCurrentPaymentRef,
        user,
        dispatch,
        router,
        toast,
        searchParams,
        paymentVerificationApiError, // Use the specific error selector
        invoiceFetchApiError // Use the specific error selector
    ]);


    // --- UI Rendering Logic ---
    const renderUI = () => {
        console.log("UI RENDER: verificationStatus:", verificationStatus, "invoiceFetchStatus:", invoiceFetchStatus, "processingAttemptedForCurrentPaymentRef:", processingAttemptedForCurrentPaymentRef, "verifiedPaymentDetails:", !!verifiedPaymentDetails);
        const paymentReferenceFromUrl = searchParams.get('trxref') || searchParams.get('reference');
        const paymentHasInvoiceId = !!((verifiedPaymentDetails as any)?.invoiceId || (verifiedPaymentDetails as any)?.invoice_id ||
            getMetadataFromPaymentRecord(verifiedPaymentDetails).invoiceId ||
            getMetadataFromPaymentRecord(verifiedPaymentDetails).invoice_id);

        // State 1: Initial Loading (Payment Verification or Initial Invoice Fetch if applicable)
        // Show loading if verifyPayment is loading OR (if verifyPayment succeeded & payment is good & invoice is expected & invoice is loading AND main processing hasn't started)
        if ((verificationStatus === 'loading' || (verificationStatus === 'idle' && !!paymentReferenceFromUrl && !processingAttemptedForCurrentPaymentRef)) ||
            (verificationStatus === 'succeeded' && verifiedPaymentDetails?.status === 'succeeded' &&
                paymentHasInvoiceId && invoiceFetchStatus === 'loading' && !processingAttemptedForCurrentPaymentRef)
        ) {
            const message = (verificationStatus === 'loading' || (verificationStatus === 'idle' && !!paymentReferenceFromUrl && !processingAttemptedForCurrentPaymentRef))
                ? "Verifying Your Payment"
                : "Fetching Invoice Details";
            console.log("UI RENDER: State 1 - Primary Loading. Message:", message);
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                    <h1 className="text-2xl font-semibold mb-2 mt-8">{message}</h1>
                    <p className="text-muted-foreground">Please wait, we're processing your information...</p>
                    <Loader2 className="h-12 w-12 animate-spin text-primary mt-6" />
                </div>
            );
        }

        // State 2: Processing has been attempted AND the original payment verification was successful
        // AND the payment gateway also reported success. This usually means enrolment was successful and redirect is imminent.
        if (processingAttemptedForCurrentPaymentRef && verificationStatus === 'succeeded' && verifiedPaymentDetails?.status === 'succeeded') {
            console.log("UI RENDER: State 2 - Processing Attempted & Payment Succeeded. Waiting for redirect or final state action.");
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
                    <h1 className="text-2xl font-semibold mb-2">Processing Complete!</h1>
                    <p className="text-muted-foreground">Your transaction has been processed. You should be redirected shortly.</p>
                    <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
                </div>
            );
        }

        // State 3: Failure States (shown after processingAttemptedForCurrentPaymentRef is true and a failure condition is met)
        let showFailureUI = false;
        let failureTitle = "Payment Issue";
        let failureDescription = "An unexpected error occurred during payment processing.";

        if (processingAttemptedForCurrentPaymentRef) { // Only show these "final" failure UIs if processing was attempted
            if (verificationStatus === 'failed') {
                showFailureUI = true;
                failureTitle = "Payment Verification Problem";
                failureDescription = paymentVerificationApiError || "Could not communicate with the payment provider for verification.";
            } else if (verifiedPaymentDetails && verifiedPaymentDetails.status !== 'succeeded') { // Implies verificationStatus was 'succeeded'
                showFailureUI = true;
                failureTitle = "Payment Not Successful";
                failureDescription = `The payment status reported by the provider was: ${verifiedPaymentDetails.status}.`;
            }
            // Note: If invoice fetch fails (invoiceFetchStatus === 'failed'), Effect 3 Path 2 handles the toast and redirect.
            // This UI block is more for payment-level failures.
        }


        if (showFailureUI) {
            console.log("UI RENDER: State 3 - Failure UI. Title:", failureTitle);
            const paymentAttemptRefForUI = verifiedPaymentDetails?.providerReference || searchParams.get('trxref') || searchParams.get('reference');
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                    <XCircle className="h-16 w-16 text-destructive mb-6" />
                    <h1 className="text-2xl font-semibold mb-2">{failureTitle}</h1>
                    <Alert variant="destructive" className="max-w-md text-left my-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Issue Detected</AlertTitle>
                        <AlertDescription>{failureDescription} <br /> If you believe you were charged or need assistance, please contact support with reference: {paymentAttemptRefForUI || "N/A"}.</AlertDescription>
                    </Alert>
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

        // State 4: Fallback for Invalid Page Access (No reference in URL and everything is idle and not processed)
        if (!paymentReferenceFromUrl && verificationStatus === 'idle' && invoiceFetchStatus === 'idle' && !verifiedPaymentDetails && !processingAttemptedForCurrentPaymentRef) {
            console.log("UI RENDER: State 4 - Invalid Page Access.");
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                    <Alert variant="destructive" className="max-w-md">
                        <AlertTriangle className="h-4 w-4" /> <AlertTitle>Invalid Page Access</AlertTitle>
                        <AlertDescription>This page should be accessed via a payment redirect. Please start your checkout process again.</AlertDescription>
                    </Alert>
                    <DyraneButton className="mt-6" asChild> <Link href="/checkout">Go to Checkout</Link> </DyraneButton>
                </div>
            );
        }

        // State 5: Default/Waiting Fallback (e.g., initial idle state before Effect 1 kicks in fully, or waiting for Effect 3 resolution)
        console.log("UI RENDER: State 5 - Hitting default/waiting fallback UI (e.g. waiting for Effect 3, or initial state).");
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <h1 className="text-2xl font-semibold mb-2 mt-8">Finalizing Your Payment</h1>
                <p className="text-muted-foreground">Please wait a moment while we complete the necessary steps...</p>
                <Loader2 className="h-12 w-12 animate-spin text-primary mt-6" />
            </div>
        );
    };

    return renderUI();
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
                <div className="w-full max-w-sm space-y-4">
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-full mx-auto" />
                    <Skeleton className="h-6 w-5/6 mx-auto" />
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