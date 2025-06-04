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
            disabled: !courseRevenues || courseRevenues.length === 0,
        },
        {
            icon: CreditCard,
            title: "Payment Methods",
            description: "Export payment data",
            onClick: handleExportPaymentMethods,
            disabled: !paymentMethods || Object.keys(paymentMethods).length === 0,
        },
        {
            icon: Calculator,
            title: "Monthly Trends",
            description: "Export trend data",
            onClick: handleExportMonthlyRevenue,
            disabled: !monthlyRevenue || monthlyRevenue.length === 0,
        },
        {
            icon: FileText,
            title: "Full Report",
            description: "Export everything",
            onClick: handleExportComprehensive,
            disabled:
                (!courseRevenues || courseRevenues.length === 0) &&
                (!paymentMethods || Object.keys(paymentMethods).length === 0) &&
                (!monthlyRevenue || monthlyRevenue.length === 0),
        },
    ]

    return (
        <Card className="bg-purple-50 dark:bg-purple-950/5">
            <CardHeader>
                <CardTitle>Quick Actions & Exports</CardTitle>
                <CardDescription>Common accounting tasks and data exports</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Flexbox layout with wrapping */}
                <div className="flex flex-wrap gap-4">
                    {actions.map((action, index) => {
                        const IconComponent = action.icon
                        return (
                            <Button
                                key={index}
                                variant="outline"
                                className="
                                h-auto min-h-[100px] p-4
                                flex flex-col items-center justify-center space-y-2
                                hover:bg-accent/50 transition-colors
                                w-full sm:w-auto sm:flex-grow sm:basis-[calc(50%-0.5rem)] md:basis-[calc(33.33%-0.66rem)] lg:basis-[calc(25%-0.75rem)]
                                min-w-[160px] max-w-full sm:max-w-xs
                                border-primary/20 hover:border-primary/40
                            "
                                onClick={action.onClick}
                                disabled={action.disabled}
                            >
                                <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-primary mb-1" />
                                <div className="text-center space-y-0.5">
                                    <p className="font-semibold text-sm sm:text-base leading-tight">{action.title}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-tight">{action.description}</p>
                                </div>
                                {action.disabled && <span className="mt-1 text-xs text-destructive/70">(No data)</span>}
                            </Button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
