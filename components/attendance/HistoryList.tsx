import { GLOBAL_STYLES, THEME } from '@/constants/theme';
import { Language, TranslationKeys } from '@/constants/translations';
import { Attendance } from '@/types/attendance';
import { extractShortTime, formatDate, formatLateTime } from '@/utils/date';
import { getStatusTranslation } from '@/utils/status';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface HistoryListProps {
  history: Attendance[];
  locale: Language;
  t: TranslationKeys;
  onViewMore?: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  locale,
  t,
  onViewMore,
}) => {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.home.recentActivity}</Text>
        <TouchableOpacity onPress={onViewMore}>
          <Text style={styles.viewMore}>{t.home.viewHistory}</Text>
        </TouchableOpacity>
      </View>

      <Animated.View entering={FadeInUp.delay(500)}>
        {history.length > 0 ? (
          history.map((item) => (
            <View key={item.id} style={[styles.historyItem, GLOBAL_STYLES.card]}>
              <View style={styles.historyIcon}>
                <Ionicons name="calendar" size={20} color={THEME.primary} />
              </View>
              <View style={styles.historyInfo}>
                <View style={styles.historyDateRow}>
                  <Text style={styles.historyDate}>
                    {formatDate(new Date(item.date), 'historyDate', locale)}
                  </Text>
                  {item.is_late && (
                    <View style={styles.historyLateBadge}>
                      <Text style={styles.historyLateBadgeText}>
                        {t.home.late}
                        {item.late_minutes && item.late_minutes > 0 ? ` (${formatLateTime(item.late_minutes, t.home)})` : ''}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.historyStatus}>{getStatusTranslation(item.status, t)}</Text>
              </View>
              <View style={styles.historyTimes}>
                <Text style={[styles.historyTimeIn, item.is_late && styles.historyTimeLate]}>
                  {extractShortTime(item.clock_in)}
                </Text>
                <Text style={styles.historyTimeOut}>
                  {extractShortTime(item.clock_out)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t.home.noActivity}</Text>
          </View>
        )}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
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
});
