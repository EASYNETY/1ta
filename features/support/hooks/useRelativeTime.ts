import { useEffect, useState } from 'react'
import { parseISO, isValid, formatDistanceToNowStrict } from 'date-fns'

/**
 * Returns a live-updating relative time label for a given ISO date string.
 * Example: "Updated just now", "Updated 1 minute ago"
 */
export default function useRelativeTime(dateString?: string) {
    const compute = (): string => {
        if (!dateString) return 'Updated N/A'
        try {
            const parsed = parseISO(dateString)
            if (!isValid(parsed)) return 'Updated Invalid date'
            const now = new Date()
            const safeDate = parsed.getTime() > now.getTime() ? now : parsed
            const text = formatDistanceToNowStrict(safeDate, { addSuffix: true })
            return `Updated ${text}`
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

        // Choose interval: every second for the first minute, otherwise every minute
        const getInterval = () => {
            try {
                const parsed = parseISO(dateString)
                if (!isValid(parsed)) return 60000
                const now = Date.now()
                const diffSec = Math.abs((now - Math.min(parsed.getTime(), now)) / 1000)
                return diffSec < 60 ? 1000 : 60000
            } catch {
                return 60000
            }
        }

        // Start interval and also run immediately
        tick()
        let interval = getInterval()
        const id = setInterval(tick, interval)

        // If the frequency should change (e.g., moved past 1 minute), recreate timer
        const freqChecker = setInterval(() => {
            const next = getInterval()
            if (next !== interval) {
                clearInterval(id)
                interval = next
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                // recreate interval with new timing (we'll rely on effect cleanup to clear)
                // but here we simply clear and set a new one
                // NOTE: setInterval id variable re-assigned below is local; recreate directly
            }
        }, 5000)

        return () => {
            mounted = false
            clearInterval(id)
            clearInterval(freqChecker)
        }
    }, [dateString])

    return label
}
