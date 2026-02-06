import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityCard } from '@/components/activity';
import { DateGroupHeader, MonthFilter } from '@/components/history';
import { THEME } from '@/constants/theme';
import { useLocalization } from '@/context/LocalizationContext';
import { getActivities } from '@/services/activityService';
import { Activity, ActivityGroup } from '@/types/activity';

const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const groupActivitiesByDate = (activities: Activity[]): ActivityGroup[] => {
  const groups: Map<string, Activity[]> = new Map();

  activities.forEach((activity) => {
    const date = activity.datetime.split('T')[0];
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(activity);
  });

  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, acts]) => ({
      date,
      label: date,
      activities: acts.sort((a, b) =>
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      ),
    }));
};

export default function HistoryScreen() {
  const router = useRouter();
  const { t, locale } = useLocalization();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = useCallback(async (month: string) => {
    try {
      const data = await getActivities({ month });
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setActivities([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchActivities(selectedMonth).finally(() => setLoading(false));
  }, [selectedMonth, fetchActivities]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities(selectedMonth);
    setRefreshing(false);
  }, [selectedMonth, fetchActivities]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const groupedActivities = useMemo(
    () => groupActivitiesByDate(activities),
    [activities]
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }} edges={['top']}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={THEME.text} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {locale === 'id' ? 'Riwayat Aktivitas' : 'Activity History'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Month Filter */}
          <MonthFilter
            selectedMonth={selectedMonth}
            onSelectMonth={handleMonthChange}
            locale={locale}
          />

          {/* Activity List */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={THEME.primary}
              />
            }
          >
            {loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t.common.loading}</Text>
              </View>
            ) : groupedActivities.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color={THEME.muted} />
                <Text style={styles.emptyText}>
                  {locale === 'id' ? 'Tidak ada aktivitas' : 'No activities'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {locale === 'id'
                    ? 'Tidak ada aktivitas untuk bulan ini'
                    : 'No activities for this month'}
                </Text>
              </View>
            ) : (
              groupedActivities.map((group) => (
                <View key={group.date}>
                  <DateGroupHeader date={group.date} locale={locale} />
                  {group.activities.map((activity) => (
                    <ActivityCard
                      key={`${activity.type}-${activity.id}`}
                      activity={activity}
                      locale={locale}
                    />
                  ))}
                </View>
              ))
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: THEME.muted,
    marginTop: 4,
  },
});
