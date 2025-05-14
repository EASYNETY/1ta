// src/app/payments/[id]/receipt/page.tsx (PaymentReceiptPage)
"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { AlertTriangle } from "lucide-react"


export default function PaymentReceiptPage() {
  const params = useParams()
  const router = useRouter() // Keep if needed for other back navigation
  const dispatch = useAppDispatch()

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
        className="no-print" // Hide page header when printing
      />

      {payment && (
        <ReceiptActionsWithDom
          payment={payment}
          receiptElementId="payment-receipt-component" // Ensure this ID matches the one on PaymentReceipt's Card
          className="flex justify-end mb-4 no-print" // Hide actions when printing
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

      {/* This div acts as the main container for what gets printed */}
      <div id="payment-receipt-container">
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