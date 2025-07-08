// src/features/payment/components/payment-receipt.tsx
"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react"
import Image from "next/image"
import type { UnifiedReceiptData, PaymentRecord, InvoiceItem } from "../types/payment-types"
import { formatCurrency, formatDate, getReceiptNumber, formatAmount } from "../utils/receipt-utils"

interface PaymentReceiptProps {
  receiptData: UnifiedReceiptData | null
  className?: string
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ receiptData, className = "" }) => {
  if (!receiptData) {
    return (
      <Card id="payment-receipt-component" className={className || "shadow-lg rounded-lg"}>
        <CardContent className="p-6 text-center text-muted-foreground">
          Receipt details are currently unavailable or being loaded.
        </CardContent>
      </Card>
    );
  }

  const receiptNumberToDisplay = getReceiptNumber(receiptData.originalPaymentRecord, receiptData.paymentId);

  const getStatusBadge = (status: PaymentRecord["status"]) => {
    // ... (status badge logic remains the same)
    switch (status) {
      case "succeeded":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-700/20 dark:text-green-300 dark:border-green-700/30">
            <CheckCircle className="mr-1 h-3 w-3" />
            Successful
          </Badge>
        )
      case "pending":
      case "processing":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700/20 dark:text-yellow-300 dark:border-yellow-700/30">
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/20 dark:text-blue-300 dark:border-blue-700/30">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Refunded
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }



  // itemsToDisplay will always have at least one item if receiptData is not null,
  // due to the updated selector logic.
  const itemsToDisplay: InvoiceItem[] = receiptData.items; // No '|| []' needed if selector guarantees it.

  return (
    <Card id="payment-receipt-component" className={`shadow-lg rounded-lg overflow-hidden ${className}`}>
      <CardHeader className="p-6 md:p-8">
        {/* ... (header content remains the same) ... */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <div className="relative h-12 w-12 mr-3 sm:h-16 sm:w-16 flex-shrink-0">
              <Image
                src="https://onetechacademy.com/icon.png"
                alt="1Tech Academy Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">1Tech Academy</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Payment Receipt</CardDescription>
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
            <p className="text-sm font-medium">Receipt #: {receiptNumberToDisplay}</p>
            <p className="text-sm text-muted-foreground">Date: {formatDate(receiptData.paymentDate)}</p>
            {receiptData.invoiceId && <p className="text-xs text-muted-foreground">Invoice #: {receiptData.invoiceId}</p>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8 space-y-6">
        {/* ... (Payment & Billing Details remain the same) ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Information</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium text-muted-foreground">Transaction ID:</span> {receiptData.paymentProviderReference || 'N/A'}</p>
              <p><span className="font-medium text-muted-foreground">Method:</span> {receiptData.paymentMethod?.charAt(0).toUpperCase() + (receiptData.paymentMethod?.slice(1) || '')}</p>
              <p><span className="font-medium text-muted-foreground">Status:</span> {getStatusBadge(receiptData.paymentStatus)}</p>
              {receiptData.invoiceDueDate && (
                <p><span className="font-medium text-muted-foreground">Invoice Due Date:</span> {formatDate(receiptData.invoiceDueDate)}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Billed To</h3>
            <div className="space-y-1 text-sm">
              {receiptData.studentName || receiptData.studentEmail ? (
                <>
                  {receiptData.studentName && <p className="font-medium">{receiptData.studentName}</p>}
                  {receiptData.studentEmail && <p>{receiptData.studentEmail}</p>}
                  {receiptData.billingDetails?.phone && <p>Phone: {receiptData.billingDetails.phone}</p>}
                  {receiptData.billingDetails?.address && <p>Address: {receiptData.billingDetails.address}</p>}
                </>
              ) : (
                <p className="text-muted-foreground italic">Not specified</p>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-6 dark:bg-gray-700" />

        {/* Items Table - Now always has at least one item from the selector */}
        <div>
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">Order Summary</h3>
          {/* No need for itemsToDisplay.length > 0 check if selector guarantees at least one item */}
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full min-w-[600px]">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Item Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-none">
                {Array.isArray(itemsToDisplay) && itemsToDisplay.map((item, index) => (
                  <tr key={item.courseId || `item-${index}-${item.description.slice(0, 5)}`}>
                    <td className="px-4 py-3 whitespace-normal break-words">
                      {/* Description (cleaned & truncated) */}
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {(() => {
                          // Use invoice description first, fall back to the plain description
                          const raw =
                            item.invoice?.description ||
                            item.description ||
                            item.courseName ||
                            'Unknown Course';

                          // Strip leading “Course enrolment:” (case‑insensitive, keeps other text)
                          const cleaned = raw.replace(/^Course\s+enrolment:\s*/i, '').trim();

                          // Truncate to 30 chars
                          return cleaned.length > 30
                            ? `${cleaned.substring(0, 30)}…`
                            : cleaned;
                        })()}
                      </div>

                      {/* Course ID shown only when it’s a real course */}
                      {item.courseId &&
                        item.courseId !== 'SUMMARY_PAYMENT_DESC' &&
                        item.courseId !== 'SUMMARY_ITEM_NO_COURSE_ID' &&
                        item.courseId !== 'GENERIC_SUMMARY_ITEM' && (
                          <div className="text-xs text-muted-foreground">
                            Course&nbsp;ID:&nbsp;{item.courseId}
                          </div>
                        )}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(item.amount, receiptData.paymentCurrency)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.amount * item.quantity, receiptData.paymentCurrency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* The fallback <p> for no items is no longer needed here if the selector always provides at least one item */}
        </div>

        {/* Amount and Currency Display - Using formatAmount for safe number formatting */}
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Amount: {formatAmount(receiptData.paymentAmount)} {receiptData.paymentCurrency}
        </div>

        {/* ... (Total Section and Footer remain the same) ... */}
        <div className="mt-6 pt-6 dark:border-gray-700">
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Paid:</span>
                <span>{formatCurrency(receiptData.paymentAmount, receiptData.paymentCurrency)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col text-center text-xs text-muted-foreground p-6">
        <p>Thank you for your payment!</p>
        <p>If you have any questions, please contact support at support@1techacademy.com or visit our website.</p>
        <p className="mt-1">© {new Date().getFullYear()} 1Tech Academy. All rights reserved.</p>
      </CardFooter>
    </Card>
  )
}