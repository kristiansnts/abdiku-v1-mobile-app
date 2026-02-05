import MapModal from '@/components/MapModal';
import { GLOBAL_STYLES, THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useGeofence } from '@/hooks/use-geofence';
import api from '@/services/api';
import { Attendance, AttendanceStatus } from '@/types/attendance';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { t, locale } = useLocalization();
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal States
  const [showMapModal, setShowMapModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'clock-in' | 'clock-out' | null>(null);

  // Use the new geofence hook
  const { isInside, nearestPlace, currentLocation, locations, refreshLocations, error: locationError, retryLocation } = useGeofence(!!user?.employee);

  // Helper for formatting dates with selected locale
  const formatDate = useCallback((date: Date, pattern: 'time' | 'fullDate' | 'shortTime' | 'historyDate') => {
    const localeCode = locale === 'id' ? 'id-ID' : 'en-GB';

    if (pattern === 'time') {
      return date.toLocaleTimeString(localeCode, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    if (pattern === 'fullDate') {
      return date.toLocaleDateString(localeCode, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    }
    if (pattern === 'shortTime') {
      return date.toLocaleTimeString(localeCode, { hour: '2-digit', minute: '2-digit' });
    }
    if (pattern === 'historyDate') {
      return date.toLocaleDateString(localeCode, { weekday: 'short', day: '2-digit', month: 'short' });
    }
    return date.toDateString();
  }, [locale]);

  // Helper for translating attendance status
  const getStatusTranslation = useCallback((status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'approved':
        return t.status.approved;
      case 'rejected':
        return t.status.rejected;
      case 'pending':
        return t.status.pending;
      case 'locked':
        return t.status.locked;
      default:
        return status; // Fallback to original status if not found
    }
  }, [t]);

  // Helper to check if current time is within shift hours
  const isWithinShift = useCallback(() => {
    if (!status?.shift) return true; // If no shift, allow clock in/out

    const now = new Date();
    const [startHour, startMin] = status.shift.start_time.split(':').map(Number);
    const [endHour, endMin] = status.shift.end_time.split(':').map(Number);

    const shiftStart = new Date(now);
    shiftStart.setHours(startHour, startMin, 0, 0);

    const shiftEnd = new Date(now);
    shiftEnd.setHours(endHour, endMin, 0, 0);

    return now >= shiftStart && now <= shiftEnd;
  }, [status?.shift]);

  // Helper to calculate late minutes
  const getLateMinutes = useCallback(() => {
    if (!status?.shift || !status?.today_attendance?.clock_in) return 0;

    const [startHour, startMin] = status.shift.start_time.split(':').map(Number);
    const [clockHour, clockMin] = status.today_attendance.clock_in.split(':').map(Number);

    const shiftStartMinutes = startHour * 60 + startMin;
    const clockInMinutes = clockHour * 60 + clockMin;
    const lateMinutes = clockInMinutes - shiftStartMinutes - status.shift.late_after_minutes;

    return lateMinutes > 0 ? lateMinutes : 0;
  }, [status?.shift, status?.today_attendance?.clock_in]);

  const handleAuthError = useCallback(async (err: any) => {
    const status = err.response?.status;
    const errorData = err.response?.data?.error;
    const message = errorData?.message || err.message || 'Session error';

    console.log('Auth Error Details:', JSON.stringify(errorData, null, 2));

    if (status === 401 || status === 403) {
      Alert.alert('Access Denied', `${message}. Please sign in again.`, [
        { text: 'OK', onPress: () => logout() }
      ]);
    }
  }, [logout]);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/attendance/status');
      setStatus(res.data.data);
    } catch (err) {
      console.error('Fetch status error:', err);
      handleAuthError(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/attendance/history?per_page=5');
      setHistory(res.data.data);
    } catch (err) {
      console.error('Fetch history error:', err);
      handleAuthError(err);
    }
  };

  const onRefresh = useCallback(async () => {
    if (!user?.employee) return;
    setRefreshing(true);
    await Promise.all([
      fetchStatus(),
      fetchHistory(),
      refreshLocations()
    ]);
    setRefreshing(false);
  }, [user?.employee, refreshLocations]);

  useEffect(() => {
    if (user?.employee) {
      fetchStatus();
      fetchHistory();
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [user?.employee]);

  const initiateClockAction = (type: 'clock-in' | 'clock-out') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPendingAction(type);
    setShowMapModal(true);
  };

  const handleClockAction = async () => {
    if (!user?.employee || !pendingAction) return;

    setShowMapModal(false);

    try {
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to mark attendance');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      const payload = {
        [`${pendingAction.replace('-', '_')}_at`]: new Date().toISOString(),
        evidence: {
          geolocation: {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            accuracy: location.coords.accuracy,
          },
          device: {
            device_id: 'mobile-device',
            model: 'iPhone',
            os: 'ios',
            app_version: '1.0.0',
          },
        },
      };

      await api.post(`/attendance/${pendingAction}`, payload);
      setPendingAction(null);
      onRefresh();
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
        {/* Header Section */}
        <View style={styles.header}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text style={styles.greeting}>{t.home.greeting}</Text>
            <Text style={styles.userName}>{user?.name} 👋</Text>
          </Animated.View>
        </View>

        {/* Clock Section */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.clockCard}>
          <LinearGradient
            colors={[THEME.primary, '#6366f1']}
            style={styles.clockGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.geofenceBadgeContainer}>
              {isInside !== null && (
                <View style={[styles.geofenceBadge, { backgroundColor: isInside ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
                  <Ionicons
                    name={isInside ? "location" : "location-outline"}
                    size={14}
                    color={isInside ? THEME.success : '#ff8a8a'}
                  />
                  <Text style={[styles.geofenceText, { color: isInside ? '#d1fae5' : '#fee2e2' }]}>
                    {isInside ? `${t.home.insideArea} ${nearestPlace}` : t.home.outsideArea}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.clockTime}>{formatDate(currentTime, 'time')}</Text>
            <Text style={styles.clockDate}>{formatDate(currentTime, 'fullDate')}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Shift Info */}
        {status.shift && (
          <Animated.View entering={FadeInUp.delay(250)} style={styles.shiftInfoContainer}>
            <View style={styles.shiftInfo}>
              <Ionicons name="time-outline" size={16} color={THEME.muted} />
              <Text style={styles.shiftInfoText}>
                {t.home.shiftTime}: {status.shift.name} ({status.shift.start_time} - {status.shift.end_time})
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Stats/Status Row */}
        <View style={styles.statusRow}>
          <Animated.View entering={FadeInLeft.delay(300)} style={[styles.statusBox, GLOBAL_STYLES.card]}>
            <Ionicons name="enter-outline" size={24} color={THEME.success} />
            <Text style={styles.statusBoxLabel}>{t.home.clockIn}</Text>
            <Text style={styles.statusBoxTime}>
              {status.today_attendance?.clock_in
                ? formatDate(new Date(`2000-01-01T${status.today_attendance.clock_in}`), 'shortTime')
                : '--:--'}
            </Text>
            {/* Late Indicator */}
            {getLateMinutes() > 0 && (
              <View style={styles.lateBadge}>
                <Text style={styles.lateBadgeText}>
                  {t.home.lateBy} {getLateMinutes()} {t.home.minutes}
                </Text>
              </View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(300)} style={[styles.statusBox, GLOBAL_STYLES.card]}>
            <Ionicons name="exit-outline" size={24} color={THEME.danger} />
            <Text style={styles.statusBoxLabel}>{t.home.clockOut}</Text>
            <Text style={styles.statusBoxTime}>
              {status.today_attendance?.clock_out
                ? formatDate(new Date(`2000-01-01T${status.today_attendance.clock_out}`), 'shortTime')
                : '--:--'}
            </Text>
          </Animated.View>
        </View>

        {/* Action Button */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.actionContainer}>
          {/* Outside Shift Hours Message */}
          {!isWithinShift() && (status.can_clock_in || status.can_clock_out) && (
            <View style={[styles.mainButton, styles.outsideShiftButton]}>
              <Ionicons name="time-outline" size={24} color={THEME.muted} style={{ marginRight: 10 }} />
              <Text style={[styles.mainButtonText, { color: THEME.muted }]}>{t.home.outsideShift}</Text>
            </View>
          )}

          {/* Clock In Button - only show within shift */}
          {isWithinShift() && status.can_clock_in && (
            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: THEME.primary }]}
              onPress={() => initiateClockAction('clock-in')}
            >
              <Ionicons name="location" size={24} color="white" style={{ marginRight: 10 }} />
              <Text style={styles.mainButtonText}>{t.home.clockInNow}</Text>
            </TouchableOpacity>
          )}

          {/* Clock Out Button - only show within shift */}
          {isWithinShift() && status.can_clock_out && (
            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: THEME.secondary }]}
              onPress={() => initiateClockAction('clock-out')}
            >
              <Ionicons name="walk" size={24} color="white" style={{ marginRight: 10 }} />
              <Text style={styles.mainButtonText}>{t.home.clockOutNow}</Text>
            </TouchableOpacity>
          )}

          {/* Attendance Completed */}
          {!status.can_clock_in && !status.can_clock_out && (
            <View style={[styles.mainButton, { backgroundColor: '#e2e8f0' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#64748b" style={{ marginRight: 10 }} />
              <Text style={[styles.mainButtonText, { color: '#64748b' }]}>{t.home.attendanceCompleted}</Text>
            </View>
          )}
        </Animated.View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.home.recentActivity}</Text>
          <TouchableOpacity>
            <Text style={styles.viewMore}>{t.home.viewHistory}</Text>
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInUp.delay(500)}>
          {history.length > 0 ? (
            history.map((item) => (
              <View key={item.id} style={[styles.historyItem, GLOBAL_STYLES.card]}>
                <View style={styles.historyIcon}>
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={THEME.primary}
                  />
                </View>
                <View style={styles.historyInfo}>
                  <View style={styles.historyDateRow}>
                    <Text style={styles.historyDate}>{formatDate(new Date(item.date), 'historyDate')}</Text>
                    {item.is_late && (
                      <View style={styles.historyLateBadge}>
                        <Text style={styles.historyLateBadgeText}>{t.home.late}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.historyStatus}>{getStatusTranslation(item.status)}</Text>
                </View>
                <View style={styles.historyTimes}>
                  <Text style={[styles.historyTimeIn, item.is_late && styles.historyTimeLate]}>
                    {item.clock_in ? item.clock_in.substring(0, 5) : '-'}
                  </Text>
                  <Text style={styles.historyTimeOut}>{item.clock_out ? item.clock_out.substring(0, 5) : '-'}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t.home.noActivity}</Text>
            </View>
          )}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Map Verification Modal */}
      <MapModal
        visible={showMapModal}
        onClose={() => setShowMapModal(false)}
        onConfirm={handleClockAction}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.bg,
    padding: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: THEME.muted,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text,
  },
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  viewMore: {
    color: THEME.primary,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  historyInfo: {
    flex: 1,
  },
  historyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.text,
  },
  historyLateBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historyLateBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.danger,
  },
  historyStatus: {
    fontSize: 12,
    color: THEME.muted,
    marginTop: 2,
  },
  historyTimes: {
    alignItems: 'flex-end',
  },
  historyTimeIn: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.success,
  },
  historyTimeLate: {
    color: THEME.danger,
  },
  historyTimeOut: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.danger,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: THEME.muted,
  },
  emptyCard: {
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.text,
    marginTop: 20,
  },
  emptyDesc: {
    fontSize: 16,
    color: THEME.muted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  logoutButtonSmall: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: THEME.bg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logoutTextSmall: {
    color: THEME.danger,
    fontWeight: 'bold',
  }
});
