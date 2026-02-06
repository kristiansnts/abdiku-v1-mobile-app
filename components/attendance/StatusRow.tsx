import { GLOBAL_STYLES, THEME } from '@/constants/theme';
import { Language } from '@/constants/translations';
import { formatDate, formatLateTime } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';

interface StatusRowProps {
  clockIn: string | null;
  clockOut: string | null;
  lateMinutes: number;
  locale: Language;
  t: {
    clockIn: string;
    clockOut: string;
    lateBy: string;
    hour: string;
    hours: string;
    minute: string;
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
              {t.lateBy} {formatLateTime(lateMinutes, t)}
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
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  statusBox: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: THEME.card,
    borderRadius: 24,
  },
  statusBoxLabel: {
    fontSize: 13,
    color: THEME.muted,
    fontWeight: '600',
    marginTop: 10,
    letterSpacing: 0.2,
  },
  statusBoxTime: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.text,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  lateBadge: {
    marginTop: 10,
    backgroundColor: '#fff1f2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  lateBadgeText: {
    fontSize: 10,
    color: THEME.danger,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
