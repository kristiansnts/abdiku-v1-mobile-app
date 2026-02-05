import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { THEME } from '@/constants/theme';
import { Shift } from '@/types/attendance';

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
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  shiftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shiftInfoText: {
    fontSize: 13,
    color: THEME.muted,
    fontWeight: '500',
  },
});
