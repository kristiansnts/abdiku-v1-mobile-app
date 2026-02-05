import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { GLOBAL_STYLES, THEME } from '@/constants/theme';
import { formatDate } from '@/utils/date';
import { Language } from '@/constants/translations';

interface StatusRowProps {
  clockIn: string | null;
  clockOut: string | null;
  lateMinutes: number;
  locale: Language;
  t: {
    clockIn: string;
    clockOut: string;
    lateBy: string;
    minutes: string;
  };
}

export const StatusRow: React.FC<StatusRowProps> = ({
  clockIn,
  clockOut,
  lateMinutes,
  locale,
  t,
}) => {
  const formatClockTime = (time: string | null) => {
    if (!time) return '--:--';
    return formatDate(new Date(`2000-01-01T${time}`), 'shortTime', locale);
  };

  return (
    <View style={styles.statusRow}>
      <Animated.View entering={FadeInLeft.delay(300)} style={[styles.statusBox, GLOBAL_STYLES.card]}>
        <Ionicons name="enter-outline" size={24} color={THEME.success} />
        <Text style={styles.statusBoxLabel}>{t.clockIn}</Text>
        <Text style={styles.statusBoxTime}>{formatClockTime(clockIn)}</Text>
        {lateMinutes > 0 && (
          <View style={styles.lateBadge}>
            <Text style={styles.lateBadgeText}>
              {t.lateBy} {lateMinutes} {t.minutes}
            </Text>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInRight.delay(300)} style={[styles.statusBox, GLOBAL_STYLES.card]}>
        <Ionicons name="exit-outline" size={24} color={THEME.danger} />
        <Text style={styles.statusBoxLabel}>{t.clockOut}</Text>
        <Text style={styles.statusBoxTime}>{formatClockTime(clockOut)}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  statusBox: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
  },
  statusBoxLabel: {
    fontSize: 12,
    color: THEME.muted,
    marginTop: 8,
  },
  statusBoxTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
    marginTop: 4,
  },
  lateBadge: {
    marginTop: 8,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lateBadgeText: {
    fontSize: 11,
    color: THEME.danger,
    fontWeight: '600',
  },
});
