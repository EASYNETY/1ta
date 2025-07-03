"use client"

import { useState, useEffect, useCallback } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationControls, PaginationInfo } from "@/components/ui/pagination-controls"
import { Button } from "@/components/ui/button"
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Receipt,
  MoreHorizontal,
  Edit,
  Trash2,
  Download
} from "lucide-react"
import { format, parseISO, isValid } from "date-fns"
import { useDebounce } from "@/hooks/use-debounce"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  fetchAdminPayments,
  selectAdminPayments,
  selectAdminPaymentsPagination,
  selectAdminPaymentsStatus,
  selectAdminPaymentsError,
  clearAdminPaymentsError,
  updatePayment,
  deletePayment,
  generateReceipt,
  setSelectedPayment,
  selectSelectedPayment,
  selectUpdatePaymentStatus,
  selectDeletePaymentStatus,
} from "../store/adminPayments"
import type { PaymentRecord } from "../types/payment-types"
import type { AdminPaymentParams } from "../types/admin-payment-types"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

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

const AdminPaymentTable: React.FC = () => {
  const dispatch = useAppDispatch()
  const payments = useAppSelector(selectAdminPayments)
  const pagination = useAppSelector(selectAdminPaymentsPagination)
  const status = useAppSelector(selectAdminPaymentsStatus)
  const error = useAppSelector(selectAdminPaymentsError)
  const selectedPayment = useAppSelector(selectSelectedPayment)
  const updateStatus = useAppSelector(selectUpdatePaymentStatus)
  const deleteStatus = useAppSelector(selectDeletePaymentStatus)

  const isLoading = status === "loading"
  const isUpdating = updateStatus === "loading"
  const isDeleting = deleteStatus === "loading"

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [providerFilter, setProviderFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<string>("DESC")

  // Edit payment dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editDescription, setEditDescription] = useState("")
  const [editStatus, setEditStatus] = useState<PaymentRecord["status"]>("pending")

  // Delete payment dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Fetch data based on filters/pagination
  const fetchData = useCallback(() => {
    const params: AdminPaymentParams = {
      page: currentPage,
      limit: itemsPerPage,
      status: statusFilter === "all" ? undefined : statusFilter,
      provider: providerFilter === "all" ? undefined : providerFilter,
      sortBy,
      sortOrder,
      search: debouncedSearchTerm || undefined,
    }
    dispatch(fetchAdminPayments(params))
  }, [dispatch, currentPage, itemsPerPage, statusFilter, providerFilter, sortBy, sortOrder, debouncedSearchTerm])

  // Initial fetch and refetch on filter/page changes
  useEffect(() => {
    dispatch(clearAdminPaymentsError())
    fetchData()
  }, [fetchData, dispatch])

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, providerFilter, sortBy, sortOrder, debouncedSearchTerm])

  const handlePageChange = (newPage: number) => {
    // If we have pagination data, use it to validate the page number
    if (pagination) {
      const totalPages = pagination.totalPages || Math.ceil((pagination.totalItems || 0) / itemsPerPage);
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    } else {
      // If we don't have pagination data, just set the page if it's valid
      if (newPage >= 1) {
        setCurrentPage(newPage);
      }
    }
  }

  // Format amount helper
  const formatAmount = (amount: number, currency: string): string => {
    try {
      // Remove leading zeros by converting to number first
      const cleanAmount = Number(amount)

      if (currency === "NGN") {
        // For NGN, use the ₦ symbol directly to ensure consistent display
        return `₦${cleanAmount.toLocaleString()}`
      } else {
        return new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: currency,
          maximumFractionDigits: 0,
        }).format(cleanAmount)
      }
    } catch {
      // Fallback for unknown currency
      return `${currency === "NGN" ? "₦" : currency} ${Number(amount).toLocaleString()}`
    }
  }

  // Handle edit payment
  const handleEditClick = (payment: PaymentRecord) => {
    dispatch(setSelectedPayment(payment))
    setEditDescription(payment.description || "")
    setEditStatus(payment.status)
    setIsEditDialogOpen(true)
  }

  // Handle delete payment
  const handleDeleteClick = (payment: PaymentRecord) => {
    dispatch(setSelectedPayment(payment))
    setIsDeleteDialogOpen(true)
  }

  // Handle generate receipt
  const handleGenerateReceipt = (paymentId: string) => {
    dispatch(generateReceipt(paymentId))
  }

  // Handle save edit
  const handleSaveEdit = () => {
    if (selectedPayment) {
      dispatch(updatePayment({
        id: selectedPayment.id,
        status: editStatus,
        description: editDescription,
      }))
        .unwrap()
        .then(() => {
          setIsEditDialogOpen(false)
          fetchData() // Refresh data after update
        })
        .catch((error) => {
          console.error("Failed to update payment:", error)
        })
    }
  }

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedPayment) {
      dispatch(deletePayment(selectedPayment.id))
        .unwrap()
        .then(() => {
          setIsDeleteDialogOpen(false)
          fetchData() // Refresh data after delete
        })
        .catch((error) => {
          console.error("Failed to delete payment:", error)
        })
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
          onValueChange={(value) => setStatusFilter(value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[180px] flex-shrink-0">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="succeeded">Successful</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={providerFilter}
          onValueChange={(value) => setProviderFilter(value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[180px] flex-shrink-0">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="paystack">Paystack</SelectItem>
            <SelectItem value="stripe">Stripe</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="mock">Mock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters (Sort) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[180px] flex-shrink-0">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[180px] flex-shrink-0">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ASC">Ascending</SelectItem>
            <SelectItem value="DESC">Descending</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => setItemsPerPage(parseInt(value))}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-[180px] flex-shrink-0">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="25">25 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
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
        <div className="border rounded-md bg-card/5 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount Billed</TableHead>
                <TableHead className="text-right">Amount Paid</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reconciled</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!payments || payments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={13} className="h-24 text-center">
                    No payments found matching criteria.
                  </TableCell>
                </TableRow>
              )}
              {payments && payments.map((payment) => (
                <TableRow key={payment.id}>
                  {/* Student Name */}
                  <TableCell>
                    <div className="font-medium">{payment.userName || "N/A"}</div>
                  </TableCell>

                  {/* Student ID */}
                  <TableCell>
                    <div className="text-xs font-mono">{payment.userId}</div>
                  </TableCell>

                  {/* Invoice # */}
                  <TableCell>
                    <div className="text-xs font-mono">{payment.invoiceId || payment.invoice_id || "N/A"}</div>
                  </TableCell>

                  {/* Fee Type */}
                  <TableCell>
                    <div className="text-xs">
                      {payment.metadata?.feeType ||
                        (payment.description?.toLowerCase().includes("tuition") ? "Tuition" :
                          payment.description?.toLowerCase().includes("material") ? "Materials" :
                            payment.description?.toLowerCase().includes("exam") ? "Exam Fee" : "General")}
                    </div>
                  </TableCell>

                  {/* Event/Course */}
                <TableCell className="max-w-[250px] truncate text-xs">
                  {(() => {
                    // Use the invoice description as the course name, with a fallback
                    const courseName = payment.invoice?.description || payment.description || "Unknown Course";

                    // Clean up the course name by removing "Course enrolment:" prefix
                    const cleanedName = courseName.replace(/^Course enrolment:\s*/, '').trim();

                    return cleanedName.length > 30 ? `${cleanedName.substring(0, 30)}...` : cleanedName;
                  })()}
                </TableCell>

                  {/* Payment Date/Time */}
                  <TableCell className="text-xs whitespace-nowrap">
                    {safeFormatDateTime(payment.createdAt)}
                  </TableCell>

                  {/* Amount Billed */}
                  <TableCell className="text-right font-mono text-xs">
                    {formatAmount(payment.metadata?.billedAmount || payment.amount, payment.currency)}
                  </TableCell>

                  {/* Amount Paid */}
                  <TableCell className="text-right font-mono text-xs">
                    {formatAmount(payment.amount, payment.currency)}
                  </TableCell>

                  {/* Payment Method */}
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">
                      {payment.provider}
                    </Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>

                  {/* Reconciled */}
                  <TableCell>
                    {payment.reconciliationStatus ? (
                      <Badge
                        variant={payment.reconciliationStatus === "reconciled" ? "secondary" : "outline"}
                        className="text-xs capitalize"
                      >
                        {payment.reconciliationStatus}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    )}
                  </TableCell>

                  {/* Notes */}
                  <TableCell className="max-w-[150px] truncate text-xs">
                    {payment.metadata?.notes || "No notes"}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <TooltipProvider>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {/* <DropdownMenuItem onClick={() => handleEditClick(payment)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Payment
                          </DropdownMenuItem> */}
                          {payment.status === "succeeded" && (
                            <DropdownMenuItem
                            // onClick={() => handleGenerateReceipt(payment.id)}
                            >
                              {/* <Receipt className="mr-2 h-4 w-4" />
                              Generate Receipt */}
                              <Link href={`/payments/${payment.id}/receipt`} passHref className="flex items-center justify-center gap-2 text-sm">
                                <>
                                  <Receipt className="h-3 w-3" />
                                  <span>View Receipt</span>
                                </>
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {/* <DropdownMenuItem
                            onClick={() => handleDeleteClick(payment)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Payment
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Controls */}
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

      {/* Edit Payment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>
              Update payment details. Changes will be saved to the database.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right">
                Status
              </label>
              <Select
                value={editStatus}
                onValueChange={(value: PaymentRecord["status"]) => setEditStatus(value)}
                disabled={isUpdating}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right">
                Description
              </label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="col-span-3"
                disabled={isUpdating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPayment && (
              <div className="space-y-2 border p-3 rounded-md">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="text-sm">{formatAmount(selectedPayment.amount, selectedPayment.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">User:</span>
                  <span className="text-sm">{selectedPayment.userName || selectedPayment.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Date:</span>
                  <span className="text-sm">{safeFormatDateTime(selectedPayment.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="text-sm">{selectedPayment.status}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminPaymentTable