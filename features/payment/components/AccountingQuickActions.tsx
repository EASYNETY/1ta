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

    const actions = [
        {
            icon: BarChart3,
            title: "Course Revenue",
            description: "Export course data",
            onClick: handleExportCourseRevenue,
        },
        {
            icon: CreditCard,
            title: "Payment Methods",
            description: "Export payment data",
            onClick: handleExportPaymentMethods,
        },
        {
            icon: Calculator,
            title: "Monthly Trends",
            description: "Export trend data",
            onClick: handleExportMonthlyRevenue,
        },
        {
            icon: FileText,
            title: "Full Report",
            description: "Export everything",
            onClick: handleExportComprehensive,
        },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common accounting tasks and reports</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Mobile: Stack vertically, Tablet: 2 columns, Desktop: 4 columns */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                    {actions.map((action, index) => {
                        const IconComponent = action.icon
                        return (
                            <Button
                                key={index}
                                variant="outline"
                                className="h-auto min-h-[100px] p-4 flex flex-col items-center justify-center space-y-3 hover:bg-accent/50 transition-colors"
                                onClick={action.onClick}
                            >
                                <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                                <div className="text-center space-y-1">
                                    <p className="font-medium text-sm sm:text-base leading-tight">{action.title}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-tight">{action.description}</p>
                                </div>
                            </Button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
