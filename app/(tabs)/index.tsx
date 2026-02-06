import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import MapModal from '@/components/MapModal';
import {
  ActionButton,
  ClockCard,
  HistoryList,
  ShiftInfo,
  StatusRow,
} from '@/components/attendance';
import { Toast } from '@/components/common/Toast';
import { GLOBAL_STYLES, THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useNetwork } from '@/context/NetworkContext';
import { useGeofence } from '@/hooks/use-geofence';
import { useAttendance } from '@/hooks/useAttendance';
import { homeStyles as styles } from '@/styles/screens';
import { formatLateTime } from '@/utils/date';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { t, locale } = useLocalization();
  const { isConnected, pendingCount, triggerSync, refreshPendingCount } = useNetwork();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMapModal, setShowMapModal] = useState(false);
  const [showLateNotice, setShowLateNotice] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  const {
    isInside,
    nearestPlace,
    currentLocation,
    locations,
    refreshLocations,
    error: locationError,
    isMockLocation,
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
    getLiveLateMinutes,
  } = useAttendance({
    enabled: !!user?.employee,
    onAuthError: handleAuthError,
    isConnected,
  });

  const liveLateMinutes = getLiveLateMinutes(currentTime);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isMockLocation) {
      Alert.alert(
        t.errors.mockLocationDetected,
        t.errors.mockLocationMessage,
        [{ text: t.common.ok, style: 'default' }],
        { cancelable: false }
      );
    }
  }, [isMockLocation, t]);

  const onRefresh = useCallback(async () => {
    // Trigger sync first if there are pending actions
    await triggerSync();
    // Then refresh all data
    await Promise.all([refresh(), refreshLocations(), refreshPendingCount()]);
  }, [refresh, refreshLocations, triggerSync, refreshPendingCount]);

  const onClockAction = (type: 'clock-in' | 'clock-out') => {
    if (isMockLocation) {
      Alert.alert(
        t.errors.mockLocationDetected,
        t.errors.mockLocationBlocked,
        [{ text: t.common.ok }]
      );
      return;
    }
    initiateClockAction(type);
    setShowMapModal(true);
  };

  const onConfirmClockAction = async () => {
    setShowMapModal(false);
    try {
      const result = await handleClockAction();
      if (result.offline) {
        // Saved offline - show info toast
        setToast({
          visible: true,
          message: pendingAction === 'clock-in' ? t.home.offlineClockIn : t.home.offlineClockOut,
          type: 'info'
        });
        refreshPendingCount();
      } else {
        // Successfully synced online
        setToast({
          visible: true,
          message: pendingAction === 'clock-in' ? t.home.clockInSuccess : t.home.clockOutSuccess,
          type: 'success'
        });
      }
    } catch (err: any) {
      setToast({
        visible: true,
        message: err.response?.data?.error?.message || t.errors.operationFailed,
        type: 'error'
      });
    }
  };

  if (!user?.employee) {
    return (
      <View style={styles.center}>
        <Animated.View entering={FadeInDown} style={[styles.emptyCard, GLOBAL_STYLES.card]}>
          <Ionicons name="person-remove-outline" size={60} color={THEME.muted} />
          <Text style={styles.emptyTitle}>Account Setup Required</Text>
          <Text style={styles.emptyDesc}>
            Your account ({user?.email}) is not linked to an employee record.{"\n\n"}
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
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      )}
      {!!(status.can_clock_in && liveLateMinutes > 0 && showLateNotice) && (
        <View style={styles.lateNoticeContainerFixed}>
          <View style={{ width: 24 }} />
          <View style={styles.lateNoticeContent}>
            <Ionicons name="alert-circle" size={14} color={THEME.danger} />
            <Text style={styles.lateNoticeText}>
              {t.home.lateBy} {formatLateTime(liveLateMinutes, t.home)}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowLateNotice(false)} style={styles.closeNoticeButton}>
            <Ionicons name="close" size={20} color={THEME.danger} />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />
        }
      >
        <View style={styles.header}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text style={styles.greeting}>{t.home.greeting}</Text>
            <Text style={styles.userName}>{user?.name} 👋</Text>
          </Animated.View>
          {pendingCount > 0 && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fef3c7',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              gap: 6,
            }}>
              <Ionicons name="cloud-upload-outline" size={14} color="#d97706" />
              <Text style={{ fontSize: 12, color: '#d97706', fontWeight: '600' }}>
                {t.home.pendingSync}
              </Text>
            </View>
          )}
        </View>

        <ClockCard
          currentTime={currentTime}
          locale={locale}
          isInside={isInside}
          nearestPlace={nearestPlace}
          t={{ insideArea: t.home.insideArea, outsideArea: t.home.outsideArea }}
        />

        <ShiftInfo shift={status.shift} t={{ shiftTime: t.home.shiftTime }} />

        <StatusRow
          clockIn={status.today_attendance?.clock_in || null}
          clockOut={status.today_attendance?.clock_out || null}
          lateMinutes={getLateMinutes()}
          locale={locale}
          t={{
            clockIn: t.home.clockIn,
            clockOut: t.home.clockOut,
            lateBy: t.home.lateBy,
            hour: t.home.hour,
            hours: t.home.hours,
            minute: t.home.minute,
            minutes: t.home.minutes,
          }}
        />

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

        <HistoryList history={history} locale={locale} t={t} />
        <View style={{ height: 40 }} />
      </ScrollView>

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
        isMockLocation={isMockLocation}
      />
    </SafeAreaView>
  );
}
