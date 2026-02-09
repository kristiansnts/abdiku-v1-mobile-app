import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { THEME } from '@/constants/theme';
import { useLocalization } from '@/context/LocalizationContext';
import { getRequestDetail } from '@/services/activityService';
import { getStatusColor, RequestDetail } from '@/types/activity';

export default function RequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useLocalization();
  const [detail, setDetail] = useState<RequestDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getRequestDetail(Number(id))
        .then(setDetail)
        .catch((err) => {
          setError(err.response?.data?.error?.message || 'Failed to load request details');
        });
    }
  }, [id]);

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-';

    // The API returns datetime in UTC (e.g., "2026-02-09 10:38:00" is UTC time)
    // We need to parse it as UTC and convert to local timezone
    // Replace 'T' with space and split to get date and time parts
    const normalized = dateStr.replace('T', ' ');
    const [datePart, timePart] = normalized.split(' ');

    if (!datePart) return '-';

    // Parse date components
    const [year, month, day] = datePart.split('-').map(Number);

    // Parse time components (default to 00:00 if not provided)
    let hour = 0, minute = 0, second = 0;
    if (timePart) {
      const timeComponents = timePart.split(':').map(Number);
      hour = timeComponents[0] || 0;
      minute = timeComponents[1] || 0;
      second = timeComponents[2] || 0;
    }

    // Create Date object from UTC components
    // Date.UTC() returns milliseconds, which we pass to new Date()
    const d = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

    return d.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '-';

    let year: number, month: number, day: number, hour: number, minute: number, second: number;

    if (timeStr.includes('T') || (timeStr.includes('-') && timeStr.includes(' '))) {
      // Full datetime string
      const normalized = timeStr.replace('T', ' ');
      const [datePart, timePart] = normalized.split(' ');
      const dateComponents = datePart.split('-').map(Number);
      year = dateComponents[0];
      month = dateComponents[1];
      day = dateComponents[2];

      const timeComponents = timePart.split(':').map(Number);
      hour = timeComponents[0];
      minute = timeComponents[1];
      second = timeComponents[2] || 0;
    } else {
      // Time-only string (HH:mm:ss or HH:mm)
      // Treat as UTC time on today's date
      const now = new Date();
      year = now.getUTCFullYear();
      month = now.getUTCMonth() + 1;
      day = now.getUTCDate();

      const timeComponents = timeStr.trim().split(':').map(Number);
      if (timeComponents.length < 2) return timeStr;

      hour = timeComponents[0];
      minute = timeComponents[1];
      second = timeComponents[2] || 0;
    }

    // Create Date from UTC components and format to local time
    const d = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    return d.toLocaleTimeString(locale === 'id' ? 'id-ID' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'LATE':
        return 'time-outline';
      case 'CORRECTION':
        return 'create-outline';
      case 'MISSING':
        return 'help-circle-outline';
      default:
        return 'document-outline';
    }
  };

  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }} edges={['top']}>
          <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={THEME.text} />
              <Text style={styles.backText}>Request Detail</Text>
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
            <Text style={styles.backText}>Request Detail</Text>
          </TouchableOpacity>

          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={[styles.typeIcon, { backgroundColor: `${statusColor}15` }]}>
              <Ionicons
                name={getRequestTypeIcon(detail.request_type) as any}
                size={28}
                color={statusColor}
              />
            </View>
            <Text style={styles.typeLabel}>{detail.request_type_label}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{detail.status_label}</Text>
            </View>
          </View>

          {/* Request Info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Request Info</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Submitted</Text>
              <Text style={styles.detailValue}>{formatDateTime(detail.requested_at)}</Text>
            </View>

            {detail.requested_clock_in_at && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Requested Clock In</Text>
                  <Text style={styles.detailValue}>{formatTime(detail.requested_clock_in_at)}</Text>
                </View>
              </>
            )}

            {detail.requested_clock_out_at && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Requested Clock Out</Text>
                  <Text style={styles.detailValue}>{formatTime(detail.requested_clock_out_at)}</Text>
                </View>
              </>
            )}
          </View>

          {/* Reason */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Reason</Text>
            <Text style={styles.reasonText}>{detail.reason}</Text>
          </View>

          {/* Review Info */}
          {detail.reviewed_at && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Review</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reviewed At</Text>
                <Text style={styles.detailValue}>{formatDateTime(detail.reviewed_at)}</Text>
              </View>

              {detail.reviewer && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reviewer</Text>
                    <Text style={styles.detailValue}>{detail.reviewer.name}</Text>
                  </View>
                </>
              )}

              {detail.review_note && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.noteContainer}>
                    <Text style={styles.detailLabel}>Notes</Text>
                    <Text style={styles.noteText}>{detail.review_note}</Text>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Related Attendance */}
          {detail.attendance && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Related Attendance</Text>
              <TouchableOpacity
                style={styles.attendanceRow}
                onPress={() => router.push(`/attendance-detail?id=${detail.attendance?.id}`)}
              >
                <View style={styles.attendanceInfo}>
                  <Text style={styles.attendanceDate}>{detail.attendance.date}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={THEME.muted} />
              </TouchableOpacity>
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
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
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
  reasonText: {
    fontSize: 14,
    color: THEME.text,
    lineHeight: 22,
  },
  noteContainer: {
    paddingVertical: 10,
  },
  noteText: {
    fontSize: 14,
    color: THEME.text,
    marginTop: 6,
    lineHeight: 20,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceDate: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
  },
  attendanceTimes: {
    fontSize: 13,
    color: THEME.muted,
    marginTop: 2,
  },
});
