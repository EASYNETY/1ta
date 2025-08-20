// features/payment/components/DateRangeFilter.tsx

"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, subDays } from "date-fns"
import { CalendarIcon, RefreshCw, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { setDateRange, selectDateRange, fetchAccountingData } from "../store/accounting-slice"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { setDateRange as setAdminDateRange } from "../store/adminPayments"


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
    const [applyStatus, setApplyStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
    const [applyMessage, setApplyMessage] = useState<string | null>(null)

    // On mount, initialize from URL query params if present so filter persists across refresh
    useEffect(() => {
        try {
            const search = typeof window !== 'undefined' ? window.location.search : '';
            if (!search) return;
            const params = new URLSearchParams(search);
            const s = params.get('startDate');
            const e = params.get('endDate');
            if (s || e) {
                const parsedStart = s ? new Date(s) : undefined;
                const parsedEnd = e ? new Date(e) : undefined;
                setStartDate(parsedStart);
                setEndDate(parsedEnd);

                // Synchronize store and trigger fetch
                dispatch(
                    setAccountingDateRange({
                        startDate: s || null,
                        endDate: e || null,
                    }),
                );
                dispatch(
                    setAdminDateRange({
                        startDate: s || null,
                        endDate: e || null,
                    }),
                );

                dispatch(fetchAccountingData({ startDate: s || undefined, endDate: e || undefined }));
            }
        } catch (err) {
            console.warn('[DateRangeFilter] failed to initialize from URL', err)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleApplyFilter = async () => {
        console.log('[DateRangeFilter] Apply clicked', { startDate, endDate })
        // Update UI immediately
        setApplyStatus('loading')
        setApplyMessage('Applying filter...')

        dispatch(
            setAccountingDateRange({
                startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
                endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
            }),
        )
        dispatch(
            setAdminDateRange({
                startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
                endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
            }),
        )

        // Fetch data with the new date range and await result so we can show status
        try {
            const action = await dispatch(
                fetchAccountingData({
                    startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
                    endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
                }),
            )

            // Persist to URL so refresh keeps the filter
            try {
                if (typeof window !== 'undefined') {
                    const params = new URLSearchParams(window.location.search);
                    if (startDate) params.set('startDate', format(startDate, 'yyyy-MM-dd'));
                    else params.delete('startDate');
                    if (endDate) params.set('endDate', format(endDate, 'yyyy-MM-dd'));
                    else params.delete('endDate');

                    const newUrl = `${window.location.pathname}?${params.toString()}`;
                    window.history.replaceState({}, '', newUrl);
                }
            } catch (err) {
                console.warn('[DateRangeFilter] failed to persist date range to URL', err)
            }

            if (fetchAccountingData.rejected.match(action)) {
                console.warn('[DateRangeFilter] fetchAccountingData rejected', action.payload)
                setApplyStatus('error')
                setApplyMessage(action.payload ?? 'Failed to apply filter')
            } else {
                console.log('[DateRangeFilter] fetchAccountingData fulfilled')
                setApplyStatus('success')
                setApplyMessage('Filter applied')
            }
        } catch (err: any) {
            console.error('[DateRangeFilter] apply error', err)
            setApplyStatus('error')
            setApplyMessage(err?.message || 'Error applying filter')
        }

        // Clear message after a short delay
        setTimeout(() => {
            setApplyStatus('idle')
            setApplyMessage(null)
        }, 3000)
    }

    const handleResetFilter = () => {
        setStartDate(undefined)
        setEndDate(undefined)
        dispatch(
            setAccountingDateRange({
                startDate: null,
                endDate: null,
            }),
        )
        dispatch(
            setAdminDateRange({
                startDate: null,
                endDate: null,
            }),
        )

        // Fetch data with no date range
        dispatch(fetchAccountingData({}))

        // Remove date range from URL
        try {
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                params.delete('startDate');
                params.delete('endDate');
                const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        } catch (err) {
            console.warn('[DateRangeFilter] failed to clear date range from URL', err)
        }
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
                setAccountingDateRange({
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
                    <Button type="button" onClick={handleApplyFilter} className="flex-shrink-0">Apply</Button>
                    <Button type="button" variant="outline" onClick={handleResetFilter} className="flex-shrink-0">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                </div>
                <div className="flex items-center ml-3">
                    {applyStatus === 'loading' && <span className="text-sm text-muted-foreground">Applying...</span>}
                    {applyStatus === 'success' && <span className="text-sm text-green-600">{applyMessage}</span>}
                    {applyStatus === 'error' && <span className="text-sm text-red-600">{applyMessage}</span>}
                </div>
            </div>
        </div>
    )
}
