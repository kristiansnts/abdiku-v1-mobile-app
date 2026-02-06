import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { THEME } from '@/constants/theme';
import { Activity } from '@/types/activity';

import { ActivityCard } from './ActivityCard';

interface ActivityListProps {
  activities: Activity[];
  locale?: string;
  title?: string;
  showViewAll?: boolean;
  emptyText?: string;
  viewAllText?: string;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  locale = 'en',
  title = 'Latest Activity',
  showViewAll = true,
  emptyText = 'No recent activity',
  viewAllText = 'View History',
}) => {
  const router = useRouter();

  const handleViewAll = () => {
    router.push('/history');
  };

  return (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showViewAll && activities.length > 0 && (
          <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>{viewAllText}</Text>
            <Ionicons name="chevron-forward" size={14} color={THEME.primary} />
          </TouchableOpacity>
        )}
      </View>

      {activities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={32} color={THEME.muted} />
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {activities.map((activity, index) => (
            <ActivityCard key={`${activity.type}-${activity.id}`} activity={activity} locale={locale} />
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: -0.5,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 13,
    color: THEME.primary,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: THEME.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: THEME.muted,
    fontWeight: '500',
  },
});

export default ActivityList;
