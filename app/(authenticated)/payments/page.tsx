"use client"

import { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CreditCard, LifeBuoy } from "lucide-react"
import {
    fetchMyPaymentHistory,
    selectMyPayments,
    selectPaymentHistoryStatus,
    selectPaymentHistoryError,
    clearPaymentHistoryError,
} from "@/features/payment/store/payment-slice"
import { PaymentListItem } from "@/features/payment/components/payment-list-item"
import AdminPaymentsTable from "@/features/payment/components/admin-payments-table"

export default function PaymentHistoryPage() {
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)
    const myPayments = useAppSelector(selectMyPayments)
    const status = useAppSelector(selectPaymentHistoryStatus)
    const error = useAppSelector(selectPaymentHistoryError)
    const isLoading = status === "loading"

    // Fetch data on mount, specific fetch handled within role components now for Admin
    useEffect(() => {
        if (user?.id && user.role === "student" && status === "idle") {
            dispatch(fetchMyPaymentHistory({ userId: user.id }))
        }
        // Admin data fetching is triggered inside AdminPaymentsTable component
        // Clear errors on mount or user change
        dispatch(clearPaymentHistoryError())
    }, [dispatch, user?.id, user?.role, status]) // Status included to refetch if becomes idle

    const renderContent = () => {
        if (!user) return <Skeleton className="h-40 w-full" />

        // Error handled globally first
        if (status === "failed" && error && !isLoading) {
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Data</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )
        }

        // Role-based rendering
        switch (user.role) {
            case "admin":
                // Admin table handles its own loading/error/empty states internally
                return <AdminPaymentsTable />
            case "student":
                if (isLoading) {
                    return (
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full rounded-lg" />
                            <Skeleton className="h-20 w-full rounded-lg" />
                        </div>
                    )
                }
                if (status === "succeeded" && myPayments.length === 0) {
                    return (
                        <div className="text-center py-10 border rounded-lg bg-card">
                            <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">You have no payment history yet.</p>
                        </div>
                    )
                }
                if (status === "succeeded" && myPayments.length > 0) {
                    return (
                        <div className="space-y-4">
                            {myPayments.map((payment) => (
                                <PaymentListItem key={payment.id} payment={payment} />
                            ))}
                            {/* TODO: Add Student Pagination controls if needed */}
                        </div>
                    )
                }
                return null // Should be covered by loading/error/empty

            case "teacher":
            // case "receptionist":
            default:
                return (
                    <div className="text-center py-10 border rounded-lg bg-card">
                        <LifeBuoy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Payment history is not applicable for your role.</p>
                    </div>
                )
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold">Payment History</h1>
            </div>
            {renderContent()}
        </div>
    )
}
