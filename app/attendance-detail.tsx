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
    if (!evidence.action) return '';

    if (evidence.action === 'CLOCK_IN') {
      return ` (${t.home?.clockIn || 'Clock In'})`;
    }

    if (evidence.action === 'CLOCK_OUT') {
      return ` (${t.home?.clockOut || 'Clock Out'})`;
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

  const calculateLateInfo = () => {
    // First, check if the API already provided late information
    if (detail?.is_late && detail?.late_minutes !== undefined && detail.late_minutes > 0) {

      return {
        isLate: true,
        minutes: detail.late_minutes,
      };
    }

    // Fallback: Calculate from shift data if available
    if (!detail?.clock_in || !detail?.shift) {
      return null;
    }

    const clockInTime = detail.clock_in.includes(' ')
      ? detail.clock_in.split(' ')[1]
      : detail.clock_in;
    const shiftStartTime = detail.shift.start_time;

    // Parse times (HH:mm format)
    const [clockInHour, clockInMin] = clockInTime.split(':').map(Number);
    const [shiftHour, shiftMin] = shiftStartTime.split(':').map(Number);

    const clockInMinutes = clockInHour * 60 + clockInMin;
    const shiftMinutes = shiftHour * 60 + shiftMin;
    const lateMinutes = clockInMinutes - shiftMinutes;

    if (lateMinutes > 0) {
      return {
        isLate: true,
        minutes: lateMinutes,
      };
    }

    return null;
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
            {(() => {
              const lateInfo = calculateLateInfo();

              if (lateInfo) {
                const hours = Math.floor(lateInfo.minutes / 60);
                const mins = lateInfo.minutes % 60;
                let lateText = '';
                if (hours > 0) {
                  lateText = `${hours} ${hours === 1 ? t.home.hour : t.home.hours}`;
                  if (mins > 0) {
                    lateText += ` ${mins} ${mins === 1 ? t.home.minute : t.home.minutes}`;
                  }
                } else {
                  lateText = `${mins} ${mins === 1 ? t.home.minute : t.home.minutes}`;
                }

                // Find existing LATE request
                const lateRequest = detail.requests?.find(req => req.request_type === 'LATE');
                const hasLateRequest = !!lateRequest;

                return (
                  <>
                    <View style={styles.lateIndicator}>
                      <Ionicons name="time-outline" size={16} color={THEME.danger} />
                      <Text style={styles.lateText}>
                        {t.home.late} {lateText}
                      </Text>
                    </View>

                    {/* Submit Late Request Button */}
                    <TouchableOpacity
                      style={[
                        styles.submitLateButton,
                        hasLateRequest && styles.submitLateButtonDisabled
                      ]}
                      onPress={() => {
                        if (!hasLateRequest) {
                          router.push(`/request-form?type=LATE&attendanceId=${detail.id}` as any);
                        }
                      }}
                      disabled={hasLateRequest}
                      activeOpacity={hasLateRequest ? 1 : 0.7}
                    >
                      <Ionicons
                        name={hasLateRequest ? "checkmark-circle-outline" : "document-text-outline"}
                        size={18}
                        color={hasLateRequest ? THEME.success : THEME.primary}
                      />
                      <Text style={[
                        styles.submitLateButtonText,
                        hasLateRequest && styles.submitLateButtonTextDisabled
                      ]}>
                        {hasLateRequest
                          ? `${t.attendanceDetail.submitLateRequest} ${lateRequest.status_label ? `(${lateRequest.status_label})` : `(${lateRequest.status})`}`
                          : t.attendanceDetail.submitLateRequest
                        }
                      </Text>
                    </TouchableOpacity>
                  </>
                );
              }
              return null;
            })()}
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
                // Deduplicate DEVICE evidences only, keep all GEOLOCATION to show clock-in/out separately
                const seen = new Set<string>();
                const uniqueEvidences = detail.evidences.filter((evidence) => {
                  // Always keep geolocation evidence (to show both clock-in and clock-out locations)
                  if (evidence.type === 'GEOLOCATION') {
                    return true;
                  }

                  // Deduplicate device evidence
                  const data = getEvidenceData(evidence as any) as any;
                  let key = '';

                  if (evidence.type === 'DEVICE' && data) {
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
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <Text style={styles.evidenceType}>
                              {evidence.type === 'GEOLOCATION' ? t.attendanceDetail.gpsLocation : t.attendanceDetail.deviceInfo}
                            </Text>
                            {evidence.type === 'GEOLOCATION' && (() => {
                              const action = getEvidenceAction(evidence);


                              if (action) {
                                const isClockIn = action.includes(t.home?.clockIn || 'Clock In');

                                return (
                                  <View style={[
                                    styles.evidenceActionBadge,
                                    { backgroundColor: isClockIn ? '#dcfce7' : '#fee2e2' }
                                  ]}>
                                    <Text style={[
                                      styles.evidenceActionText,
                                      { color: isClockIn ? THEME.success : THEME.danger }
                                    ]}>
                                      {isClockIn ? t.home.clockIn : t.home.clockOut}
                                    </Text>
                                  </View>
                                );
                              }
                              return null;
                            })()}
                          </View>
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
  container: { flex: 1, backgroundColor: THEME.bg, paddingHorizontal: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 24,
    gap: 12,
  },
  backText: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: -0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: THEME.danger,
    textAlign: 'center',
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: THEME.card,
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  dateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: THEME.card,
    padding: 24,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 20,
    letterSpacing: -0.3,
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
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeLabel: {
    fontSize: 13,
    color: THEME.muted,
    fontWeight: '600',
    marginBottom: 6,
  },
  timeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: -0.5,
  },
  timeDivider: {
    width: 1.5,
    height: 80,
    backgroundColor: '#f1f5f9',
  },
  lateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff1f2',
    borderRadius: 16,
  },
  lateText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.danger,
  },
  submitLateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: THEME.primary,
  },
  submitLateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.primary,
  },
  submitLateButtonDisabled: {
    backgroundColor: '#f8fafc',
    borderColor: THEME.border,
  },
  submitLateButtonTextDisabled: {
    color: THEME.muted,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 15,
    color: THEME.muted,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: THEME.text,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#f8fafc',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    letterSpacing: -0.3,
  },
  locationAddress: {
    fontSize: 14,
    color: THEME.muted,
    marginTop: 4,
    lineHeight: 20,
    fontWeight: '500',
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
  },
  evidenceInfo: {
    flex: 1,
  },
  evidenceType: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
  },
  evidenceDetail: {
    fontSize: 13,
    color: THEME.muted,
    marginTop: 4,
    fontWeight: '500',
  },
  evidenceTime: {
    fontSize: 12,
    color: THEME.muted,
    marginTop: 2,
  },
  evidenceActionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  evidenceActionText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  requestRow: {
    paddingVertical: 12,
  },
  requestContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestType: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    letterSpacing: -0.3,
  },
  requestReason: {
    fontSize: 13,
    color: THEME.muted,
    marginTop: 4,
    maxWidth: 200,
    fontWeight: '500',
  },
  requestBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  requestStatus: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
