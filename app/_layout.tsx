import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LocalizationProvider } from '@/context/LocalizationContext';
import { NetworkProvider } from '@/context/NetworkContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inProtectedRoute = [
      'kepegawaian-detail',
      'gaji-detail',
      'payslip-detail',
      'attendance-detail',
      'request-detail',
      'request-form'
    ].includes(segments[0] as string);
    const onLoginPage = segments[0] === 'login';

    if (!user && (inAuthGroup || inProtectedRoute)) {
      router.replace('/login');
    } else if (user && onLoginPage) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

  if (loading) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="kepegawaian-detail" options={{ headerShown: false }} />
        <Stack.Screen name="gaji-detail" options={{ headerShown: false }} />
        <Stack.Screen name="payslip-detail" options={{ headerShown: false }} />
        <Stack.Screen name="attendance-detail" options={{ headerShown: false }} />
        <Stack.Screen name="request-detail" options={{ headerShown: false }} />
        <Stack.Screen name="request-form" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <LocalizationProvider>
      <AuthProvider>
        <NetworkProvider>
          <NotificationProvider>
            <RootLayoutNav />
          </NotificationProvider>
        </NetworkProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
}
