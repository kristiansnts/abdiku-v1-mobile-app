import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { THEME } from '@/constants/theme';
import { useLocalization } from '@/context/LocalizationContext';
import {
  Activity,
  ActivityStatus,
  ActivityType,
  getActivityIcon,
  getStatusColor,
  isAttendanceActivity,
} from '@/types/activity';

interface ActivityCardProps {
  activity: Activity;
  locale?: string;
}

const formatDateTime = (datetime: string, locale: string): { date: string; time: string } => {
  const d = new Date(datetime);
  const dateStr = d.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const timeStr = d.toLocaleTimeString(locale === 'id' ? 'id-ID' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return { date: dateStr, time: timeStr };
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, locale: propLocale }) => {
  const router = useRouter();
  const { t, locale: contextLocale } = useLocalization();
  const locale = propLocale || contextLocale;

  const { date, time } = formatDateTime(activity.datetime, locale);
  const iconName = getActivityIcon(activity.type);
  const statusColor = getStatusColor(activity.status);
  const isAttendance = isAttendanceActivity(activity.type);

  const getTypeLabel = (type: ActivityType): string => {
    switch (type) {
      case 'CLOCK_IN':
        return t.activityTypes.clockIn;
      case 'CLOCK_OUT':
        return t.activityTypes.clockOut;
      case 'LATE':
        return t.activityTypes.late;
      case 'LEAVE_REQUEST':
        return t.activityTypes.leave;
      case 'CORRECTION':
        return t.activityTypes.correction;
      case 'MISSING':
        return t.activityTypes.missing;
      default:
        return type;
    }
  };

  const getStatusLabel = (status: ActivityStatus): string => {
    switch (status) {
      case 'APPROVED':
        return t.status.approved;
      case 'PENDING':
        return t.status.pending;
      case 'REJECTED':
        return t.status.rejected;
      case 'LOCKED':
        return t.status.locked;
      default:
        return status;
    }
  };

  const handlePress = () => {
    if (isAttendance) {
      router.push(`/attendance-detail?id=${activity.id}`);
    } else {
      router.push(`/request-detail?id=${activity.id}`);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: `${statusColor}15` }]}>
        <Ionicons name={iconName as any} size={20} color={statusColor} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.typeLabel} numberOfLines={1}>{getTypeLabel(activity.type)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(activity.status)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.datetime}>
            {date} • {time}
          </Text>
          <Text style={styles.label} numberOfLines={1}>
            {activity.label}
          </Text>
        </View>

        {/* Late Badge */}
        {activity.is_late && activity.late_minutes !== undefined && activity.late_minutes > 0 && (
          <View style={styles.lateBadge}>
            <Ionicons name="time-outline" size={12} color={THEME.danger} />
            <Text style={styles.lateText}>
              {activity.late_label || `${t.home.late} ${activity.late_minutes} ${activity.late_minutes === 1 ? t.home.minute : t.home.minutes}`}
            </Text>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={16} color={THEME.muted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 4,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datetime: {
    fontSize: 12,
    color: THEME.muted,
    fontWeight: '500',
  },
  label: {
    fontSize: 12,
    color: THEME.mutedLight,
    flex: 1,
  },
  lateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff1f2',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  lateText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.danger,
  },
});

export default ActivityCard;
