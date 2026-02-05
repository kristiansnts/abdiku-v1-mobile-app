import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/constants/theme';
import { formatDate, DatePattern } from '@/utils/date';
import { Language } from '@/constants/translations';

interface ClockCardProps {
  currentTime: Date;
  locale: Language;
  isInside: boolean | null;
  nearestPlace: string | null;
  t: {
    insideArea: string;
    outsideArea: string;
  };
}

export const ClockCard: React.FC<ClockCardProps> = ({
  currentTime,
  locale,
  isInside,
  nearestPlace,
  t,
}) => {
  return (
    <View style={styles.clockCard}>
      <LinearGradient
        colors={[THEME.primary, '#6366f1']}
        style={styles.clockGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.geofenceBadgeContainer}>
          {isInside !== null && (
            <View style={[
              styles.geofenceBadge,
              { backgroundColor: isInside ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }
            ]}>
              <Ionicons
                name={isInside ? "location" : "location-outline"}
                size={14}
                color={isInside ? THEME.success : '#ff8a8a'}
              />
              <Text style={[styles.geofenceText, { color: isInside ? '#d1fae5' : '#fee2e2' }]}>
                {isInside ? `${t.insideArea} ${nearestPlace}` : t.outsideArea}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.clockTime}>{formatDate(currentTime, 'time', locale)}</Text>
        <Text style={styles.clockDate}>{formatDate(currentTime, 'fullDate', locale)}</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  clockCard: {
    marginHorizontal: 20,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 8,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  clockGradient: {
    padding: 30,
    alignItems: 'center',
  },
  clockTime: {
    fontSize: 48,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 2,
  },
  clockDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    fontWeight: '500',
  },
  geofenceBadgeContainer: {
    marginBottom: 10,
  },
  geofenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  geofenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
