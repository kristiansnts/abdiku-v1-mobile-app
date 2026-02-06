import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { THEME } from '@/constants/theme';

interface DateGroupHeaderProps {
  date: string;  // ISO date string (YYYY-MM-DD)
  locale?: string;
}

const getDateLabel = (dateStr: string, locale: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) {
    return locale === 'id' ? 'Hari Ini' : 'Today';
  }

  if (date.getTime() === yesterday.getTime()) {
    return locale === 'id' ? 'Kemarin' : 'Yesterday';
  }

  return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const DateGroupHeader: React.FC<DateGroupHeaderProps> = ({ date, locale = 'en' }) => {
  const label = getDateLabel(date, locale);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default DateGroupHeader;
