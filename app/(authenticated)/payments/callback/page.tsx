// app/(authenticated)/payments/callback/page.tsx
"use client";

import { useEffect, Suspense, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';

import {
    verifyPayment,
    selectVerificationStatus,
    selectPaymentHistoryError,
    resetPaymentState,
    selectCurrentPayment,
    getInvoiceById,
    selectCurrentInvoice,
    selectInvoiceFetchStatus,
    selectCourseIdsFromCurrentInvoice,
    selectInvoiceFetchError
} from '@/features/payment/store/payment-slice';
import type { PaymentRecord, Invoice } from '@/features/payment/types/payment-types';

import {
    enrolCoursesAfterPayment,
    resetCheckout
} from '@/features/checkout/store/checkoutSlice';
import type { EnrolCoursesPayload } from "@/features/checkout/types/checkout-types";
import { clearCart } from '@/features/cart/store/cart-slice';

import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Helper: Get metadata from PaymentRecord (Ensure this utility is robust)
const getMetadataFromPaymentRecord = (record: PaymentRecord | null): Record<string, any> => {
    if (!record) return {};
    if (typeof record.metadata === 'object' && record.metadata !== null) {
        return record.metadata;
    }
    const metadataSources = [
        record.gatewayRef, record.description,
        (record as any).providerMetadata, (record as any).transactionMetadata,
    ];
    for (const source of metadataSources) {
        if (!source) continue;
        if (typeof source === 'object' && source !== null) return source;
        if (typeof source === 'string') {
            try {
                const parsed = JSON.parse(source);
                if (typeof parsed === 'object' && parsed !== null) return parsed;
            } catch (e) { /* Ignore */ }
        }
    }
    return {};
};


function PaymentCallbackContent() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // --- Redux State Selectors ---
    const verificationStatus = useAppSelector(selectVerificationStatus);
    const verificationError = useAppSelector(selectPaymentHistoryError);
    const verifiedPaymentDetails = useAppSelector(selectCurrentPayment);

    const currentInvoice = useAppSelector(selectCurrentInvoice);
    const invoiceFetchStatus = useAppSelector(selectInvoiceFetchStatus);
    const invoiceFetchError = useAppSelector(selectInvoiceFetchError);
    const courseIdsFromInvoice = useAppSelector(selectCourseIdsFromCurrentInvoice);

    const { user } = useAppSelector((state) => state.auth);

    // --- Local State for Flow Control ---
    const [processingAttemptedForCurrentPaymentRef, setProcessingAttemptedForCurrentPaymentRef] = useState(false);
    const [lastProcessedPaymentRefFromUrl, setLastProcessedPaymentRefFromUrl] = useState<string | null>(null);

    // --- Effect 1: Initial Payment Verification ---
    useEffect(() => {
        console.log("EFFECT 1 (Verify Payment) - Running. Current verificationStatus:", verificationStatus, "Last processed URL ref:", lastProcessedPaymentRefFromUrl);
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');
        const paymentReferenceFromUrl = trxref || reference;

        if (paymentReferenceFromUrl) {
            const isNewUrlReference = lastProcessedPaymentRefFromUrl !== paymentReferenceFromUrl;
            const needsFreshVerificationCycle = verificationStatus === 'idle' &&
                (!processingAttemptedForCurrentPaymentRef || isNewUrlReference);


            if (isNewUrlReference || needsFreshVerificationCycle) {
                console.log(`EFFECT 1: Initiating new verification cycle for URL ref: ${paymentReferenceFromUrl}. isNewUrlReference: ${isNewUrlReference}, needsFreshVerificationCycle: ${needsFreshVerificationCycle}`);
                dispatch(resetPaymentState());
                dispatch(resetCheckout()); // << Reset checkout state for a new/fresh cycle
                setProcessingAttemptedForCurrentPaymentRef(false);
                setLastProcessedPaymentRefFromUrl(paymentReferenceFromUrl);
                dispatch(verifyPayment({ reference: paymentReferenceFromUrl }));
            } else {
                console.log("EFFECT 1: No new verification cycle needed for URL ref:", paymentReferenceFromUrl, "Current verificationStatus:", verificationStatus, "processingAttemptedForCurrentPaymentRef:", processingAttemptedForCurrentPaymentRef);
            }
        } else {
            console.log("EFFECT 1: No payment reference found in URL.");
            toast({ title: "Invalid Payment Link", description: "No payment reference found. Redirecting...", variant: "destructive" });
            router.replace('/checkout');
        }
    }, [searchParams, dispatch, verificationStatus, lastProcessedPaymentRefFromUrl, processingAttemptedForCurrentPaymentRef, router, toast]);


    // --- Effect 2: Fetch Invoice (if needed after successful payment verification) ---
    useEffect(() => {
        console.log("EFFECT 2 (Fetch Invoice) - Running. verificationStatus:", verificationStatus, "processingAttemptedForCurrentPaymentRef:", processingAttemptedForCurrentPaymentRef, "invoiceFetchStatus:", invoiceFetchStatus);

        if (processingAttemptedForCurrentPaymentRef) {
            console.log("EFFECT 2: Main processing already attempted/underway for current payment ref, skipping invoice fetch logic.");
            return;
        }

        if (verificationStatus === 'succeeded' && verifiedPaymentDetails && verifiedPaymentDetails.status === 'succeeded') {
            const paymentInvoiceId = (verifiedPaymentDetails as any).invoiceId || (verifiedPaymentDetails as any).invoice_id ||
                getMetadataFromPaymentRecord(verifiedPaymentDetails).invoiceId ||
                getMetadataFromPaymentRecord(verifiedPaymentDetails).invoice_id;

            console.log("EFFECT 2: Payment verified. PaymentInvoiceId:", paymentInvoiceId, "CurrentInvoiceId in state:", currentInvoice?.id);

            if (paymentInvoiceId) {
                const isDifferentInvoiceNeeded = currentInvoice?.id !== paymentInvoiceId;
                const isReadyForNewFetch = invoiceFetchStatus === 'idle';

                if ((isReadyForNewFetch || isDifferentInvoiceNeeded) && invoiceFetchStatus !== 'loading') {
                    console.log('EFFECT 2: Dispatching getInvoiceById for paymentInvoiceId:', paymentInvoiceId);
                    toast({ title: "Payment Verified", description: "Fetching invoice details..." });
                    dispatch(getInvoiceById(paymentInvoiceId));
                } else {
                    console.log("EFFECT 2: Conditions to fetch invoice NOT met. isReadyForNewFetch:", isReadyForNewFetch, "isDifferentInvoiceNeeded:", isDifferentInvoiceNeeded, "invoiceFetchStatus:", invoiceFetchStatus);
                }
            } else {
                console.log("EFFECT 2: No paymentInvoiceId found. Enrolment (Effect 3) will rely on metadata if applicable.");
            }
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


    // --- Effect 3: Handle Enrolment (Main Processing Logic after verification and optional invoice fetch) ---
    useEffect(() => {
        console.log("EFFECT 3 (Handle Enrolment) - Running. verificationStatus:", verificationStatus, "invoiceFetchStatus:", invoiceFetchStatus, "processingAttemptedForCurrentPaymentRef:", processingAttemptedForCurrentPaymentRef, "User:", !!user);

        if (processingAttemptedForCurrentPaymentRef) {
            console.log("EFFECT 3: Main processing already attempted/completed for current payment ref. Exiting.");
            return;
        }

        const paymentRefForUrl = verifiedPaymentDetails?.providerReference || searchParams.get('trxref') || searchParams.get('reference') || 'unknown';

        if (!user) {
            if (verificationStatus === 'succeeded' || verificationStatus === 'failed' ||
                invoiceFetchStatus === 'succeeded' || invoiceFetchStatus === 'failed') {
                console.log("EFFECT 3: User session lost while processing payment.");
                toast({ title: "User session lost", description: "Please log in to complete your enrolment.", variant: "destructive" });
                router.replace('/login');
            }
            return;
        }

        const paymentHasInvoiceId = !!((verifiedPaymentDetails as any)?.invoiceId || (verifiedPaymentDetails as any)?.invoice_id ||
            getMetadataFromPaymentRecord(verifiedPaymentDetails).invoiceId ||
            getMetadataFromPaymentRecord(verifiedPaymentDetails).invoice_id);

        // --- Path 1: Successful Payment AND Successful Invoice Fetch (if an invoice was expected) ---
        if (verificationStatus === 'succeeded' && verifiedPaymentDetails?.status === 'succeeded' &&
            paymentHasInvoiceId && invoiceFetchStatus === 'succeeded' && currentInvoice) {
            console.log("EFFECT 3: Path 1 - Invoice Success. Enrolling with invoice items. Invoice ID:", currentInvoice.id);
            setProcessingAttemptedForCurrentPaymentRef(true);

            if (courseIdsFromInvoice.length > 0) {
                toast({ title: "Invoice Details Fetched!", description: "Finalizing enrolment with items from invoice...", variant: "success" });
                const enrolmentPayload: EnrolCoursesPayload = {
                    userId: user.id,
                    courseIds: courseIdsFromInvoice,
                    paymentReference: { reference: verifiedPaymentDetails.providerReference, status: verifiedPaymentDetails.status, message: 'Payment verified, invoice processed' },
                    totalAmountPaid: verifiedPaymentDetails.amount, // Ensure this is number
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
                console.log("EFFECT 3: Path 1 - No course IDs in invoice. Resetting payment and checkout state.");
                dispatch(resetCheckout());
                dispatch(resetPaymentState());
                router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=invoice_items_missing&invoice=${currentInvoice.id}`);
            }
        }
        // --- Path 2: Successful Payment BUT (Invoice Fetch Failed OR No Invoice ID was ever present) - Fallback to Metadata ---
        else if (verificationStatus === 'succeeded' && verifiedPaymentDetails?.status === 'succeeded' &&
            ((paymentHasInvoiceId && invoiceFetchStatus === 'failed') ||
                (!paymentHasInvoiceId && !['loading', 'succeeded'].includes(invoiceFetchStatus))
            )
        ) {
            console.log("EFFECT 3: Path 2 - Metadata Fallback. PaymentHasInvoiceId:", paymentHasInvoiceId, "InvoiceFetchStatus:", invoiceFetchStatus);
            setProcessingAttemptedForCurrentPaymentRef(true);

            const reason = (paymentHasInvoiceId && invoiceFetchStatus === 'failed')
                ? `Invoice fetch failed: ${invoiceFetchError || 'Unknown error'}.`
                : "No specific invoice linked to this payment.";
            toast({ title: "Proceeding with Payment Metadata", description: `${reason} Attempting enrolment with available payment data.` });

            const metadata = getMetadataFromPaymentRecord(verifiedPaymentDetails);
            const courseIdsFromMetadata = metadata.course_ids || metadata.courseIds || metadata.courses ||
                (metadata.items && Array.isArray(metadata.items) ?
                    metadata.items.map((item: any) => item.courseId || item.course_id).filter(Boolean) :
                    []);

            if (courseIdsFromMetadata.length === 0 && !metadata.isCorporate) {
                toast({ title: "Enrolment Issue", description: "Course items for enrolment not found in payment metadata. Please contact support.", variant: "destructive" });
                console.log("EFFECT 3: Path 2 - No course IDs in metadata. Resetting payment and checkout state.");
                dispatch(resetCheckout()); // << RESET CHECKOUT
                dispatch(resetPaymentState());
                router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=enrolment_data_missing`);
                return;
            }

            const enrolmentPayload: EnrolCoursesPayload = {
                userId: user.id,
                courseIds: courseIdsFromMetadata,
                paymentReference: { reference: verifiedPaymentDetails.providerReference, status: verifiedPaymentDetails.status, message: 'Payment verified, metadata used for enrolment' },
                totalAmountPaid: verifiedPaymentDetails.amount, // Ensure number
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
                        toast({ variant: "destructive", title: "Enrolment Failed (from metadata)", description: typeof enrolmentErrorMsg === 'string' ? enrolmentErrorMsg : "Contact support for assistance." });
                        dispatch(resetCheckout());
                        router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=enrolment_failed`);
                    })
                    .finally(() => {
                        console.log("EFFECT 3: Path 2 - Enrolment promise finally. Resetting payment state.");
                        dispatch(resetPaymentState());
                    });
            } else {
                toast({ title: "Payment Successful (Metadata)", description: "Transaction complete. No specific courses found in metadata to enrol.", variant: "success" });
                dispatch(clearCart());
                dispatch(resetCheckout());
                console.log("EFFECT 3: Path 2 - No specific courses in metadata. Resetting payment state.");
                dispatch(resetPaymentState());
                router.replace(`/dashboard?payment_success=true&ref=${paymentRefForUrl}`);
            }
        }
        // --- Path 3: Payment Verification Failed OR Payment Status from Gateway Not Succeeded ---
        else if (verificationStatus === 'failed' ||
            (verifiedPaymentDetails && verifiedPaymentDetails.status !== 'succeeded') // <<<< RESTORE THIS LINE
        ) {
            console.log("EFFECT 3: Path 3 - Payment/Verification failed OR Gateway status not succeeded. VerificationStatus:", verificationStatus, "Payment Status from Gateway:", verifiedPaymentDetails?.status);
            setProcessingAttemptedForCurrentPaymentRef(true);

            let statusParam = 'declined'; // Default
            let toastVariant: "destructive" | "warning" | "default" = "destructive";
            let toastTitle = "Payment Not Successful";
            let toastDescription = `An issue occurred with your payment.`;

            if (verificationStatus === 'failed') {
                toastDescription = verificationError || "Could not confirm payment with payment provider.";
                statusParam = 'verification_failed';
            } else if (verifiedPaymentDetails) { // Implies verificationStatus was 'succeeded' but payment.status was not
                toastDescription = `Payment status from provider: ${verifiedPaymentDetails.status}. Please try again or contact support.`;
                if (verifiedPaymentDetails.status === 'pending') {
                    statusParam = 'pending_confirmation';
                    toastVariant = "default";
                    toastTitle = "Payment Pending";
                    toastDescription = `Your payment is ${verifiedPaymentDetails.status}. We will notify you of updates. Ref: ${paymentRefForUrl}`;
                } else {
                    // For other non-succeeded statuses like 'failed' by gateway
                    statusParam = 'declined_by_gateway'; // Be more specific if needed
                }
            }

            toast({ title: toastTitle, description: toastDescription, variant: toastVariant });
            console.log("EFFECT 3: Path 3 - Resetting payment and checkout state. Redirecting to checkout.");
            dispatch(resetCheckout()); // Ensure this is called
            dispatch(resetPaymentState());
            router.replace(`/checkout?payment_status=${statusParam}&ref=${paymentRefForUrl}`);
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
        verificationError,
        invoiceFetchError
    ]);


    // --- UI Rendering Logic ---
    const renderUI = () => {
        // ... (UI rendering logic from previous full example can be used here, it was quite comprehensive)
        // Ensure it uses `processingAttemptedForCurrentPaymentRef` to differentiate initial loading vs. post-processing UI.
        console.log("UI RENDER: verificationStatus:", verificationStatus, "invoiceFetchStatus:", invoiceFetchStatus, "processingAttemptedForCurrentPaymentRef:", processingAttemptedForCurrentPaymentRef, "verifiedPaymentDetails:", !!verifiedPaymentDetails);
        const paymentReferenceFromUrl = searchParams.get('trxref') || searchParams.get('reference');
        const paymentHasInvoiceId = !!((verifiedPaymentDetails as any)?.invoiceId || (verifiedPaymentDetails as any)?.invoice_id ||
            getMetadataFromPaymentRecord(verifiedPaymentDetails).invoiceId ||
            getMetadataFromPaymentRecord(verifiedPaymentDetails).invoice_id);

        // State 1: Initial Loading
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

        // State 2: Processing has been attempted and payment was successful
        if (processingAttemptedForCurrentPaymentRef && verifiedPaymentDetails?.status === 'succeeded') {
            console.log("UI RENDER: State 2 - Processing Attempted, Payment Succeeded. Waiting for redirect or final state.");
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
                    <h1 className="text-2xl font-semibold mb-2">Processing Complete!</h1>
                    <p className="text-muted-foreground">Your transaction has been processed. You should be redirected shortly.</p>
                    <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
                </div>
            );
        }

        // State 3: Failure States (after processingAttemptedForCurrentPaymentRef might be true)
        let showFailureUI = false;
        let failureTitle = "Payment Issue";
        let failureDescription = "An unexpected error occurred during payment processing.";

        if (processingAttemptedForCurrentPaymentRef) { // Failures typically happen after an attempt
            if (verificationStatus === 'failed') {
                showFailureUI = true;
                failureTitle = "Payment Verification Problem";
                failureDescription = verificationError || "Could not communicate with the payment provider for verification.";
            } else if (verifiedPaymentDetails && verifiedPaymentDetails.status !== 'succeeded') {
                showFailureUI = true;
                failureTitle = "Payment Not Successful";
                failureDescription = `The payment status reported by the provider was: ${verifiedPaymentDetails.status}.`;
            }
            // If invoice fetch failed but metadata enrolment was attempted, Effect 3's toasts would cover it.
            // This UI is for when the entire process halts due to a payment-level failure.
        }


        if (showFailureUI) {
            console.log("UI RENDER: State 3 - Failure UI. Title:", failureTitle);
            const paymentAttemptRef = verifiedPaymentDetails?.providerReference || searchParams.get('trxref') || searchParams.get('reference');
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                    <XCircle className="h-16 w-16 text-destructive mb-6" />
                    <h1 className="text-2xl font-semibold mb-2">{failureTitle}</h1>
                    <Alert variant="destructive" className="max-w-md text-left my-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Issue Detected</AlertTitle>
                        <AlertDescription>{failureDescription} <br /> If you believe you were charged or need assistance, please contact support.</AlertDescription>
                    </Alert>
                    {paymentAttemptRef && <p className="text-sm text-muted-foreground mt-1">Reference: {paymentAttemptRef}</p>}
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

        // State 4: Fallback for Invalid Page Access
        if (!paymentReferenceFromUrl && verificationStatus === 'idle' && invoiceFetchStatus === 'idle' && !verifiedPaymentDetails) {
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

        // State 5: Default/Waiting Fallback
        console.log("UI RENDER: State 5 - Hitting default/waiting fallback UI.");
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <h1 className="text-2xl font-semibold mb-2 mt-8">Finalizing Payment Process</h1>
                <p className="text-muted-foreground">Please wait a moment while we complete the necessary steps...</p>
                <Loader2 className="h-12 w-12 animate-spin text-primary mt-6" />
            </div>
        );
    };

    return renderUI();
}

// Main component using Suspense for useSearchParams
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