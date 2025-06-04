// features/accounting/components/AccountingQuickActions.tsx
"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, CreditCard, FileText, Calculator } from "lucide-react"
import { useAppSelector } from "@/store/hooks"
import {
    selectCourseRevenues,
    selectPaymentMethodDistribution,
    selectMonthlyRevenueTrend,
} from "../store/accounting-slice" // Assuming correct path
import {
    // Assuming these are defined in your export-utils.ts
    // and they accept the correct data types from the selectors
    exportCourseRevenueReports,
    exportPaymentMethodReports,
    exportMonthlyRevenueReports,
    exportComprehensiveAccountingReport,
} from "../utils/export-utils" // Assuming correct path

export function AccountingQuickActions() {
    const courseRevenues = useAppSelector(selectCourseRevenues)
    const paymentMethods = useAppSelector(selectPaymentMethodDistribution)
    const monthlyRevenue = useAppSelector(selectMonthlyRevenueTrend)

    const handleExportCourseRevenue = () => {
        if (courseRevenues && courseRevenues.length > 0) {
            exportCourseRevenueReports(courseRevenues)
        } else {
            // Optionally, show a toast message that there's no data to export
            console.warn("No course revenue data to export.")
        }
    }

    const handleExportPaymentMethods = () => {
        if (paymentMethods && paymentMethods.length > 0) {
            exportPaymentMethodReports(paymentMethods)
        } else {
            console.warn("No payment method data to export.")
        }
    }

    const handleExportMonthlyRevenue = () => {
        if (monthlyRevenue && monthlyRevenue.length > 0) {
            exportMonthlyRevenueReports(monthlyRevenue)
        } else {
            console.warn("No monthly revenue data to export.")
        }
    }

    const handleExportComprehensive = () => {
        // Check if all data sources have content before attempting a comprehensive export
        if (
            (courseRevenues && courseRevenues.length > 0) ||
            (paymentMethods && paymentMethods.length > 0) ||
            (monthlyRevenue && monthlyRevenue.length > 0)
        ) {
            exportComprehensiveAccountingReport(courseRevenues || [], paymentMethods || [], monthlyRevenue || [])
        } else {
            console.warn("No data available for comprehensive export.")
        }
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
            disabled: !paymentMethods || paymentMethods.length === 0,
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
                (!paymentMethods || paymentMethods.length === 0) &&
                (!monthlyRevenue || monthlyRevenue.length === 0),
        },
    ]

    return (
        <Card>
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
                                // className for individual button styling and responsiveness
                                // min-w-[180px] or sm:min-w-[200px] sets a minimum width
                                // w-full on small screens, then grow and basis for larger
                                // flex-grow allows it to grow, flex-shrink prevents excessive shrinking
                                // basis-1/2 on sm, basis-1/4 on lg/xl can create column-like behavior within flex
                                className="
                                    h-auto min-h-[100px] p-4
                                    flex flex-col items-center justify-center space-y-2
                                    hover:bg-accent/50 transition-colors
                                    w-full sm:w-auto sm:flex-grow sm:basis-[calc(50%-0.5rem)] md:basis-[calc(33.33%-0.66rem)] lg:basis-[calc(25%-0.75rem)]
                                    min-w-[160px] max-w-full sm:max-w-xs  /* Ensure buttons don't get overly wide if few */
                                "
                                onClick={action.onClick}
                                disabled={action.disabled} // Disable button if no data
                            >
                                <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-primary mb-1" />
                                <div className="text-center space-y-0.5">
                                    <p className="font-semibold text-sm sm:text-base leading-tight">{action.title}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-tight">{action.description}</p>
                                </div>
                                {action.disabled && (
                                    <span className="mt-1 text-xs text-destructive/70">(No data)</span>
                                )}
                            </Button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}