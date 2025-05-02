"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, AlertTriangle, CheckCircle, XCircle, RefreshCw, Filter } from "lucide-react"
import { format, parseISO, isValid } from "date-fns"
import { useDebounce } from "@/hooks/use-debounce"

import {
    fetchAllPaymentsAdmin,
    selectAllAdminPayments,
    selectAdminPaymentsPagination,
    selectPaymentHistoryStatus,
    selectPaymentHistoryError,
    clearPaymentHistoryError,
} from "../store/payment-slice"
import type { PaymentRecord } from "../types/payment-types"

// Helper to safely format date
const safeFormatDateTime = (dateString?: string): string => {
    if (!dateString) return "N/A"
    try {
        const date = parseISO(dateString)
        return isValid(date) ? format(date, "MMM d, yyyy p") : "Invalid Date" // Include time
    } catch {
        return "Error"
    }
}

// Helper for status badge
const getStatusBadge = (status: PaymentRecord["status"]) => {
    switch (status) {
        case "succeeded":
            return (
                <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Succeeded
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
        default:
            return (
                <Badge variant="secondary" className="text-xs capitalize">
                    {status}
                </Badge>
            )
    }
}

const ITEMS_PER_PAGE = 15 // Or make configurable

const AdminPaymentsTable: React.FC = () => {
    const dispatch = useAppDispatch()
    const payments = useAppSelector(selectAllAdminPayments)
    const pagination = useAppSelector(selectAdminPaymentsPagination)
    const status = useAppSelector(selectPaymentHistoryStatus)
    const error = useAppSelector(selectPaymentHistoryError)
    const isLoading = status === "loading"

    // Local state for filters/search/page
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<PaymentRecord["status"] | "all">("all")

    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    // Fetch data based on filters/pagination
    const fetchData = useCallback(() => {
        const params = {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            status: statusFilter === "all" ? undefined : statusFilter,
            search: debouncedSearchTerm || undefined,
        }
        dispatch(fetchAllPaymentsAdmin(params))
    }, [dispatch, currentPage, statusFilter, debouncedSearchTerm])

    // Initial fetch and refetch on filter/page changes
    useEffect(() => {
        dispatch(clearPaymentHistoryError())
        fetchData()
    }, [fetchData, dispatch])

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [statusFilter, debouncedSearchTerm])

    const handlePageChange = (newPage: number) => {
        if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage)
        }
    }

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

    return (
        <div className="space-y-4">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search User, Ref, Desc..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full"
                        disabled={isLoading}
                    />
                </div>
                <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as PaymentRecord["status"] | "all")}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full sm:w-[180px] flex-shrink-0">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="succeeded">Succeeded</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Loading Skeleton for Table */}
            {isLoading && (
                <div className="space-y-2 border rounded-md p-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            )}

            {/* Error Display */}
            {status === "failed" && error && !isLoading && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Payments</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Table */}
            {status === "succeeded" && !isLoading && (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Reference</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No payments found matching criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <div className="font-medium">{payment.userName || payment.userId}</div>
                                        <div className="text-xs text-muted-foreground">{payment.userId}</div>
                                    </TableCell>
                                    <TableCell className="max-w-[250px] truncate">{payment.description}</TableCell>
                                    <TableCell className="text-right font-mono">
                                        {formatAmount(payment.amount, payment.currency)}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {safeFormatDateTime(payment.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-xs font-mono text-muted-foreground">{payment.providerReference}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && status === "succeeded" && (
                <div className="mt-6 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handlePageChange(pagination.currentPage - 1)
                                    }}
                                    aria-disabled={pagination.currentPage <= 1}
                                    tabIndex={pagination.currentPage <= 1 ? -1 : undefined}
                                    className={pagination.currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
                                />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#" isActive>
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handlePageChange(pagination.currentPage + 1)
                                    }}
                                    aria-disabled={pagination.currentPage >= pagination.totalPages}
                                    tabIndex={pagination.currentPage >= pagination.totalPages ? -1 : undefined}
                                    className={
                                        pagination.currentPage >= pagination.totalPages ? "pointer-events-none opacity-50" : undefined
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
}

export default AdminPaymentsTable
