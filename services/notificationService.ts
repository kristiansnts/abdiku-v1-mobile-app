import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PushNotification {
  notification_id: string;
  type: string;
  title: string;
  body: string;
  icon: string;
  icon_color: string;
  related_id?: string;
  related_type?: string;
  created_at: string;
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push notification permissions');
    return false;
  }

  return true;
}

/**
 * Get FCM token for this device
 * Note: Run 'eas init' in project directory to set up Expo project ID
 */
export async function getFcmToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      return null;
    }

    // Expo will use the project ID from app.json extra.eas.projectId if available
    // If not set, you need to run: npx eas init
    const token = await Notifications.getExpoPushTokenAsync();

    return token.data;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    console.error('If you see "projectId is required", run: npx eas init');
    return null;
  }
}

/**
 * Register FCM token with backend
 */
export async function registerFcmToken(deviceId: string, fcmToken: string): Promise<void> {
  try {
    await api.post('/notifications/fcm-token', {
      device_id: deviceId,
      fcm_token: fcmToken,
    });

    await AsyncStorage.setItem('fcm_token', fcmToken);
    console.log('FCM token registered successfully');
  } catch (error: any) {
    console.error('Failed to register FCM token:', error?.response?.data || error);
    throw error;
  }
}

/**
 * Clear FCM token on logout
 */
export async function clearFcmToken(deviceId: string): Promise<void> {
  try {
    await api.delete('/notifications/fcm-token', {
      data: { device_id: deviceId },
    });

    await AsyncStorage.removeItem('fcm_token');
  } catch (error) {
    console.error('Failed to clear FCM token:', error);
  }
}

/**
 * Get notifications from backend
 */
export async function getNotifications(params?: {
  page?: number;
  per_page?: number;
  unread_only?: boolean;
}) {
  const response = await api.get('/notifications', { params });
  return response.data.data;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const response = await api.post(`/notifications/${notificationId}/read`);
  return response.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  const response = await api.post('/notifications/read-all');
  return response.data;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await api.get('/notifications/unread-count');
  return response.data.data.count;
}

/**
 * Parse notification data from push payload
 */
export function parseNotificationData(
  notification: Notifications.Notification
): PushNotification | null {
  const data = notification.request.content.data;

  if (!data || !data.notification_id) {
    return null;
  }

  return {
    notification_id: data.notification_id as string,
    type: data.type as string,
    title: data.title as string,
    body: data.body as string,
    icon: data.icon as string,
    icon_color: data.icon_color as string,
    related_id: data.related_id as string | undefined,
    related_type: data.related_type as string | undefined,
    created_at: data.created_at as string,
  };
}
