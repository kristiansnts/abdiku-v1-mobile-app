import { FEATURES } from '@/constants/features';
import * as notificationService from '@/services/notificationService';
import { Notifications, PushNotification } from '@/services/notificationService';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  handleNotificationPress: (notification: PushNotification) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const notificationListener = useRef<any>(undefined);
  const responseListener = useRef<any>(undefined);

  // Initialize notification listeners
  useEffect(() => {
    if (!user || !FEATURES.PUSH_NOTIFICATIONS || !Notifications) return;

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification: any) => {
        console.log('Notification received (foreground):', notification);
        refreshUnreadCount();
      }
    );

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        const data = notificationService.parseNotificationData(response.notification);
        if (data) {
          handleNotificationPress(data);
        }
      }
    );

    // Check permission status
    checkPermissionStatus();

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);

  const checkPermissionStatus = async () => {
    if (!FEATURES.PUSH_NOTIFICATIONS || !Notifications) return;
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestPermission = async (): Promise<boolean> => {
    const granted = await notificationService.requestNotificationPermissions();
    setHasPermission(granted);
    return granted;
  };

  const refreshNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await notificationService.getNotifications({ per_page: 50 });
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUnreadCount = async () => {
    if (!user) return;

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);

      // Update badge count (only in standalone builds)
      if (FEATURES.PUSH_NOTIFICATIONS && Notifications) {
        await Notifications.setBadgeCountAsync(count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markNotificationAsRead(id);
      await refreshNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      await refreshNotifications();
      if (FEATURES.PUSH_NOTIFICATIONS && Notifications) {
        await Notifications.setBadgeCountAsync(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationPress = (notification: PushNotification) => {
    console.log('Notification pressed:', notification);

    // Route based on notification type
    switch (notification.type) {
      case 'attendance_request_submitted':
      case 'attendance_request_reviewed':
        if (notification.related_id) {
          router.push(`/request-detail?id=${notification.related_id}` as any);
        }
        break;

      case 'payslip_available':
      case 'payroll_finalized_employee':
        if (notification.related_id) {
          router.push(`/payslip-detail?id=${notification.related_id}` as any);
        } else {
          router.push('/(tabs)/payslip' as any);
        }
        break;

      case 'employee_absent':
        router.push('/(tabs)/' as any);
        break;

      case 'payroll_prepared':
      case 'payroll_finalized_stakeholder':
        router.push('/(tabs)/payslip' as any);
        break;

      case 'override_request':
        if (notification.related_id) {
          router.push(`/request-detail?id=${notification.related_id}` as any);
        }
        break;

      default:
        // Navigate to notifications screen for unknown types
        console.log('Unknown notification type:', notification.type);
    }
  };

  // Refresh notifications when user logs in
  useEffect(() => {
    if (user) {
      refreshNotifications();
      refreshUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      if (FEATURES.PUSH_NOTIFICATIONS && Notifications) {
        Notifications.setBadgeCountAsync(0);
      }
    }
  }, [user]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    hasPermission,
    requestPermission,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    handleNotificationPress,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
