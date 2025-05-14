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
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageHeader } from "@/components/layout/auth/page-header"

export default function PaymentReceiptPage() {
  const params = useParams()
  const router = useRouter()
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

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="mx-auto">
      <PageHeader
        heading="Payment Receipt"
        subheading="View and download your payment receipt"
      />

      {
        payment &&
        <ReceiptActionsWithDom payment={payment} receiptElementId="payment-receipt" className="flex justify-end" />
      }

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

      {status === "succeeded" && payment && (
        <div className="mt-6 space-y-4">
          <PaymentReceipt payment={payment} />
        </div>
      )}
    </div>
  )
}
