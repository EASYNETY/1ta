// app/(authenticated)/payments/callback/page.tsx
"use client";

import { useEffect, Suspense, useState } from 'react'; // Added useState
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
} from '@/features/checkout/store/checkoutSlice';
import type { EnrolCoursesPayload } from "@/features/checkout/types/checkout-types";
import { clearCart } from '@/features/cart/store/cart-slice';

import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { DyraneButton } from '@/components/dyrane-ui/dyrane-button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic helper function to parse metadata from various sources (Keep as is)
const getMetadataFromPaymentRecord = (record: PaymentRecord | null): Record<string, any> => {
    if (!record) return {};
    const metadataSources = [
        (record as any).metadata, record.gatewayRef, record.description,
        (record as any).providerMetadata, (record as any).transactionMetadata,
        ...Object.values(record).filter(value =>
            typeof value === 'string' && value.startsWith('{') && value.endsWith('}')
        )
    ];
    for (const source of metadataSources) {
        if (!source) continue;
        if (typeof source === 'object' && source !== null) return source;
        if (typeof source === 'string' && source.startsWith('{') && source.endsWith('}')) {
            try { return JSON.parse(source); } catch (e) { /* continue */ }
        }
    }
    return {};
};

// Dynamic helper to extract payment record from verification response (Keep as is)
const extractPaymentFromVerification = (verificationResponse: any): PaymentRecord | null => {
    if (!verificationResponse) return null;
    const possiblePaymentSources = [
        verificationResponse.payments, verificationResponse.payment,
        verificationResponse.id ? verificationResponse : null,
        verificationResponse.data?.payments, verificationResponse.data?.payment,
        verificationResponse.data
    ];
    for (const source of possiblePaymentSources) {
        if (source && typeof source === 'object' && source.id) {
            return source as PaymentRecord;
        }
    }
    return null;
};


