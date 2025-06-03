// src/features/payment/components/PaymentListItem.tsx
"use client" // Good practice for components with hooks/interactivity

import type React from "react"
import { format, parseISO, isValid } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Added more specific imports
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Receipt, ExternalLink } from "lucide-react" // Added ExternalLink for invoice
import type { PaymentRecord } from "../types/payment-types"
import Link from "next/link"

interface PaymentListItemProps {
  payment: PaymentRecord
}

// Helper to safely format date
const safeFormatDateTime = (dateString?: string): string => {
  if (!dateString) return "N/A"
  try {
    const date = parseISO(dateString)
    // Using a more common and slightly more detailed format
    return isValid(date) ? format(date, "PPpp") : "Invalid Date" // PPpp -> eg. "Sep 14, 2023, 2:30 PM"
  } catch {
    return "Error formatting date"
  }
}

export const PaymentListItem: React.FC<PaymentListItemProps> = ({ payment }) => {
  // Format amount helper
  const formatAmount = (amount: number | null | undefined, currency: string): string => {
    if (typeof amount !== 'number') return "N/A"; // Handle null or undefined amount

    // Your API sends amount as a major unit string "16.00" which is parsed to number
    // So, no division by 100 needed here if it's already in the main unit.
    const majorAmount = amount;
    try {
      return new Intl.NumberFormat("en-NG", { // Consider using a locale like 'en-US' if 'en-NG' gives issues or is too specific
        style: "currency",
        currency: currency,
      }).format(majorAmount)
    } catch {
      return `${currency} ${majorAmount.toFixed(2)}`
    }
  }

  // Helper for status badge
  const getStatusBadge = (status: PaymentRecord["status"]) => {
    // Adding specific classNames for better styling potential, and using provided Badge variants
    switch (status) {
      case "succeeded":
        return (
          <Badge variant="secondary">
            <CheckCircle className="mr-1 h-3 w-3" />
            Succeeded
          </Badge>
        )
      case "pending":
      case "processing": // Grouping processing with pending
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700/20 dark:text-yellow-300 dark:border-yellow-700/30">
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      case "failed":
      case "requires_action": // Grouping requires_action with failed
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            {status === 'failed' ? 'Failed' : 'Action Required'}
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

  // Determine main description and sub-description (if different)
  const mainDescription = payment.description || "Payment Transaction";
  const subDescription = (payment.description)
    ? payment.description // Show payment's own description if it's different from invoice's
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          {/* Left side: Description, Date, Refs */}
          <div className="flex-grow space-y-1">
            <h3 className="font-semibold text-base md:text-lg leading-tight">{mainDescription}</h3>
            {subDescription && <p className="text-xs text-muted-foreground italic">{subDescription}</p>}
            <p className="text-sm text-muted-foreground">
              {safeFormatDateTime(payment.createdAt)}
            </p>
            <div className="text-xs pt-1">
              {payment.providerReference && (
                <span className="font-mono text-gray-500 dark:text-gray-400 mr-3">
                  Pay Ref: {payment.providerReference}
                </span>
              )}
              {payment.invoiceId && (
                <span className="font-mono text-gray-500 dark:text-gray-400">
                  Inv Ref: {payment.invoiceId}
                </span>
              )}
            </div>
          </div>

          {/* Right side: Amount, Status, Actions */}
          <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0 min-w-[180px] sm:min-w-[200px]">
            <div className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
              {formatAmount(payment.amount, payment.currency)}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2"> {/* flex-wrap for smaller screens */}
              {getStatusBadge(payment.status)}
              {/* Optionally show invoice status if different and relevant */}
              {/* {payment.invoiceStatus && payment.invoiceStatus !== payment.status && (
                <Badge variant="outline" className="text-xs">
                  Invoice: {payment.invoiceStatus.charAt(0).toUpperCase() + payment.invoiceStatus.slice(1)}
                </Badge>
              )} */}
              {payment.status === "succeeded" && (
                <Link href={`/payments/${payment.id}/receipt`} passHref legacyBehavior>
                  <Button asChild variant="outline" size="sm" className="flex items-center gap-1 text-xs px-2 py-1 h-auto">
                    <a> {/* legacyBehavior requires an <a> tag child */}
                      <Receipt className="h-3 w-3" />
                      <span>View Receipt</span>
                    </a>
                  </Button>
                </Link>
              )}
              {/* Optionally, a direct link to an invoice page if you have one */}
              {/* {payment.invoiceId && (
                <Link href={`/invoices/${payment.invoiceId}`} passHref legacyBehavior>
                  <Button asChild variant="ghost" size="sm" className="flex items-center gap-1 text-xs px-2 py-1 h-auto text-blue-600 hover:text-blue-700">
                    <a>
                      <ExternalLink className="h-3 w-3" />
                      <span>Invoice</span>
                    </a>
                  </Button>
                </Link>
              )} */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}