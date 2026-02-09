import { Language } from '@/constants/translations';

export type DatePattern = 'time' | 'fullDate' | 'shortTime' | 'historyDate' | 'dateTime' | 'shortDate';

/**
 * Get locale code for date formatting
 */
const getLocaleCode = (locale: Language): string => {
  return locale === 'id' ? 'id-ID' : 'en-GB';
};

/**
 * Format a date according to a pattern and locale
 */
export const formatDate = (date: Date, pattern: DatePattern, locale: Language): string => {
  const localeCode = getLocaleCode(locale);

  switch (pattern) {
    case 'time':
      return date.toLocaleTimeString(localeCode, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    case 'fullDate':
      return date.toLocaleDateString(localeCode, {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    case 'shortTime':
      return date.toLocaleTimeString(localeCode, {
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'historyDate':
      return date.toLocaleDateString(localeCode, {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      });
    case 'dateTime':
      return date.toLocaleDateString(localeCode, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'shortDate':
      return date.toLocaleDateString(localeCode, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    default:
      return date.toDateString();
  }
};

/**
 * Format time from a Date object
 */
export const formatTime = (date: Date, locale: Language): string => {
  return date.toLocaleTimeString(getLocaleCode(locale), {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Parse a time string (HH:MM:SS or HH:MM) into a Date object
 */
export const parseTimeString = (timeStr: string): Date => {
  return new Date(`2000-01-01T${timeStr}`);
};

/**
 * Format a date string from API response
 */
export const formatDateString = (dateStr: string | null | undefined, pattern: DatePattern, locale: Language): string => {
  if (!dateStr) return '-';

  try {
    // Handle formats like "YYYY-MM-DD HH:mm:ss" which might fail in some JS engines (e.g. older Android/iOS)
    // We normalize it to ISO format by replacing the space with 'T'
    let normalizedStr = dateStr.trim();

    // Simple heuristic: if it looks like "YYYY-MM-DD HH:mm:ss...", insert the 'T'
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(normalizedStr)) {
      normalizedStr = normalizedStr.replace(/\s/, 'T');
    }

    const date = new Date(normalizedStr);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`[formatDateString] Invalid date encountered: "${dateStr}"`);
      return dateStr;
    }

    const formatted = formatDate(date, pattern, locale);

    // Extra safety check for toLocaleDateString/toDateString returning "Invalid Date" string
    if (formatted === 'Invalid Date' || formatted === 'NaN/NaN/NaN') {
      return dateStr;
    }

    return formatted;
  } catch (error) {
    console.warn(`[formatDateString] Error formatting date: "${dateStr}"`, error);
    return dateStr;
  }
};

/**
 * Extract time portion (HH:MM) from a time string
 */
export const extractShortTime = (timeStr: string | null): string => {
  if (!timeStr) return '-';

  // If it's "YYYY-MM-DD HH:mm:ss", get the time part
  // If it's "YYYY-MM-DDTHH:mm:ss", get the time part
  if (timeStr.includes('T') || (timeStr.includes('-') && timeStr.includes(' '))) {
    const parts = timeStr.trim().split(/[ T]/);
    if (parts.length > 1) {
      return parts[1].substring(0, 5);
    }
  }

  // Default: just take first 5 characters (handles "HH:mm:ss")
  return timeStr.substring(0, 5);
};

/**
 * Format late minutes into hours and minutes
 */
export const formatLateTime = (minutes: number, t: { hour: string, hours: string, minute: string, minutes: string }): string => {
  if (minutes <= 0) return '';

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  let result = '';

  if (h > 0) {
    result += `${h} ${h > 1 ? t.hours : t.hour}`;
  }

  if (m > 0) {
    if (result) result += ' ';
    result += `${m} ${m > 1 ? t.minutes : t.minute}`;
  }

  return result;
};
