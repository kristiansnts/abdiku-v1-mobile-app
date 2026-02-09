import { GLOBAL_STYLES, THEME } from '@/constants/theme';
import { Language, TranslationKeys } from '@/constants/translations';
import { CorrectionRequest } from '@/types/attendance';
import { formatDateString } from '@/utils/date';
import { getRequestStatusText, getRequestTypeText, getStatusColor } from '@/utils/status';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface RequestCardProps {
  item: CorrectionRequest;
  index: number;
  locale: Language;
  t: TranslationKeys;
  onDelete: (id: number) => void;
  onPress: (id: number) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  item,
  index,
  locale,
  t,
  onDelete,
  onPress,
}) => {
  const statusColor = getStatusColor(item.status);

  return (
    <Animated.View entering={FadeInUp.delay(index * 50)}>
      <TouchableOpacity
        style={[styles.requestCard, GLOBAL_STYLES.card]}
        onPress={() => onPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.requestHeader}>
            <View style={styles.requestTypeContainer}>
              <View style={[styles.requestTypeBadge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.requestTypeText, { color: statusColor }]}>
                  {getRequestTypeText(item.request_type, t)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{getRequestStatusText(item.status, t)}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              {item.status === 'PENDING' && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color={THEME.danger} />
                </TouchableOpacity>
              )}
              <Ionicons name="chevron-forward" size={18} color={THEME.muted} />
            </View>
          </View>

          <Text style={styles.requestReason} numberOfLines={2}>{item.reason}</Text>

          <View style={styles.requestDetails}>
            {item.requested_clock_in_at && (
              <View style={styles.requestDetailRow}>
                <Ionicons name="enter-outline" size={16} color={THEME.success} />
                <Text style={styles.requestDetailText}>
                  {formatDateString(item.requested_clock_in_at, 'dateTime', locale)}
                </Text>
              </View>
            )}
            {item.requested_clock_out_at && (
              <View style={styles.requestDetailRow}>
                <Ionicons name="exit-outline" size={16} color={THEME.danger} />
                <Text style={styles.requestDetailText}>
                  {formatDateString(item.requested_clock_out_at, 'dateTime', locale)}
                </Text>
              </View>
            )}
          </View>



          {item.reviewer_notes && (
            <View style={styles.reviewerNotes}>
              <Text style={styles.reviewerNotesLabel}>{t.requests.reviewerNotes}:</Text>
              <Text style={styles.reviewerNotesText}>{item.reviewer_notes}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  requestCard: {
    marginBottom: 15,
    padding: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  cardContent: {
    flex: 1,
  },
  requestTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  requestTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  requestReason: {
    fontSize: 14,
    color: THEME.text,
    marginBottom: 10,
    lineHeight: 20,
  },
  requestDetails: {
    gap: 6,
  },
  requestDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestDetailText: {
    fontSize: 13,
    color: THEME.muted,
  },

  reviewerNotes: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  reviewerNotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.muted,
    marginBottom: 4,
  },
  reviewerNotesText: {
    fontSize: 13,
    color: THEME.text,
  },
});
