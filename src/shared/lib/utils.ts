import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as formatDate, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely formats a date-like value. Returns a fallback string instead of
 * throwing if the value is missing, null, or an unparsable date — date-fns'
 * format() throws RangeError on invalid dates rather than returning "".
 */
export function safeFormat(
  value: string | number | Date | null | undefined,
  pattern: string,
  fallback = ""
): string {
  if (value === null || value === undefined || value === "") return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (!isValid(date)) return fallback;
  return formatDate(date, pattern);
}
