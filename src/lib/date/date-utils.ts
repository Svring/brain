import { format, fromUnixTime, Locale } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { zhCN } from "date-fns/locale";

/**
 * Get current date in Unix seconds
 * @returns Current time in Unix seconds
 */
export function getCurrentUnixTime(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Get current timezone information
 * @returns Object containing timezone offset and name
 */
export function getCurrentTimezoneInfo(): { offset: number; name: string } {
  const now = new Date();
  const offset = now.getTimezoneOffset(); // Returns offset in minutes (negative for ahead of UTC)
  const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    offset: offset,
    name: timezoneName,
  };
}

/**
 * Format Unix timestamp in current local timezone
 * @param unixTime - Unix timestamp in seconds
 * @param formatString - Date format string (default: 'yyyy-MM-dd HH:mm:ss')
 * @param locale - Locale for formatting (default: zhCN)
 * @returns Formatted date string in current local timezone
 */
export function formatUnixTimeInLocalTimezone(
  unixTime: number,
  formatString: string = "yyyy-MM-dd HH:mm:ss",
  locale: Locale = zhCN
): string {
  const date = fromUnixTime(unixTime);
  // date-fns will automatically use the system's local timezone
  return format(date, formatString, { locale });
}

/**
 * Convert Unix timestamp to readable format for different time zones
 * @param unixTime - Unix timestamp in seconds
 * @param timeZone - Time zone string (e.g., 'Asia/Shanghai', 'America/New_York', 'UTC')
 * @param formatString - Date format string (default: 'yyyy-MM-dd HH:mm:ss')
 * @param locale - Locale for formatting (default: zhCN)
 * @returns Formatted date string in the specified time zone
 */
export function formatUnixTimeToReadable(
  unixTime: number,
  timeZone: string,
  formatString: string = "yyyy-MM-dd HH:mm:ss",
  locale: Locale = zhCN
): string {
  const date = fromUnixTime(unixTime);
  const zonedDate = toZonedTime(date, timeZone);

  return format(zonedDate, formatString, { locale });
}

/**
 * Format ISO date string to readable format (YYYY-MM-DD HH:mm)
 * @param isoDateString - ISO date string (e.g., "2025-08-15T15:46:32Z")
 * @param formatString - Date format string (default: 'yyyy-MM-dd HH:mm')
 * @param locale - Locale for formatting (default: zhCN)
 * @returns Formatted date string
 */
export function formatIsoDateToReadable(
  isoDateString: string,
  formatString: string = "yyyy-MM-dd HH:mm",
  locale: Locale = zhCN
): string {
  const date = new Date(isoDateString);
  return format(date, formatString, { locale });
}

/**
 * Format duration in seconds to readable format (XdYhZm)
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "2d1h44m")
 */
export function formatDurationToReadable(seconds: number): string {
  if (seconds < 0) return "0m";

  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes}m`);
  }

  return parts.join("");
}

/**
 * Get monitor timespan with configurable offset
 * @param currentTimeUnix - Current time in Unix seconds
 * @param offsetHours - Hours to subtract from current time (default: 1)
 * @returns Object containing start and end times in Unix seconds
 */
export function getMonitorTimespan(
  currentTimeUnix: number,
  offsetHours: number = 1
): { start: number; end: number } {
  const endTime = currentTimeUnix;
  const startTime = endTime - offsetHours * 60 * 60; // Convert hours to seconds

  return {
    start: startTime,
    end: endTime,
  };
}
