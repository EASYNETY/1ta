"use client"

import { useState, useEffect, useCallback } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationControls, PaginationInfo } from "@/components/ui/pagination-controls"
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Trash2 } from "lucide-react"
import { format, parseISO, isValid } from "date-fns"

import {
  fetchAdminPayments,
  selectAdminPayments,
  selectAdminPaymentsPagination,
  selectAdminPaymentsStatus,
  selectAdminPaymentsError,
} from "../store/adminPayments"

import { selectDateRange } from "../store/accounting-slice"

import type { PaymentRecord } from "../types/payment-types"
import type { AdminPaymentParams } from "../types/admin-payment-types"

const safeFormatDateTime = (dateString?: string): string => {
  if (!dateString) return "N/A"
  try {
    const date = parseISO(dateString)
    return isValid(date) ? format(date, "MMM d, yyyy p") : "Invalid Date"
  } catch {
    return "Error"
  }
}

// Reset to first page when filter changes
useEffect(() => {
  setCurrentPage(1)
}, [currentDateRange.startDate, currentDateRange.endDate])

const getStatusBadge = (status: PaymentRecord["status"]) => {
  switch (status) {
    case "succeeded":
      return (
        <Badge variant="success" className="text-xs">
          <CheckCircle className="mr-1 h-3 w-3" />
          Successful
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="secondary" className="text-xs">
          <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
          Pending
        </Badge>
      )
    case "failed":
      return (
        <Badge variant="destructive" className="text-xs">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      )
    case "refunded":
      return (
        <Badge variant="outline" className="text-xs">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Refunded
        </Badge>
      )
    case "deleted":
      return (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          <Trash2 className="mr-1 h-3 w-3" />
          Deleted
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="text-xs capitalize">
          {status}
        </Badge>
      )
  }
}

export function RecentPaymentsWidget() {
  const dispatch = useAppDispatch()
  const payments       = useAppSelector(selectAdminPayments)
  const pagination     = useAppSelector(selectAdminPaymentsPagination)
  const status         = useAppSelector(selectAdminPaymentsStatus)
  const error          = useAppSelector(selectAdminPaymentsError)
  const currentDateRange = useAppSelector(selectDateRange) // ← read filter

  const isLoading = status === "loading"

  const [currentPage, setCurrentPage]   = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const fetchData = useCallback(() => {
    const params: AdminPaymentParams = {
      page: currentPage,
      limit: itemsPerPage,
      sortBy: "createdAt",
      sortOrder: "DESC",
      startDate: currentDateRange.startDate ?? undefined,
      endDate:   currentDateRange.endDate   ?? undefined,
    }
    dispatch(fetchAdminPayments(params))
  }, [
    dispatch,
    currentPage,
    itemsPerPage,
    currentDateRange.startDate,
    currentDateRange.endDate,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePageChange = (newPage: number) => {
    const totalPages =
      pagination?.totalPages ??
      Math.ceil((pagination?.totalItems || 0) / itemsPerPage)

    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const formatAmount = (amount: number, currency: string): string => {
    try {
      const cleanAmount = Number(amount)
      if (currency === "NGN") {
        return `₦${cleanAmount.toLocaleString()}`
      } else {
        return new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(cleanAmount)
      }
    } catch {
      return `${currency === "NGN" ? "₦" : currency} ${Number(amount).toLocaleString()}`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>Recent payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {status === "failed" && error && !isLoading && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Payments</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === "succeeded" && !isLoading && (
          <div className="border rounded-md bg-card/5 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!payments || payments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No payments found.
                    </TableCell>
                  </TableRow>
                )}
                {payments && payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell><div className="font-medium">{payment.userName || "N/A"}</div></TableCell>
                    <TableCell><div className="text-xs">{payment.userEmail || "N/A"}</div></TableCell>
                    <TableCell><div className="text-xs capitalize">{payment.userRole || "N/A"}</div></TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatAmount(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {(() => {
                        const courseName = payment.invoice?.description || payment.description || "Unknown Course"
                        const cleanedName = courseName.replace(/^Course enrolment:\s*/, '').trim()
                        return cleanedName.length > 30 ? `${cleanedName.substring(0, 30)}...` : cleanedName
                      })()}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">{payment.provider}</Badge>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{safeFormatDateTime(payment.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {status === "succeeded" && !isLoading && payments && payments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 w-full border border-border/25 bg-card/5 backdrop-blur-sm p-2 rounded-md">
            <PaginationInfo
              currentPage={pagination?.currentPage || currentPage}
              totalPages={pagination?.totalPages || 1}
              totalItems={pagination?.totalItems || payments.length}
              itemsPerPage={pagination?.limit || itemsPerPage}
            />
            <PaginationControls
              currentPage={pagination?.currentPage || currentPage}
              totalPages={pagination?.totalPages || 1}
              className="w-full flex-1 justify-end"
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
