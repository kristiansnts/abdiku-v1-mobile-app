import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { GLOBAL_STYLES, THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useGeofence } from '@/hooks/use-geofence';
import { useAttendance } from '@/hooks/useAttendance';
import MapModal from '@/components/MapModal';
import {
  ClockCard,
  StatusRow,
  ActionButton,
  HistoryList,
  ShiftInfo,
} from '@/components/attendance';
import { homeStyles as styles } from '@/styles/screens';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { t, locale } = useLocalization();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMapModal, setShowMapModal] = useState(false);

  // Use custom hooks
  const {
    isInside,
    nearestPlace,
    currentLocation,
    locations,
    refreshLocations,
    error: locationError,
    retryLocation,
  } = useGeofence(!!user?.employee);

  const handleAuthError = useCallback(async (err: any) => {
    const status = err.response?.status;
    const errorData = err.response?.data?.error;
    const message = errorData?.message || err.message || 'Session error';

    if (status === 401 || status === 403) {
      Alert.alert('Access Denied', `${message}. Please sign in again.`, [
        { text: 'OK', onPress: () => logout() }
      ]);
    }
  }, [logout]);

  const {
    status,
    history,
    refreshing,
    refresh,
    initiateClockAction,
    handleClockAction,
    pendingAction,
    isWithinShift,
    getLateMinutes,
  } = useAttendance({
    enabled: !!user?.employee,
    onAuthError: handleAuthError,
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = useCallback(async () => {
    await Promise.all([refresh(), refreshLocations()]);
  }, [refresh, refreshLocations]);

  const onClockAction = (type: 'clock-in' | 'clock-out') => {
    initiateClockAction(type);
    setShowMapModal(true);
  };

  const onConfirmClockAction = async () => {
    setShowMapModal(false);
    try {
      await handleClockAction();
      Alert.alert(
        t.common.success,
        `Successfully ${pendingAction === 'clock-in' ? t.home.clockIn : t.home.clockOut}`
      );
    } catch (err: any) {
      Alert.alert(t.common.error, err.response?.data?.error?.message || t.errors.operationFailed);
    }
  };

  // Missing Employee View
  if (!user?.employee) {
    return (
      <View style={styles.center}>
        <Animated.View entering={FadeInDown} style={[styles.emptyCard, GLOBAL_STYLES.card]}>
          <Ionicons name="person-remove-outline" size={60} color={THEME.muted} />
          <Text style={styles.emptyTitle}>Account Setup Required</Text>
          <Text style={styles.emptyDesc}>
            Your account ({user?.email}) is not linked to an employee record.
            {"\n\n"}
            Attendance and payroll features are only available for accounts with a valid employee profile.
          </Text>
          <TouchableOpacity style={styles.logoutButtonSmall} onPress={logout}>
            <Text style={styles.logoutTextSmall}>{t.profile.signOut}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  if (!status) {
    return (
      <View style={styles.center}>
        <Text style={{ color: THEME.muted }}>{t.common.loading}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }} edges={['top']}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text style={styles.greeting}>{t.home.greeting}</Text>
            <Text style={styles.userName}>{user?.name} 👋</Text>
          </Animated.View>
        </View>

        {/* Clock Card */}
        <ClockCard
          currentTime={currentTime}
          locale={locale}
          isInside={isInside}
          nearestPlace={nearestPlace}
          t={{ insideArea: t.home.insideArea, outsideArea: t.home.outsideArea }}
        />

        {/* Shift Info */}
        <ShiftInfo shift={status.shift} t={{ shiftTime: t.home.shiftTime }} />

        {/* Status Row */}
        <StatusRow
          clockIn={status.today_attendance?.clock_in || null}
          clockOut={status.today_attendance?.clock_out || null}
          lateMinutes={getLateMinutes()}
          locale={locale}
          t={{
            clockIn: t.home.clockIn,
            clockOut: t.home.clockOut,
            lateBy: t.home.lateBy,
            minutes: t.home.minutes,
          }}
        />

        {/* Action Button */}
        <ActionButton
          canClockIn={status.can_clock_in}
          canClockOut={status.can_clock_out}
          isWithinShift={isWithinShift()}
          onClockIn={() => onClockAction('clock-in')}
          onClockOut={() => onClockAction('clock-out')}
          t={{
            outsideShift: t.home.outsideShift,
            clockInNow: t.home.clockInNow,
            clockOutNow: t.home.clockOutNow,
            attendanceCompleted: t.home.attendanceCompleted,
          }}
        />

        {/* History List */}
        <HistoryList history={history} locale={locale} t={t} />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Map Modal */}
      <MapModal
        visible={showMapModal}
        onClose={() => setShowMapModal(false)}
        onConfirm={onConfirmClockAction}
        latitude={currentLocation?.lat || null}
        longitude={currentLocation?.lng || null}
        isInside={isInside}
        nearestPlace={nearestPlace}
        actionType={pendingAction}
        locations={locations}
        locationError={locationError}
        onRetryLocation={retryLocation}
      />
    </SafeAreaView>
  );
}
