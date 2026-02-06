import { GLOBAL_STYLES, THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface ActionButtonProps {
  canClockIn: boolean;
  canClockOut: boolean;
  isWithinShift: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
  isHoliday?: boolean;
  holidayMessage?: string;
  t: {
    outsideShift: string;
    clockInNow: string;
    clockOutNow: string;
    attendanceCompleted: string;
    holiday: string;
    holidayEnjoy: string;
  };
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  canClockIn,
  canClockOut,
  isWithinShift,
  onClockIn,
  onClockOut,
  isHoliday,
  holidayMessage,
  t,
}) => {
  return (
    <Animated.View entering={FadeInUp.delay(400)} style={styles.actionContainer}>
      {/* Holiday Message */}
      {isHoliday && (
        <View style={[styles.holidayCard, GLOBAL_STYLES.shadowLg]}>
          <LinearGradient
            colors={['#fffbeb', '#fef3c7']}
            style={styles.holidayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.holidayContent}>
              <View style={styles.holidayBadge}>
                <Ionicons name="calendar" size={16} color="#b45309" />
                <Text style={styles.holidayBadgeText}>{t.holiday}</Text>
              </View>
              <Text style={styles.holidayName}>
                {holidayMessage || t.holiday}
              </Text>
              <Text style={styles.holidayEnjoyText}>
                {t.holidayEnjoy}
              </Text>
            </View>
            <View style={styles.holidayIconContainer}>
              <Ionicons name="balloon-outline" size={64} color="rgba(180, 83, 9, 0.1)" />
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Outside Shift Hours Message */}
      {!isHoliday && !isWithinShift && (canClockIn || canClockOut) && (
        <View style={[styles.mainButton, styles.outsideShiftButton]}>
          <View style={[styles.iconCircle, { backgroundColor: '#f1f5f9' }]}>
            <Ionicons name="time-outline" size={20} color={THEME.muted} />
          </View>
          <Text style={[styles.mainButtonText, { color: THEME.muted, flex: 1 }]}>{t.outsideShift}</Text>
        </View>
      )}

      {/* Clock In Button - only show within shift and not holiday */}
      {!isHoliday && isWithinShift && canClockIn && (
        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: THEME.primary }, styles.shadowPrimary]}
          onPress={onClockIn}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircleWhite}>
            <Ionicons name="location" size={20} color={THEME.primary} />
          </View>
          <Text style={styles.mainButtonText}>{t.clockInNow}</Text>
        </TouchableOpacity>
      )}

      {/* Clock Out Button - only show within shift and not holiday */}
      {!isHoliday && isWithinShift && canClockOut && (
        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: THEME.secondary }, styles.shadowSecondary]}
          onPress={onClockOut}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircleWhite}>
            <Ionicons name="walk" size={20} color={THEME.secondary} />
          </View>
          <Text style={styles.mainButtonText}>{t.clockOutNow}</Text>
        </TouchableOpacity>
      )}

      {/* Attendance Completed */}
      {!isHoliday && !canClockIn && !canClockOut && (
        <View style={[styles.mainButton, { backgroundColor: '#f1f5f9' }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#e2e8f0' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#64748b" />
          </View>
          <Text style={[styles.mainButtonText, { color: '#64748b' }]}>{t.attendanceCompleted}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    gap: 16,
  },
  shadowPrimary: {
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  shadowSecondary: {
    shadowColor: THEME.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleWhite: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outsideShiftButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderStyle: 'dashed',
  },
  holidayCard: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  holidayGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  holidayContent: {
    flex: 1,
  },
  holidayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 12,
  },
  holidayBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b45309',
    textTransform: 'uppercase',
  },
  holidayName: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: -0.5,
  },
  holidayEnjoyText: {
    fontSize: 14,
    color: '#b45309',
    marginTop: 4,
    fontWeight: '500',
    opacity: 0.8,
  },
  holidayIconContainer: {
    marginLeft: 16,
  },
});
