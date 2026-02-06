import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { THEME } from '@/constants/theme';
import { useLocalization } from '@/context/LocalizationContext';
import { getAttendanceDetail } from '@/services/activityService';
import { AttendanceDetail, DeviceData, GeolocationData, getEvidenceData, getStatusColor } from '@/types/activity';

export default function AttendanceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useLocalization();
  const [detail, setDetail] = useState<AttendanceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getAttendanceDetail(Number(id))
        .then(setDetail)
        .catch((err) => {
          setError(err.response?.data?.error?.message || 'Failed to load details');
        });
    }
  }, [id]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '-';

    // Handle both "HH:mm:ss" and full ISO datetime "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DD HH:mm:ss"
    if (timeStr.includes('T') || (timeStr.includes('-') && timeStr.includes(' '))) {
      const d = new Date(timeStr.replace(' ', 'T'));
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString(locale === 'id' ? 'id-ID' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      }
    }

    // Fallback: If it's "YYYY-MM-DD HH:mm:ss", extract the time part
    // If it's "HH:mm:ss", just take the first 5 chars
    const parts = timeStr.trim().split(' ');
    const timeOnly = parts.length > 1 ? parts[1] : parts[0];
    return timeOnly.substring(0, 5);
  };

  const getEvidenceAction = (evidence: any) => {
    if (!evidence.captured_at) return '';

    const capTime = new Date(evidence.captured_at.replace(' ', 'T')).getTime();
    const capTimeStr = evidence.captured_at.includes(' ') ? evidence.captured_at.split(' ')[1].substring(0, 5) : '';
    const capTimeTStr = evidence.captured_at.includes('T') ? evidence.captured_at.split('T')[1].substring(0, 5) : '';
    const capTimeString = capTimeStr || capTimeTStr;

    // Check if it matches clock in time
    if (detail?.clock_in) {
      const inTimeStr = detail.clock_in.includes(' ') ? detail.clock_in.split(' ')[1].substring(0, 5) : detail.clock_in.substring(0, 5);
      const inTime = new Date(detail.clock_in.replace(' ', 'T')).getTime();
      // Match by full time or just HH:mm if full match fails (timezone diff)
      if (Math.abs(capTime - inTime) < 300000 || (capTimeString && capTimeString === inTimeStr)) {
        return ` (${t.home?.clockIn || 'Clock In'})`;
      }
    }

    // Check if it matches clock out time
    if (detail?.clock_out) {
      const outTimeStr = detail.clock_out.includes(' ') ? detail.clock_out.split(' ')[1].substring(0, 5) : detail.clock_out.substring(0, 5);
      const outTime = new Date(detail.clock_out.replace(' ', 'T')).getTime();
      // Match by full time or just HH:mm
      if (Math.abs(capTime - outTime) < 300000 || (capTimeString && capTimeString === outTimeStr)) {
        return ` (${t.home?.clockOut || 'Clock Out'})`;
      }
    }

    return '';
  };

  const formatEvidenceTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString(locale === 'id' ? 'id-ID' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }} edges={['top']}>
          <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={THEME.text} />
              <Text style={styles.backText}>{t.attendanceDetail.title}</Text>
            </TouchableOpacity>
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={THEME.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!detail) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }} edges={['top']}>
          <View style={styles.center}>
            <Text style={{ color: THEME.muted }}>{t.common.loading}</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const statusColor = getStatusColor(detail.status);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }} edges={['top']}>
        <ScrollView style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={THEME.text} />
            <Text style={styles.backText}>{t.attendanceDetail.title}</Text>
          </TouchableOpacity>

          {/* Date Header */}
          <View style={styles.headerCard}>
            <View style={styles.dateIcon}>
              <Ionicons name="calendar" size={24} color={THEME.primary} />
            </View>
            <Text style={styles.dateText}>{formatDate(detail.date)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{detail.status_label}</Text>
            </View>
          </View>

          {/* Clock Times */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t.attendanceDetail.clockTimes}</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <View style={[styles.timeIcon, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="log-in-outline" size={20} color={THEME.success} />
                </View>
                <Text style={styles.timeLabel}>{t.home.clockIn}</Text>
                <Text style={styles.timeValue}>{formatTime(detail.clock_in)}</Text>
              </View>
              <View style={styles.timeDivider} />
              <View style={styles.timeItem}>
                <View style={[styles.timeIcon, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="log-out-outline" size={20} color={THEME.danger} />
                </View>
                <Text style={styles.timeLabel}>{t.home.clockOut}</Text>
                <Text style={styles.timeValue}>{formatTime(detail.clock_out)}</Text>
              </View>
            </View>
          </View>

          {/* Shift Info */}
          {detail.shift && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t.attendanceDetail.shift}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.attendanceDetail.shiftName}</Text>
                <Text style={styles.detailValue}>{detail.shift.name}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.attendanceDetail.schedule}</Text>
                <Text style={styles.detailValue}>
                  {detail.shift.start_time} - {detail.shift.end_time}
                </Text>
              </View>
            </View>
          )}

          {/* Location */}
          {detail.location && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t.attendanceDetail.location}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={20} color={THEME.primary} />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{detail.location.name}</Text>
                  <Text style={styles.locationAddress}>{detail.location.address}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Evidence */}
          {detail.evidences && detail.evidences.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t.attendanceDetail.evidence}</Text>
              {(() => {
                // Deduplicate evidences by content to avoid showing redundant data
                const seen = new Set<string>();
                const uniqueEvidences = detail.evidences.filter((evidence) => {
                  const data = getEvidenceData(evidence as any) as any;
                  let key = '';

                  if (evidence.type === 'GEOLOCATION' && data) {
                    // Use coordinates with 5 decimal places for geo-matching (~1.1m precision)
                    key = `geo-${data.lat.toFixed(5)}-${data.lng.toFixed(5)}`;
                  } else if (evidence.type === 'DEVICE' && data) {
                    key = `dev-${data.model}-${data.os}`;
                  } else {
                    key = `${evidence.id}-${evidence.type}`;
                  }

                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                });

                return uniqueEvidences.map((evidence, index) => {
                  const geoData = evidence.type === 'GEOLOCATION' ? getEvidenceData<GeolocationData>(evidence) : null;
                  const deviceData = evidence.type === 'DEVICE' ? getEvidenceData<DeviceData>(evidence) : null;
                  return (
                    <View key={evidence.id || index}>
                      {index > 0 && <View style={styles.divider} />}
                      <View style={styles.evidenceRow}>
                        <Ionicons
                          name={evidence.type === 'GEOLOCATION' ? 'navigate-outline' : 'phone-portrait-outline'}
                          size={18}
                          color={THEME.muted}
                        />
                        <View style={styles.evidenceInfo}>
                          <Text style={styles.evidenceType}>
                            {evidence.type === 'GEOLOCATION' ? t.attendanceDetail.gpsLocation : t.attendanceDetail.deviceInfo}
                            {getEvidenceAction(evidence)}
                          </Text>
                          {evidence.type === 'GEOLOCATION' && geoData && (
                            <View>
                              <Text style={styles.evidenceDetail}>
                                {geoData.lat.toFixed(6)}, {geoData.lng.toFixed(6)}
                                {geoData.within_geofence !== undefined && (
                                  <Text style={{ color: geoData.within_geofence ? THEME.success : THEME.danger }}>
                                    {' '}{geoData.within_geofence ? `(${t.map.matched})` : `(${t.map.outsideAttendanceArea})`}
                                  </Text>
                                )}
                              </Text>
                            </View>
                          )}
                          {evidence.type === 'DEVICE' && deviceData && (
                            <Text style={styles.evidenceDetail}>
                              {deviceData.model} ({deviceData.os})
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                });
              })()}
            </View>
          )}

          {/* Related Requests */}
          {detail.requests && detail.requests.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t.attendanceDetail.relatedRequests}</Text>
              {detail.requests.map((request, index) => {
                const reqStatusColor = getStatusColor(request.status);
                return (
                  <TouchableOpacity
                    key={request.id}
                    style={styles.requestRow}
                    onPress={() => router.push(`/request-detail?id=${request.id}`)}
                  >
                    {index > 0 && <View style={styles.divider} />}
                    <View style={styles.requestContent}>
                      <View>
                        <Text style={styles.requestType}>{request.request_type}</Text>
                        <Text style={styles.requestReason} numberOfLines={1}>
                          {request.reason}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.requestBadge, { backgroundColor: `${reqStatusColor}15` }]}>
                          <Text style={[styles.requestStatus, { color: reqStatusColor }]}>
                            {request.status}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={THEME.muted} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg, paddingHorizontal: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    gap: 10,
  },
  backText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: THEME.danger,
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: THEME.card,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  dateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: THEME.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: THEME.muted,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
  },
  timeDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#e2e8f0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: THEME.muted,
  },
  detailValue: {
    fontSize: 14,
    color: THEME.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
  },
  locationAddress: {
    fontSize: 13,
    color: THEME.muted,
    marginTop: 2,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  evidenceInfo: {
    flex: 1,
  },
  evidenceType: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.text,
  },
  evidenceDetail: {
    fontSize: 12,
    color: THEME.muted,
    marginTop: 2,
  },
  evidenceTime: {
    fontSize: 11,
    color: THEME.muted,
    marginTop: 1,
  },
  requestRow: {
    paddingVertical: 8,
  },
  requestContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestType: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.text,
  },
  requestReason: {
    fontSize: 12,
    color: THEME.muted,
    marginTop: 2,
    maxWidth: 180,
  },
  requestBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requestStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
});
