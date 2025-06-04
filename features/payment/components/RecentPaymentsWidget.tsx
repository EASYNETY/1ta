"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppSelector } from "@/store/hooks"
import { selectAllAdminPayments, selectPaymentHistoryStatus } from "@/features/payment/store/payment-slice"

export function RecentPaymentsWidget() {
    const payments = useAppSelector(selectAllAdminPayments)
    const status = useAppSelector(selectPaymentHistoryStatus)
    const isLoading = status === "loading"

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "succeeded":
                return (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Successful</Badge>
                )
            case "pending":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Pending</Badge>
                )
            case "failed":
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Failed</Badge>
            default:
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">{status}</Badge>
        }
    }

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <Card className="bg-blue-50 dark:bg-blue-950/5">
            <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : payments.length > 0 ? (
                    <div className="space-y-4">
                        {payments.slice(0, 5).map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <p className="font-medium">{payment.userName || payment.userId}</p>
                                        <p className="text-sm text-muted-foreground">{payment.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    {getStatusBadge(payment.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No recent payments found</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
