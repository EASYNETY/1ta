// features/payment/components/DateRangeFilter.tsx

"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { setDateRange, selectDateRange, fetchAccountingData } from "../store/accounting-slice"

export function DateRangeFilter() {
    const dispatch = useAppDispatch()
    const currentDateRange = useAppSelector(selectDateRange)

    const [startDate, setStartDate] = useState<Date | undefined>(
        currentDateRange.startDate ? new Date(currentDateRange.startDate) : undefined,
    )
    const [endDate, setEndDate] = useState<Date | undefined>(
        currentDateRange.endDate ? new Date(currentDateRange.endDate) : undefined,
    )

    const [startOpen, setStartOpen] = useState(false)
    const [endOpen, setEndOpen] = useState(false)

    const handleApplyFilter = () => {
        dispatch(
            setDateRange({
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null,
            }),
        )

        // Fetch data with the new date range
        dispatch(
            fetchAccountingData({
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
            }),
        )
    }

    const handleResetFilter = () => {
        setStartDate(undefined)
        setEndDate(undefined)
        dispatch(
            setDateRange({
                startDate: null,
                endDate: null,
            }),
        )

        // Fetch data with no date range
        dispatch(fetchAccountingData({}))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Date Range Filter</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="grid gap-2">
                        <div className="text-sm font-medium">Start Date</div>
                        <Popover open={startOpen} onOpenChange={setStartOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => {
                                        setStartDate(date)
                                        setStartOpen(false)
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <div className="text-sm font-medium">End Date</div>
                        <Popover open={endOpen} onOpenChange={setEndOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => {
                                        setEndDate(date)
                                        setEndOpen(false)
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex items-end gap-2">
                        <Button onClick={handleApplyFilter}>Apply Filter</Button>
                        <Button variant="outline" onClick={handleResetFilter}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
