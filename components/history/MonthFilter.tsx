import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { THEME } from '@/constants/theme';

interface MonthFilterProps {
  selectedMonth: string;  // Format: YYYY-MM
  onSelectMonth: (month: string) => void;
  locale?: string;
}

const getMonths = (count: number, locale: string): { value: string; label: string }[] => {
  const months: { value: string; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      month: 'short',
      year: 'numeric',
    });
    months.push({ value, label });
  }

  return months;
};

export const MonthFilter: React.FC<MonthFilterProps> = ({
  selectedMonth,
  onSelectMonth,
  locale = 'en',
}) => {
  const months = useMemo(() => getMonths(12, locale), [locale]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {months.map((month) => {
          const isSelected = month.value === selectedMonth;
          return (
            <TouchableOpacity
              key={month.value}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelectMonth(month.value)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {month.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipSelected: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.text,
  },
  chipTextSelected: {
    color: '#fff',
  },
});

export default MonthFilter;
