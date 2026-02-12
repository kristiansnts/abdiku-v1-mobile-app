# Feature Flag Implementation: Push Notifications

## Overview
Implemented a feature flag system to conditionally enable/disable push notifications based on the app's execution environment. This allows the app to run in Expo Go (which doesn't support push notifications in SDK 53+) while maintaining full functionality in development and production builds.

## Changes Made

### 1. Created Feature Flag System
**File:** `/constants/features.ts`

- Detects execution environment using `Constants.executionEnvironment`
- Exports `FEATURES.PUSH_NOTIFICATIONS` flag
- Automatically disabled in Expo Go, enabled in standalone builds
- Includes debug logging in development mode

### 2. Updated Notification Service
**File:** `/services/notificationService.ts`

- Wrapped `Notifications.setNotificationHandler()` in feature flag check
- Added early returns in:
  - `requestNotificationPermissions()` - Returns `false` in Expo Go
  - `getFcmToken()` - Returns `null` in Expo Go
- Added console logs for debugging when notifications are disabled

### 3. Updated Notification Context
**File:** `/context/NotificationContext.tsx`

- Added feature flag check to prevent listener setup in Expo Go
- Wrapped all `Notifications.setBadgeCountAsync()` calls in feature flag checks
- Fixed TypeScript errors with useRef initialization
- Maintains full functionality in standalone builds

### 4. Fixed MainActivity Bug
**File:** `/android/app/src/main/java/com/kristiansnts/abdikuv1mobileapp/MainActivity.kt`

- Changed `super.onCreate(null)` to `super.onCreate(savedInstanceState)`
- This was causing the white screen issue by breaking React Native initialization

## How It Works

### In Expo Go:
- `FEATURES.PUSH_NOTIFICATIONS` = `false`
- No notification listeners are set up
- No FCM token requests
- No badge count updates
- App runs without errors ✅

### In Development/Production Builds:
- `FEATURES.PUSH_NOTIFICATIONS` = `true`
- Full push notification support
- FCM token registration
- Badge count management
- Notification routing ✅

## Testing

### Test in Expo Go:
```bash
npx expo start
# Scan QR code with Expo Go app
```

Expected: No notification errors, app runs smoothly

### Test in Development Build:
```bash
npx expo run:android
# or
npx expo run:ios
```

Expected: Full push notification functionality

## Future Enhancements

You can easily add more feature flags to the `FEATURES` object:

```typescript
export const FEATURES = {
  PUSH_NOTIFICATIONS: isStandaloneBuild,
  BIOMETRIC_AUTH: isStandaloneBuild,
  BACKGROUND_LOCATION: isStandaloneBuild,
  // Add more features as needed
} as const;
```

## Benefits

1. ✅ **No more Expo Go errors** - App runs smoothly in Expo Go
2. ✅ **Full feature support in builds** - Production builds have all features
3. ✅ **Easy to extend** - Add more feature flags as needed
4. ✅ **Type-safe** - TypeScript ensures correct usage
5. ✅ **Debug-friendly** - Logs execution environment in dev mode
