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
import {
    setDateRange as setAccountingDateRange,
    selectDateRange as selectAccountingDateRange,
    fetchAccountingData,
    syncPaymentsFromAdmin,
} from "../store/accounting-slice"
import { selectAdminPayments } from "../store/adminPayments"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { setDateRange as setAdminDateRange } from "../store/adminPayments"

export function DateRangeFilter() {
    const dispatch = useAppDispatch()
    const currentDateRange = useAppSelector(selectAccountingDateRange)

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
    const adminPayments = useAppSelector(selectAdminPayments)

    // Initialize from URL query params
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
                dispatch(setAccountingDateRange({
                    startDate: s || null,
                    endDate: e || null,
                }));
                dispatch(setAdminDateRange({
                    startDate: s || null,
                    endDate: e || null,
                }));

                dispatch(fetchAccountingData({ startDate: s || undefined, endDate: e || undefined }));
            }
        } catch (err) {
            console.warn('[DateRangeFilter] Failed to initialize from URL', err)
        }
    }, [dispatch])

    const handleApplyFilter = async () => {
        console.log('[DateRangeFilter] Apply clicked', { startDate, endDate })
        
        // Update UI immediately
        setApplyStatus('loading')
        setApplyMessage('Applying filter...')

        try {
            // Update both slices' date ranges
            const startDateStr = startDate ? format(startDate, "yyyy-MM-dd") : null;
            const endDateStr = endDate ? format(endDate, "yyyy-MM-dd") : null;

            dispatch(setAccountingDateRange({
                startDate: startDateStr,
                endDate: endDateStr,
            }))
            dispatch(setAdminDateRange({
                startDate: startDateStr,
                endDate: endDateStr,
            }))

            // Fetch fresh accounting data
            const action = await dispatch(fetchAccountingData({
                startDate: startDateStr || undefined,
                endDate: endDateStr || undefined,
            }))

            // Update URL
            try {
                if (typeof window !== 'undefined') {
                    const params = new URLSearchParams(window.location.search);
                    if (startDateStr) params.set('startDate', startDateStr);
                    else params.delete('startDate');
                    if (endDateStr) params.set('endDate', endDateStr);
                    else params.delete('endDate');

                    const newUrl = `${window.location.pathname}?${params.toString()}`;
                    window.history.replaceState({}, '', newUrl);
                }
            } catch (err) {
                console.warn('[DateRangeFilter] Failed to update URL', err)
            }

            // Check if fetch was successful
            if (fetchAccountingData.rejected.match(action)) {
                console.warn('[DateRangeFilter] fetchAccountingData rejected', action.payload)
                setApplyStatus('error')
                setApplyMessage(action.payload ?? 'Failed to apply filter')
            } else {
                console.log('[DateRangeFilter] fetchAccountingData fulfilled')
                
                // Additional sync: ensure adminPayments data is synced to accounting slice
                const currentAdminPayments = adminPayments || [];
                if (currentAdminPayments.length > 0) {
                    // Filter admin payments by the new date range and sync
                    const filteredPayments = currentAdminPayments.filter((payment) => {
                        if (!startDateStr && !endDateStr) return true;
                        
                        try {
                            const paymentDate = new Date(payment.createdAt);
                            const start = startDateStr ? new Date(startDateStr) : null;
                            if (start) start.setHours(0, 0, 0, 0);
                            const end = endDateStr ? new Date(endDateStr) : null;
                            if (end) end.setHours(23, 59, 59, 999);

                            if (start && paymentDate < start) return false;
                            if (end && paymentDate > end) return false;
                            return true;
                        } catch (e) {
                            return false;
                        }
                    });
                    
                    console.log('[DateRangeFilter] Syncing filtered payments to accounting slice:', filteredPayments.length);
                    dispatch(syncPaymentsFromAdmin(filteredPayments));
                }
                
                setApplyStatus('success')
                setApplyMessage('Filter applied successfully')
            }
        } catch (err: any) {
            console.error('[DateRangeFilter] Apply error', err)
            setApplyStatus('error')
            setApplyMessage(err?.message || 'Error applying filter')
        }

        // Clear message after delay
        setTimeout(() => {
            setApplyStatus('idle')
            setApplyMessage(null)
        }, 3000)
    }

    const handleResetFilter = async () => {
        setStartDate(undefined)
        setEndDate(undefined)
        
        dispatch(setAccountingDateRange({
            startDate: null,
            endDate: null,
        }))
        dispatch(setAdminDateRange({
            startDate: null,
            endDate: null,
        }))

        // Fetch data with no date range
        await dispatch(fetchAccountingData({}))

        // Sync all admin payments to accounting slice
        if (adminPayments && adminPayments.length > 0) {
            dispatch(syncPaymentsFromAdmin(adminPayments));
        }

        // Remove date range from URL
        try {
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                params.delete('startDate');
                params.delete('endDate');
                const newUrl = params.toString() ? 
                    `${window.location.pathname}?${params.toString()}` : 
                    window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        } catch (err) {
            console.warn('[DateRangeFilter] Failed to clear URL params', err)
        }
    }

    const handleQuickSelect = async (value: string) => {
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
                return
            default:
                return
        }

        setStartDate(start)
        setEndDate(end)

        // Auto-apply the filter
        if (start && end) {
            const startStr = format(start, "yyyy-MM-dd");
            const endStr = format(end, "yyyy-MM-dd");
            
            dispatch(setAccountingDateRange({
                startDate: startStr,
                endDate: endStr,
            }))
            dispatch(setAdminDateRange({
                startDate: startStr,
                endDate: endStr,
            }))

            const action = await dispatch(fetchAccountingData({
                startDate: startStr,
                endDate: endStr,
            }))

            // Sync filtered data
            if (fetchAccountingData.fulfilled.match(action)) {
                // Filter and sync admin payments
                const filteredPayments = (adminPayments || []).filter((payment) => {
                    try {
                        const paymentDate = new Date(payment.createdAt);
                        const startDate = new Date(start);
                        startDate.setHours(0, 0, 0, 0);
                        const endDate = new Date(end);
                        endDate.setHours(23, 59, 59, 999);

                        return paymentDate >= startDate && paymentDate <= endDate;
                    } catch (e) {
                        return false;
                    }
                });
                
                dispatch(syncPaymentsFromAdmin(filteredPayments));
            }
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
                    <Button 
                        type="button" 
                        onClick={handleApplyFilter} 
                        className="flex-shrink-0"
                        disabled={applyStatus === 'loading'}
                    >
                        {applyStatus === 'loading' ? 'Applying...' : 'Apply'}
                    </Button>
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleResetFilter} 
                        className="flex-shrink-0"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                </div>
                
                {applyMessage && (
                    <div className="flex items-center ml-3">
                        <span className={cn(
                            "text-sm",
                            applyStatus === 'loading' && "text-muted-foreground",
                            applyStatus === 'success' && "text-green-600",
                            applyStatus === 'error' && "text-red-600"
                        )}>
                            {applyMessage}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}