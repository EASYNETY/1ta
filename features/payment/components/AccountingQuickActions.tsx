// features/payment/components/AccountingQuickActions.tsx

"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, CreditCard, FileText, Calculator } from "lucide-react"
import { useAppSelector } from "@/store/hooks"
import {
    selectCourseRevenues,
    selectPaymentMethodDistribution,
    selectMonthlyRevenueTrend,
} from "../store/accounting-slice"
import {
    exportCourseRevenueReports,
    exportPaymentMethodReports,
    exportMonthlyRevenueReports,
    exportComprehensiveAccountingReport,
} from "../utils/export-utils"

export function AccountingQuickActions() {
    const courseRevenues = useAppSelector(selectCourseRevenues)
    const paymentMethods = useAppSelector(selectPaymentMethodDistribution)
    const monthlyRevenue = useAppSelector(selectMonthlyRevenueTrend)

    const handleExportCourseRevenue = () => {
        exportCourseRevenueReports(courseRevenues)
    }

    const handleExportPaymentMethods = () => {
        exportPaymentMethodReports(paymentMethods)
    }

    const handleExportMonthlyRevenue = () => {
        exportMonthlyRevenueReports(monthlyRevenue)
    }

    const handleExportComprehensive = () => {
        exportComprehensiveAccountingReport(courseRevenues, paymentMethods, monthlyRevenue)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common accounting tasks and reports</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                        onClick={handleExportCourseRevenue}
                    >
                        <BarChart3 className="h-8 w-8" />
                        <div className="text-center">
                            <p className="font-medium">Course Revenue</p>
                            <p className="text-sm text-muted-foreground">Export course data</p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                        onClick={handleExportPaymentMethods}
                    >
                        <CreditCard className="h-8 w-8" />
                        <div className="text-center">
                            <p className="font-medium">Payment Methods</p>
                            <p className="text-sm text-muted-foreground">Export payment data</p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                        onClick={handleExportMonthlyRevenue}
                    >
                        <Calculator className="h-8 w-8" />
                        <div className="text-center">
                            <p className="font-medium">Monthly Trends</p>
                            <p className="text-sm text-muted-foreground">Export trend data</p>
                        </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                        onClick={handleExportComprehensive}
                    >
                        <FileText className="h-8 w-8" />
                        <div className="text-center">
                            <p className="font-medium">Full Report</p>
                            <p className="text-sm text-muted-foreground">Export everything</p>
                        </div>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
