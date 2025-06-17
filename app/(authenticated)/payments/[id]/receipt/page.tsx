// src/app/payments/[id]/receipt/page.tsx
"use client"

import { useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchPaymentById,
  selectSelectedPayment,
  selectSelectedPaymentStatus,
  getInvoiceById,             // << IMPORT
  selectCurrentInvoice,       // << IMPORT
  selectInvoiceFetchStatus,   // << IMPORT
  selectUnifiedReceiptData,   // << IMPORT NEW SELECTOR
  selectPaymentHistoryError,  // General error for payment/invoice fetch
  selectInvoiceFetchError,    // Specific invoice fetch error
  resetPaymentState,          // << To clear invoice state too
  getReceiptData,            // << IMPORT for receipt data
  selectReceiptData,         // << SELECTOR for receipt data
  selectReceiptStatus,       // << SELECTOR for receipt status
} from "@/features/payment/store/payment-slice"
import type { PaymentRecord, UnifiedReceiptData as UnifiedReceiptDataType } from "@/features/payment/types/payment-types"; // Import UnifiedReceiptData type
import { PaymentReceipt } from "@/features/payment/components/payment-receipt" // This will now take UnifiedReceiptData
import { ReceiptActionsWithDom } from "@/features/payment/components/receipt-actions-with-dom" // This can still take PaymentRecord for download name
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageHeader } from "@/components/layout/auth/page-header"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"


export default function PaymentReceiptPage() {
  const params = useParams()
  // const router = useRouter(); // Keep if needed
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams();

  const paymentId = params.id as string;

  // Selectors for individual data pieces and statuses
  const paymentRecord = useAppSelector(selectSelectedPayment);
  const paymentStatus = useAppSelector(selectSelectedPaymentStatus);
  const invoiceRecord = useAppSelector(selectCurrentInvoice); // Not directly used for display, but triggers unified data
  const invoiceFetchStatus = useAppSelector(selectInvoiceFetchStatus);

  // Unified data for the receipt component
  const unifiedReceiptData = useAppSelector(selectUnifiedReceiptData);

  // Error selectors
  const paymentFetchError = useAppSelector(selectPaymentHistoryError); // This selector might need renaming if it's general
  const specificInvoiceFetchError = useAppSelector(selectInvoiceFetchError);

  // Receipt data and status
  const receiptData = useAppSelector(selectReceiptData);
  const receiptStatus = useAppSelector(selectReceiptStatus);

  const isLoadingPayment = paymentStatus === "loading" || paymentStatus === "idle";
  // Invoice is loading if payment is successful, invoiceId exists, and invoice isn't yet fetched/failed
  const isLoadingInvoice =
    paymentStatus === "succeeded" &&
    paymentRecord &&
    paymentRecord.invoiceId &&
    (invoiceFetchStatus === "loading" || invoiceFetchStatus === "idle") &&
    (!invoiceRecord || invoiceRecord.id !== paymentRecord.invoiceId); // Only load if not already the correct invoice

  const overallIsLoading = isLoadingPayment || isLoadingInvoice;
  const overallFetchFailed = (paymentStatus === "failed" && paymentFetchError) || (invoiceFetchStatus === "failed" && specificInvoiceFetchError && paymentRecord?.invoiceId);


  useEffect(() => {
    // Clear previous states when paymentId changes or on mount
    // to ensure fresh data for the current receipt.
    if (paymentId) {
      dispatch(resetPaymentState()); // Resets currentPayment, currentInvoice, and their statuses
      dispatch(fetchPaymentById(paymentId));
    }
  }, [dispatch, paymentId]);


  // Effect to fetch invoice if payment is loaded and has an invoiceId
  useEffect(() => {
    if (paymentStatus === "succeeded" && paymentRecord?.invoiceId) {
      // Fetch invoice only if it's not already fetched for this ID or status is idle
      if (invoiceFetchStatus === 'idle' || (invoiceRecord?.id !== paymentRecord.invoiceId && invoiceFetchStatus !== 'loading')) {
        dispatch(getInvoiceById(paymentRecord.invoiceId));
      }
    }
  }, [dispatch, paymentStatus, paymentRecord, invoiceFetchStatus, invoiceRecord]);


  // Effect to fetch receipt data on mount and when paymentId changes
  useEffect(() => {
    if (paymentId) {
      dispatch(getReceiptData(paymentId));
    }
  }, [dispatch, paymentId]);


  return (
    <div className="mx-auto">
      <PageHeader
        heading="Payment Receipt"
        subheading="View and download your payment receipt"
      />

      {/* Actions still use paymentRecord for naming convention, can be adapted */}
      {paymentRecord && !overallIsLoading && (
        <ReceiptActionsWithDom
          payment={paymentRecord} // Or pass unifiedReceiptData if actions need more
          receiptElementId="payment-receipt-component"
          className="flex justify-end mb-4"
        />
      )}

      {overallIsLoading && (
        <div className="mt-6 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">
            {isLoadingPayment ? "Loading payment details..." : "Loading invoice details..."}
          </p>
          <Skeleton className="h-[600px] w-full rounded-lg mt-4" />
        </div>
      )}

      {overallFetchFailed && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Receipt</AlertTitle>
          <AlertDescription>
            {paymentStatus === "failed" && `Failed to load payment details: ${paymentFetchError || "Please try again."}`}
            {paymentStatus === "failed" && invoiceFetchStatus === "failed" && <br />}
            {invoiceFetchStatus === "failed" && paymentRecord?.invoiceId && `Failed to load associated invoice details: ${specificInvoiceFetchError || "Please try again."}`}
            {!paymentRecord?.invoiceId && paymentStatus === "succeeded" && invoiceFetchStatus === "failed" && `Associated invoice details could not be loaded: ${specificInvoiceFetchError || "Please try again."}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Display alerts based on query params (existing logic) */}
      {searchParams.get('status') === 'enrolment_failed' && (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Enrolment Issue After Payment</AlertTitle>
          <AlertDescription>
            Your payment was successful, but we encountered an issue enrolling you.
            Contact support with payment ID ({paymentId}).
          </AlertDescription>
        </Alert>
      )}
      {/* ... other status alerts ... */}
      {searchParams.get('status') === 'success' && paymentRecord && paymentRecord.status === 'succeeded' && !overallIsLoading && !overallFetchFailed && (
        <Alert className="my-4">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Payment Successful</AlertTitle>
          <AlertDescription>
            Your payment was successful and your receipt is below.
          </AlertDescription>
        </Alert>
      )}


      <div>
        {/* Render PaymentReceipt only when unified data is ready and no critical errors */}
        {!overallIsLoading && !overallFetchFailed && unifiedReceiptData && (
          <div className="mt-6 space-y-4">
            <PaymentReceipt receiptData={unifiedReceiptData} /> {/* Pass unified data */}
          </div>
        )}
        {/* Handle case where payment is fine but invoice is needed and not loaded/failed */}
        {!overallIsLoading && paymentStatus === "succeeded" && paymentRecord?.invoiceId && !invoiceRecord && invoiceFetchStatus !== "failed" && (
          <p className="text-muted-foreground mt-6 text-center">Waiting for invoice details to complete receipt...</p>
        )}
      </div>
    </div>
  )
}