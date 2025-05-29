// src/app/payments/[id]/receipt/page.tsx (PaymentReceiptPage)
"use client"

import { useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchPaymentById,
  selectSelectedPayment,
  selectSelectedPaymentStatus,
  selectPaymentHistoryError,
} from "@/features/payment/store/payment-slice"
import { PaymentReceipt } from "@/features/payment/components/payment-receipt"
import { ReceiptActionsWithDom } from "@/features/payment/components/receipt-actions-with-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageHeader } from "@/components/layout/auth/page-header" // Assuming PageHeader can take a className
import { AlertTriangle, CheckCircle } from "lucide-react"


export default function PaymentReceiptPage() {
  const params = useParams()
  const router = useRouter() // Keep if needed for other back navigation
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams();

  const paymentId = params.id as string
  const payment = useAppSelector(selectSelectedPayment)
  const status = useAppSelector(selectSelectedPaymentStatus)
  const error = useAppSelector(selectPaymentHistoryError)

  const isLoading = status === "loading"

  useEffect(() => {
    if (paymentId) {
      dispatch(fetchPaymentById(paymentId))
    }
  }, [dispatch, paymentId])

  // const handleBack = () => { // No explicit back button shown in snippet, PageHeader might handle
  //   router.back()
  // }

  return (
    <div className="mx-auto">
      <PageHeader
        heading="Payment Receipt"
        subheading="View and download your payment receipt"
      />

      {payment && (
        <ReceiptActionsWithDom
          payment={payment}
          receiptElementId="payment-receipt-component" // Ensure this ID matches the one on PaymentReceipt's Card
          className="flex justify-end mb-4"
        />
      )}

      {isLoading && (
        <div className="mt-6">
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      )}

      {status === "failed" && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Failed to load payment receipt. Please try again."}</AlertDescription>
        </Alert>
      )}

      {/* Display alerts based on query params */}
      {searchParams.get('status') === 'enrolment_failed' && (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Enrolment Issue After Payment</AlertTitle>
          <AlertDescription>
            Your payment was successful, but we encountered an issue enrolling you in your course(s).
            Please contact support with your payment ID ({paymentId}) for assistance.
          </AlertDescription>
        </Alert>
      )}
      {searchParams.get('status') === 'enrolment_data_missing' && (
        <Alert className="my-4"> {/* Use warning or error */}
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Required: Enrolment Data</AlertTitle>
          <AlertDescription>
            Your payment was successful. However, we need to manually confirm your course enrolment due to a data issue.
            Please contact support with your payment ID ({paymentId}).
          </AlertDescription>
        </Alert>
      )}
      {searchParams.get('status') === 'success' && payment && payment.status === 'succeeded' && (
        <Alert className="my-4">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Payment Successful</AlertTitle>
          <AlertDescription>
            Your payment was successful and your receipt is below. You should now have access to your purchased items.
          </AlertDescription>
        </Alert>
      )}

      <div>
        {status === "succeeded" && payment && (
          <div className="mt-6 space-y-4"> {/* This div might be redundant if PaymentReceipt handles its own spacing */}
            {/* The PaymentReceipt component should have id="payment-receipt-component" */}
            <PaymentReceipt payment={payment} />
          </div>
        )}
      </div>
    </div>
  )
}