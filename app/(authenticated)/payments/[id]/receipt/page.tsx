// src/app/(authenticated)/payments/[id]/receipt/page.tsx
"use client"

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getReceiptData,
  selectReceiptData,
  selectPaymentHistoryStatus as selectReceiptFetchStatus,
  selectPaymentHistoryError as selectReceiptFetchError,
} from "@/features/payment/store/payment-slice";
import { PaymentReceipt } from "@/features/payment/components/payment-receipt";
import { ReceiptActionsWithDom } from "@/features/payment/components/receipt-actions-with-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/layout/auth/page-header";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import type { PaymentRecord } from "@/features/payment/types/payment-types";

export default function PaymentReceiptPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const paymentId = params.id as string;

  // Use the selectors related to getReceiptData
  const receiptData = useAppSelector(selectReceiptData);
  const status = useAppSelector(selectReceiptFetchStatus);
  const error = useAppSelector(selectReceiptFetchError);

  const isLoading = status === "loading" || status === "idle";
  const fetchFailed = status === "failed";

  // Single effect to fetch all receipt data
  useEffect(() => {
    if (paymentId) {
      dispatch(getReceiptData(paymentId));
    }

    // Optional: Cleanup function to reset state when the component unmounts
    return () => {
      // dispatch(resetReceiptState()); // You would create this action in your slice
    };
  }, [dispatch, paymentId]);

  const originalPaymentRecord = receiptData?.originalPaymentRecord as PaymentRecord | undefined;

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        heading="Payment Receipt"
        subheading="View and download your payment receipt"
      />

      {originalPaymentRecord && !isLoading && (
        <ReceiptActionsWithDom
          payment={originalPaymentRecord}
          receiptElementId="payment-receipt-component"
          className="flex justify-end mb-4"
        />
      )}

      {isLoading && (
        <div className="mt-6 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading receipt details...</p>
          <Skeleton className="h-[600px] w-full rounded-lg mt-4" />
        </div>
      )}

      {fetchFailed && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Receipt</AlertTitle>
          <AlertDescription>
            {error || "An unexpected error occurred. Please try again or contact support."}
          </AlertDescription>
        </Alert>
      )}

      {/* Success/Status Alerts from URL params */}
      {!isLoading && !fetchFailed && searchParams.get('status') === 'success' && (
        <Alert className="my-4">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Payment Successful</AlertTitle>
          <AlertDescription>Your payment was successful and your receipt is below.</AlertDescription>
        </Alert>
      )}

      <div className="mt-6">
        {!isLoading && !fetchFailed && receiptData && (
          <PaymentReceipt receiptData={receiptData} />
        )}
      </div>
    </div>
  );
}