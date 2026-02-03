# Navigation & Theme

Expo apps use `@react-navigation/stack` for screen transitions and a shared theme for the "Claymorphism" look.

## 1. Main Navigation (`App.tsx`)

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#f8fafc' } }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Abdiku Attendance' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

## 2. Design Tokens (`src/styles/theme.ts`)

```typescript
export const COLORS = {
  primary: '#4f46e5',
  secondary: '#ec4899',
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  success: '#10b981',
  danger: '#ef4444',
  muted: '#64748b',
};

export const GLOBAL_STYLES = {
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    padding: 20,
  }
};
```
