import { THEME } from '@/constants/theme';
import { Shift } from '@/types/attendance';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface ShiftInfoProps {
  shift: Shift | null;
  t: {
    shiftTime: string;
  };
}

export const ShiftInfo: React.FC<ShiftInfoProps> = ({ shift, t }) => {
  if (!shift) return null;

  return (
    <Animated.View entering={FadeInUp.delay(250)} style={styles.shiftInfoContainer}>
      <View style={styles.shiftInfo}>
        <Ionicons name="time-outline" size={16} color={THEME.muted} />
        <Text style={styles.shiftInfoText}>
          {t.shiftTime}: {shift.name} ({shift.start_time} - {shift.end_time})
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shiftInfoContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  shiftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 116, 139, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    gap: 8,
  },
  shiftInfoText: {
    fontSize: 12,
    color: THEME.muted,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
