import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { THEME } from '@/constants/theme';

interface ActionButtonProps {
  canClockIn: boolean;
  canClockOut: boolean;
  isWithinShift: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
  t: {
    outsideShift: string;
    clockInNow: string;
    clockOutNow: string;
    attendanceCompleted: string;
  };
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  canClockIn,
  canClockOut,
  isWithinShift,
  onClockIn,
  onClockOut,
  t,
}) => {
  return (
    <Animated.View entering={FadeInUp.delay(400)} style={styles.actionContainer}>
      {/* Outside Shift Hours Message */}
      {!isWithinShift && (canClockIn || canClockOut) && (
        <View style={[styles.mainButton, styles.outsideShiftButton]}>
          <Ionicons name="time-outline" size={24} color={THEME.muted} style={{ marginRight: 10 }} />
          <Text style={[styles.mainButtonText, { color: THEME.muted }]}>{t.outsideShift}</Text>
        </View>
      )}

      {/* Clock In Button - only show within shift */}
      {isWithinShift && canClockIn && (
        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: THEME.primary }]}
          onPress={onClockIn}
        >
          <Ionicons name="location" size={24} color="white" style={{ marginRight: 10 }} />
          <Text style={styles.mainButtonText}>{t.clockInNow}</Text>
        </TouchableOpacity>
      )}

      {/* Clock Out Button - only show within shift */}
      {isWithinShift && canClockOut && (
        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: THEME.secondary }]}
          onPress={onClockOut}
        >
          <Ionicons name="walk" size={24} color="white" style={{ marginRight: 10 }} />
          <Text style={styles.mainButtonText}>{t.clockOutNow}</Text>
        </TouchableOpacity>
      )}

      {/* Attendance Completed */}
      {!canClockIn && !canClockOut && (
        <View style={[styles.mainButton, { backgroundColor: '#e2e8f0' }]}>
          <Ionicons name="checkmark-circle" size={24} color="#64748b" style={{ marginRight: 10 }} />
          <Text style={[styles.mainButtonText, { color: '#64748b' }]}>{t.attendanceCompleted}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  outsideShiftButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
});