function PaymentCallbackContent() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const verificationStatus = useAppSelector(selectVerificationStatus);
    const verificationError = useAppSelector(selectPaymentHistoryError);
    const verifiedPaymentDetails = useAppSelector(selectCurrentPayment);

    const currentInvoice = useAppSelector(selectCurrentInvoice);
    const invoiceFetchStatus = useAppSelector(selectInvoiceFetchStatus);
    const invoiceFetchError = useAppSelector(selectInvoiceFetchError);
    const courseIdsFromInvoice = useAppSelector(selectCourseIdsFromCurrentInvoice);

    const { user } = useAppSelector((state) => state.auth);

    // State to track if enrolment has been attempted for the current payment
    const [enrolmentAttempted, setEnrolmentAttempted] = useState(false);


    // Effect 1: Verify Payment
    useEffect(() => {
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');
        const paymentReference = trxref || reference;

        if (paymentReference) {
            // Only verify if status is idle or if the payment reference has changed
            if (verificationStatus === 'idle' || (verifiedPaymentDetails && verifiedPaymentDetails.providerReference !== paymentReference)) {
                setEnrolmentAttempted(false); // Reset enrolment attempt flag for new verification
                dispatch(verifyPayment({ reference: paymentReference }));
            }
        } else {
            toast({ title: "Invalid Payment Link", description: "Redirecting to checkout.", variant: "destructive" });
            router.replace('/checkout');
        }
    }, [searchParams, dispatch, verificationStatus, verifiedPaymentDetails]); // Removed router, toast from deps as they are stable

    // Effect 2: Fetch Invoice if Payment is Verified and has invoiceId
    useEffect(() => {
        if (verificationStatus === 'succeeded' && verifiedPaymentDetails && verifiedPaymentDetails.status === 'succeeded') {
            // Check for invoiceId in payment details (ensure your PaymentRecord type has invoiceId)
            const paymentInvoiceId = (verifiedPaymentDetails as any).invoiceId || (verifiedPaymentDetails as any).invoice_id || // If backend adds it directly
                getMetadataFromPaymentRecord(verifiedPaymentDetails).invoiceId || // From metadata
                getMetadataFromPaymentRecord(verifiedPaymentDetails).invoice_id;


            if (paymentInvoiceId) {
                // Fetch invoice only if not already fetched/fetching for this paymentInvoiceId or if currentInvoice is null
                if (invoiceFetchStatus === 'idle' || (currentInvoice && currentInvoice.id !== paymentInvoiceId)) {
                    toast({ title: "Payment Verified", description: "Fetching invoice details...", });
                    dispatch(getInvoiceById(paymentInvoiceId));
                }
            } else if (!enrolmentAttempted) { // No invoiceId, proceed with metadata-based enrolment (original logic)
                // This branch handles cases where there's no invoiceId, relying on metadata.
                // It will be effectively skipped if invoiceId is found and invoice fetching starts.
                // The actual enrolment will then happen in Effect 3.
                console.log("No invoiceId found on payment, will attempt enrolment with metadata if available.");
                // We can't directly call the enrolment logic here as it needs course IDs
                // which will be derived in the next effect if invoice is not fetched.
            }
        }
    }, [verificationStatus, verifiedPaymentDetails, dispatch, invoiceFetchStatus, currentInvoice, enrolmentAttempted]);


    // Effect 3: Handle Enrolment after Payment Verification AND Invoice Fetch (if applicable)
    useEffect(() => {
        if (enrolmentAttempted) return; // Prevent re-enrolment

        const paymentRefForUrl = verifiedPaymentDetails?.providerReference || searchParams.get('trxref') || searchParams.get('reference') || 'unknown';

        if (!user) {
            if (verificationStatus === 'succeeded' || verificationStatus === 'failed' || invoiceFetchStatus === 'succeeded' || invoiceFetchStatus === 'failed') {
                toast({ title: "User session lost", description: "Please log in.", variant: "destructive" });
                router.replace('/login');
            }
            return;
        }

        // Condition 1: Payment verified, invoice fetched successfully
        if (verificationStatus === 'succeeded' && verifiedPaymentDetails?.status === 'succeeded' &&
            invoiceFetchStatus === 'succeeded' && currentInvoice) {

            if (courseIdsFromInvoice.length > 0) {
                toast({ title: "Invoice Fetched!", description: "Finalizing enrolment with invoice items...", variant: "success" });
                const enrolmentPayload: EnrolCoursesPayload = {
                    userId: user.id,
                    courseIds: courseIdsFromInvoice, // Use courseIds from the fetched invoice
                    paymentReference: { reference: verifiedPaymentDetails.providerReference, status: verifiedPaymentDetails.status, message: 'Payment verified, invoice processed' },
                    totalAmountPaid: verifiedPaymentDetails.amount,
                    // isCorporatePurchase, studentCount can still come from invoice metadata or payment metadata
                    isCorporatePurchase: currentInvoice.metadata?.isCorporate || getMetadataFromPaymentRecord(verifiedPaymentDetails).isCorporate || false,
                    corporateStudentCount: currentInvoice.metadata?.studentCount || getMetadataFromPaymentRecord(verifiedPaymentDetails).studentCount,
                };

                setEnrolmentAttempted(true);
                dispatch(enrolCoursesAfterPayment(enrolmentPayload))
                    .unwrap()
                    .then((enrolmentResponse) => {
                        toast({ variant: "success", title: "Enrolment Successful!", description: enrolmentResponse.message || `You're now enroled!` });
                        dispatch(clearCart());
                        router.replace(`/dashboard?payment_success=true&ref=${paymentRefForUrl}&invoice=${currentInvoice.id}`);
                    })
                    .catch((enrolmentErrorMsg) => {
                        toast({ variant: "destructive", title: "Enrolment Failed After Payment", description: typeof enrolmentErrorMsg === 'string' ? enrolmentErrorMsg : "Contact support." });
                        router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=enrolment_failed&invoice=${currentInvoice.id}`);
                    })
                    .finally(() => {
                        dispatch(resetPaymentState()); // Reset after everything
                    });
            } else {
                toast({ title: "Enrolment Issue", description: "No course items found in the invoice. Contact support.", variant: "destructive" });
                setEnrolmentAttempted(true);
                dispatch(resetPaymentState());
                router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=invoice_items_missing&invoice=${currentInvoice.id}`);
            }
        }
        // Condition 2: Payment verified, but no invoiceId was found on payment, or invoice fetch failed
        // And we haven't tried enrolling yet.
        else if (verificationStatus === 'succeeded' && verifiedPaymentDetails?.status === 'succeeded' &&
            (invoiceFetchStatus === 'failed' || (!((verifiedPaymentDetails as any).invoiceId || getMetadataFromPaymentRecord(verifiedPaymentDetails).invoiceId || getMetadataFromPaymentRecord(verifiedPaymentDetails).invoice_id) && invoiceFetchStatus !== 'loading'))) {

            toast({ title: "Proceeding with Payment Metadata", description: invoiceFetchStatus === 'failed' ? `Invoice fetch failed: ${invoiceFetchError}. Trying enrolment with payment metadata.` : "No invoice linked directly to payment, using payment metadata.", });

            const metadata = getMetadataFromPaymentRecord(verifiedPaymentDetails);
            // Your original getEnrollmentData might be useful here if you adapt it,
            // or extract course IDs directly from metadata.
            const courseIdsFromMetadata = metadata.course_ids || metadata.courseIds || metadata.courses ||
                (metadata.items && Array.isArray(metadata.items) ?
                    metadata.items.map((item: any) => item.courseId || item.course_id).filter(Boolean) :
                    []);

            if (courseIdsFromMetadata.length === 0 && !metadata.isCorporate) {
                toast({ title: "Enrolment Issue", description: "Items for enrolment not found in payment metadata. Contact support.", variant: "destructive" });
                setEnrolmentAttempted(true);
                dispatch(resetPaymentState());
                router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=enrolment_data_missing`);
                return;
            }

            const enrolmentPayload: EnrolCoursesPayload = {
                userId: user.id,
                courseIds: courseIdsFromMetadata,
                paymentReference: { reference: verifiedPaymentDetails.providerReference, status: verifiedPaymentDetails.status, message: 'Payment verified' },
                totalAmountPaid: verifiedPaymentDetails.amount,
                isCorporatePurchase: metadata.isCorporate || false,
                corporateStudentCount: metadata.studentCount,
                // invoiceId might still be in metadata even if not on payment record directly
            };

            if (courseIdsFromMetadata.length > 0 || metadata.isCorporate) {
                setEnrolmentAttempted(true);
                dispatch(enrolCoursesAfterPayment(enrolmentPayload))
                    .unwrap()
                    .then((enrolmentResponse) => {
                        toast({ variant: "success", title: "Enrolment Successful (from metadata)!", description: enrolmentResponse.message || `You're now enroled!` });
                        dispatch(clearCart());
                        router.replace(`/dashboard?payment_success=true&ref=${paymentRefForUrl}`);
                    })
                    .catch((enrolmentErrorMsg) => {
                        toast({ variant: "destructive", title: "Enrolment Failed After Payment (from metadata)", description: typeof enrolmentErrorMsg === 'string' ? enrolmentErrorMsg : "Contact support." });
                        router.replace(`/payments/${verifiedPaymentDetails.id}/receipt?status=enrolment_failed`);
                    })
                    .finally(() => {
                        dispatch(resetPaymentState());
                    });
            } else {
                toast({ title: "Payment Successful (metadata check)!", description: "Transaction complete, but no specific courses found to enrol via metadata.", variant: "success" });
                dispatch(clearCart());
                setEnrolmentAttempted(true);
                dispatch(resetPaymentState());
                router.replace(`/dashboard?payment_success=true&ref=${paymentRefForUrl}`);
            }
        }
        // Condition 3: Payment verification itself failed, or payment status was not 'succeeded'
        else if (verificationStatus === 'failed' || (verifiedPaymentDetails && verifiedPaymentDetails.status !== 'succeeded')) {
            if (!enrolmentAttempted) { // Ensure this runs only once
                const errorMsg = verificationStatus === 'failed' ?
                    (verificationError || "Could not confirm payment.") :
                    `Payment status: ${verifiedPaymentDetails?.status}. Try again or contact support.`;
                toast({ title: "Payment Not Successful", description: errorMsg, variant: "destructive" });
                setEnrolmentAttempted(true);
                dispatch(resetPaymentState());
                router.replace(`/checkout?payment_status=${verificationStatus === 'failed' ? 'verification_failed' : 'declined'}&ref=${paymentRefForUrl}`);
            }
        }

    }, [
        verificationStatus, verifiedPaymentDetails,
        invoiceFetchStatus, currentInvoice, invoiceFetchError, // Invoice related
        courseIdsFromInvoice, // Derived from currentInvoice
        dispatch, router, toast, user,
        enrolmentAttempted, searchParams, verificationError // Added verificationError & searchParams
    ]);


    // --- UI Rendering based on status ---
    // Loading state: either payment verification or invoice fetching
    if (verificationStatus === 'loading' ||
        (verificationStatus === 'succeeded' && verifiedPaymentDetails?.status === 'succeeded' && invoiceFetchStatus === 'loading' && ((verifiedPaymentDetails as any).invoiceId || getMetadataFromPaymentRecord(verifiedPaymentDetails).invoiceId)) ||
        (verificationStatus === 'idle' && (searchParams.get('reference') || searchParams.get('trxref')))) {
        const message = verificationStatus === 'loading' || verificationStatus === 'idle'
            ? "Verifying Your Payment"
            : "Fetching Invoice Details";
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                {/* ... Skeleton UI ... */}
                <div className="w-full max-w-md space-y-4">
                    <Skeleton className="h-8 w-3/4 mx-auto" /> <Skeleton className="h-4 w-full mx-auto" />
                    <Skeleton className="h-4 w-5/6 mx-auto" />
                    <div className="flex justify-center pt-4"> <Loader2 className="h-12 w-12 animate-spin text-primary" /> </div>
                    <Skeleton className="h-10 w-1/2 mx-auto mt-6" />
                </div>
                <h1 className="text-2xl font-semibold mb-2 mt-8">{message}</h1>
                <p className="text-muted-foreground">Please wait, we're processing your information...</p>
            </div>
        );
    }

    // Successful payment and enrolment (this state might be brief due to redirect)
    if (verificationStatus === 'succeeded' && verifiedPaymentDetails?.status === 'succeeded' &&
        (invoiceFetchStatus === 'succeeded' || (!((verifiedPaymentDetails as any).invoiceId || getMetadataFromPaymentRecord(verifiedPaymentDetails).invoiceId) && invoiceFetchStatus !== 'loading' && invoiceFetchStatus !== 'failed')) &&
        enrolmentAttempted) { // Check enrolmentAttempted to ensure we are past the enrolment logic
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
                <h1 className="text-2xl font-semibold mb-2">Processing Complete!</h1>
                <p className="text-muted-foreground">Redirecting you shortly...</p>
                <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
            </div>
        );
    }


    // Handles various failure scenarios
    if (verificationStatus === 'failed' ||
        (verifiedPaymentDetails && verifiedPaymentDetails.status !== 'succeeded') ||
        (invoiceFetchStatus === 'failed' && verificationStatus === 'succeeded' && verifiedPaymentDetails?.status === 'succeeded')) {

        let title = "Payment Issue";
        let description = "An unexpected error occurred.";
        const paymentAttemptRef = verifiedPaymentDetails?.providerReference || searchParams.get('trxref') || searchParams.get('reference');

        if (verificationStatus === 'failed') {
            title = "Payment Verification Problem";
            description = verificationError || "Could not communicate with the payment provider.";
        } else if (verifiedPaymentDetails && verifiedPaymentDetails.status !== 'succeeded') {
            title = "Payment Not Successful";
            description = `The payment status was: ${verifiedPaymentDetails.status}.`;
        } else if (invoiceFetchStatus === 'failed') {
            title = "Invoice Processing Issue";
            description = `Payment was successful, but we couldn't fetch invoice details: ${invoiceFetchError || 'Unknown error'}. Enrolment via metadata might have been attempted.`;
        }

        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <XCircle className="h-16 w-16 text-destructive mb-6" />
                <h1 className="text-2xl font-semibold mb-2">{title}</h1>
                <Alert variant="destructive" className="max-w-md text-left my-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Issue Detected</AlertTitle>
                    <AlertDescription>{description} <br /> If you believe you were charged or need assistance, please contact support.</AlertDescription>
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


    // Fallback for initial load if no reference in URL
    if (!searchParams.get('reference') && !searchParams.get('trxref') && verificationStatus === 'idle') {
        // ... (your existing UI for this case)
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

    // Default fallback
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            {/* ... Skeleton UI ... */}
            <Skeleton className="h-8 w-1/2 mb-4" /> <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-3/4" />
            <p className="mt-6 text-muted-foreground">Loading payment information...</p>
        </div>
    );
}

// Main component using Suspense
export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
                {/* ... Skeleton UI ... */}
                <div className="w-full max-w-sm space-y-4">
                    <Skeleton className="h-10 w-3/4 mx-auto" /> <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-6 w-5/6 mx-auto" /> <Skeleton className="h-6 w-1/2 mx-auto" />
                    <div className="pt-4"> <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /> </div>
                </div>
            </div>
        }>
            <PaymentCallbackContent />
        </Suspense>
    );
}