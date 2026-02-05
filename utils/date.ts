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
export const formatDateString = (dateStr: string, pattern: DatePattern, locale: Language): string => {
  const date = new Date(dateStr);
  return formatDate(date, pattern, locale);
};

/**
 * Extract time portion (HH:MM) from a time string
 */
export const extractShortTime = (timeStr: string | null): string => {
  if (!timeStr) return '-';
  return timeStr.substring(0, 5);
};
