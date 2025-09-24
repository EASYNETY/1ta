import { useEffect, useState } from 'react'
import { parseISO, isValid, differenceInSeconds, differenceInMinutes, differenceInHours } from 'date-fns'
import { zonedTimeToUtc, toZonedTime } from 'date-fns-tz'

/**
 * Returns a live-updating relative time label for a given ISO date string.
 * Example: "Updated just now", "Updated 1 minute ago"
 */
export default function useRelativeTime(dateString?: string) {
    const compute = (): string => {
        if (!dateString) return 'Updated N/A'
        try {
            // Parse the ISO string as UTC, then convert to user's local timezone
            const utcDate = parseISO(dateString)
            if (!isValid(utcDate)) return 'Updated Invalid date'

            // Convert UTC to user's local timezone (Africa/Lagos)
            const localDate = toZonedTime(utcDate, 'Africa/Lagos')
            const now = new Date()
            const localNow = toZonedTime(now, 'Africa/Lagos')

            const safeDate = localDate.getTime() > localNow.getTime() ? localNow : localDate
            const seconds = differenceInSeconds(localNow, safeDate)
            const minutes = differenceInMinutes(localNow, safeDate)
            const hours = differenceInHours(localNow, safeDate)
            if (seconds < 60) {
                return `Updated ${seconds} second${seconds === 1 ? '' : 's'} ago`
            } else if (minutes < 60) {
                return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`
            } else {
                return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`
            }
        } catch {
            return 'Updated Error'
        }
    }

    const [label, setLabel] = useState<string>(() => compute())

    useEffect(() => {
        if (!dateString) {
            setLabel('Updated N/A')
            return
        }

        let mounted = true

        const tick = () => {
            if (!mounted) return
            setLabel(compute())
        }

        // Choose interval: every second for <1min, every minute for <1hr, every hour for >=1hr
        const getInterval = () => {
            try {
                const utcDate = parseISO(dateString)
                if (!isValid(utcDate)) return 60000
                const localDate = toZonedTime(utcDate, 'Africa/Lagos')
                const now = new Date()
                const localNow = toZonedTime(now, 'Africa/Lagos')
                const seconds = differenceInSeconds(localNow, localDate)
                const minutes = differenceInMinutes(localNow, localDate)
                if (seconds < 60) return 1000
                if (minutes < 60) return 60000
                return 3600000
            } catch {
                return 60000
            }
        }

        tick()
        let interval = getInterval()
        let id = setInterval(tick, interval)

        // Check every 10s if interval should change
        const freqChecker = setInterval(() => {
            const next = getInterval()
            if (next !== interval) {
                clearInterval(id)
                interval = next
                id = setInterval(tick, interval)
            }
        }, 10000)

        return () => {
            mounted = false
            clearInterval(id)
            clearInterval(freqChecker)
        }
    }, [dateString])

    return label
}
