// features/payment/components/DateRangeFilter.tsx

"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, subDays } from "date-fns"
import { CalendarIcon, RefreshCw, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { setDateRange, selectDateRange, fetchAccountingData } from "../store/accounting-slice"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

    const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
  dispatch(
    setDateRange({
      startDate: range.from ? format(range.from, 'yyyy-MM-dd') : null,
      endDate: range.to ? format(range.to, 'yyyy-MM-dd') : null
    })
  )

  dispatch(
    fetchAccountingData({
      startDate: range.from ? format(range.from, 'yyyy-MM-dd') : undefined,
      endDate: range.to ? format(range.to, 'yyyy-MM-dd') : undefined
    })
  )
}

const handleApplyFilter = () => {
  handleDateRangeChange({ from: startDate, to: endDate })
}


    // const handleApplyFilter = () => {
    //     dispatch(
    //         setDateRange({
    //             startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
    //             endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
    //         }),
    //     )

    //     // Fetch data with the new date range
    //     dispatch(
    //         fetchAccountingData({
    //             startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    //             endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    //         }),
    //     )
    // }

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

    const handleQuickSelect = (value: string) => {
        const today = new Date()
        let start: Date | undefined
        let end: Date = today

        switch (value) {
            case "today":
                start = today
                break
            case "yesterday":
                start = subDays(today, 1)
                end = subDays(today, 1)
                break
            case "last7days":
                start = subDays(today, 6)
                break
            case "last30days":
                start = subDays(today, 29)
                break
            case "thisMonth":
                start = new Date(today.getFullYear(), today.getMonth(), 1)
                break
            case "lastMonth":
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                end = new Date(today.getFullYear(), today.getMonth(), 0)
                break
            case "custom":
                // Do nothing, let user select custom dates
                return
            default:
                return
        }

        setStartDate(start)
        setEndDate(end)

        // Auto-apply the filter
        if (start && end) {
            dispatch(
                setDateRange({
                    startDate: format(start, "yyyy-MM-dd"),
                    endDate: format(end, "yyyy-MM-dd"),
                }),
            )

            dispatch(
                fetchAccountingData({
                    startDate: format(start, "yyyy-MM-dd"),
                    endDate: format(end, "yyyy-MM-dd"),
                }),
            )
        }
    }

    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Select onValueChange={handleQuickSelect} defaultValue="last30days">
                <SelectTrigger className="w-full sm:w-[180px] flex-shrink-0">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last7days">Last 7 days</SelectItem>
                    <SelectItem value="last30days">Last 30 days</SelectItem>
                    <SelectItem value="thisMonth">This month</SelectItem>
                    <SelectItem value="lastMonth">Last month</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex flex-col sm:flex-row gap-3 flex-grow">
                <Popover open={startOpen} onOpenChange={setStartOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn("w-full sm:w-[200px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : "Start date"}
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

                <Popover open={endOpen} onOpenChange={setEndOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn("w-full sm:w-[200px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : "End date"}
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

                <div className="flex gap-2">
                    <Button onClick={handleApplyFilter} className="flex-shrink-0">Apply</Button>
                    <Button variant="outline" onClick={handleResetFilter} className="flex-shrink-0">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    )
}
