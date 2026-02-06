import { GLOBAL_STYLES, THEME } from '@/constants/theme';
import { Language } from '@/constants/translations';
import { formatDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ClockCardProps {
  currentTime: Date;
  locale: Language;
  isInside: boolean | null;
  nearestPlace: string | null;
  isHoliday?: boolean;
  holidayName?: string;
  t: {
    insideArea: string;
    outsideArea: string;
    holiday: string;
  };
}

export const ClockCard: React.FC<ClockCardProps> = ({
  currentTime,
  locale,
  isInside,
  nearestPlace,
  isHoliday,
  holidayName,
  t,
}) => {
  const holidayColors: readonly [string, string] = ['#f59e0b', '#d97706']; // Amber/Orange
  const normalColors: readonly [string, string] = [THEME.primary, THEME.primaryDeep];

  return (
    <View style={[styles.clockCard, GLOBAL_STYLES.shadowLg]}>
      <LinearGradient
        colors={isHoliday ? holidayColors : normalColors}
        style={styles.clockGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.geofenceBadgeContainer}>
          {isHoliday ? (
            <View style={[styles.geofenceBadge, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
              <Ionicons name="calendar" size={14} color="white" />
              <Text style={[styles.geofenceText, { color: 'white' }]}>
                {t.holiday}: {holidayName}
              </Text>
            </View>
          ) : isInside !== null ? (
            <View style={[
              styles.geofenceBadge,
              { backgroundColor: isInside ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)' }
            ]}>
              <Ionicons
                name={isInside ? "location" : "location-outline"}
                size={14}
                color={isInside ? '#10b981' : '#fb7185'}
              />
              <Text style={[styles.geofenceText, { color: isInside ? '#d1fae5' : '#ffe4e6' }]}>
                {isInside ? `${t.insideArea} ${nearestPlace}` : t.outsideArea}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.clockTime}>{formatDate(currentTime, 'time', locale)}</Text>
        <Text style={styles.clockDate}>{formatDate(currentTime, 'fullDate', locale)}</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  clockCard: {
    marginHorizontal: 24,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 24,
  },
  clockGradient: {
    padding: 36,
    alignItems: 'center',
  },
  clockTime: {
    fontSize: 54,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  clockDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  geofenceBadgeContainer: {
    marginBottom: 12,
  },
  geofenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
  },
  geofenceText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
