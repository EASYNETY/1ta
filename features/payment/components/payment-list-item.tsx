import type React from "react"
import { format, parseISO, isValid } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react"
import type { PaymentRecord } from "../types/payment-types"

interface PaymentListItemProps {
  payment: PaymentRecord
}

// Helper to safely format date
const safeFormatDateTime = (dateString?: string): string => {
  if (!dateString) return "N/A"
  try {
    const date = parseISO(dateString)
    return isValid(date) ? format(date, "MMM d, yyyy p") : "Invalid Date"
  } catch {
    return "Error"
  }
}

export const PaymentListItem: React.FC<PaymentListItemProps> = ({ payment }) => {
  // Format amount helper
  const formatAmount = (amount: number, currency: string): string => {
    // Assuming amount is in smallest unit (kobo/cents)
    const majorAmount = amount / 100
    try {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: currency,
      }).format(majorAmount)
    } catch {
      // Fallback for unknown currency
      return `${currency} ${(majorAmount).toFixed(2)}`
    }
  }

  // Helper for status badge
  const getStatusBadge = (status: PaymentRecord["status"]) => {
    switch (status) {
      case "succeeded":
        return (
          <Badge variant="secondary">
            <CheckCircle className="mr-1 h-3 w-3" />
            Succeeded
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            Pending
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
          <Badge variant="outline">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Refunded
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-medium">{payment.description}</h3>
            <p className="text-sm text-muted-foreground">{safeFormatDateTime(payment.createdAt)}</p>
            <div className="text-xs font-mono text-muted-foreground">Ref: {payment.providerReference}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-lg font-semibold">{formatAmount(payment.amount, payment.currency)}</div>
            {getStatusBadge(payment.status)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
