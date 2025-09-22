/**
 * Shared time utilities to ensure consistent formatting across roles and pages.
 * Uses date-fns-tz to render times in Africa/Lagos regardless of server/client timezone.
 */
import { parseISO, isValid } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export const LAGOS_TZ = "Africa/Lagos";

/**
 * Format an ISO timestamp (or Date/number) in Africa/Lagos as "yyyy-MM-dd HH:mm:ss".
 * - If input is undefined/null or invalid, returns empty string or the original string respectively.
 * - Always renders in Lagos time to maintain parity between Admin and Customer Care.
 */
export function formatLocalTimestampKeepDate(
  ts?: string | Date | number | null,
  pattern: string = "yyyy-MM-dd HH:mm:ss",
  timeZone: string = LAGOS_TZ
): string {
  if (ts === undefined || ts === null) return "";
  try {
    // If a Date or number, use as-is. If string, parse as ISO first (keeps absolute instant).
    const date =
      typeof ts === "string"
        ? parseISO(ts)
        : ts instanceof Date
        ? ts
        : new Date(ts);

    if (!isValid(date)) return String(ts);

    // Format in the specified TZ (Africa/Lagos by default)
    return formatInTimeZone(date, timeZone, pattern);
  } catch {
    return String(ts);
  }
}